import { 
  InvestmentParams, 
  CalculationSummary, 
  YearlyResult,
  RealEstateParams,
  FinancingSummary,
  FinancingInstallment 
} from '../types';

type NumericParam = Exclude<keyof InvestmentParams, 'taxExempt'>;

export const PARAM_LIMITS: Record<NumericParam, { min: number; max: number }> = {
  initialDeposit: { min: 0, max: 1_000_000_000 },
  monthlyDeposit: { min: 0, max: 100_000_000 },
  annualAdjustmentRate: { min: 0, max: 50 },
  annualInterestRate: { min: 0.1, max: 50 },
  annualInflationRate: { min: 0, max: 30 },
  years: { min: 1, max: 60 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Drops non-finite values and clamps the rest to the supported range.
 * Years are whole numbers because the engine compounds in 12-month blocks.
 */
export function sanitizeParams(
  current: InvestmentParams,
  changes: Partial<InvestmentParams>
): InvestmentParams {
  const next = { ...current };
  if (typeof changes.taxExempt === 'boolean') next.taxExempt = changes.taxExempt;
  for (const key of Object.keys(PARAM_LIMITS) as NumericParam[]) {
    const raw = changes[key];
    if (raw === undefined || !Number.isFinite(raw)) continue;
    const { min, max } = PARAM_LIMITS[key];
    next[key] = clamp(key === 'years' ? Math.round(raw) : raw, min, max);
  }
  return next;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

export const monthlyEquivalentRate = (annualPercent: number) =>
  Math.pow(1 + annualPercent / 100, 1 / 12) - 1;

// Regressive IR table for fixed income (Lei 11.033/2004), by days invested.
export const LONG_TERM_TAX_RATE = 15;
const DAYS_PER_MONTH = 365.25 / 12;

export function regressiveTaxRate(daysInvested: number): number {
  if (daysInvested <= 180) return 22.5;
  if (daysInvested <= 360) return 20;
  if (daysInvested <= 720) return 17.5;
  return LONG_TERM_TAX_RATE;
}

interface DepositLot {
  month: number;
  amount: number;
}

/** IR due if everything were redeemed at `currentMonth`; each deposit is taxed by its own holding period. */
function redemptionTax(lots: DepositLot[], currentMonth: number, monthlyRate: number): number {
  let tax = 0;
  for (const lot of lots) {
    const monthsHeld = currentMonth - lot.month;
    const gain = lot.amount * (Math.pow(1 + monthlyRate, monthsHeld) - 1);
    tax += gain * (regressiveTaxRate(monthsHeld * DAYS_PER_MONTH) / 100);
  }
  return tax;
}

/**
 * Month-by-month compounding with end-of-month deposits adjusted every 12 months.
 * IR follows the regressive table per deposit; real values are deflated monthly.
 */
export function calculateInvestment(params: InvestmentParams): CalculationSummary {
  const {
    initialDeposit,
    monthlyDeposit,
    annualAdjustmentRate,
    annualInterestRate,
    annualInflationRate,
    years,
    taxExempt,
  } = params;

  const monthlyRate = monthlyEquivalentRate(annualInterestRate);
  const monthlyInflation = monthlyEquivalentRate(annualInflationRate);
  // Income is withdrawn after the accumulation phase, from positions held well over 720 days.
  const incomeTax = taxExempt ? 0 : LONG_TERM_TAX_RATE / 100;

  let grossBalance = initialDeposit;
  let accumulatedDeposits = initialDeposit;
  let depositsInTodaysMoney = initialDeposit;
  let previousYearBalance = grossBalance;
  let month = 0;
  let taxDue = 0;

  const lots: DepositLot[] = initialDeposit > 0 ? [{ month: 0, amount: initialDeposit }] : [];
  const yearlyData: YearlyResult[] = [];

  // Net income that leaves the capital's purchasing power intact:
  // monthly yield after IR, minus what must be reinvested to offset inflation.
  const sustainableIncome = (netBalance: number) =>
    Math.max(0, netBalance * (monthlyRate * (1 - incomeTax) - monthlyInflation));

  for (let year = 1; year <= years; year++) {
    const currentMonthlyDeposit = monthlyDeposit * Math.pow(1 + annualAdjustmentRate / 100, year - 1);

    for (let m = 1; m <= 12; m++) {
      month++;
      grossBalance = grossBalance * (1 + monthlyRate) + currentMonthlyDeposit;
      accumulatedDeposits += currentMonthlyDeposit;
      depositsInTodaysMoney += currentMonthlyDeposit / Math.pow(1 + monthlyInflation, month);
      if (currentMonthlyDeposit > 0) lots.push({ month, amount: currentMonthlyDeposit });
    }

    const totalInterestGained = grossBalance - accumulatedDeposits;
    taxDue = taxExempt ? 0 : redemptionTax(lots, month, monthlyRate);
    const netBalance = grossBalance - taxDue;
    const inflationFactor = Math.pow(1 + annualInflationRate / 100, year);

    yearlyData.push({
      year,
      totalDeposited: round2(accumulatedDeposits),
      grossBalance: round2(grossBalance),
      netBalance: round2(netBalance),
      totalInterestGained: round2(totalInterestGained),
      yearlyInterestGained: round2(grossBalance - previousYearBalance - currentMonthlyDeposit * 12),
      savingsOnlyBalance: round2(accumulatedDeposits),
      sustainableMonthlyIncome: round2(sustainableIncome(netBalance)),
      realNetBalance: round2(netBalance / inflationFactor),
    });

    previousYearBalance = grossBalance;
  }

  const totalInterestGained = grossBalance - accumulatedDeposits;
  const finalNetBalance = grossBalance - taxDue;
  const finalInflationFactor = Math.pow(1 + annualInflationRate / 100, years);
  const finalRealNetBalance = finalNetBalance / finalInflationFactor;
  const sustainable = sustainableIncome(finalNetBalance);
  const surpassRow = yearlyData.find((row) => row.totalInterestGained > row.totalDeposited);

  return {
    totalInvested: round2(accumulatedDeposits),
    totalInvestedReal: round2(depositsInTodaysMoney),
    finalGrossBalance: round2(grossBalance),
    finalNetBalance: round2(finalNetBalance),
    finalRealNetBalance: round2(finalRealNetBalance),
    totalInterestGained: round2(totalInterestGained),
    totalInterestNet: round2(totalInterestGained - taxDue),
    incomeTax: round2(taxDue),
    effectiveTaxRate: totalInterestGained > 0 ? (taxDue / totalInterestGained) * 100 : 0,
    realMultiplier: depositsInTodaysMoney > 0 ? round2(finalRealNetBalance / depositsInTodaysMoney) : 0,
    fullYieldMonthlyNetIncome: round2(finalNetBalance * monthlyRate * (1 - incomeTax)),
    sustainableMonthlyIncome: round2(sustainable),
    sustainableMonthlyIncomeReal: round2(sustainable / finalInflationFactor),
    interestSurpassesDepositsYear: surpassRow ? surpassRow.year : null,
    yearlyData,
  };
}

/**
 * Format number into Brazilian Real currency (R$ 1.250.000,00)
 */
export function formatBRL(value: number): string {
  if (isNaN(value) || !isFinite(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ------------------------------------------------------------------
// REAL ESTATE FINANCING CALCULATOR (SAC vs PRICE)
// ------------------------------------------------------------------

export function calculateFinancing(params: RealEstateParams): FinancingSummary {
  const {
    propertyValue,
    downPayment,
    annualInterestRate,
    termMonths,
    amortizationSystem,
    extraMonthlyAmortization,
  } = params;

  const totalFinanced = Math.max(0, propertyValue - downPayment);
  
  // Taxa de juros mensal equivalente (Para imobiliário padrão Brasil, costuma-se usar taxa nominal / 12, mas vamos usar equivalente composta padrão)
  const monthlyRate = Math.pow(1 + annualInterestRate / 100, 1 / 12) - 1;

  // Lógica Base: Sem amortização extraordinária (Para calcular o que seria "salvo")
  let baselineTotalPaid = 0;
  let baselineTotalInterest = 0;
  
  if (totalFinanced > 0 && monthlyRate > 0 && termMonths > 0) {
    let baselineBalance = totalFinanced;
    
    if (amortizationSystem === 'PRICE') {
      const pmt = (totalFinanced * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
      baselineTotalPaid = pmt * termMonths;
      baselineTotalInterest = baselineTotalPaid - totalFinanced;
    } else {
      // SAC
      const fixedAmortization = totalFinanced / termMonths;
      for (let i = 1; i <= termMonths; i++) {
        const interest = baselineBalance * monthlyRate;
        const pmt = fixedAmortization + interest;
        baselineTotalPaid += pmt;
        baselineTotalInterest += interest;
        baselineBalance -= fixedAmortization;
      }
    }
  }

  // Simulação Real (Com Amortizações Extraordinárias)
  let currentBalance = totalFinanced;
  let actualTotalPaidOut = 0;
  let actualTotalInterest = 0;
  let firstInstallment = 0;
  let lastInstallment = 0;
  const schedule: FinancingInstallment[] = [];
  let monthCount = 0;

  // Para Price, a parcela constante (sem seguros)
  const pricePmt = (totalFinanced > 0 && monthlyRate > 0) 
    ? (totalFinanced * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
    : 0;
  
  // Para SAC, a amortização teórica fixa inicial
  const sacFixedAmortization = totalFinanced > 0 ? totalFinanced / termMonths : 0;

  while (currentBalance > 0.01 && monthCount < termMonths * 2) { // TermMonths * 2 is safety limit
    monthCount++;
    
    const interest = currentBalance * monthlyRate;
    
    let baseAmortization = 0;
    let basePayment = 0;

    if (amortizationSystem === 'PRICE') {
      basePayment = pricePmt;
      baseAmortization = basePayment - interest;
    } else { // SAC
      baseAmortization = sacFixedAmortization;
      basePayment = baseAmortization + interest;
    }

    // Se o saldo devedor for menor que a amortização pretendida (última parcela real)
    if (currentBalance < baseAmortization) {
      baseAmortization = currentBalance;
      basePayment = baseAmortization + interest;
    }

    // Amortização Extraordinária
    let extra = extraMonthlyAmortization;
    // Não pode amortizar mais do que deve
    if (currentBalance - baseAmortization < extra) {
      extra = currentBalance - baseAmortization;
    }

    const totalMonthAmortization = baseAmortization + extra;
    const totalMonthPayment = basePayment + extra;

    currentBalance -= totalMonthAmortization;
    // Prevent floating point negative dust
    if (currentBalance < 0.01) currentBalance = 0;

    actualTotalPaidOut += totalMonthPayment;
    actualTotalInterest += interest;

    if (monthCount === 1) {
      firstInstallment = basePayment; // Registra o valor original da 1ª sem extra (padrão de mercado exibir assim)
    }
    lastInstallment = basePayment; // Atualiza a cada loop para pegar o valor da última normal (sem o extra da quitação)

    schedule.push({
      month: monthCount,
      payment: totalMonthPayment,
      amortization: baseAmortization,
      interest: interest,
      extraAmortization: extra,
      outstandingBalance: currentBalance,
    });
  }

  // Prevenção caso o imóvel seja pago à vista (totalFinanced = 0)
  if (totalFinanced <= 0) {
    return {
      totalFinanced: 0,
      totalPaidOut: 0,
      totalInterestPaid: 0,
      firstInstallment: 0,
      lastInstallment: 0,
      monthsSaved: 0,
      interestSaved: 0,
      actualTermMonths: 0,
      schedule: [],
    };
  }

  const interestSaved = Math.max(0, baselineTotalInterest - actualTotalInterest);
  const monthsSaved = Math.max(0, termMonths - monthCount);

  return {
    totalFinanced,
    totalPaidOut: actualTotalPaidOut,
    totalInterestPaid: actualTotalInterest,
    firstInstallment,
    lastInstallment,
    monthsSaved,
    interestSaved,
    actualTermMonths: monthCount,
    schedule,
  };
}

/**
 * Format number into compact Brazilian Real currency (R$ 1,5 mi / R$ 850 mil)
 */
export function formatCompactBRL(value: number): string {
  if (isNaN(value) || !isFinite(value)) return 'R$ 0';
  if (Math.abs(value) >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} bi`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} mi`;
  }
  if (Math.abs(value) >= 10_000) {
    return `R$ ${(value / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`;
  }
  return formatBRL(value);
}

/**
 * Format percentage (12,5%)
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
