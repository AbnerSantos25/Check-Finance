import type { IndependenceMonth, IndependenceParams, IndependenceResult } from '../../../types';
import { monthlyEquivalentRate } from '../../../shared/lib/format';

/** 100 anos. Além disso a projeção deixa de ser planejamento. */
export const MAX_MONTHS = 1200;

/**
 * Taxa real anual pela relação de Fisher: (1 + i) / (1 + π) − 1.
 * Subtrair (12% − 4,5% = 7,5%) superestima; o correto é 7,18%.
 */
export const annualRealRate = (annualReturn: number, annualInflation: number) =>
  ((1 + annualReturn / 100) / (1 + annualInflation / 100) - 1) * 100;

const emptyResult = (
  status: IndependenceResult['status'],
  annualReal: number,
  monthlyReal: number,
  targetReal: number
): IndependenceResult => ({
  status,
  months: null,
  ageAtIndependence: null,
  annualRealRate: annualReal,
  monthlyRealRate: monthlyReal,
  targetReal,
  targetNominal: 0,
  incomeGoalNominal: 0,
  finalBalanceReal: 0,
  finalBalanceNominal: 0,
  totalContributedReal: 0,
  totalContributedNominal: 0,
  totalInterestReal: 0,
  totalInterestNominal: 0,
  schedule: [],
});

/**
 * Quanto tempo até o patrimônio sustentar a renda desejada para sempre.
 *
 * A conta inteira roda em valores de hoje, na taxa real mensal (equivalência
 * composta, nunca divisão por 12). A meta é a perpetuidade real: o patrimônio que
 * rende a renda desejada todo mês e ainda preserva o próprio poder de compra,
 * P = M / r_real. Os valores nominais saem multiplicando pelo fator de inflação
 * acumulado de cada mês.
 *
 * Aportes no fim de cada mês. Com `contributionFollowsInflation` o aporte é
 * constante em valores de hoje (o nominal sobe com a inflação); sem ele, o
 * nominal fica parado e o valor real encolhe a cada mês.
 */
export function calculateIndependence(params: IndependenceParams): IndependenceResult {
  const {
    monthlyIncomeGoal,
    currentWealth,
    monthlyContribution,
    annualReturn,
    annualInflation,
    currentAge,
    contributionFollowsInflation,
  } = params;

  const annualReal = annualRealRate(annualReturn, annualInflation);
  const r = monthlyEquivalentRate(annualReal);
  const inflation = monthlyEquivalentRate(annualInflation);

  // Sem juro real, nenhum patrimônio paga renda para sempre sem encolher: a
  // concorrência "resolve" isso com um rendimento fantasma, aqui não há resposta.
  if (r <= 0) return emptyResult('no-real-return', annualReal, r, 0);

  const targetReal = monthlyIncomeGoal / r;

  if (currentWealth <= 0 && monthlyContribution <= 0) {
    return emptyResult('no-savings', annualReal, r, targetReal);
  }

  let balanceReal = currentWealth;
  let contributedReal = currentWealth;
  let contributedNominal = currentWealth;
  let inflationFactor = 1;

  const row = (month: number): IndependenceMonth => ({
    month,
    contributedReal,
    contributedNominal,
    interestReal: balanceReal - contributedReal,
    interestNominal: balanceReal * inflationFactor - contributedNominal,
    balanceReal,
    balanceNominal: balanceReal * inflationFactor,
    incomeReal: balanceReal * r,
    incomeNominal: balanceReal * r * inflationFactor,
  });

  const schedule: IndependenceMonth[] = [row(0)];
  let month = 0;

  while (balanceReal < targetReal && month < MAX_MONTHS) {
    month++;
    inflationFactor *= 1 + inflation;
    const nominal = contributionFollowsInflation ? monthlyContribution * inflationFactor : monthlyContribution;
    const real = nominal / inflationFactor;
    balanceReal = balanceReal * (1 + r) + real;
    contributedReal += real;
    contributedNominal += nominal;
    schedule.push(row(month));
  }

  if (balanceReal < targetReal) return emptyResult('over-limit', annualReal, r, targetReal);

  const last = schedule[schedule.length - 1];

  return {
    status: month === 0 ? 'already-reached' : 'reached',
    months: month,
    ageAtIndependence: currentAge + month / 12,
    annualRealRate: annualReal,
    monthlyRealRate: r,
    targetReal,
    targetNominal: targetReal * inflationFactor,
    incomeGoalNominal: monthlyIncomeGoal * inflationFactor,
    finalBalanceReal: last.balanceReal,
    finalBalanceNominal: last.balanceNominal,
    totalContributedReal: last.contributedReal,
    totalContributedNominal: last.contributedNominal,
    totalInterestReal: last.interestReal,
    totalInterestNominal: last.interestNominal,
    schedule,
  };
}

export interface Sensitivity {
  /** Meses a mais com rentabilidade 1 ponto menor; null se deixa de convergir. */
  lower: number | null;
  /** Meses a menos com rentabilidade 1 ponto maior; null se deixa de convergir. */
  higher: number | null;
}

/** Quanto o prazo muda com 1 ponto percentual a menos ou a mais de rentabilidade. */
export function sensitivity(params: IndependenceParams, baseMonths: number): Sensitivity {
  const monthsWith = (annualReturn: number) => {
    const result = calculateIndependence({ ...params, annualReturn: Math.max(0, annualReturn) });
    return result.status === 'reached' || result.status === 'already-reached' ? result.months : null;
  };
  const lower = monthsWith(params.annualReturn - 1);
  const higher = monthsWith(params.annualReturn + 1);
  return {
    lower: lower === null ? null : lower - baseMonths,
    higher: higher === null ? null : baseMonths - higher,
  };
}

/** "21 anos e 2 meses", "1 ano", "5 meses". */
export function formatDuration(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const y = years === 1 ? '1 ano' : `${years} anos`;
  const m = months === 1 ? '1 mês' : `${months} meses`;
  if (years === 0) return m;
  if (months === 0) return y;
  return `${y} e ${m}`;
}
