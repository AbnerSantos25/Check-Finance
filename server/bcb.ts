import type { BcbSeries, SgsPoint } from '../src/types';

/**
 * Séries do SGS (Sistema Gerenciador de Séries Temporais) do Banco Central usadas
 * nos indicadores do topo e como taxas padrão das calculadoras.
 */
export const BCB_SERIES = {
  selic: 432, // Meta Selic definida pelo Copom (% a.a.)
  cdi: 4389, // CDI anualizado base 252 (% a.a.)
  ipca: 13522, // IPCA acumulado em 12 meses (%)
  poupanca: 195, // Rendimento mensal da poupança para depósitos do dia (% a.m.)
  ptax: 1, // Dólar comercial, venda (R$)
} as const;

export type BcbSeriesName = keyof typeof BCB_SERIES;

/** Quantos pontos cada série devolve (o último, salvo o PTAX, que precisa da variação). */
const POINTS_KEPT: Record<BcbSeriesName, number> = { selic: 1, cdi: 1, ipca: 1, poupanca: 1, ptax: 2 };

/** Data de hoje em Brasília como `aaaa-mm-dd`. O Worker roda em UTC. */
export function brazilToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
}

/** `aaaa-mm-dd` → `dd/mm/aaaa`. */
const toBcbDate = (isoDay: string) => isoDay.split('-').reverse().join('/');

/** `dd/mm/aaaa` → `aaaa-mm-dd` (comparável como texto), ou null se inválida. */
function toIsoDay(label: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(label);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

function daysBefore(isoDay: string, days: number): string {
  const date = new Date(`${isoDay}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

/** URL de consulta de uma série do SGS. */
export function sgsUrl(name: BcbSeriesName, today: string): string {
  const base = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${BCB_SERIES[name]}/dados`;
  // A Selic meta publica linhas com data futura até a próxima reunião do Copom, então
  // `ultimos/1` devolveria um dia que ainda não chegou. Busca o último mês e filtra.
  if (name === 'selic') {
    return `${base}?formato=json&dataInicial=${toBcbDate(daysBefore(today, 30))}&dataFinal=${toBcbDate(today)}`;
  }
  // A poupança traz alguns dias para o caso de o último ainda não ter sido publicado.
  const count = name === 'poupanca' ? 5 : POINTS_KEPT[name];
  return `${base}/ultimos/${count}?formato=json`;
}

/**
 * Lê a resposta do SGS: lista de `{ data: 'dd/mm/aaaa', valor: '14.25' }`.
 * Descarta linhas inválidas e com data posterior a `today`, ordena da mais antiga
 * para a mais recente e devolve só os últimos `POINTS_KEPT` pontos.
 */
export function parseSgs(name: BcbSeriesName, payload: unknown, today: string): SgsPoint[] | null {
  if (!Array.isArray(payload)) return null;

  const points = payload
    .map((row: unknown) => {
      if (typeof row !== 'object' || row === null) return null;
      const { data, valor } = row as { data?: unknown; valor?: unknown };
      if (typeof data !== 'string' || (typeof valor !== 'string' && typeof valor !== 'number')) return null;
      const day = toIsoDay(data);
      const value = parseFloat(String(valor).replace(',', '.'));
      return day && day <= today && Number.isFinite(value) ? { day, point: { date: data, value } } : null;
    })
    .filter((p): p is { day: string; point: SgsPoint } => p !== null)
    .sort((a, b) => a.day.localeCompare(b.day))
    .map((p) => p.point);

  return points.length > 0 ? points.slice(-POINTS_KEPT[name]) : null;
}

/**
 * Junta o resultado de uma consulta com o último valor bom de cada série: uma
 * série fora do ar mantém o valor anterior (que traz a própria data) em vez de
 * derrubar as outras. Devolve null quando nenhuma série respondeu.
 */
export function mergeSeries(
  fresh: Record<BcbSeriesName, SgsPoint[] | null>,
  previous: BcbSeries | null
): BcbSeries | null {
  if (Object.values(fresh).every((points) => points === null)) return null;

  const last = (name: Exclude<BcbSeriesName, 'ptax'>) => fresh[name]?.at(-1) ?? previous?.[name] ?? null;
  return {
    selic: last('selic'),
    cdi: last('cdi'),
    ipca: last('ipca'),
    poupanca: last('poupanca'),
    ptax: fresh.ptax ?? previous?.ptax ?? null,
  };
}
