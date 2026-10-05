/**
 * Número com até duas casas, sem zeros sobrando: 30, 12,5, 1.980, −200.
 *
 * Arredonda antes de formatar e troca −0 por 0: o Intl escreveria "-0" para −0 e
 * para −0,001. O sinal de menos é o tipográfico (−), o mesmo de `formatSignedPct`.
 */
export const formatValue = (value: number): string => {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 100) / 100 || 0;
  return rounded.toLocaleString('pt-BR', { maximumFractionDigits: 2 }).replace('-', '−');
};

/** Percentual com até duas casas: 25%, 11,11%. */
export const formatPct = (value: number): string => `${formatValue(value)}%`;

/** Percentual com sinal explícito para variações: +25%, −20%, 0%. */
export const formatSignedPct = (value: number): string => {
  // Arredonda antes de decidir o sinal: −0,001% não deve aparecer como "−0%".
  const rounded = Math.round(value * 100) / 100;
  if (rounded === 0) return '0%';
  return `${rounded > 0 ? '+' : '−'}${formatPct(Math.abs(rounded))}`;
};
