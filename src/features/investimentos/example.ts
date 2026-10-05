import { formatBRL, formatNumber, formatPercent } from '../../shared/lib/format';
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

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const superscript = (n: number) => String(n).replace(/\d/g, (d) => SUPERSCRIPT[Number(d)]);

/** Capital e taxa da comparação juros simples × compostos. */
export const COMPARISON = { capital: 10000, monthlyRate: 0.01 };
/** Capital da tabela de juros compostos. */
export const TABLE_CAPITAL = 1000;

const base = compoundAmount(FORMULA_EXAMPLE.capital, FORMULA_EXAMPLE.monthlyRate, FORMULA_EXAMPLE.months);
const withDeposits =
  base + depositsAmount(FORMULA_EXAMPLE.deposit, FORMULA_EXAMPLE.monthlyRate, FORMULA_EXAMPLE.months);

export const EXAMPLE = {
  capital: formatBRL(FORMULA_EXAMPLE.capital),
  deposit: formatBRL(FORMULA_EXAMPLE.deposit),
  rate: formatPercent(FORMULA_EXAMPLE.monthlyRate * 100, 0),
  months: FORMULA_EXAMPLE.months,
  // Seis casas: com quatro (1,1268), a conta escrita daria R$ 1.126,80, e não 1.126,83.
  factor: formatNumber(Math.pow(1 + FORMULA_EXAMPLE.monthlyRate, FORMULA_EXAMPLE.months), 6),
  /** "1.000 × (1 + 0,01)¹²" */
  substitution: `${formatNumber(FORMULA_EXAMPLE.capital, 0)} × (1 + ${formatNumber(FORMULA_EXAMPLE.monthlyRate, 2)})${superscript(FORMULA_EXAMPLE.months)}`,
  capitalPlain: formatNumber(FORMULA_EXAMPLE.capital, 0),
  amount: formatBRL(base),
  interest: formatBRL(base - FORMULA_EXAMPLE.capital),
  simpleAmount: formatBRL(simpleAmount(FORMULA_EXAMPLE.capital, FORMULA_EXAMPLE.monthlyRate, FORMULA_EXAMPLE.months)),
  withDeposits: formatBRL(withDeposits),
  annualEquivalent: formatPercent(monthlyToAnnual(1)),
};

/** Juros simples × compostos: COMPARISON.capital à taxa COMPARISON.monthlyRate. */
const SIMPLE_VS_COMPOUND_MONTHS = [12, 60, 120, 240];

export const SIMPLE_VS_COMPOUND = SIMPLE_VS_COMPOUND_MONTHS.map((months) => {
  const simple = simpleAmount(COMPARISON.capital, COMPARISON.monthlyRate, months);
  const compound = compoundAmount(COMPARISON.capital, COMPARISON.monthlyRate, months);
  return {
    period: months % 12 === 0 ? `${months / 12} ${months === 12 ? 'ano' : 'anos'}` : `${months} meses`,
    simple: formatBRL(simple),
    compound: formatBRL(compound),
    difference: formatBRL(compound - simple),
  };
});

export const COMPARISON_TEXT = `${formatBRL(COMPARISON.capital)} a ${formatPercent(COMPARISON.monthlyRate * 100, 0)} ao mês`;
export const TABLE_CAPITAL_TEXT = formatBRL(TABLE_CAPITAL);

const longest = SIMPLE_VS_COMPOUND_MONTHS[SIMPLE_VS_COMPOUND_MONTHS.length - 1];
/** Frase do FAQ: o prazo mais longo da comparação, por extenso. */
export const LONG_RUN_COMPARISON = `Em ${longest / 12} anos, a mesma taxa sobre ${formatBRL(COMPARISON.capital)} dá ${formatBRL(
  simpleAmount(COMPARISON.capital, COMPARISON.monthlyRate, longest),
)} com juros simples e mais de R$ ${Math.floor(compoundAmount(COMPARISON.capital, COMPARISON.monthlyRate, longest) / 1000)} mil com juros compostos.`;

/** Tabela de juros compostos: quanto TABLE_CAPITAL vira, por taxa mensal e prazo. */

const TABLE_MONTHS = [12, 24, 60, 120];

export const COMPOUND_TABLE = {
  months: TABLE_MONTHS,
  rows: [0.005, 0.01, 0.015].map((rate) => ({
    rate: `${formatPercent(rate * 100, 1)} a.m.`,
    values: TABLE_MONTHS.map((months) => formatBRL(compoundAmount(TABLE_CAPITAL, rate, months))),
  })),
};
