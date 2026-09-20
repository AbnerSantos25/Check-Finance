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

// -----------------------------------------------------
// REAL ESTATE FINANCING TYPES
// -----------------------------------------------------

export type AmortizationSystem = 'SAC' | 'PRICE';

export interface RealEstateParams {
  propertyValue: number;         // Valor total do imóvel
  downPayment: number;           // Valor da entrada
  annualInterestRate: number;    // Taxa de Juros Anual (%)
  termMonths: number;            // Prazo em meses (ex: 360 = 30 anos)
  amortizationSystem: AmortizationSystem; // SAC ou Price
  extraMonthlyAmortization: number; // Amortização extraordinária recorrente por mês
}

export interface FinancingInstallment {
  month: number;
  payment: number;        // Parcela total do mês (Amortização + Juros)
  amortization: number;   // Parcela abatida da dívida
  interest: number;       // Juros pagos no mês
  extraAmortization: number; // Abatimento extra opcional no mês
  outstandingBalance: number; // Saldo Devedor após o pagamento
}

export interface FinancingSummary {
  totalFinanced: number;      // Valor financiado (Imóvel - Entrada)
  totalPaidOut: number;       // Custo efetivo total desembolsado (Total Parcelas)
  totalInterestPaid: number;  // Custo do dinheiro (Apenas Juros)
  firstInstallment: number;   // Valor da 1ª Parcela
  lastInstallment: number;    // Valor da Última Parcela
  monthsSaved: number;        // Quantos meses a dívida reduziu (devido a extras)
  interestSaved: number;      // Quantos R$ economizou de juros (devido a extras)
  actualTermMonths: number;   // Em quantos meses a dívida foi realmente quitada
  schedule: FinancingInstallment[]; // Evolução mês a mês
}
