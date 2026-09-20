import { EconomicIndicator, IbovespaQuote, IndicatorStatus, MarketRates } from '../types';
import { formatNumber } from './calculations';

const CACHE_KEY = 'hub_financeiro_economic_indicators_v2';
const CACHE_TTL_MS = 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6000;

// Values published by BCB/SGS on this date; shown only when a source is unreachable.
export const REFERENCE_DATE = '16/09/2026';
export const REFERENCE_RATES: MarketRates = {
  selic: 14.0,
  cdi: 13.9,
  ipca: 4.22,
  poupanca: 8.34,
};
const REFERENCE_IPCA_MONTH = 'ago/26';
const REFERENCE_PTAX = 5.1527;

interface SgsPoint {
  date: Date;
  label: string;
  value: number;
}

export interface EconomicData {
  indicators: EconomicIndicator[];
  rates: MarketRates;
  liveCount: number;
}

// 5 séries do BCB + IBOVESPA. O IBOVESPA só aparece quando há cotação real,
// por isso a lista pode vir menor.
export const EXPECTED_INDICATORS = 6;

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const toBcbDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

function parseBcbDate(label: string): Date | null {
  const [day, month, year] = label.split('/').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

/**
 * Fetches a BCB/SGS series and returns its points up to today, oldest first.
 * Some series (e.g. 432, Selic meta) publish future-dated rows until the next Copom meeting.
 */
async function fetchSgs(seriesId: number, query: string): Promise<SgsPoint[] | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesId}/dados${query}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const points = data
      .map((row: { data?: string; valor?: string }) => {
        const date = row.data ? parseBcbDate(row.data) : null;
        const value = row.valor !== undefined ? parseFloat(String(row.valor).replace(',', '.')) : NaN;
        return date && Number.isFinite(value) ? { date, label: row.data as string, value } : null;
      })
      .filter((p): p is SgsPoint => p !== null && p.date <= endOfToday)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return points.length > 0 ? points : null;
  } catch (err) {
    console.warn(`BCB SGS series ${seriesId} unavailable`, err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

const lastPoint = (points: SgsPoint[] | null) => (points ? points[points.length - 1] : null);

const shortDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (date: Date) => `${MONTHS[date.getMonth()]}/${String(date.getFullYear()).slice(2)}`;

function readCache(): EconomicData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { timestamp: number; data: EconomicData };
    return Date.now() - cached.timestamp < CACHE_TTL_MS ? cached.data : null;
  } catch {
    return null;
  }
}

function writeCache(data: EconomicData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Storage may be unavailable (private mode); the data is simply refetched next time.
  }
}

/**
 * Busca a cotação do IBOVESPA na Pages Function, que guarda a chave da HG Brasil
 * no servidor e mantém um cache global de 10 minutos.
 */
async function fetchIbovespa(): Promise<IbovespaQuote | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch('/api/ibovespa', { signal: controller.signal });
    if (!res.ok) return null;
    const quote = (await res.json()) as IbovespaQuote;
    return Number.isFinite(quote?.points) ? quote : null;
  } catch (err) {
    console.warn('IBOVESPA indisponível', err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function buildReferenceData(): EconomicData {
  return buildEconomicData({ selic: null, cdi: null, ipca: null, poupanca: null, ptax: null }, null);
}

interface FetchedSeries {
  selic: SgsPoint | null;
  cdi: SgsPoint | null;
  ipca: SgsPoint | null;
  poupanca: SgsPoint | null;
  ptax: SgsPoint[] | null;
}

function ibovespaIndicator(quote: IbovespaQuote): EconomicIndicator {
  const fetchedAt = new Date(quote.fetchedAt);
  const isToday = fetchedAt.toDateString() === new Date().toDateString();
  const time = `${String(fetchedAt.getHours()).padStart(2, '0')}h${String(fetchedAt.getMinutes()).padStart(2, '0')}`;

  return {
    name: 'IBOVESPA',
    value: `${formatNumber(quote.points, 0)} pts`,
    change: `${quote.changePercent >= 0 ? '+' : ''}${formatNumber(quote.changePercent)}%`,
    positive: quote.changePercent >= 0,
    status: quote.stale ? 'reference' : 'live',
    asOf: isToday ? time : shortDate(fetchedAt),
    source: 'B3, via HG Brasil',
  };
}

function buildEconomicData(series: FetchedSeries, ibovespa: IbovespaQuote | null): EconomicData {
  const status = (point: unknown): IndicatorStatus => (point ? 'live' : 'reference');

  const selic = series.selic?.value ?? REFERENCE_RATES.selic;
  const cdi = series.cdi?.value ?? REFERENCE_RATES.cdi;
  const ipca = series.ipca?.value ?? REFERENCE_RATES.ipca;
  // Series 195 is the monthly yield for deposits made on that date.
  const poupanca = series.poupanca
    ? (Math.pow(1 + series.poupanca.value / 100, 12) - 1) * 100
    : REFERENCE_RATES.poupanca;

  const ptaxLast = series.ptax ? series.ptax[series.ptax.length - 1] : null;
  const ptaxPrev = series.ptax && series.ptax.length > 1 ? series.ptax[series.ptax.length - 2] : null;
  const ptax = ptaxLast?.value ?? REFERENCE_PTAX;
  const ptaxChange = ptaxLast && ptaxPrev ? (ptaxLast.value / ptaxPrev.value - 1) * 100 : null;

  const indicators: EconomicIndicator[] = [
    {
      name: 'SELIC meta',
      value: `${formatNumber(selic)}% a.a.`,
      change: 'Copom',
      positive: true,
      status: status(series.selic),
      asOf: series.selic ? shortDate(series.selic.date) : REFERENCE_DATE,
      source: 'BCB · série 432',
    },
    {
      name: 'CDI',
      value: `${formatNumber(cdi)}% a.a.`,
      change: 'BCB',
      positive: true,
      status: status(series.cdi),
      asOf: series.cdi ? shortDate(series.cdi.date) : REFERENCE_DATE,
      source: 'BCB · série 4389',
    },
    {
      name: 'IPCA 12m',
      value: `${formatNumber(ipca)}%`,
      change: series.ipca ? monthLabel(series.ipca.date) : REFERENCE_IPCA_MONTH,
      positive: true,
      status: status(series.ipca),
      asOf: series.ipca ? monthLabel(series.ipca.date) : REFERENCE_DATE,
      source: 'IBGE, via BCB · série 13522',
    },
    {
      name: 'Poupança',
      value: `${formatNumber(poupanca)}% a.a.`,
      change: 'BCB',
      positive: true,
      status: status(series.poupanca),
      asOf: series.poupanca ? shortDate(series.poupanca.date) : REFERENCE_DATE,
      source: 'BCB · série 195',
    },
    {
      name: 'Dólar PTAX',
      value: `R$ ${formatNumber(ptax, 4)}`,
      change: ptaxChange !== null ? `${ptaxChange >= 0 ? '+' : ''}${formatNumber(ptaxChange)}%` : undefined,
      positive: ptaxChange !== null ? ptaxChange <= 0 : true,
      status: status(ptaxLast),
      asOf: ptaxLast ? shortDate(ptaxLast.date) : REFERENCE_DATE,
      source: 'BCB · série 1',
    },
  ];

  if (ibovespa) indicators.push(ibovespaIndicator(ibovespa));

  return {
    indicators,
    rates: { selic, cdi, ipca, poupanca },
    liveCount: indicators.filter((i) => i.status === 'live').length,
  };
}

/**
 * Loads indicators from BCB/SGS. Unreachable sources fall back to dated reference values
 * and are flagged as such; only fully live results are cached.
 */
export async function loadEconomicIndicators(options: { force?: boolean } = {}): Promise<EconomicData> {
  if (!options.force) {
    const cached = readCache();
    if (cached) return cached;
  }

  const today = new Date();
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [selic, cdi, ipca, poupanca, ptax, ibovespa] = await Promise.all([
    fetchSgs(432, `?formato=json&dataInicial=${toBcbDate(monthAgo)}&dataFinal=${toBcbDate(today)}`),
    fetchSgs(4389, '/ultimos/1?formato=json'),
    fetchSgs(13522, '/ultimos/1?formato=json'),
    fetchSgs(195, '/ultimos/5?formato=json'),
    fetchSgs(1, '/ultimos/2?formato=json'),
    fetchIbovespa(),
  ]);

  const data = buildEconomicData(
    {
      selic: lastPoint(selic),
      cdi: lastPoint(cdi),
      ipca: lastPoint(ipca),
      poupanca: lastPoint(poupanca),
      ptax,
    },
    ibovespa
  );

  // Só guarda em cache o retrato completo, para que uma fonte com falha seja
  // consultada de novo no próximo carregamento.
  if (data.liveCount === EXPECTED_INDICATORS) writeCache(data);
  return data;
}
