export interface InvestmentParams {
  initialDeposit: number;
  monthlyDeposit: number;
  annualAdjustmentRate: number; // % increase in monthly deposit each 12 months
  annualInterestRate: number;    // % annual return rate
  annualInflationRate: number;   // % annual inflation
  years: number;                 // Period in years
  taxRate: number;               // % IR tax (typically 15% for long term, or 0% for tax exempt)
}

export interface YearlyResult {
  year: number;
  totalDeposited: number;
  grossBalance: number;
  totalInterestGained: number;
  yearlyInterestGained: number;
  savingsOnlyBalance: number; // Just deposits accumulated
  differenceWithSavings: number;
  monthlyNetIncome: number; // Net passive monthly income at this balance
  realBalance: number; // Discounted by cumulative inflation
}

export interface CalculationSummary {
  totalInvested: number;
  finalGrossBalance: number;
  totalInterestGained: number;
  finalMonthlyNetIncome: number;
  finalRealBalance: number;
  interestPercentage: number;
  savingsOnlyTotal: number;
  profitMultiplier: number;
  yearlyData: YearlyResult[];
}

export interface EconomicIndicator {
  name: string;
  value: string;
  change?: string;
  positive?: boolean;
}
