/**
 * Contas de porcentagem. Funções puras, sem arredondar: quem exibe formata.
 *
 * Todas devolvem `null` quando a conta não existe (dividir por zero), para a tela
 * explicar o motivo em vez de mostrar "Infinity%" ou "NaN".
 */

/** Quanto é `percent`% de `value`. 15% de 200 = 30. */
export const percentOf = (percent: number, value: number): number => (value * percent) / 100;

/** `part` é quantos por cento de `whole`. 30 é 15% de 200. */
export const percentageOfWhole = (part: number, whole: number): number | null =>
  whole === 0 ? null : (part / whole) * 100;

/** Valor depois de um aumento (percentual positivo) ou desconto (negativo). */
export const applyChange = (value: number, percent: number): number => value * (1 + percent / 100);

/** Variação percentual de `from` para `to`. De 80 para 100 = +25%. */
export const percentChange = (from: number, to: number): number | null =>
  from === 0 ? null : ((to - from) / Math.abs(from)) * 100;

export interface ChainStep {
  /** Percentual da etapa: positivo = aumento, negativo = desconto. */
  percent: number;
  /** Valor depois desta etapa. */
  value: number;
}

export interface ChainResult {
  steps: ChainStep[];
  final: number;
  /** Variação total equivalente, em %. `null` quando o valor inicial é zero. */
  totalPercent: number | null;
}

/**
 * Aumentos e descontos aplicados um depois do outro. Cada etapa incide sobre o
 * resultado da anterior: +10% e −10% sobre 2.000 dão 1.980, não 2.000.
 */
export function chainChanges(start: number, percents: number[]): ChainResult {
  let value = start;
  const steps = percents.map((percent) => {
    value = applyChange(value, percent);
    return { percent, value };
  });
  return { steps, final: value, totalPercent: percentChange(start, value) };
}
