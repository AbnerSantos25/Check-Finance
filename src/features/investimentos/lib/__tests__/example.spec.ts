import { describe, expect, it } from 'vitest';
import { COMPOUND_TABLE, EXAMPLE, SIMPLE_VS_COMPOUND } from '../../example';
import { INVESTMENT_FAQ } from '../../faq';
import { calculateInvestment } from '../calculateInvestment';
import { monthlyToAnnual } from '../units';

// O Intl separa "R$" do número com espaço não separável; o texto escrito usa espaço comum.
const n = (text: string) => text.replace(/\u00a0/g, ' ');

describe('números do conteúdo educativo', () => {
  it('exemplo da fórmula: R$ 1.000 a 1% a.m. por 12 meses', () => {
    expect(n(EXAMPLE.amount)).toBe('R$ 1.126,83');
    expect(n(EXAMPLE.interest)).toBe('R$ 126,83');
    expect(n(EXAMPLE.simpleAmount)).toBe('R$ 1.120,00');
    expect(n(EXAMPLE.withDeposits)).toBe('R$ 2.395,08');
    expect(n(EXAMPLE.annualEquivalent)).toBe('12,68%');
  });

  it('a conta escrita fecha: capital × fator arredondado dá o montante exibido', () => {
    expect(EXAMPLE.substitution).toBe('1.000 × (1 + 0,01)¹²');
    expect(EXAMPLE.factor).toBe('1,126825');
    const factor = Number(EXAMPLE.factor.replace(',', '.'));
    expect((1000 * factor).toFixed(2)).toBe('1126.83');
  });

  it('o botão "fazer esta conta" leva a calculadora ao mesmo montante', () => {
    const s = calculateInvestment({
      initialDeposit: 1000,
      monthlyDeposit: 0,
      annualAdjustmentRate: 0,
      annualInterestRate: monthlyToAnnual(1),
      annualInflationRate: 4.5,
      years: 1,
      taxExempt: true,
    });
    expect(s.finalGrossBalance).toBe(1126.83);
  });

  it('valores citados por extenso no FAQ batem com a tabela', () => {
    const twentyYears = SIMPLE_VS_COMPOUND[SIMPLE_VS_COMPOUND.length - 1];
    expect(n(twentyYears.simple)).toBe('R$ 34.000,00');
    expect(n(twentyYears.compound)).toBe('R$ 108.925,54');
    const answer = INVESTMENT_FAQ.find((q) => q.question.includes('juros simples e compostos'))!.answer.join(' ');
    expect(n(answer)).toContain('R$ 34.000,00');
    expect(n(answer)).toContain('mais de R$ 108 mil');
  });

  it('tabela de juros compostos: 1% a.m. por 120 meses', () => {
    const onePercent = COMPOUND_TABLE.rows.find((row) => row.rate.startsWith('1,0'))!;
    expect(n(onePercent.values[COMPOUND_TABLE.months.indexOf(120)])).toBe('R$ 3.300,39');
  });
});
