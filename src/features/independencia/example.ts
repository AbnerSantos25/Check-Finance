import { formatBRL, formatPercent } from '../../shared/lib/format';
import { calculateIndependence, formatDuration } from './lib/calculateIndependence';
import { DEFAULT_PARAMS } from './defaults';

/**
 * Números de exemplo citados no texto educativo e no FAQ.
 *
 * Saem do próprio motor rodando o cenário padrão, e não de constantes escritas à
 * mão: se o cálculo mudar, o texto muda junto e nunca contradiz a ferramenta. A
 * conta é determinística, então o HTML pré-renderizado e o do navegador batem.
 */
const base = calculateIndependence(DEFAULT_PARAMS);
const noInflation = calculateIndependence({ ...DEFAULT_PARAMS, annualInflation: 0 });
const fixedContribution = calculateIndependence({ ...DEFAULT_PARAMS, contributionFollowsInflation: false });

export const EXAMPLE = {
  goal: formatBRL(DEFAULT_PARAMS.monthlyIncomeGoal),
  contribution: formatBRL(DEFAULT_PARAMS.monthlyContribution),
  annualReturn: formatPercent(DEFAULT_PARAMS.annualReturn, 0),
  inflation: formatPercent(DEFAULT_PARAMS.annualInflation, 1),
  realRate: formatPercent(base.annualRealRate),
  target: formatBRL(base.targetReal),
  duration: formatDuration(base.months ?? 0),
  goalNominal: formatBRL(base.incomeGoalNominal),
  targetNoInflation: formatBRL(noInflation.targetReal),
  durationNoInflation: formatDuration(noInflation.months ?? 0),
  durationFixedContribution: formatDuration(fixedContribution.months ?? 0),
  targetFourPercent: formatBRL((12 * DEFAULT_PARAMS.monthlyIncomeGoal) / 0.04),
};
