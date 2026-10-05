/**
 * Unidades de exibição da calculadora de juros compostos.
 *
 * Os parâmetros guardam sempre a taxa ANUAL e o prazo em ANOS (com precisão de um
 * mês). Taxa ao mês e prazo em meses são só a forma de digitar e ler: a conversão
 * acontece na borda do formulário, e o motor, a URL compartilhada e os testes não
 * mudam.
 */

export type RateUnit = 'anual' | 'mensal';
export type PeriodUnit = 'anos' | 'meses';

export interface DisplayUnits {
  rate: RateUnit;
  period: PeriodUnit;
}

export const DEFAULT_UNITS: DisplayUnits = { rate: 'anual', period: 'anos' };

/** Taxa mensal equivalente composta: 12% a.a. → 0,9489% a.m. (não 1%). */
export const annualToMonthly = (annualPercent: number): number =>
  (Math.pow(1 + annualPercent / 100, 1 / 12) - 1) * 100;

/**
 * Taxa anual equivalente composta: 1% a.m. → 12,682503% a.a. (não 12%).
 * Seis casas bastam (a volta para a taxa mensal é exata até a quarta) e deixam o
 * link compartilhado legível: `taxa=12.682503` em vez de 15 dígitos.
 */
export const monthlyToAnnual = (monthlyPercent: number): number =>
  Math.round((Math.pow(1 + monthlyPercent / 100, 12) - 1) * 100 * 1e6) / 1e6;

/** Prazo em anos (fracionário) → número inteiro de meses. */
export const toMonths = (years: number): number => Math.round(years * 12);

/**
 * Dois prazos são o mesmo mês? Compare sempre assim, nunca com `===`: o prazo dos
 * parâmetros é gravado com 6 casas (8.333333) e o da linha da tabela sai do motor
 * como meses ÷ 12 (8.333333333333334).
 */
export const samePeriod = (a: number, b: number): boolean => toMonths(a) === toMonths(b);

/** "1 ano", "30 anos", "1 mês", "18 meses". */
export function formatPeriod(years: number): string {
  const months = toMonths(years);
  if (months % 12 === 0) {
    const whole = months / 12;
    return `${whole} ${whole === 1 ? 'ano' : 'anos'}`;
  }
  return `${months} ${months === 1 ? 'mês' : 'meses'}`;
}

/** Rótulo de uma linha da série: "Ano 3" nos anos cheios, "Mês 18" na linha parcial. */
export function periodRowLabel(year: number): string {
  const months = toMonths(year);
  return months % 12 === 0 ? `Ano ${months / 12}` : `Mês ${months}`;
}
