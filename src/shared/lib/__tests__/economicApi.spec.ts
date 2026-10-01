import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IndicatorsResponse } from '../../../types';
import { EXPECTED_INDICATORS, REFERENCE_DATE, REFERENCE_RATES, loadEconomicIndicators } from '../economicApi';

const FULL: IndicatorsResponse = {
  series: {
    selic: { date: '17/09/2026', value: 14.25 },
    cdi: { date: '30/09/2026', value: 14.15 },
    ipca: { date: '01/08/2026', value: 4.5 },
    poupanca: { date: '30/09/2026', value: 0.6 },
    ptax: [
      { date: '29/09/2026', value: 5 },
      { date: '30/09/2026', value: 5.1 },
    ],
  },
  ibovespa: {
    points: 185_000,
    changePercent: -0.41,
    fetchedAt: '2026-09-30T18:00:00.000Z',
    stale: false,
    source: 'HG Brasil',
  },
};

let fetchMock: ReturnType<typeof vi.fn>;
const respondWith = (body: unknown, status = 200) =>
  fetchMock.mockImplementation(async () => new Response(JSON.stringify(body), { status }));

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const byName = (data: Awaited<ReturnType<typeof loadEconomicIndicators>>, name: string) =>
  data.indicators.find((i) => i.name === name)!;

describe('loadEconomicIndicators', () => {
  it('faz uma requisição só, ao Worker', async () => {
    respondWith(FULL);
    await loadEconomicIndicators();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/indicadores');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: 'default' });
  });

  it('force pede ao navegador para revalidar o cache HTTP', async () => {
    respondWith(FULL);
    await loadEconomicIndicators({ force: true });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: 'no-cache' });
  });

  it('resposta completa: todas as fontes ao vivo', async () => {
    respondWith(FULL);
    const data = await loadEconomicIndicators();
    expect(data.liveCount).toBe(EXPECTED_INDICATORS);
    expect(data.rates.selic).toBe(14.25);
    expect(data.rates.cdi).toBe(14.15);
    expect(data.rates.ipca).toBe(4.5);
    expect(byName(data, 'SELIC meta').asOf).toBe('17/09');
    expect(byName(data, 'IPCA 12m').asOf).toBe('ago/26');
  });

  it('anualiza a poupança a partir do rendimento mensal (série 195)', async () => {
    respondWith(FULL);
    const data = await loadEconomicIndicators();
    expect(data.rates.poupanca).toBeCloseTo((Math.pow(1.006, 12) - 1) * 100, 10);
  });

  it('calcula a variação do PTAX entre os dois últimos pontos', async () => {
    respondWith(FULL);
    const ptax = byName(await loadEconomicIndicators(), 'Dólar PTAX');
    expect(ptax.value).toBe('R$ 5,1000');
    expect(ptax.change).toBe('+2,00%');
    // Dólar subindo é ruim para quem lê o indicador.
    expect(ptax.positive).toBe(false);
  });

  it('série ausente vira valor de referência datado', async () => {
    respondWith({ ...FULL, series: { ...FULL.series!, cdi: null } });
    const data = await loadEconomicIndicators();
    const cdi = byName(data, 'CDI');
    expect(cdi.status).toBe('reference');
    expect(cdi.asOf).toBe(REFERENCE_DATE);
    expect(data.rates.cdi).toBe(REFERENCE_RATES.cdi);
    expect(data.liveCount).toBe(EXPECTED_INDICATORS - 1);
  });

  it('IBOVESPA ausente some da lista; stale aparece como referência', async () => {
    respondWith({ ...FULL, ibovespa: null });
    expect((await loadEconomicIndicators()).indicators.some((i) => i.name === 'IBOVESPA')).toBe(false);

    respondWith({ ...FULL, ibovespa: { ...FULL.ibovespa!, stale: true } });
    expect(byName(await loadEconomicIndicators(), 'IBOVESPA').status).toBe('reference');
  });

  it.each([
    ['erro de rede', () => fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))],
    ['HTTP 500', () => respondWith({ error: 'x' }, 500)],
    ['séries null', () => respondWith({ series: null, ibovespa: null })],
  ])('%s: só valores de referência', async (_label, arrange) => {
    arrange();
    const data = await loadEconomicIndicators();
    expect(data.liveCount).toBe(0);
    expect(data.rates).toEqual(REFERENCE_RATES);
  });
});

describe('REFERENCE_RATES', () => {
  // Os valores de referência aparecem quando o BCB e o cache do Worker falham ao
  // mesmo tempo, e também no HTML pré-renderizado antes da busca. Este teste
  // reprova quando eles envelhecem demais.
  //
  // Para atualizar: copie em economicApi.ts o último valor das séries 432 (Selic
  // meta), 4389 (CDI), 13522 (IPCA 12m), 195 (poupança, anualizada) e 1 (PTAX) em
  // https://www3.bcb.gov.br/sgspub e troque REFERENCE_DATE e REFERENCE_IPCA_MONTH.
  const MAX_AGE_DAYS = 180;

  it(`não têm mais de ${MAX_AGE_DAYS} dias`, () => {
    const [day, month, year] = REFERENCE_DATE.split('/').map(Number);
    const ageDays = (Date.now() - new Date(year, month - 1, day).getTime()) / 86_400_000;
    expect(ageDays, `REFERENCE_DATE (${REFERENCE_DATE}) tem ${Math.floor(ageDays)} dias; atualize os valores`).toBeLessThan(
      MAX_AGE_DAYS
    );
  });
});
