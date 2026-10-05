import type { PercentageParams } from '../../types';

/**
 * Exemplos que a página abre preenchidos. O de aumentos e descontos sucessivos é a
 * pergunta que viralizou (R$ 2.000 com aumento de 10% e depois desconto de 10%).
 */
export const DEFAULT_PARAMS: PercentageParams = {
  ofPercent: 15,
  ofValue: 200,
  partValue: 30,
  wholeValue: 200,
  changeValue: 150,
  changePercent: 10,
  fromValue: 80,
  toValue: 100,
  chainStart: 2000,
  chainCount: 2,
  chainStep1: 10,
  chainStep2: -10,
  chainStep3: 0,
  chainStep4: 0,
  chainStep5: 0,
};

export const MAX_CHAIN_STEPS = 5;
export const CHAIN_STEP_KEYS = ['chainStep1', 'chainStep2', 'chainStep3', 'chainStep4', 'chainStep5'] as const;

/** Percentuais das etapas em uso, na ordem. */
export const chainPercents = (params: PercentageParams): number[] =>
  CHAIN_STEP_KEYS.slice(0, params.chainCount).map((key) => params[key]);
