import { describe, expect, it } from 'vitest';
import type { RentVsBuyParams } from '../../../../types';
import { breakEvenAppreciation, calculateRentVsBuy } from '../calculateRentVsBuy';
import { sanitizeParams } from '../sanitizeParams';
import { DEFAULT_PARAMS } from '../../defaults';

/** Tudo zerado: sem juros, sem rendimento, sem inflação, sem custos. */
const FLAT: RentVsBuyParams = {
  propertyValue: 120000,
  downPayment: 0,
  financingRate: 0,
  termMonths: 12,
  amortizationSystem: 'SAC',
  acquisitionCostRate: 0,
  maintenanceRate: 0,
  propertyAppreciation: 0,
  monthlyRent: 1000,
  rentAdjustment: 0,
  investmentReturn: 0,
  inflation: 0,
  years: 1,
  taxExempt: false,
};

describe('calculateRentVsBuy — contas à mão', () => {
  it('sem juros nem rendimento: quem aluga guarda a diferença entre parcela e aluguel', () => {
    // Parcela de 120.000 / 12 = 10.000; aluguel de 1.000; sobram 9.000 por mês para investir.
    const r = calculateRentVsBuy(FLAT);
    expect(r.yearly[0].buyNominal).toBeCloseTo(120000, 6);
    expect(r.yearly[0].rentNominal).toBeCloseTo(108000, 6);
    expect(r.winner).toBe('buy');
    expect(r.differenceReal).toBeCloseTo(12000, 6); // o aluguel pago no ano
  });

  it('com aluguel zero e dinheiro parado, comprar perde exatamente custos, juros e manutenção', () => {
    const params: RentVsBuyParams = {
      ...FLAT,
      propertyValue: 300000,
      downPayment: 60000,
      financingRate: 10,
      termMonths: 120,
      acquisitionCostRate: 4,
      maintenanceRate: 0.5,
      monthlyRent: 0,
      years: 10,
    };
    const r = calculateRentVsBuy(params);
    const last = r.yearly[r.yearly.length - 1];
    const acquisition = 300000 * 0.04;
    const maintenance = 300000 * 0.005 * 10; // sem valorização, manutenção constante
    expect(last.outstanding).toBeCloseTo(0, 2);
    expect(last.buyNominal).toBeCloseTo(300000, 2);
    expect(last.rentNominal - last.buyNominal).toBeCloseTo(acquisition + r.totalInterest + maintenance, 2);
  });

  it('quem aluga começa investindo a entrada mais os custos de aquisição', () => {
    const r = calculateRentVsBuy({ ...FLAT, downPayment: 30000, acquisitionCostRate: 4 });
    expect(r.initialOutlay).toBe(30000 + 120000 * 0.04);
  });

  it('com entrada igual ao imóvel não há financiamento nem parcela', () => {
    const r = calculateRentVsBuy({ ...DEFAULT_PARAMS, downPayment: DEFAULT_PARAMS.propertyValue });
    expect(r.financed).toBe(0);
    expect(r.yearly.every((y) => y.monthlyInstallment === 0 && y.outstanding === 0)).toBe(true);
  });
});

describe('calculateRentVsBuy — comportamento', () => {
  it('rendimento muito alto faz alugar vencer; valorização muito alta faz comprar vencer', () => {
    expect(calculateRentVsBuy({ ...DEFAULT_PARAMS, investmentReturn: 30 }).winner).toBe('rent');
    expect(calculateRentVsBuy({ ...DEFAULT_PARAMS, propertyAppreciation: 20 }).winner).toBe('buy');
  });

  it('sem inflação, valores reais são iguais aos nominais', () => {
    const r = calculateRentVsBuy({ ...DEFAULT_PARAMS, inflation: 0 });
    for (const y of r.yearly) {
      expect(y.buyReal).toBeCloseTo(y.buyNominal, 6);
      expect(y.rentReal).toBeCloseTo(y.rentNominal, 6);
    }
  });

  it('investimento isento de IR deixa quem aluga com mais', () => {
    const taxed = calculateRentVsBuy(DEFAULT_PARAMS);
    const exempt = calculateRentVsBuy({ ...DEFAULT_PARAMS, taxExempt: true });
    expect(exempt.finalRentReal).toBeGreaterThan(taxed.finalRentReal);
  });

  it('o aluguel é reajustado uma vez por ano', () => {
    const r = calculateRentVsBuy({ ...DEFAULT_PARAMS, rentAdjustment: 10, years: 3 });
    expect(r.yearly.map((y) => Math.round(y.monthlyRent))).toEqual([2000, 2200, 2420]);
  });

  it('uma série por ano do horizonte', () => {
    expect(calculateRentVsBuy({ ...DEFAULT_PARAMS, years: 25 }).yearly).toHaveLength(25);
  });

  it('o ano da virada é coerente com a série', () => {
    for (const appreciation of [3, 6, 8, 10]) {
      const r = calculateRentVsBuy({ ...DEFAULT_PARAMS, propertyAppreciation: appreciation });
      if (r.buyAheadFromYear === null) {
        const last = r.yearly[r.yearly.length - 1];
        expect(last.buyNominal).toBeLessThan(last.rentNominal);
        continue;
      }
      const from = r.buyAheadFromYear;
      for (const y of r.yearly) {
        if (y.year >= from) expect(y.buyNominal).toBeGreaterThanOrEqual(y.rentNominal);
      }
      if (from > 1) expect(r.yearly[from - 2].buyNominal).toBeLessThan(r.yearly[from - 2].rentNominal);
    }
  });
});

describe('breakEvenAppreciation', () => {
  it('na valorização de equilíbrio os dois patrimônios praticamente empatam', () => {
    const rate = breakEvenAppreciation(DEFAULT_PARAMS);
    expect(typeof rate).toBe('number');
    const below = calculateRentVsBuy({ ...DEFAULT_PARAMS, propertyAppreciation: (rate as number) - 0.05 });
    const above = calculateRentVsBuy({ ...DEFAULT_PARAMS, propertyAppreciation: (rate as number) + 0.05 });
    expect(below.finalBuyReal).toBeLessThan(below.finalRentReal);
    expect(above.finalBuyReal).toBeGreaterThan(above.finalRentReal);
  });

  it('aluguel caro faz comprar compensar sempre; rendimento altíssimo, nunca', () => {
    expect(breakEvenAppreciation({ ...DEFAULT_PARAMS, monthlyRent: 20000 })).toBe('always');
    expect(breakEvenAppreciation({ ...DEFAULT_PARAMS, investmentReturn: 50, monthlyRent: 500 })).toBe('never');
  });
});

describe('sanitizeParams (aluguel)', () => {
  it('limita a entrada ao valor do imóvel e arredonda prazo e horizonte', () => {
    const out = sanitizeParams(DEFAULT_PARAMS, { propertyValue: 200000, downPayment: 500000, termMonths: 200.4, years: 12.6 });
    expect(out.downPayment).toBe(200000);
    expect(out.termMonths).toBe(200);
    expect(out.years).toBe(13);
  });

  it('aceita valorização negativa, mas dentro da faixa', () => {
    expect(sanitizeParams(DEFAULT_PARAMS, { propertyAppreciation: -3 }).propertyAppreciation).toBe(-3);
    expect(sanitizeParams(DEFAULT_PARAMS, { propertyAppreciation: -50 }).propertyAppreciation).toBe(-10);
  });

  it('ignora valores não finitos e sistema desconhecido', () => {
    const out = sanitizeParams(DEFAULT_PARAMS, {
      monthlyRent: NaN,
      amortizationSystem: 'BALAO' as unknown as RentVsBuyParams['amortizationSystem'],
    });
    expect(out.monthlyRent).toBe(DEFAULT_PARAMS.monthlyRent);
    expect(out.amortizationSystem).toBe(DEFAULT_PARAMS.amortizationSystem);
  });
});
