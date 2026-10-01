import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker, { type Env } from '../index';
import type { IndicatorsResponse } from '../../src/types';
import { resetInflight } from '../cache';
import okPayload from '../../server/__fixtures__/hg-finance-ok.json';

const MINUTE = 60 * 1000;

/** KV em memória com a parte da API que o Worker usa. */
function fakeKv(initial: Record<string, unknown> = {}) {
  const store = new Map(Object.entries(initial).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    store,
    get: vi.fn(async (key: string) => {
      const raw = store.get(key);
      return raw === undefined ? null : JSON.parse(raw);
    }),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
  };
}

function setup(kvInitial: Record<string, unknown> = {}, env: Partial<Env> = {}) {
  const kv = fakeKv(kvInitial);
  const pending: Promise<unknown>[] = [];
  const ctx = { waitUntil: (p: Promise<unknown>) => pending.push(p), passThroughOnException() {} };
  const assets = { fetch: vi.fn(async () => new Response('<html>', { status: 404 })) };
  const fullEnv = { HG_BRASIL_KEY: 'chave', MARKET_CACHE: kv, ASSETS: assets, ...env } as unknown as Env;
  const call = (path: string, init?: RequestInit) =>
    worker.fetch(new Request(`https://checkfinance.com.br${path}`, init), fullEnv, ctx as unknown as ExecutionContext);
  return { kv, pending, assets, call };
}

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const cachedQuote = (fetchedAgoMs: number, extra: Record<string, unknown> = {}) => ({
  'ibovespa:v2': { value: { points: 180_000, changePercent: 1.5 }, fetchedAt: ago(fetchedAgoMs), ...extra },
});

let upstream: ReturnType<typeof vi.fn>;

beforeEach(() => {
  resetInflight();
  upstream = vi.fn(async () => Response.json(okPayload));
  vi.stubGlobal('fetch', upstream);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('GET /api/ibovespa', () => {
  it('cache fresco não consulta a HG Brasil', async () => {
    const { call } = setup(cachedQuote(MINUTE));
    const res = await call('/api/ibovespa');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ points: 180_000, stale: false });
    expect(upstream).not.toHaveBeenCalled();
  });

  it('cache vencido responde na hora e revalida depois da resposta', async () => {
    const { call, pending, kv } = setup(cachedQuote(30 * MINUTE));
    const res = await call('/api/ibovespa');
    expect(await res.json()).toMatchObject({ points: 180_000, stale: false });
    expect(pending).toHaveLength(1);

    await Promise.all(pending);
    expect(upstream).toHaveBeenCalledTimes(1);
    expect(JSON.parse(kv.store.get('ibovespa:v2')!).value).toEqual({ points: 185229.17, changePercent: -0.41 });
  });

  it('requisições simultâneas com cache vencido fazem uma consulta só', async () => {
    const { call, pending } = setup(cachedQuote(30 * MINUTE));
    await Promise.all([call('/api/ibovespa'), call('/api/ibovespa'), call('/api/ibovespa')]);
    await Promise.all(pending);
    expect(upstream).toHaveBeenCalledTimes(1);
  });

  it('sem cache, espera a fonte', async () => {
    const { call, pending } = setup();
    const res = await call('/api/ibovespa');
    expect(await res.json()).toMatchObject({ points: 185229.17, stale: false });
    expect(pending).toHaveLength(0);
  });

  it('fonte fora do ar: devolve o último valor como stale e não insiste a cada visita', async () => {
    upstream.mockImplementation(async () => new Response('erro', { status: 500 }));
    const { call, pending } = setup(cachedQuote(30 * MINUTE));

    await call('/api/ibovespa');
    await Promise.all(pending);
    const res = await call('/api/ibovespa');
    expect(await res.json()).toMatchObject({ points: 180_000, stale: true });

    await Promise.all(pending);
    expect(upstream).toHaveBeenCalledTimes(1);
  });

  it('valor além do prazo máximo e fonte fora do ar: 503', async () => {
    upstream.mockImplementation(async () => new Response('erro', { status: 500 }));
    const { call } = setup(cachedQuote(25 * 60 * MINUTE));
    const res = await call('/api/ibovespa');
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('sem chave configurada não consulta a fonte', async () => {
    const { call } = setup({}, { HG_BRASIL_KEY: '' });
    expect((await call('/api/ibovespa')).status).toBe(503);
    expect(upstream).not.toHaveBeenCalled();
  });
});

describe('roteamento', () => {
  it('método diferente de GET/HEAD recebe 405 com Allow', async () => {
    const { call } = setup(cachedQuote(MINUTE));
    const res = await call('/api/ibovespa', { method: 'POST' });
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('GET, HEAD');
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('HEAD devolve os cabeçalhos do GET sem corpo', async () => {
    const { call } = setup(cachedQuote(MINUTE));
    const res = await call('/api/ibovespa', { method: 'HEAD' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.text()).toBe('');
  });

  it('rota /api desconhecida recebe 404 em JSON, não a página 404', async () => {
    const { call, assets } = setup();
    const res = await call('/api/nao-existe');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not_found' });
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it('fora de /api, repassa aos arquivos estáticos', async () => {
    const { call, assets } = setup();
    await call('/qualquer-coisa');
    expect(assets.fetch).toHaveBeenCalledTimes(1);
  });

  it('respostas da API levam nosniff', async () => {
    const { call } = setup(cachedQuote(MINUTE));
    expect((await call('/api/ibovespa')).headers.get('x-content-type-options')).toBe('nosniff');
  });
});

describe('GET /api/indicadores', () => {
  const today = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  let sgs: Record<string, unknown>;

  beforeEach(() => {
    sgs = {
      432: [{ data: today, valor: '14.25' }],
      4389: [{ data: today, valor: '14.15' }],
      13522: [{ data: today, valor: '4.50' }],
      195: [{ data: today, valor: '0.6' }],
      1: [{ data: '01/01/2026', valor: '5.10' }, { data: today, valor: '5.20' }],
    };
    upstream.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith('https://api.hgbrasil.com')) return Response.json(okPayload);
      const id = /bcdata\.sgs\.(\d+)\//.exec(url)?.[1];
      return id && sgs[id] ? Response.json(sgs[id]) : new Response('not found', { status: 404 });
    });
  });

  it('junta as séries do BCB e o IBOVESPA numa resposta só', async () => {
    const { call, kv } = setup();
    const res = await call('/api/indicadores');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('public, max-age=300');

    const body = (await res.json()) as IndicatorsResponse;
    expect(body.series).toMatchObject({
      selic: { date: today, value: 14.25 },
      poupanca: { value: 0.6 },
      ptax: [{ value: 5.1 }, { value: 5.2 }],
    });
    expect(body.ibovespa).toMatchObject({ points: 185229.17 });
    expect(upstream).toHaveBeenCalledTimes(6);
    expect(kv.store.has('bcb:v1')).toBe(true);
  });

  it('uma série fora do ar mantém o valor anterior do cache', async () => {
    delete sgs[13522];
    const previous = { selic: null, cdi: null, ipca: { date: '10/09/2026', value: 4.1 }, poupanca: null, ptax: null };
    const { call, pending } = setup({ 'bcb:v1': { value: previous, fetchedAt: ago(2 * 60 * MINUTE) } });

    // Cache vencido: a primeira resposta ainda é o valor antigo; a revalidação vem depois.
    const first = (await (await call('/api/indicadores')).json()) as IndicatorsResponse;
    expect(first.series!.selic).toBeNull();
    await Promise.all(pending);

    const second = (await (await call('/api/indicadores')).json()) as IndicatorsResponse;
    expect(second.series!.selic).toEqual({ date: today, value: 14.25 });
    expect(second.series!.ipca).toEqual({ date: '10/09/2026', value: 4.1 });
  });

  it('BCB e HG Brasil fora do ar, sem cache: séries null e max-age curto', async () => {
    upstream.mockImplementation(async () => new Response('erro', { status: 500 }));
    const { call } = setup();
    const res = await call('/api/indicadores');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ series: null, ibovespa: null });
    expect(res.headers.get('cache-control')).toBe('public, max-age=60');
  });
});
