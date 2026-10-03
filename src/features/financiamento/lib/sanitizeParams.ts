import type { AmortizationSystem, RealEstateParams } from '../../../types';

type NumericParam = Exclude<keyof RealEstateParams, 'amortizationSystem'>;

// Os mesmos limites que o formulário aceita (RealEstateForm). Servem para o que
// chega de fora dele, como um link compartilhado editado à mão.
export const PARAM_LIMITS: Record<NumericParam, { min: number; max: number }> = {
  propertyValue: { min: 0, max: 10_000_000_000 },
  downPayment: { min: 0, max: 10_000_000_000 },
  annualInterestRate: { min: 0, max: 50 },
  termMonths: { min: 60, max: 420 },
  extraMonthlyAmortization: { min: 0, max: 100_000_000 },
};

export const AMORTIZATION_SYSTEMS: readonly AmortizationSystem[] = ['SAC', 'PRICE'];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Descarta valores não finitos e limita o resto à faixa suportada. O prazo é um
 * número inteiro de meses, e a entrada nunca passa do valor do imóvel.
 */
export function sanitizeParams(
  current: RealEstateParams,
  changes: Partial<RealEstateParams>
): RealEstateParams {
  const next = { ...current };
  if (changes.amortizationSystem && AMORTIZATION_SYSTEMS.includes(changes.amortizationSystem)) {
    next.amortizationSystem = changes.amortizationSystem;
  }
  for (const key of Object.keys(PARAM_LIMITS) as NumericParam[]) {
    const raw = changes[key];
    if (raw === undefined || !Number.isFinite(raw)) continue;
    const { min, max } = PARAM_LIMITS[key];
    next[key] = clamp(key === 'termMonths' ? Math.round(raw) : raw, min, max);
  }
  next.downPayment = Math.min(next.downPayment, next.propertyValue);
  return next;
}
