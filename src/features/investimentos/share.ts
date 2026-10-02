import type { InvestmentParams } from '../../types';
import type { ShareSchema } from '../../shared/lib/shareParams';

/** Chaves da simulação na URL: /calculadora-juros-compostos?ap=1500&anos=20 */
export const SHARE_SCHEMA: ShareSchema<InvestmentParams> = {
  initialDeposit: { key: 'inicial', type: 'number' },
  monthlyDeposit: { key: 'ap', type: 'number' },
  annualAdjustmentRate: { key: 'reajuste', type: 'number' },
  annualInterestRate: { key: 'taxa', type: 'number' },
  annualInflationRate: { key: 'inflacao', type: 'number' },
  years: { key: 'anos', type: 'number' },
  taxExempt: { key: 'isento', type: 'boolean' },
};
