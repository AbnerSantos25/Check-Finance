import { describe, expect, it } from 'vitest';
import { formatBRL, formatCompactBRL, formatNumber, formatPercent, monthlyEquivalentRate } from '../format';

// O Intl separa "R$" do número com espaço não separável (U+00A0).
const nbsp = (text: string) => text.replace(/ /g, ' ');

describe('formatBRL', () => {
  it.each([
    [1_250_000, 'R$ 1.250.000,00'],
    [0.5, 'R$ 0,50'],
    [-1234.567, '-R$ 1.234,57'],
  ])('%f → %s', (value, expected) => {
    expect(formatBRL(value)).toBe(nbsp(expected));
  });

  // O fallback é um texto fixo, com espaço comum, não passa pelo Intl.
  it.each([NaN, Infinity, -Infinity])('valor inválido (%f) vira R$ 0,00', (value) => {
    expect(formatBRL(value)).toBe('R$ 0,00');
  });
});

describe('formatCompactBRL', () => {
  it.each([
    [9_999.99, nbsp('R$ 9.999,99')],
    [10_000, 'R$ 10 mil'],
    [850_400, 'R$ 850 mil'],
    [999_999, 'R$ 1.000 mil'],
    [1_000_000, 'R$ 1 mi'],
    [1_500_000, 'R$ 1,5 mi'],
    [999_999_999, 'R$ 1.000 mi'],
    [1_000_000_000, 'R$ 1 bi'],
    [2_345_678_901, 'R$ 2,35 bi'],
    [-1_500_000, 'R$ -1,5 mi'],
  ])('%f → %s', (value, expected) => {
    expect(formatCompactBRL(value)).toBe(expected);
  });

  it('valor inválido vira R$ 0', () => {
    expect(formatCompactBRL(NaN)).toBe('R$ 0');
  });
});

describe('formatPercent', () => {
  it('usa vírgula e o número de casas pedido', () => {
    expect(formatPercent(12.5)).toBe('12,50%');
    expect(formatPercent(12.345, 1)).toBe('12,3%');
    expect(formatPercent(1234.5, 0)).toBe('1.235%');
  });

  it('valor inválido vira 0%', () => {
    expect(formatPercent(Infinity)).toBe('0%');
  });
});

describe('formatNumber', () => {
  it('formata com separador de milhar e casas fixas', () => {
    expect(formatNumber(185229.17, 0)).toBe('185.229');
    expect(formatNumber(5.1527, 4)).toBe('5,1527');
    expect(formatNumber(14)).toBe('14,00');
  });

  it('valor inválido vira 0', () => {
    expect(formatNumber(NaN)).toBe('0');
  });
});

describe('monthlyEquivalentRate', () => {
  it('é a taxa mensal composta equivalente à anual', () => {
    expect(Math.pow(1 + monthlyEquivalentRate(12), 12)).toBeCloseTo(1.12, 12);
    expect(monthlyEquivalentRate(0)).toBe(0);
  });
});
