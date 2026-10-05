import { formatBRL } from '../../../shared/lib/format';

/**
 * Número com até duas casas, sem zeros sobrando: 30, 12,5, 1.980, −200.
 *
 * Arredonda antes de formatar e troca −0 por 0: o Intl escreveria "-0" para −0 e
 * para −0,001. O sinal de menos é o tipográfico (−), o mesmo de `formatSignedPct`.
 */
/** Duas casas, arredondando o meio para longe do zero nos dois sentidos (−0,125 → −0,13). */
const round2 = (value: number) => (Math.sign(value) * Math.round(Math.abs(value) * 100)) / 100 || 0;

export const formatValue = (value: number): string => {
  if (!Number.isFinite(value)) return '—';
  const rounded = round2(value);
  return rounded.toLocaleString('pt-BR', { maximumFractionDigits: 2 }).replace('-', '−');
};

/** Percentual com até duas casas: 25%, 11,11%. */
export const formatPct = (value: number): string => `${formatValue(value)}%`;

/** Percentual com sinal explícito para variações: +25%, −20%, 0%. */
export const formatSignedPct = (value: number): string => {
  // Arredonda antes de decidir o sinal: −0,001% não deve aparecer como "−0%".
  const rounded = round2(value);
  if (rounded === 0) return '0%';
  return `${rounded > 0 ? '+' : '−'}${formatPct(Math.abs(rounded))}`;
};

/** Diferença em reais com sinal: +R$ 15,00, −R$ 15,00 e, no zero, R$ 0,00 sem sinal. */
export const formatMoneyDelta = (value: number): string => {
  const rounded = round2(value);
  if (rounded === 0) return formatBRL(0);
  return `${rounded > 0 ? '+' : '−'}${formatBRL(Math.abs(rounded))}`;
};
