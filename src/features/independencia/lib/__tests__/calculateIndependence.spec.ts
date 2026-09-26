import { describe, expect, it } from 'vitest';
import { annualRealRate, calculateIndependence, formatDuration, MAX_MONTHS, sensitivity } from '../calculateIndependence';
import { sanitizeParams } from '../sanitizeParams';
import { DEFAULT_PARAMS } from '../../defaults';
import type { IndependenceParams } from '../../../../types';

// Cenário usado na auditoria da concorrência: meta de R$ 10.000/mês,
// aporte de R$ 1.000, patrimônio zero, 12% a.a.
const AUDIT: IndependenceParams = {
  monthlyIncomeGoal: 10000,
  currentWealth: 0,
  monthlyContribution: 1000,
  annualReturn: 12,
  annualInflation: 0,
  currentAge: 30,
  contributionFollowsInflation: true,
};

describe('calculateIndependence — gabarito da auditoria', () => {
  it('sem inflação: equivalência composta, 21 anos e 2 meses', () => {
    const r = calculateIndependence(AUDIT);
    expect(r.status).toBe('reached');
    expect(r.monthlyRealRate).toBeCloseTo(0.00948879, 8);
    expect(r.targetReal).toBeCloseTo(1_053_875, -1);
    expect(r.months).toBe(254);
    expect(formatDuration(r.months!)).toBe('21 anos e 2 meses');
  });

  it('com 4,5% de inflação: 34 anos e 8 meses em valores de hoje', () => {
    const r = calculateIndependence({ ...AUDIT, annualInflation: 4.5 });
    expect(r.annualRealRate).toBeCloseTo(7.177, 3);
    expect(r.targetReal).toBeCloseTo(1_726_312, -1);
    expect(r.months).toBe(416);
    expect(r.ageAtIndependence).toBeCloseTo(30 + 416 / 12, 10);
  });

  it('para no primeiro mês em que o saldo cobre o patrimônio necessário', () => {
    const r = calculateIndependence({ ...AUDIT, annualInflation: 4.5 });
    const last = r.schedule[r.schedule.length - 1];
    const previous = r.schedule[r.schedule.length - 2];
    expect(last.balanceReal).toBeGreaterThanOrEqual(r.targetReal);
    expect(previous.balanceReal).toBeLessThan(r.targetReal);
    expect(last.incomeReal).toBeGreaterThanOrEqual(AUDIT.monthlyIncomeGoal);
  });
});

describe('calculateIndependence — valores nominais', () => {
  const r = calculateIndependence({ ...AUDIT, annualInflation: 4.5 });
  const factor = Math.pow(1.045, 416 / 12);

  it('nominal = valor de hoje × inflação acumulada', () => {
    expect(r.targetNominal).toBeCloseTo(r.targetReal * factor, 2);
    expect(r.incomeGoalNominal).toBeCloseTo(10000 * factor, 6);
    expect(r.finalBalanceNominal).toBeCloseTo(r.finalBalanceReal * factor, 2);
  });

  it('aporte reajustado: constante em valores de hoje, crescente no nominal', () => {
    expect(r.totalContributedReal).toBeCloseTo(416 * 1000, 6);
    expect(r.totalContributedNominal).toBeGreaterThan(r.totalContributedReal);
  });

  it('aportado + juros = saldo, nas duas bases', () => {
    for (const row of r.schedule) {
      expect(row.contributedReal + row.interestReal).toBeCloseTo(row.balanceReal, 6);
      expect(row.contributedNominal + row.interestNominal).toBeCloseTo(row.balanceNominal, 6);
    }
  });

  it('aporte nominal fixo perde valor real e atrasa a meta', () => {
    const fixed = calculateIndependence({ ...AUDIT, annualInflation: 4.5, contributionFollowsInflation: false });
    expect(fixed.totalContributedNominal).toBeCloseTo(fixed.months! * 1000, 6);
    expect(fixed.months!).toBeGreaterThan(r.months!);
  });
});

describe('calculateIndependence — casos de borda', () => {
  it('rentabilidade zero não tem rendimento fantasma', () => {
    const r = calculateIndependence({ ...AUDIT, annualReturn: 0 });
    expect(r.status).toBe('no-real-return');
    expect(r.months).toBeNull();
    expect(r.schedule).toEqual([]);
  });

  it('rentabilidade igual à inflação não tem solução', () => {
    expect(calculateIndependence({ ...AUDIT, annualReturn: 4.5, annualInflation: 4.5 }).status).toBe('no-real-return');
  });

  it('patrimônio atual acima do necessário: meta já atingida', () => {
    const r = calculateIndependence({ ...AUDIT, currentWealth: 5_000_000 });
    expect(r.status).toBe('already-reached');
    expect(r.months).toBe(0);
    expect(r.ageAtIndependence).toBe(30);
    expect(r.schedule).toHaveLength(1);
  });

  it('patrimônio inicial entra na conta e encurta o prazo', () => {
    const r = calculateIndependence({ ...AUDIT, currentWealth: 200_000 });
    expect(r.months!).toBeLessThan(254);
    expect(r.totalContributedReal).toBeCloseTo(200_000 + r.months! * 1000, 6);
  });

  it('sem patrimônio nem aporte', () => {
    expect(calculateIndependence({ ...AUDIT, monthlyContribution: 0 }).status).toBe('no-savings');
  });

  it('acima de 100 anos', () => {
    const r = calculateIndependence({ ...AUDIT, monthlyContribution: 1, annualReturn: 1 });
    expect(r.status).toBe('over-limit');
    expect(r.schedule).toEqual([]);
    expect(MAX_MONTHS).toBe(1200);
  });
});

describe('annualRealRate', () => {
  it('usa Fisher, não subtração', () => {
    expect(annualRealRate(12, 4.5)).toBeCloseTo(7.1770335, 6);
    expect(annualRealRate(10, 0)).toBeCloseTo(10, 10);
  });
});

describe('sensitivity', () => {
  it('1 ponto a menos alonga, 1 ponto a mais encurta', () => {
    const base = calculateIndependence(DEFAULT_PARAMS);
    const s = sensitivity(DEFAULT_PARAMS, base.months!);
    expect(s.lower!).toBeGreaterThan(0);
    expect(s.higher!).toBeGreaterThan(0);
    expect(s.lower!).toBeGreaterThan(s.higher!);
  });

  it('devolve null quando o cenário mais pessimista deixa de ter solução', () => {
    const params = { ...AUDIT, annualReturn: 5, annualInflation: 4.5 };
    const base = calculateIndependence(params);
    expect(sensitivity(params, base.months ?? 0).lower).toBeNull();
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '0 meses'],
    [1, '1 mês'],
    [12, '1 ano'],
    [13, '1 ano e 1 mês'],
    [254, '21 anos e 2 meses'],
  ])('%i meses → %s', (months, text) => {
    expect(formatDuration(months)).toBe(text);
  });
});

describe('sanitizeParams', () => {
  it('limita e arredonda a idade', () => {
    const next = sanitizeParams(DEFAULT_PARAMS, { currentAge: 31.6, annualReturn: 80, monthlyIncomeGoal: 0 });
    expect(next.currentAge).toBe(32);
    expect(next.annualReturn).toBe(50);
    expect(next.monthlyIncomeGoal).toBe(100);
  });

  it('ignora valores não finitos e preserva o resto', () => {
    const next = sanitizeParams(DEFAULT_PARAMS, { currentWealth: NaN, contributionFollowsInflation: false });
    expect(next.currentWealth).toBe(DEFAULT_PARAMS.currentWealth);
    expect(next.contributionFollowsInflation).toBe(false);
  });
});
