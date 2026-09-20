export const HG_FINANCE_URL = 'https://api.hgbrasil.com/finance';

// O índice fechou 2025 perto de 180 mil pontos; a faixa abaixo é só uma
// barreira contra respostas corrompidas, não uma previsão.
const MIN_POINTS = 10_000;
const MAX_POINTS = 1_000_000;
// Os circuit breakers da B3 interrompem o pregão bem antes disso.
const MAX_ABS_CHANGE_PERCENT = 20;

export interface ParsedIbovespa {
  points: number;
  changePercent: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Lê a cotação do IBOVESPA na resposta de GET /finance da HG Brasil.
 * A API responde HTTP 200 mesmo quando a chave é inválida ou o recurso é negado,
 * então o erro só aparece no corpo — daí a validação ser feita aqui.
 */
export function parseIbovespa(payload: unknown): ParsedIbovespa | null {
  if (!isRecord(payload)) return null;
  if (payload.valid_key === false) return null;
  if (Array.isArray(payload.errors) && payload.errors.length > 0) return null;

  const results = payload.results;
  if (!isRecord(results) || results.error) return null;

  const stocks = results.stocks;
  if (!isRecord(stocks)) return null;

  const ibovespa = stocks.IBOVESPA;
  if (!isRecord(ibovespa)) return null;

  const points = Number(ibovespa.points);
  const changePercent = Number(ibovespa.variation);

  if (!Number.isFinite(points) || points < MIN_POINTS || points > MAX_POINTS) return null;
  if (!Number.isFinite(changePercent) || Math.abs(changePercent) > MAX_ABS_CHANGE_PERCENT) return null;

  return { points, changePercent };
}
