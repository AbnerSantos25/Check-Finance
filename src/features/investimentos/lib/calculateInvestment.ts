import type { CalculationSummary, InvestmentParams, YearlyResult } from '../../../types';
import { monthlyEquivalentRate } from '../../../shared/lib/format';
import { DAYS_PER_MONTH, LONG_TERM_TAX_RATE, regressiveTaxRate } from './taxes';

const round2 = (value: number) => Math.round(value * 100) / 100;

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
