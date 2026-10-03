import type { RentVsBuyParams } from '../../types';
import type { ShareSchema } from '../../shared/lib/shareParams';
import { AMORTIZATION_SYSTEMS } from '../financiamento/lib/sanitizeParams';

/** Chaves da simulação na URL: /alugar-ou-comprar-imovel?imovel=700000&aluguel=3000 */
export const SHARE_SCHEMA: ShareSchema<RentVsBuyParams> = {
  propertyValue: { key: 'imovel', type: 'number' },
  downPayment: { key: 'entrada', type: 'number' },
  financingRate: { key: 'juros', type: 'number' },
  termMonths: { key: 'prazo', type: 'number' },
  amortizationSystem: { key: 'sistema', type: 'enum', values: AMORTIZATION_SYSTEMS },
  acquisitionCostRate: { key: 'itbi', type: 'number' },
  maintenanceRate: { key: 'manutencao', type: 'number' },
  propertyAppreciation: { key: 'valorizacao', type: 'number' },
  monthlyRent: { key: 'aluguel', type: 'number' },
  rentAdjustment: { key: 'reajuste', type: 'number' },
  investmentReturn: { key: 'rendimento', type: 'number' },
  inflation: { key: 'inflacao', type: 'number' },
  years: { key: 'anos', type: 'number' },
  taxExempt: { key: 'isento', type: 'boolean' },
};
