import { describe, expect, it } from 'vitest';
import { calculateInvestment } from '../calculateInvestment';
import { sanitizeParams } from '../sanitizeParams';
import { regressiveTaxRate } from '../taxes';
import type { InvestmentParams } from '../../../../types';

// Cenário padrão exibido ao abrir a calculadora.
const BASE: InvestmentParams = {
  initialDeposit: 5000,
  monthlyDeposit: 1000,
  annualAdjustmentRate: 5,
  annualInterestRate: 12,
  annualInflationRate: 4.5,
  years: 30,
  taxExempt: false,
};

describe('calculateInvestment — cenário padrão, tributado', () => {
  const s = calculateInvestment(BASE);

  it('fixa o resumo', () => {
    expect(s.totalInvested).toBe(802266.17);
    expect(s.totalInvestedReal).toBe(382061.22);
    expect(s.finalGrossBalance).toBe(4781666.14);
    expect(s.finalNetBalance).toBe(4184396.17);
    expect(s.finalRealNetBalance).toBe(1117233.84);
    expect(s.totalInterestGained).toBe(3979399.97);
    expect(s.totalInterestNet).toBe(3382130);
    expect(s.incomeTax).toBe(597269.97);
    expect(s.effectiveTaxRate).toBeCloseTo(15.009045919308663, 9);
    expect(s.realMultiplier).toBe(2.92);
    expect(s.fullYieldMonthlyNetIncome).toBe(33749.14);
    expect(s.sustainableMonthlyIncome).toBe(18372.28);
    expect(s.sustainableMonthlyIncomeReal).toBe(4905.4);
    expect(s.interestSurpassesDepositsYear).toBe(12);
  });

  it('fixa a série anual', () => {
    expect(s.yearlyData).toHaveLength(30);
    expect(s.yearlyData[0]).toEqual({
      year: 1,
      totalDeposited: 17000,
      grossBalance: 18246.5,
      netBalance: 18008.59,
      totalInterestGained: 1246.5,
      yearlyInterestGained: 1246.5,
      savingsOnlyBalance: 17000,
      sustainableMonthlyIncome: 79.07,
      realNetBalance: 17233.1,
    });
    expect(s.yearlyData[29]).toEqual({
      year: 30,
      totalDeposited: 802266.17,
      grossBalance: 4781666.14,
      netBalance: 4184396.17,
      totalInterestGained: 3979399.97,
      yearlyInterestGained: 509405.16,
      savingsOnlyBalance: 802266.17,
      sustainableMonthlyIncome: 18372.28,
      realNetBalance: 1117233.84,
    });
  });
});

describe('calculateInvestment — isento de IR', () => {
  const s = calculateInvestment({ ...BASE, taxExempt: true });

  it('zera o imposto e mantém o bruto igual ao cenário tributado', () => {
    expect(s.incomeTax).toBe(0);
    expect(s.effectiveTaxRate).toBe(0);
    expect(s.finalGrossBalance).toBe(4781666.14);
    expect(s.finalNetBalance).toBe(4781666.14);
    expect(s.totalInterestNet).toBe(3979399.97);
  });

  it('fixa os valores que dependem da isenção', () => {
    expect(s.finalRealNetBalance).toBe(1276704.93);
    expect(s.realMultiplier).toBe(3.34);
    expect(s.fullYieldMonthlyNetIncome).toBe(45372.24);
    expect(s.sustainableMonthlyIncome).toBe(27800.53);
    expect(s.sustainableMonthlyIncomeReal).toBe(7422.74);
  });
});

describe('calculateInvestment — sem reajuste anual do aporte', () => {
  const s = calculateInvestment({ ...BASE, annualAdjustmentRate: 0 });

  it('fixa o resumo', () => {
    expect(s.totalInvested).toBe(365000);
    expect(s.totalInvestedReal).toBe(204466.12);
    expect(s.finalGrossBalance).toBe(3201812.9);
    expect(s.finalNetBalance).toBe(2776200.93);
    expect(s.finalRealNetBalance).toBe(741245.69);
    expect(s.totalInterestGained).toBe(2836812.9);
    expect(s.incomeTax).toBe(425611.97);
    expect(s.realMultiplier).toBe(3.63);
    expect(s.sustainableMonthlyIncome).toBe(12189.37);
    expect(s.interestSurpassesDepositsYear).toBe(11);
  });
});

describe('regressiveTaxRate', () => {
  it.each([
    [1, 22.5],
    [180, 22.5],
    [181, 20],
    [360, 20],
    [361, 17.5],
    [720, 17.5],
    [721, 15],
    [10_000, 15],
  ])('%i dias → %f%%', (days, rate) => {
    expect(regressiveTaxRate(days)).toBe(rate);
  });
});

describe('sanitizeParams', () => {
  it('limita valores fora da faixa suportada', () => {
    const out = sanitizeParams(BASE, { annualInterestRate: 999, years: 200, annualInflationRate: -5 });
    expect(out.annualInterestRate).toBe(200);
    expect(out.years).toBe(60);
    expect(out.annualInflationRate).toBe(0);
  });

  it('arredonda o prazo para meses inteiros, de 1 mês a 60 anos', () => {
    expect(sanitizeParams(BASE, { years: 1.5 }).years).toBe(1.5); // 18 meses
    expect(sanitizeParams(BASE, { years: 10.7 }).years * 12).toBeCloseTo(128, 9); // 128,4 meses → 128
    expect(sanitizeParams(BASE, { years: 0 }).years).toBeCloseTo(1 / 12, 12);
  });

  it('ignora valores não finitos e mantém o atual', () => {
    const out = sanitizeParams(BASE, { monthlyDeposit: NaN, initialDeposit: Infinity });
    expect(out.monthlyDeposit).toBe(BASE.monthlyDeposit);
    expect(out.initialDeposit).toBe(BASE.initialDeposit);
  });

  it('aceita taxExempt apenas como booleano', () => {
    expect(sanitizeParams(BASE, { taxExempt: true }).taxExempt).toBe(true);
    expect(sanitizeParams(BASE, {}).taxExempt).toBe(BASE.taxExempt);
    // Uma string escaparia do guard e zeraria o IR silenciosamente.
    const coerced = sanitizeParams(BASE, { taxExempt: 'false' as unknown as boolean });
    expect(coerced.taxExempt).toBe(BASE.taxExempt);
  });
});

describe('calculateInvestment — prazo em meses', () => {
  const flat: InvestmentParams = { ...BASE, annualAdjustmentRate: 0, annualInflationRate: 0, taxExempt: true };

  it('18 meses: uma linha no ano 1 e uma linha parcial no mês 18', () => {
    const s = calculateInvestment({ ...flat, years: 1.5 });
    expect(s.yearlyData.map((r) => r.year)).toEqual([1, 1.5]);
    expect(s.totalInvested).toBe(5000 + 1000 * 18);
  });

  it('bate com a fórmula dos juros compostos com aportes', () => {
    // M = C(1+i)^n + PMT × ((1+i)^n − 1) / i, com i mensal equivalente e aporte no fim do mês.
    const i = Math.pow(1.12, 1 / 12) - 1;
    for (const months of [1, 7, 12, 18, 30]) {
      const s = calculateInvestment({ ...flat, years: months / 12 });
      const expected = 5000 * Math.pow(1 + i, months) + 1000 * ((Math.pow(1 + i, months) - 1) / i);
      expect(s.finalGrossBalance).toBeCloseTo(expected, 1);
    }
  });

  it('anos cheios dão o mesmo resultado em meses e em anos', () => {
    expect(calculateInvestment({ ...BASE, years: 24 / 12 })).toEqual(calculateInvestment({ ...BASE, years: 2 }));
  });
});
