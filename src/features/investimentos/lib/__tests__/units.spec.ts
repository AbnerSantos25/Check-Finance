import { describe, expect, it } from 'vitest';
import { annualToMonthly, formatPeriod, monthlyToAnnual, periodRowLabel, toMonths } from '../units';

describe('conversão de taxa', () => {
  it('usa a taxa equivalente composta, não a divisão por 12', () => {
    expect(monthlyToAnnual(1)).toBeCloseTo(12.682503, 6);
    expect(annualToMonthly(12)).toBeCloseTo(0.948879, 6);
  });

  it('ida e volta devolve a mesma taxa', () => {
    for (const rate of [0.5, 1, 1.5, 3]) expect(annualToMonthly(monthlyToAnnual(rate))).toBeCloseTo(rate, 6);
  });
});

describe('prazo', () => {
  it('converte anos fracionários em meses inteiros', () => {
    expect(toMonths(1.5)).toBe(18);
    expect(toMonths(1 / 12)).toBe(1);
    expect(toMonths(30)).toBe(360);
  });

  it('escreve o prazo por extenso', () => {
    expect(formatPeriod(1)).toBe('1 ano');
    expect(formatPeriod(30)).toBe('30 anos');
    expect(formatPeriod(1 / 12)).toBe('1 mês');
    expect(formatPeriod(1.5)).toBe('18 meses');
  });

  it('rotula as linhas da série', () => {
    expect(periodRowLabel(3)).toBe('Ano 3');
    expect(periodRowLabel(1.5)).toBe('Mês 18');
  });
});
