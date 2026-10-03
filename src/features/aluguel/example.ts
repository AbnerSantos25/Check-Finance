import { formatBRL, formatPercent } from '../../shared/lib/format';
import { calculateRentVsBuy } from './lib/calculateRentVsBuy';
import { DEFAULT_PARAMS } from './defaults';

/**
 * Números do cenário padrão citados no FAQ.
 *
 * Saem do próprio motor, e não de constantes escritas à mão: se o cálculo mudar, o
 * texto muda junto. A conta é determinística, então o HTML pré-renderizado e o do
 * navegador batem. Uma rodada só: a busca da valorização de equilíbrio fica na
 * página, onde já roda para o resultado.
 */
const base = calculateRentVsBuy(DEFAULT_PARAMS);

export const EXAMPLE = {
  property: formatBRL(DEFAULT_PARAMS.propertyValue),
  down: formatBRL(DEFAULT_PARAMS.downPayment),
  rent: formatBRL(DEFAULT_PARAMS.monthlyRent),
  firstInstallment: formatBRL(base.firstInstallment),
  financingRate: formatPercent(DEFAULT_PARAMS.financingRate, 1),
  investmentReturn: formatPercent(DEFAULT_PARAMS.investmentReturn, 1),
  appreciation: formatPercent(DEFAULT_PARAMS.propertyAppreciation, 1),
  years: DEFAULT_PARAMS.years,
  acquisition: formatBRL(DEFAULT_PARAMS.propertyValue * (DEFAULT_PARAMS.acquisitionCostRate / 100)),
  acquisitionRate: formatPercent(DEFAULT_PARAMS.acquisitionCostRate, 0),
  finalBuy: formatBRL(base.finalBuyReal),
  finalRent: formatBRL(base.finalRentReal),
  winner: base.winner,
};
