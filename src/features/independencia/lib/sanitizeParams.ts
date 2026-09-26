import type { IndependenceParams } from '../../../types';

type NumericParam = Exclude<keyof IndependenceParams, 'contributionFollowsInflation'>;

export const PARAM_LIMITS: Record<NumericParam, { min: number; max: number }> = {
  monthlyIncomeGoal: { min: 100, max: 10_000_000 },
  currentWealth: { min: 0, max: 10_000_000_000 },
  monthlyContribution: { min: 0, max: 100_000_000 },
  // Zero é aceito de propósito: mostra que, sem rendimento, a meta nunca chega.
  annualReturn: { min: 0, max: 50 },
  annualInflation: { min: 0, max: 30 },
  currentAge: { min: 0, max: 100 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Drops non-finite values and clamps the rest to the supported range. Age is a whole number. */
export function sanitizeParams(
  current: IndependenceParams,
  changes: Partial<IndependenceParams>
): IndependenceParams {
  const next = { ...current };
  if (typeof changes.contributionFollowsInflation === 'boolean') {
    next.contributionFollowsInflation = changes.contributionFollowsInflation;
  }
  for (const key of Object.keys(PARAM_LIMITS) as NumericParam[]) {
    const raw = changes[key];
    if (raw === undefined || !Number.isFinite(raw)) continue;
    const { min, max } = PARAM_LIMITS[key];
    next[key] = clamp(key === 'currentAge' ? Math.round(raw) : raw, min, max);
  }
  return next;
}
