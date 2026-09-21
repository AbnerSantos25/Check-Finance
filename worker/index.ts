import { HG_FINANCE_URL, parseIbovespa } from '../server/hgBrasil';
import type { IbovespaQuote } from '../src/types';

interface Env {
  HG_BRASIL_KEY: string;
  MARKET_CACHE: KVNamespace;
  ASSETS: Fetcher;
}

const CACHE_KEY = 'ibovespa:v1';
// O plano grátis da HG Brasil permite 400 requisições por dia.
// Uma consulta a cada 10 min dá no máximo ~144, independente do número de visitantes.
const FRESH_MS = 10 * 60 * 1000;
// Depois disso, um valor antigo deixa de ser informação útil sobre o mercado.
const MAX_STALE_MS = 24 * 60 * 60 * 1000;
const KV_TTL_SECONDS = 2 * 24 * 60 * 60;
const UPSTREAM_TIMEOUT_MS = 5000;

interface CachedQuote {
  points: number;
  changePercent: number;
  fetchedAt: string;
}

const jsonResponse = (body: unknown, status: number, maxAgeSeconds: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${maxAgeSeconds}`,
    },
  });

const toQuote = (cached: CachedQuote, stale: boolean): IbovespaQuote => ({
  points: cached.points,
  changePercent: cached.changePercent,
  fetchedAt: cached.fetchedAt,
  stale,
  source: 'HG Brasil',
});

async function readCache(env: Env): Promise<CachedQuote | null> {
  try {
    return await env.MARKET_CACHE.get<CachedQuote>(CACHE_KEY, 'json');
  } catch (err) {
    console.error('KV read failed', err);
    return null;
  }
}

async function fetchFromHgBrasil(key: string): Promise<CachedQuote | null> {
  try {
    const res = await fetch(`${HG_FINANCE_URL}?key=${encodeURIComponent(key)}`, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;

    const parsed = parseIbovespa(await res.json());
    return parsed ? { ...parsed, fetchedAt: new Date().toISOString() } : null;
  } catch (err) {
    console.error('HG Brasil request failed', err);
    return null;
  }
}

async function handleIbovespa(env: Env): Promise<Response> {
  const cached = await readCache(env);
  const ageMs = cached ? Date.now() - Date.parse(cached.fetchedAt) : Infinity;

  if (cached && ageMs >= 0 && ageMs < FRESH_MS) {
    return jsonResponse(toQuote(cached, false), 200, 60);
  }

  if (!env.HG_BRASIL_KEY) {
    console.error('HG_BRASIL_KEY is not configured');
    return cached && ageMs < MAX_STALE_MS
      ? jsonResponse(toQuote(cached, true), 200, 60)
      : jsonResponse({ error: 'unavailable' }, 503, 0);
  }

  const fresh = await fetchFromHgBrasil(env.HG_BRASIL_KEY);

  if (fresh) {
    try {
      await env.MARKET_CACHE.put(CACHE_KEY, JSON.stringify(fresh), { expirationTtl: KV_TTL_SECONDS });
    } catch (err) {
      console.error('KV write failed', err);
    }
    return jsonResponse(toQuote(fresh, false), 200, 60);
  }

  if (cached && ageMs < MAX_STALE_MS) {
    return jsonResponse(toQuote(cached, true), 200, 60);
  }

  return jsonResponse({ error: 'unavailable' }, 503, 0);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/ibovespa' && request.method === 'GET') {
      return handleIbovespa(env);
    }

    return env.ASSETS.fetch(request);
  },
};
