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

export const monthlyEquivalentRate = (annualPercent: number) =>
  Math.pow(1 + annualPercent / 100, 1 / 12) - 1;
