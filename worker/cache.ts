/**
 * Cache no KV com stale-while-revalidate.
 *
 * - Valor fresco: devolvido direto, sem tocar na fonte.
 * - Valor vencido, mas ainda útil: devolvido na hora, e a revalidação roda depois
 *   da resposta, em `ctx.waitUntil`. O visitante não espera pela fonte.
 * - Sem valor útil: aí sim a requisição espera a fonte.
 *
 * Quando a fonte falha, a falha fica registrada no KV e só se tenta de novo depois
 * de `retryMs` — senão, com a fonte fora do ar, cada visita viraria uma chamada.
 */

export interface CacheEntry<T> {
  value: T;
  /** Última vez que a fonte respondeu (ISO). */
  fetchedAt: string;
  /** Última tentativa que falhou (ISO), se for mais recente que `fetchedAt`. */
  failedAt?: string;
}

export interface CachedValue<T> {
  value: T;
  fetchedAt: string;
  /** true = a última consulta à fonte falhou e este é o último valor bom conhecido. */
  stale: boolean;
}

export interface SwrSpec<T> {
  key: string;
  /** Até quando o valor dispensa nova consulta. */
  freshMs: number;
  /** Depois disso o valor não é mais servido. */
  maxStaleMs: number;
  /** Intervalo mínimo entre tentativas depois de uma falha. */
  retryMs: number;
  /** Consulta a fonte. `previous` permite aproveitar partes do valor antigo; null = falhou. */
  load: (previous: T | null) => Promise<T | null>;
}

// Uma revalidação por chave em cada isolate: quando o cache vence sob pico, as
// requisições simultâneas esperam a mesma consulta em vez de abrir uma cada.
const inflight = new Map<string, Promise<CacheEntry<unknown> | null>>();

async function readEntry<T>(kv: KVNamespace, key: string): Promise<CacheEntry<T> | null> {
  try {
    return await kv.get<CacheEntry<T>>(key, 'json');
  } catch (err) {
    console.error('KV read failed', key, err);
    return null;
  }
}

async function writeEntry<T>(kv: KVNamespace, spec: SwrSpec<T>, entry: CacheEntry<T>) {
  try {
    await kv.put(spec.key, JSON.stringify(entry), {
      expirationTtl: Math.ceil((2 * spec.maxStaleMs) / 1000),
    });
  } catch (err) {
    console.error('KV write failed', spec.key, err);
  }
}

function refresh<T>(kv: KVNamespace, spec: SwrSpec<T>, previous: CacheEntry<T> | null) {
  const running = inflight.get(spec.key);
  if (running) return running as Promise<CacheEntry<T> | null>;

  const run = (async (): Promise<CacheEntry<T> | null> => {
    let value: T | null = null;
    try {
      value = await spec.load(previous?.value ?? null);
    } catch (err) {
      console.error('Source failed', spec.key, err);
    }

    const now = new Date().toISOString();
    const entry: CacheEntry<T> | null = value
      ? { value, fetchedAt: now }
      : previous && { ...previous, failedAt: now };
    if (entry) await writeEntry(kv, spec, entry);
    return entry;
  })().finally(() => inflight.delete(spec.key));

  inflight.set(spec.key, run);
  return run;
}

const age = (iso: string | undefined, now: number) => (iso ? now - Date.parse(iso) : Infinity);

function toCachedValue<T>(entry: CacheEntry<T> | null, spec: SwrSpec<T>, now: number): CachedValue<T> | null {
  if (!entry) return null;
  const fetchedAge = age(entry.fetchedAt, now);
  if (!(fetchedAge >= 0 && fetchedAge < spec.maxStaleMs)) return null;
  const stale = entry.failedAt !== undefined && Date.parse(entry.failedAt) > Date.parse(entry.fetchedAt);
  return { value: entry.value, fetchedAt: entry.fetchedAt, stale };
}

export async function cachedWithRevalidate<T>(
  kv: KVNamespace,
  ctx: ExecutionContext,
  spec: SwrSpec<T>
): Promise<CachedValue<T> | null> {
  const now = Date.now();
  const cached = await readEntry<T>(kv, spec.key);
  const usable = toCachedValue(cached, spec, now);

  if (usable) {
    const fetchedAge = age(cached!.fetchedAt, now);
    const recentlyFailed = age(cached!.failedAt, now) < spec.retryMs;
    if (fetchedAge >= spec.freshMs && !recentlyFailed) {
      ctx.waitUntil(refresh(kv, spec, cached).then(() => undefined));
    }
    return usable;
  }

  // Nada útil para servir, mas a fonte acabou de falhar: não insiste a cada visita.
  if (age(cached?.failedAt, now) < spec.retryMs) return null;

  return toCachedValue(await refresh(kv, spec, cached), spec, Date.now());
}

/** Só para os testes: esquece revalidações pendentes entre um caso e outro. */
export const resetInflight = () => inflight.clear();
