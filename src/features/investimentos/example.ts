import { formatBRL, formatPercent } from '../../shared/lib/format';
import { monthlyToAnnual } from './lib/units';

/**
 * Números do conteúdo educativo (fórmula, juros simples × compostos, tabela) e do
 * FAQ. Saem das fórmulas, nunca escritos à mão: ao mudar uma premissa, o texto
 * acompanha. São contas de poucos microssegundos, feitas no carregamento do módulo.
 */

/** Montante com juros compostos: M = C × (1 + i)^n. */
export const compoundAmount = (capital: number, monthlyRate: number, months: number) =>
  capital * Math.pow(1 + monthlyRate, months);

/** Montante com juros simples: M = C × (1 + i × n). */
export const simpleAmount = (capital: number, monthlyRate: number, months: number) =>
  capital * (1 + monthlyRate * months);

/** Valor futuro de aportes iguais no fim de cada mês: PMT × ((1 + i)^n − 1) / i. */
export const depositsAmount = (deposit: number, monthlyRate: number, months: number) =>
  monthlyRate === 0 ? deposit * months : deposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

/** Exemplo resolvido: R$ 1.000 a 1% ao mês por 12 meses, com e sem aporte de R$ 100. */
export const FORMULA_EXAMPLE = {
  capital: 1000,
  deposit: 100,
  monthlyRate: 0.01,
  months: 12,
};

const base = compoundAmount(FORMULA_EXAMPLE.capital, FORMULA_EXAMPLE.monthlyRate, FORMULA_EXAMPLE.months);
const withDeposits =
  base + depositsAmount(FORMULA_EXAMPLE.deposit, FORMULA_EXAMPLE.monthlyRate, FORMULA_EXAMPLE.months);

export const EXAMPLE = {
  capital: formatBRL(FORMULA_EXAMPLE.capital),
  deposit: formatBRL(FORMULA_EXAMPLE.deposit),
  rate: '1%',
  months: FORMULA_EXAMPLE.months,
  factor: Math.pow(1 + FORMULA_EXAMPLE.monthlyRate, FORMULA_EXAMPLE.months).toFixed(4).replace('.', ','),
  amount: formatBRL(base),
  interest: formatBRL(base - FORMULA_EXAMPLE.capital),
  simpleAmount: formatBRL(simpleAmount(FORMULA_EXAMPLE.capital, FORMULA_EXAMPLE.monthlyRate, FORMULA_EXAMPLE.months)),
  withDeposits: formatBRL(withDeposits),
  annualEquivalent: formatPercent(monthlyToAnnual(1)),
};

/** Juros simples × compostos: R$ 10.000 a 1% ao mês. */
export const SIMPLE_VS_COMPOUND = [12, 60, 120, 240].map((months) => {
  const simple = simpleAmount(10000, 0.01, months);
  const compound = compoundAmount(10000, 0.01, months);
  return {
    period: months % 12 === 0 ? `${months / 12} ${months === 12 ? 'ano' : 'anos'}` : `${months} meses`,
    simple: formatBRL(simple),
    compound: formatBRL(compound),
    difference: formatBRL(compound - simple),
  };
});

/** Tabela de juros compostos: quanto R$ 1.000 vira, por taxa mensal e prazo. */
export const COMPOUND_TABLE = {
  months: [12, 24, 60, 120],
  rows: [0.005, 0.01, 0.015].map((rate) => ({
    rate: `${formatPercent(rate * 100, 1)} a.m.`,
    values: [12, 24, 60, 120].map((months) => formatBRL(compoundAmount(1000, rate, months))),
  })),
};
