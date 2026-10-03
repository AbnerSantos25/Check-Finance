import type { RentVsBuyParams } from '../../types';

/**
 * Um caso típico de capital: imóvel de R$ 500 mil com 20% de entrada e aluguel de
 * R$ 2.000 (0,4% do valor ao mês, perto do que se vê nas grandes cidades). O CDI e
 * o IPCA são próximos dos atuais; o formulário oferece os valores do dia.
 */
export const DEFAULT_PARAMS: RentVsBuyParams = {
  propertyValue: 500000,
  downPayment: 100000,
  financingRate: 11.5,
  termMonths: 360,
  amortizationSystem: 'SAC',
  acquisitionCostRate: 4,
  maintenanceRate: 0.5,
  propertyAppreciation: 4.5,
  monthlyRent: 2000,
  rentAdjustment: 4.5,
  investmentReturn: 13.9,
  inflation: 4.5,
  years: 30,
  taxExempt: false,
};
