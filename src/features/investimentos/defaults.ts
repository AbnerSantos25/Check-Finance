import type { InvestmentParams } from '../../types';

export const DEFAULT_PARAMS: InvestmentParams = {
  initialDeposit: 5000,
  monthlyDeposit: 1000,
  annualAdjustmentRate: 5,
  annualInterestRate: 12,
  annualInflationRate: 4.5,
  years: 30,
  taxExempt: false,
};
