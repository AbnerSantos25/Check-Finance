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
  source: string;
}

/** Resposta de GET /api/ibovespa (Worker). */
export interface IbovespaQuote {
  points: number;
  changePercent: number;
  /** Quando o servidor consultou a fonte (ISO). O plano grátis da HG Brasil não informa a hora da cotação. */
  fetchedAt: string;
  /** true = a fonte falhou e este é o último valor bom conhecido. */
  stale: boolean;
  source: 'HG Brasil';
}

export interface MarketRates {
  selic: number;
  cdi: number;
  ipca: number;
  poupanca: number; // Annualized current savings-account yield (% a.a.)
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
