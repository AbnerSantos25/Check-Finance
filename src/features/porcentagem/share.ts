import type { PercentageParams } from '../../types';
import type { ShareSchema } from '../../shared/lib/shareParams';

/** Chaves na URL: /calculadora-porcentagem?p=20&de=350 */
export const SHARE_SCHEMA: ShareSchema<PercentageParams> = {
  ofPercent: { key: 'p', type: 'number' },
  ofValue: { key: 'de', type: 'number' },
  partValue: { key: 'parte', type: 'number' },
  wholeValue: { key: 'total', type: 'number' },
  changeValue: { key: 'valor', type: 'number' },
  changePercent: { key: 'taxa', type: 'number' },
  fromValue: { key: 'inicio', type: 'number' },
  toValue: { key: 'fim', type: 'number' },
  chainStart: { key: 'base', type: 'number' },
  chainCount: { key: 'etapas', type: 'number' },
  chainStep1: { key: 'e1', type: 'number' },
  chainStep2: { key: 'e2', type: 'number' },
  chainStep3: { key: 'e3', type: 'number' },
  chainStep4: { key: 'e4', type: 'number' },
  chainStep5: { key: 'e5', type: 'number' },
};
