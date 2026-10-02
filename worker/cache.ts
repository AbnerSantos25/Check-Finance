/**
 * Cache no KV com stale-while-revalidate.
 *
 * - Valor fresco: devolvido direto, sem tocar na fonte.
 * - Valor vencido, mas ainda útil: devolvido na hora, e a revalidação roda depois
 *   da resposta, em `ctx.waitUntil`. O visitante não espera pela fonte.
 * - Sem valor útil: a requisição espera a fonte por no máximo `waitMs`. Se ela
 *   demorar mais, a resposta sai sem o valor e a consulta continua em segundo
 *   plano, deixando o KV pronto para a próxima visita.
 *
 * Quando a fonte falha, a falha fica registrada no KV — mesmo sem valor anterior —
 * e só se tenta de novo depois de `retryMs`. Senão, com a fonte fora do ar, cada
 * visita viraria uma chamada e uma espera.
 */

export interface CacheEntry<T> {
  /** Último valor bom; null enquanto a fonte nunca respondeu. */
  value: T | null;
  /** Última vez que a fonte respondeu (ISO); null enquanto nunca respondeu. */
  fetchedAt: string | null;
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
  /**
   * Quanto uma requisição espera a fonte quando não há valor útil no cache. A
   * resposta do Worker entra no caminho da primeira pintura, então uma fonte lenta
   * não pode segurá-la pelo timeout inteiro.
   */
  waitMs: number;
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
    const entry: CacheEntry<T> = value
      ? { value, fetchedAt: now }
      : { value: previous?.value ?? null, fetchedAt: previous?.fetchedAt ?? null, failedAt: now };
    await writeEntry(kv, spec, entry);
    return entry;
  })().finally(() => inflight.delete(spec.key));

  inflight.set(spec.key, run);
  return run;
}

const age = (iso: string | null | undefined, now: number) => (iso ? now - Date.parse(iso) : Infinity);

function toCachedValue<T>(entry: CacheEntry<T> | null, spec: SwrSpec<T>, now: number): CachedValue<T> | null {
  if (!entry || entry.value === null || !entry.fetchedAt) return null;
  const fetchedAge = age(entry.fetchedAt, now);
  if (!(fetchedAge >= 0 && fetchedAge < spec.maxStaleMs)) return null;
  const stale = entry.failedAt !== undefined && Date.parse(entry.failedAt) > Date.parse(entry.fetchedAt);
  return { value: entry.value, fetchedAt: entry.fetchedAt, stale };
}

/** A promessa, ou null se ela não terminar em `ms`. */
async function within<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  try {
    return await Promise.race([promise, deadline]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function cachedWithRevalidate<T>(
  kv: KVNamespace,
  ctx: ExecutionContext,
  spec: SwrSpec<T>
): Promise<CachedValue<T> | null> {
  const now = Date.now();
  const cached = await readEntry<T>(kv, spec.key);
  const usable = toCachedValue(cached, spec, now);
  const recentlyFailed = age(cached?.failedAt, now) < spec.retryMs;

  if (usable) {
    if (age(cached!.fetchedAt, now) >= spec.freshMs && !recentlyFailed) {
      ctx.waitUntil(refresh(kv, spec, cached).then(() => undefined));
    }
    return usable;
  }

  // Nada útil para servir, mas a fonte acabou de falhar: não insiste a cada visita.
  if (recentlyFailed) return null;

  // A consulta segue até o fim em segundo plano mesmo que a resposta saia antes.
  const pending = refresh(kv, spec, cached);
  ctx.waitUntil(pending.then(() => undefined));
  const entry = await within(pending, spec.waitMs);
  return toCachedValue(entry, spec, Date.now());
}

/** Só para os testes: esquece revalidações pendentes entre um caso e outro. */
export const resetInflight = () => inflight.clear();
