import type { RentVsBuyParams } from '../../../types';
import { AMORTIZATION_SYSTEMS } from '../../financiamento/lib/sanitizeParams';

type NumericParam = Exclude<keyof RentVsBuyParams, 'amortizationSystem' | 'taxExempt'>;

export const PARAM_LIMITS: Record<NumericParam, { min: number; max: number }> = {
  propertyValue: { min: 10_000, max: 10_000_000_000 },
  downPayment: { min: 0, max: 10_000_000_000 },
  financingRate: { min: 0, max: 30 },
  termMonths: { min: 60, max: 420 },
  acquisitionCostRate: { min: 0, max: 15 },
  maintenanceRate: { min: 0, max: 5 },
  // Negativa é aceita de propósito: imóvel também pode perder valor.
  propertyAppreciation: { min: -10, max: 30 },
  monthlyRent: { min: 0, max: 10_000_000 },
  rentAdjustment: { min: 0, max: 30 },
  investmentReturn: { min: 0, max: 50 },
  inflation: { min: 0, max: 30 },
  years: { min: 1, max: 40 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const WHOLE = new Set<NumericParam>(['termMonths', 'years']);

/**
 * Descarta valores não finitos e limita o resto à faixa suportada. Prazo e horizonte
 * são números inteiros, e a entrada nunca passa do valor do imóvel.
 */
export function sanitizeParams(current: RentVsBuyParams, changes: Partial<RentVsBuyParams>): RentVsBuyParams {
  const next = { ...current };
  if (changes.amortizationSystem && AMORTIZATION_SYSTEMS.includes(changes.amortizationSystem)) {
    next.amortizationSystem = changes.amortizationSystem;
  }
  if (typeof changes.taxExempt === 'boolean') next.taxExempt = changes.taxExempt;
  for (const key of Object.keys(PARAM_LIMITS) as NumericParam[]) {
    const raw = changes[key];
    if (raw === undefined || !Number.isFinite(raw)) continue;
    const { min, max } = PARAM_LIMITS[key];
    next[key] = clamp(WHOLE.has(key) ? Math.round(raw) : raw, min, max);
  }
  next.downPayment = Math.min(next.downPayment, next.propertyValue);
  return next;
}
