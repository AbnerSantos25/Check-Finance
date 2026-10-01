import { describe, expect, it } from 'vitest';
import { brazilToday, mergeSeries, parseSgs, sgsUrl } from './bcb';

const TODAY = '2026-10-01';

describe('brazilToday', () => {
  it('usa o fuso de Brasília, não o UTC do Worker', () => {
    // 01h UTC do dia 2 ainda é noite do dia 1 em Brasília.
    expect(brazilToday(new Date('2026-10-02T01:00:00Z'))).toBe('2026-10-01');
    expect(brazilToday(new Date('2026-10-02T03:00:00Z'))).toBe('2026-10-02');
  });
});

describe('sgsUrl', () => {
  it('busca o último mês da Selic meta, que publica datas futuras', () => {
    expect(sgsUrl('selic', TODAY)).toBe(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=01/09/2026&dataFinal=01/10/2026'
    );
  });

  it('usa ultimos/N nas demais séries', () => {
    expect(sgsUrl('cdi', TODAY)).toBe('https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json');
    expect(sgsUrl('poupanca', TODAY)).toContain('bcdata.sgs.195/dados/ultimos/5');
    expect(sgsUrl('ptax', TODAY)).toContain('bcdata.sgs.1/dados/ultimos/2');
  });
});

describe('parseSgs', () => {
  it('lê valores com ponto ou vírgula e devolve o último ponto', () => {
    const payload = [
      { data: '29/09/2026', valor: '14.90' },
      { data: '30/09/2026', valor: '14,95' },
    ];
    expect(parseSgs('cdi', payload, TODAY)).toEqual([{ date: '30/09/2026', value: 14.95 }]);
  });

  it('descarta datas futuras e ordena antes de escolher o último', () => {
    const payload = [
      { data: '05/11/2026', valor: '14.25' },
      { data: '01/10/2026', valor: '14.00' },
      { data: '15/09/2026', valor: '13.75' },
    ];
    expect(parseSgs('selic', payload, TODAY)).toEqual([{ date: '01/10/2026', value: 14 }]);
  });

  it('mantém os dois últimos pontos do PTAX', () => {
    const payload = [
      { data: '29/09/2026', valor: '5.10' },
      { data: '30/09/2026', valor: '5.20' },
    ];
    expect(parseSgs('ptax', payload, TODAY)).toEqual([
      { date: '29/09/2026', value: 5.1 },
      { date: '30/09/2026', value: 5.2 },
    ]);
  });

  it.each([
    ['não é lista', { erro: 'Série inexistente' }],
    ['lista vazia', []],
    ['linhas inválidas', [{ data: '2026-09-30', valor: '1' }, { data: '30/09/2026', valor: 'n/a' }, null]],
  ])('devolve null: %s', (_label, payload) => {
    expect(parseSgs('cdi', payload, TODAY)).toBeNull();
  });
});

describe('mergeSeries', () => {
  const point = (value: number) => ({ date: '30/09/2026', value });
  const previous = {
    selic: point(13),
    cdi: point(12.9),
    ipca: point(4),
    poupanca: point(0.5),
    ptax: [point(5), point(5.1)],
  };

  it('nenhuma série respondeu: null, para o cache manter o valor anterior', () => {
    expect(mergeSeries({ selic: null, cdi: null, ipca: null, poupanca: null, ptax: null }, previous)).toBeNull();
  });

  it('série que falhou mantém o último valor bom', () => {
    const merged = mergeSeries(
      { selic: [point(14)], cdi: null, ipca: [point(4.2)], poupanca: null, ptax: null },
      previous
    );
    expect(merged).toEqual({ ...previous, selic: point(14), ipca: point(4.2) });
  });

  it('sem valor anterior, a série que falhou fica null', () => {
    const merged = mergeSeries({ selic: [point(14)], cdi: null, ipca: null, poupanca: null, ptax: null }, null);
    expect(merged).toEqual({ selic: point(14), cdi: null, ipca: null, poupanca: null, ptax: null });
  });
});
