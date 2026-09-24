/**
 * As fixtures são respostas reais da HG Brasil — inclusive as que vêm com HTTP 200
 * e erro só no corpo, que é o caso que a validação existe para pegar.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseIbovespa } from './hgBrasil';

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./__fixtures__/${name}.json`, import.meta.url), 'utf-8'));

const stocks = (ibovespa: unknown) => ({ valid_key: true, results: { stocks: { IBOVESPA: ibovespa } } });

describe('parseIbovespa', () => {
  it('lê a cotação de uma resposta válida', () => {
    expect(parseIbovespa(fixture('hg-finance-ok'))).toEqual({ points: 185229.17, changePercent: -0.41 });
  });

  it.each([
    ['valid_key:false', fixture('hg-finance-invalid-key')],
    ['errors[] preenchido', fixture('hg-v2-unauthorized')],
    ['results.error', { valid_key: true, results: { error: true } }],
    ['payload vazio', null],
  ])('rejeita erro que vem com HTTP 200: %s', (_label, payload) => {
    expect(parseIbovespa(payload)).toBeNull();
  });

  it.each([
    ['pontos abaixo da faixa', stocks({ points: 9_999, variation: 0 })],
    ['pontos acima da faixa', stocks({ points: 1_000_001, variation: 0 })],
    ['variação além do circuit breaker', stocks({ points: 185_000, variation: 21 })],
    ['pontos não numéricos', stocks({ points: 'n/a', variation: 0 })],
    ['IBOVESPA ausente', stocks(null)],
  ])('rejeita resposta corrompida: %s', (_label, payload) => {
    expect(parseIbovespa(payload)).toBeNull();
  });
});
