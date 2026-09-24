import type { InvestmentParams } from '../../../types';

type NumericParam = Exclude<keyof InvestmentParams, 'taxExempt'>;

export const PARAM_LIMITS: Record<NumericParam, { min: number; max: number }> = {
  initialDeposit: { min: 0, max: 1_000_000_000 },
  monthlyDeposit: { min: 0, max: 100_000_000 },
  annualAdjustmentRate: { min: 0, max: 50 },
  annualInterestRate: { min: 0.1, max: 50 },
  annualInflationRate: { min: 0, max: 30 },
  years: { min: 1, max: 60 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Drops non-finite values and clamps the rest to the supported range.
 * Years are whole numbers because the engine compounds in 12-month blocks.
 */
export function sanitizeParams(
  current: InvestmentParams,
  changes: Partial<InvestmentParams>
): InvestmentParams {
  const next = { ...current };
  if (typeof changes.taxExempt === 'boolean') next.taxExempt = changes.taxExempt;
  for (const key of Object.keys(PARAM_LIMITS) as NumericParam[]) {
    const raw = changes[key];
    if (raw === undefined || !Number.isFinite(raw)) continue;
    const { min, max } = PARAM_LIMITS[key];
    next[key] = clamp(key === 'years' ? Math.round(raw) : raw, min, max);
  }
  return next;
}
