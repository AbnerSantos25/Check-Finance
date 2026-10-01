import type {
  EconomicIndicator,
  IbovespaQuote,
  IndicatorStatus,
  IndicatorsResponse,
  MarketRates,
  SgsPoint,
} from '../../types';
import { formatNumber } from './format';

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

interface DatedPoint {
  date: Date;
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

function parseBcbDate(label: string): Date | null {
  const [day, month, year] = label.split('/').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

const shortDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (date: Date) => `${MONTHS[date.getMonth()]}/${String(date.getFullYear()).slice(2)}`;

export function buildReferenceData(): EconomicData {
  return buildEconomicData({ selic: null, cdi: null, ipca: null, poupanca: null, ptax: null }, null);
}

interface FetchedSeries {
  selic: DatedPoint | null;
  cdi: DatedPoint | null;
  ipca: DatedPoint | null;
  poupanca: DatedPoint | null;
  ptax: DatedPoint[] | null;
}

function toDated(point: SgsPoint | null | undefined): DatedPoint | null {
  if (!point || !Number.isFinite(point.value)) return null;
  const date = parseBcbDate(point.date);
  return date ? { date, value: point.value } : null;
}

function toFetchedSeries(series: IndicatorsResponse['series']): FetchedSeries {
  const ptax = (series?.ptax ?? []).map(toDated).filter((p): p is DatedPoint => p !== null);
  return {
    selic: toDated(series?.selic),
    cdi: toDated(series?.cdi),
    ipca: toDated(series?.ipca),
    poupanca: toDated(series?.poupanca),
    ptax: ptax.length > 0 ? ptax : null,
  };
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
 * Busca os indicadores no Worker (`/api/indicadores`), que consulta o BCB e a HG
 * Brasil e guarda o resultado num cache compartilhado por todos os visitantes.
 * Fonte indisponível vira valor de referência datado, sinalizado como tal.
 *
 * Quem evita repetir a busca entre páginas e visitas é o cache HTTP (a resposta
 * vem com `max-age`); `force` pede ao navegador que confirme com o servidor.
 */
export async function loadEconomicIndicators(options: { force?: boolean } = {}): Promise<EconomicData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch('/api/indicadores', {
      signal: controller.signal,
      cache: options.force ? 'no-cache' : 'default',
    });
    if (!res.ok) return buildReferenceData();
    const body = (await res.json()) as Partial<IndicatorsResponse> | null;
    const ibovespa = Number.isFinite(body?.ibovespa?.points) ? (body!.ibovespa as IbovespaQuote) : null;
    return buildEconomicData(toFetchedSeries(body?.series ?? null), ibovespa);
  } catch (err) {
    console.warn('Indicadores indisponíveis', err);
    return buildReferenceData();
  } finally {
    clearTimeout(timeoutId);
  }
}
