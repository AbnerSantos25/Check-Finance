import type { InvestmentParams } from '../../../types';

type NumericParam = Exclude<keyof InvestmentParams, 'taxExempt'>;

export const PARAM_LIMITS: Record<NumericParam, { min: number; max: number }> = {
  initialDeposit: { min: 0, max: 1_000_000_000 },
  monthlyDeposit: { min: 0, max: 100_000_000 },
  annualAdjustmentRate: { min: 0, max: 50 },
  // Até 200% a.a. (cerca de 9,6% a.m.): quem digita a taxa ao mês chega a valores altos.
  annualInterestRate: { min: 0.1, max: 200 },
  annualInflationRate: { min: 0, max: 30 },
  // Em anos, com precisão de um mês: 1/12 (um mês) até 60 anos.
  years: { min: 1 / 12, max: 60 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Drops non-finite values and clamps the rest to the supported range.
 * Years snap to whole months (twelfths), the engine's smallest step.
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
    next[key] = clamp(key === 'years' ? Math.round(raw * 12) / 12 : raw, min, max);
  }
  return next;
}
