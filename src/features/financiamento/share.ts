import type { RealEstateParams } from '../../types';
import type { ShareSchema } from '../../shared/lib/shareParams';
import { AMORTIZATION_SYSTEMS } from './lib/sanitizeParams';

/** Chaves da simulação na URL: /simulador-financiamento-imobiliario?imovel=600000&sistema=PRICE */
export const SHARE_SCHEMA: ShareSchema<RealEstateParams> = {
  propertyValue: { key: 'imovel', type: 'number' },
  downPayment: { key: 'entrada', type: 'number' },
  annualInterestRate: { key: 'taxa', type: 'number' },
  termMonths: { key: 'prazo', type: 'number' },
  amortizationSystem: { key: 'sistema', type: 'enum', values: AMORTIZATION_SYSTEMS },
  extraMonthlyAmortization: { key: 'extra', type: 'number' },
};
