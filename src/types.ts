export interface InvestmentParams {
  initialDeposit: number;
  monthlyDeposit: number;
  annualAdjustmentRate: number; // % increase in monthly deposit each 12 months
  annualInterestRate: number;    // % annual return rate
  annualInflationRate: number;   // % annual inflation
  years: number;                 // Period in years
  taxExempt: boolean;            // false = regressive IR table per deposit (Lei 11.033/2004)
}

export interface YearlyResult {
  year: number;
  totalDeposited: number;
  grossBalance: number;
  netBalance: number;            // Gross balance minus IR on accumulated gains
  totalInterestGained: number;
  yearlyInterestGained: number;
  savingsOnlyBalance: number;
  sustainableMonthlyIncome: number; // Nominal, keeps the capital's purchasing power
  realNetBalance: number;        // Net balance in today's money
}

export interface CalculationSummary {
  totalInvested: number;
  totalInvestedReal: number;     // Deposits in today's money
  finalGrossBalance: number;
  finalNetBalance: number;
  finalRealNetBalance: number;
  totalInterestGained: number;
  totalInterestNet: number;
  incomeTax: number;
  effectiveTaxRate: number;      // incomeTax / gains, in %
  realMultiplier: number;        // finalRealNetBalance / totalInvestedReal
  fullYieldMonthlyNetIncome: number;     // Whole net monthly yield, erodes purchasing power
  sustainableMonthlyIncome: number;      // Nominal, at the end of the period
  sustainableMonthlyIncomeReal: number;  // Same income in today's money
  interestSurpassesDepositsYear: number | null;
  yearlyData: YearlyResult[];
}

export type IndicatorStatus = 'live' | 'reference';

export interface EconomicIndicator {
  name: string;
  value: string;
  change?: string;
  positive?: boolean;
  status: IndicatorStatus;
  asOf: string;
}

export interface MarketRates {
  selic: number;
  cdi: number;
  ipca: number;
  poupanca: number; // Annualized current savings-account yield (% a.a.)
}
