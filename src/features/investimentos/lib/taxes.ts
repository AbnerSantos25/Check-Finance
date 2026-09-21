// Regressive IR table for fixed income (Lei 11.033/2004), by days invested.
export const LONG_TERM_TAX_RATE = 15;

export const DAYS_PER_MONTH = 365.25 / 12;

export function regressiveTaxRate(daysInvested: number): number {
  if (daysInvested <= 180) return 22.5;
  if (daysInvested <= 360) return 20;
  if (daysInvested <= 720) return 17.5;
  return LONG_TERM_TAX_RATE;
}
