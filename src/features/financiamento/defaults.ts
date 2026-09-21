import type { RealEstateParams } from '../../types';

export const DEFAULT_RE_PARAMS: RealEstateParams = {
  propertyValue: 500000,
  downPayment: 100000,
  annualInterestRate: 9.5,
  termMonths: 360,
  amortizationSystem: 'SAC',
  extraMonthlyAmortization: 0,
};
