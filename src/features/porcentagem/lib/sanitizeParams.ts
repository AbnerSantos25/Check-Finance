import type { PercentageParams } from '../../../types';
import { MAX_CHAIN_STEPS } from '../defaults';

type NumericParam = keyof PercentageParams;

const VALUE = { min: -1e12, max: 1e12 };
// Desconto passa de 100% só por engano: o valor ficaria negativo.
const STEP = { min: -100, max: 1000 };

export const PARAM_LIMITS: Record<NumericParam, { min: number; max: number }> = {
  ofPercent: { min: -1000, max: 1000 },
  ofValue: VALUE,
  partValue: VALUE,
  wholeValue: VALUE,
  changeValue: VALUE,
  changePercent: { min: 0, max: 1000 },
  fromValue: VALUE,
  toValue: VALUE,
  chainStart: VALUE,
  chainCount: { min: 1, max: MAX_CHAIN_STEPS },
  chainStep1: STEP,
  chainStep2: STEP,
  chainStep3: STEP,
  chainStep4: STEP,
  chainStep5: STEP,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Descarta valores não finitos e limita o resto. O número de etapas é inteiro. */
export function sanitizeParams(current: PercentageParams, changes: Partial<PercentageParams>): PercentageParams {
  const next = { ...current };
  for (const key of Object.keys(PARAM_LIMITS) as NumericParam[]) {
    const raw = changes[key];
    if (raw === undefined || !Number.isFinite(raw)) continue;
    const { min, max } = PARAM_LIMITS[key];
    next[key] = clamp(key === 'chainCount' ? Math.round(raw) : raw, min, max);
  }
  return next;
}
