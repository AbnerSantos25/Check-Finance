import { BCB_SERIES, brazilToday, mergeSeries, parseSgs, sgsUrl, type BcbSeriesName } from '../server/bcb';
import { HG_FINANCE_URL, parseIbovespa, type ParsedIbovespa } from '../server/hgBrasil';
import type { BcbSeries, IbovespaQuote, IndicatorsResponse, SgsPoint } from '../src/types';
import { cachedWithRevalidate, type CachedValue, type SwrSpec } from './cache';

export interface Env {
  HG_BRASIL_KEY: string;
  MARKET_CACHE: KVNamespace;
  ASSETS: Fetcher;
}

const UPSTREAM_TIMEOUT_MS = 5000;

const jsonResponse = (body: unknown, status: number, maxAgeSeconds: number, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': maxAgeSeconds > 0 ? `public, max-age=${maxAgeSeconds}` : 'no-store',
      // O public/_headers só vale para os arquivos estáticos.
      'x-content-type-options': 'nosniff',
      ...headers,
    },
  });

// ---------------------------------------------------------------------------
// IBOVESPA (HG Brasil)
// ---------------------------------------------------------------------------

const ibovespaSpec = (env: Env): SwrSpec<ParsedIbovespa> => ({
  // v2: o formato do valor no KV mudou junto com o stale-while-revalidate.
  key: 'ibovespa:v2',
  // O plano grátis da HG Brasil permite 400 requisições por dia.
  // Uma consulta a cada 10 min dá no máximo ~144, independente do número de visitantes.
  freshMs: 10 * 60 * 1000,
  // Depois disso, um valor antigo deixa de ser informação útil sobre o mercado.
  maxStaleMs: 24 * 60 * 60 * 1000,
  retryMs: 2 * 60 * 1000,
  load: () => fetchFromHgBrasil(env.HG_BRASIL_KEY),
});

async function fetchFromHgBrasil(key: string): Promise<ParsedIbovespa | null> {
  if (!key) {
    console.error('HG_BRASIL_KEY is not configured');
    return null;
  }
  try {
    const res = await fetch(`${HG_FINANCE_URL}?key=${encodeURIComponent(key)}`, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    return parseIbovespa(await res.json());
  } catch (err) {
    console.error('HG Brasil request failed', err);
    return null;
  }
}

const toQuote = (cached: CachedValue<ParsedIbovespa>): IbovespaQuote => ({
  points: cached.value.points,
  changePercent: cached.value.changePercent,
  fetchedAt: cached.fetchedAt,
  stale: cached.stale,
  source: 'HG Brasil',
});

async function loadIbovespa(env: Env, ctx: ExecutionContext): Promise<IbovespaQuote | null> {
  const cached = await cachedWithRevalidate(env.MARKET_CACHE, ctx, ibovespaSpec(env));
  return cached && toQuote(cached);
}

async function handleIbovespa(env: Env, ctx: ExecutionContext): Promise<Response> {
  const quote = await loadIbovespa(env, ctx);
  return quote ? jsonResponse(quote, 200, 60) : jsonResponse({ error: 'unavailable' }, 503, 0);
}

// ---------------------------------------------------------------------------
// Séries do Banco Central (SGS)
// ---------------------------------------------------------------------------

const bcbSpec: SwrSpec<BcbSeries> = {
  key: 'bcb:v1',
  // As séries mudam no máximo uma vez por dia (a Selic, só nas reuniões do Copom).
  freshMs: 60 * 60 * 1000,
  // Cada série leva a própria data na tela, então um valor de alguns dias atrás
  // ainda é informação correta; passado isso, as calculadoras usam a referência.
  maxStaleMs: 7 * 24 * 60 * 60 * 1000,
  retryMs: 10 * 60 * 1000,
  load: (previous) => fetchBcbSeries(previous),
};

async function fetchSgs(name: BcbSeriesName, today: string): Promise<SgsPoint[] | null> {
  try {
    const res = await fetch(sgsUrl(name, today), {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: { accept: 'application/json', 'user-agent': 'CheckFinance (+https://checkfinance.com.br)' },
    });
    if (!res.ok) {
      console.error(`BCB SGS ${BCB_SERIES[name]} answered ${res.status}`);
      return null;
    }
    return parseSgs(name, await res.json(), today);
  } catch (err) {
    console.error(`BCB SGS ${BCB_SERIES[name]} request failed`, err);
    return null;
  }
}

async function fetchBcbSeries(previous: BcbSeries | null): Promise<BcbSeries | null> {
  const today = brazilToday();
  const names = Object.keys(BCB_SERIES) as BcbSeriesName[];
  const results = await Promise.all(names.map((name) => fetchSgs(name, today)));
  const fresh = Object.fromEntries(names.map((name, i) => [name, results[i]])) as Record<
    BcbSeriesName,
    SgsPoint[] | null
  >;
  return mergeSeries(fresh, previous);
}

/**
 * Todos os indicadores do topo numa requisição só: as séries do BCB e o IBOVESPA,
 * cada um com o próprio cache no KV.
 */
async function handleIndicators(env: Env, ctx: ExecutionContext): Promise<Response> {
  const [series, ibovespa] = await Promise.all([
    cachedWithRevalidate(env.MARKET_CACHE, ctx, bcbSpec),
    loadIbovespa(env, ctx),
  ]);
  const body: IndicatorsResponse = { series: series?.value ?? null, ibovespa };
  // Sem as séries, o navegador volta a perguntar logo; com elas, 5 min bastam.
  return jsonResponse(body, 200, series ? 300 : 60);
}

// ---------------------------------------------------------------------------
// Roteamento
// ---------------------------------------------------------------------------

type Handler = (env: Env, ctx: ExecutionContext) => Promise<Response>;

const API_ROUTES = new Map<string, Handler>([
  ['/api/indicadores', handleIndicators],
  // O front não usa mais esta rota; ela fica para abas abertas com o JS anterior.
  ['/api/ibovespa', handleIbovespa],
]);
const ALLOWED_METHODS = 'GET, HEAD';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // O wrangler.toml só manda /api/* para cá antes dos arquivos estáticos; o
    // resto chega aqui apenas se nenhum arquivo casar.
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    const handler = API_ROUTES.get(url.pathname);
    if (!handler) return jsonResponse({ error: 'not_found' }, 404, 0);

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return jsonResponse({ error: 'method_not_allowed' }, 405, 0, { allow: ALLOWED_METHODS });
    }

    const response = await handler(env, ctx);
    return request.method === 'HEAD' ? new Response(null, response) : response;
  },
};
