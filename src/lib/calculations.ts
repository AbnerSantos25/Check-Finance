import { 
  InvestmentParams, 
  CalculationSummary, 
  YearlyResult,
  RealEstateParams,
  FinancingSummary,
  FinancingInstallment 
} from '../types';

/**
 * Calculates compound interest month-by-month with annual deposit adjustments,
 * inflation deflation, and passive net monthly income estimations.
 */
export function calculateInvestment(params: InvestmentParams): CalculationSummary {
  const {
    initialDeposit,
    monthlyDeposit,
    annualAdjustmentRate,
    annualInterestRate,
    annualInflationRate,
    years,
    taxRate,
  } = params;

  // Equivalent monthly interest rate: (1 + i_annual)^(1/12) - 1
  const monthlyRate = annualInterestRate > 0 
    ? Math.pow(1 + annualInterestRate / 100, 1 / 12) - 1 
    : 0;

  let currentGrossBalance = Math.max(0, initialDeposit);
  let currentSavingsOnly = Math.max(0, initialDeposit);
  let accumulatedDeposits = Math.max(0, initialDeposit);

  const yearlyData: YearlyResult[] = [];
  let previousYearBalance = currentGrossBalance;

  for (let year = 1; year <= years; year++) {
    // Annual adjustment on the monthly deposit: increases every year by annualAdjustmentRate%
    const currentMonthlyDeposit = Math.max(
      0,
      monthlyDeposit * Math.pow(1 + annualAdjustmentRate / 100, year - 1)
    );

    for (let month = 1; month <= 12; month++) {
      currentGrossBalance = currentGrossBalance * (1 + monthlyRate) + currentMonthlyDeposit;
      currentSavingsOnly += currentMonthlyDeposit;
      accumulatedDeposits += currentMonthlyDeposit;
    }

    const totalInterestGained = Math.max(0, currentGrossBalance - accumulatedDeposits);
    const yearlyInterestGained = Math.max(0, currentGrossBalance - previousYearBalance - (currentMonthlyDeposit * 12));
    previousYearBalance = currentGrossBalance;

    // Purchasing power discounted by cumulative inflation: M / (1 + inflation)^years
    const inflationFactor = Math.pow(1 + annualInflationRate / 100, year);
    const realBalance = inflationFactor > 0 ? currentGrossBalance / inflationFactor : currentGrossBalance;

    // Monthly gross return on final capital * (1 - taxRate)
    const grossMonthlyYield = currentGrossBalance * monthlyRate;
    const monthlyNetIncome = Math.max(0, grossMonthlyYield * (1 - taxRate / 100));

    yearlyData.push({
      year,
      totalDeposited: Math.round(accumulatedDeposits * 100) / 100,
      grossBalance: Math.round(currentGrossBalance * 100) / 100,
      totalInterestGained: Math.round(totalInterestGained * 100) / 100,
      yearlyInterestGained: Math.round(yearlyInterestGained * 100) / 100,
      savingsOnlyBalance: Math.round(currentSavingsOnly * 100) / 100,
      differenceWithSavings: Math.round((currentGrossBalance - currentSavingsOnly) * 100) / 100,
      monthlyNetIncome: Math.round(monthlyNetIncome * 100) / 100,
      realBalance: Math.round(realBalance * 100) / 100,
    });
  }

  const finalGrossBalance = currentGrossBalance;
  const totalInvested = accumulatedDeposits;
  const totalInterestGained = Math.max(0, finalGrossBalance - totalInvested);
  const interestPercentage = totalInvested > 0 ? (totalInterestGained / totalInvested) * 100 : 0;
  const profitMultiplier = totalInvested > 0 ? finalGrossBalance / totalInvested : 1;

  const finalGrossMonthlyYield = finalGrossBalance * monthlyRate;
  const finalMonthlyNetIncome = Math.max(0, finalGrossMonthlyYield * (1 - taxRate / 100));
  const finalInflationFactor = Math.pow(1 + annualInflationRate / 100, years);
  const finalRealBalance = finalInflationFactor > 0 ? finalGrossBalance / finalInflationFactor : finalGrossBalance;

  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    finalGrossBalance: Math.round(finalGrossBalance * 100) / 100,
    totalInterestGained: Math.round(totalInterestGained * 100) / 100,
    finalMonthlyNetIncome: Math.round(finalMonthlyNetIncome * 100) / 100,
    finalRealBalance: Math.round(finalRealBalance * 100) / 100,
    interestPercentage: Math.round(interestPercentage * 10) / 10,
    savingsOnlyTotal: Math.round(currentSavingsOnly * 100) / 100,
    profitMultiplier: Math.round(profitMultiplier * 100) / 100,
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
