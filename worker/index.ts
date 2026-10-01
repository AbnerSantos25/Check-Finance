import { HG_FINANCE_URL, parseIbovespa, type ParsedIbovespa } from '../server/hgBrasil';
import type { IbovespaQuote } from '../src/types';
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
// Roteamento
// ---------------------------------------------------------------------------

type Handler = (env: Env, ctx: ExecutionContext) => Promise<Response>;

const API_ROUTES = new Map<string, Handler>([['/api/ibovespa', handleIbovespa]]);
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
