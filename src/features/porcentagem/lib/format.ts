import { formatBRL } from '../../../shared/lib/format';

/**
 * Duas casas, arredondando o meio para longe do zero nos dois sentidos (−0,125 → −0,13).
 *
 * Todo número da calculadora, em reais ou não, passa por aqui antes de ir para a
 * tela: um arredondamento só, para a mesma conta nunca mostrar o mesmo valor de dois
 * jeitos. O `toPrecision(15)` desfaz o ruído do ponto flutuante antes de arredondar:
 * 1,005 × 100 dá 100,49999… em binário, e o meio centavo sumiria.
 */
const toCents = (value: number): number => {
  const scaled = Math.abs(value) * 100;
  // Acima de 1e11 centavos (R$ 1 bilhão) quinze dígitos não cobrem mais os centavos;
  // ali o double já é o melhor que dá.
  const cents = Math.round(scaled < 1e11 ? Number(scaled.toPrecision(15)) : scaled);
  return Math.sign(value) * cents || 0;
};

export const round2 = (value: number): number => toCents(value) / 100 || 0;

/** Valor em reais, arredondado por `round2` (o Intl não arredonda de novo). */
export const formatMoney = (value: number): string => formatBRL(round2(value));

/**
 * Aumento e desconto em centavos que fecham: o total é o valor mais (ou menos) a
 * diferença já arredondada. Arredondar os dois separadamente fazia R$ 99,90 + 15%
 * mostrar "+R$ 14,99 → R$ 114,88".
 */
export function moneyChange(value: number, percent: number) {
  // Em centavos inteiros: a soma é exata em qualquer escala, e a diferença sai da
  // mesma base exibida (R$ 1,005 aparece como R$ 1,01, e 100% dele é R$ 1,01).
  const base = toCents(value);
  const amount = toCents((base * percent) / 10000);
  return { amount: amount / 100, increased: (base + amount) / 100, discounted: (base - amount) / 100 };
}

/**
 * Número com até duas casas, sem zeros sobrando: 30, 12,5, 1.980, −200.
 *
 * Arredonda antes de formatar e troca −0 por 0: o Intl escreveria "-0" para −0 e
 * para −0,001. O sinal de menos é o tipográfico (−), o mesmo de `formatSignedPct`.
 */
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

/** Frase-resumo dos aumentos e descontos sucessivos. */
export function chainSummary(totalPercent: number | null): string {
  if (totalPercent === null) return 'Com valor inicial zero, não existe variação percentual.';
  const shown = formatSignedPct(totalPercent);
  if (shown === '0%') return 'Variação total de 0%: as etapas se anulam.';
  const kind = totalPercent < 0 ? 'um único desconto' : 'um único aumento';
  return `Variação total de ${shown}: o mesmo que ${kind} de ${formatPct(Math.abs(totalPercent))}.`;
}
