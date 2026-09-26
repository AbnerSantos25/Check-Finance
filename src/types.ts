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

// -----------------------------------------------------
// FINANCIAL INDEPENDENCE TYPES
// -----------------------------------------------------

export interface IndependenceParams {
  monthlyIncomeGoal: number;     // Renda mensal desejada, em valores de hoje
  currentWealth: number;         // Patrimônio já investido
  monthlyContribution: number;   // Aporte mensal, em valores de hoje
  annualReturn: number;          // Rentabilidade nominal anual (%)
  annualInflation: number;       // Inflação anual esperada (%)
  currentAge: number;            // Idade atual, em anos
  contributionFollowsInflation: boolean; // false = aporte nominal fixo, que perde valor real
}

/**
 * - `reached`: a meta é atingida dentro do limite de 100 anos.
 * - `already-reached`: o patrimônio atual já sustenta a renda.
 * - `no-real-return`: a rentabilidade não supera a inflação; nenhum patrimônio
 *   gera renda perpétua em valores de hoje.
 * - `no-savings`: sem patrimônio nem aporte, não há o que acumular.
 * - `over-limit`: levaria mais de 100 anos.
 */
export type IndependenceStatus = 'reached' | 'already-reached' | 'no-real-return' | 'no-savings' | 'over-limit';

export interface IndependenceMonth {
  month: number;
  contributedReal: number;       // Patrimônio inicial + aportes, em valores de hoje
  contributedNominal: number;
  interestReal: number;          // Juros acumulados acima da inflação
  interestNominal: number;
  balanceReal: number;
  balanceNominal: number;
  incomeReal: number;            // Renda mensal perpétua que o saldo já sustenta
  incomeNominal: number;
}

export interface IndependenceResult {
  status: IndependenceStatus;
  /** Meses até a meta; null quando ela não é atingida. */
  months: number | null;
  ageAtIndependence: number | null;
  annualRealRate: number;        // %
  monthlyRealRate: number;       // fração, não %
  targetReal: number;            // Patrimônio necessário em valores de hoje (0 sem solução)
  targetNominal: number;         // O mesmo patrimônio em valores do mês da meta
  incomeGoalNominal: number;     // A renda desejada em valores do mês da meta
  finalBalanceReal: number;
  finalBalanceNominal: number;
  totalContributedReal: number;
  totalContributedNominal: number;
  totalInterestReal: number;
  totalInterestNominal: number;
  /** Mês 0 (hoje) até o mês da meta. Vazio quando não há o que projetar. */
  schedule: IndependenceMonth[];
}
