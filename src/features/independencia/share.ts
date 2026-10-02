import type { IndependenceParams } from '../../types';
import type { ShareSchema } from '../../shared/lib/shareParams';

/** Chaves da simulação na URL: /calculadora-independencia-financeira?renda=8000&idade=35 */
export const SHARE_SCHEMA: ShareSchema<IndependenceParams> = {
  monthlyIncomeGoal: { key: 'renda', type: 'number' },
  currentWealth: { key: 'patrimonio', type: 'number' },
  monthlyContribution: { key: 'ap', type: 'number' },
  annualReturn: { key: 'taxa', type: 'number' },
  annualInflation: { key: 'inflacao', type: 'number' },
  currentAge: { key: 'idade', type: 'number' },
  contributionFollowsInflation: { key: 'corrige', type: 'boolean' },
};
