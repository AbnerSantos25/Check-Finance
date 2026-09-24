import type { FinancingInstallment, FinancingSummary, RealEstateParams } from '../../../types';

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
