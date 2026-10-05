import { describe, expect, it } from 'vitest';
import { decodeParams, encodeParams, type ShareSchema } from '../shareParams';
import type { IndependenceParams, InvestmentParams, RealEstateParams, RentVsBuyParams, PercentageParams } from '../../../types';
import { DEFAULT_PARAMS as INVESTMENT_DEFAULTS } from '../../../features/investimentos/defaults';
import { SHARE_SCHEMA as INVESTMENT_SCHEMA } from '../../../features/investimentos/share';
import { sanitizeParams as sanitizeInvestment } from '../../../features/investimentos/lib/sanitizeParams';
import { DEFAULT_RE_PARAMS as FINANCING_DEFAULTS } from '../../../features/financiamento/defaults';
import { SHARE_SCHEMA as FINANCING_SCHEMA } from '../../../features/financiamento/share';
import { sanitizeParams as sanitizeFinancing } from '../../../features/financiamento/lib/sanitizeParams';
import { DEFAULT_PARAMS as INDEPENDENCE_DEFAULTS } from '../../../features/independencia/defaults';
import { SHARE_SCHEMA as INDEPENDENCE_SCHEMA } from '../../../features/independencia/share';
import { sanitizeParams as sanitizeIndependence } from '../../../features/independencia/lib/sanitizeParams';
import { DEFAULT_PARAMS as PERCENTAGE_DEFAULTS } from '../../../features/porcentagem/defaults';
import { SHARE_SCHEMA as PERCENTAGE_SCHEMA } from '../../../features/porcentagem/share';
import { sanitizeParams as sanitizePercentage } from '../../../features/porcentagem/lib/sanitizeParams';
import { DEFAULT_PARAMS as RENT_VS_BUY_DEFAULTS } from '../../../features/aluguel/defaults';
import { SHARE_SCHEMA as RENT_VS_BUY_SCHEMA } from '../../../features/aluguel/share';
import { sanitizeParams as sanitizeRentVsBuy } from '../../../features/aluguel/lib/sanitizeParams';

interface Sample {
  amount: number;
  exempt: boolean;
  system: 'SAC' | 'PRICE';
}

const schema: ShareSchema<Sample> = {
  amount: { key: 'v', type: 'number' },
  exempt: { key: 'isento', type: 'boolean' },
  system: { key: 'sis', type: 'enum', values: ['SAC', 'PRICE'] },
};
const defaults: Sample = { amount: 1000, exempt: false, system: 'SAC' };

describe('encodeParams', () => {
  it('não escreve nada quando tudo está no padrão', () => {
    expect(encodeParams(defaults, defaults, schema)).toBe('');
  });

  it('escreve só os campos alterados', () => {
    expect(encodeParams({ ...defaults, amount: 1250.5 }, defaults, schema)).toBe('v=1250.5');
    expect(encodeParams({ amount: 1000, exempt: true, system: 'PRICE' }, defaults, schema)).toBe('isento=1&sis=PRICE');
  });
});

describe('decodeParams', () => {
  it('lê números, booleanos e enums', () => {
    expect(decodeParams('?v=1250.5&isento=1&sis=PRICE', schema)).toEqual({
      amount: 1250.5,
      exempt: true,
      system: 'PRICE',
    });
  });

  it('aceita número no formato brasileiro, de link editado à mão', () => {
    expect(decodeParams('v=1.250,50', schema)).toEqual({ amount: 1250.5 });
  });

  it.each([
    ['número inválido', 'v=abc'],
    ['número vazio', 'v='],
    ['infinito', 'v=Infinity'],
    ['booleano inválido', 'isento=talvez'],
    ['enum desconhecido', 'sis=BALAO'],
    ['chave desconhecida', 'outra=1'],
  ])('ignora %s', (_label, search) => {
    expect(decodeParams(search, schema)).toEqual({});
  });
});

describe.each([
  {
    name: 'investimentos',
    defaults: INVESTMENT_DEFAULTS,
    schema: INVESTMENT_SCHEMA,
    sanitize: sanitizeInvestment,
    edited: { ...INVESTMENT_DEFAULTS, monthlyDeposit: 2500, years: 20, taxExempt: true } as InvestmentParams,
  },
  {
    name: 'financiamento',
    defaults: FINANCING_DEFAULTS,
    schema: FINANCING_SCHEMA,
    sanitize: sanitizeFinancing,
    edited: { ...FINANCING_DEFAULTS, propertyValue: 750000, termMonths: 240, amortizationSystem: 'PRICE' } as RealEstateParams,
  },
  {
    name: 'independência',
    defaults: INDEPENDENCE_DEFAULTS,
    schema: INDEPENDENCE_SCHEMA,
    sanitize: sanitizeIndependence,
    edited: { ...INDEPENDENCE_DEFAULTS, monthlyIncomeGoal: 8000, currentAge: 42, contributionFollowsInflation: false } as IndependenceParams,
  },
  {
    name: 'alugar ou comprar',
    defaults: RENT_VS_BUY_DEFAULTS,
    schema: RENT_VS_BUY_SCHEMA,
    sanitize: sanitizeRentVsBuy,
    edited: {
      ...RENT_VS_BUY_DEFAULTS,
      monthlyRent: 3200,
      propertyAppreciation: -1.5,
      amortizationSystem: 'PRICE',
      taxExempt: true,
      years: 15,
    } as RentVsBuyParams,
  },
  {
    name: 'porcentagem',
    defaults: PERCENTAGE_DEFAULTS,
    schema: PERCENTAGE_SCHEMA,
    sanitize: sanitizePercentage,
    edited: { ...PERCENTAGE_DEFAULTS, ofPercent: 12.5, toValue: 64.9, chainCount: 3, chainStep3: -5 } as PercentageParams,
  },
])('link compartilhado de $name', ({ defaults, schema, sanitize, edited }) => {
  type P = typeof edited;
  const roundTrip = (params: P) =>
    (sanitize as (c: P, ch: Partial<P>) => P)(defaults as P, decodeParams(encodeParams(params, defaults as P, schema as ShareSchema<P>), schema as ShareSchema<P>));

  it('reabre a mesma simulação', () => {
    expect(roundTrip(edited)).toEqual(edited);
  });

  it('todo campo do formulário tem chave na URL, sem chave repetida', () => {
    const keys = Object.values(schema).map((f) => (f as { key: string }).key);
    expect(Object.keys(schema).sort()).toEqual(Object.keys(defaults).sort());
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('sanitizeParams do financiamento', () => {
  it('limita a entrada ao valor do imóvel e arredonda o prazo', () => {
    const out = sanitizeFinancing(FINANCING_DEFAULTS, { propertyValue: 300000, downPayment: 900000, termMonths: 361.6 });
    expect(out.downPayment).toBe(300000);
    expect(out.termMonths).toBe(362);
  });

  it('prende os valores à faixa do formulário', () => {
    const out = sanitizeFinancing(FINANCING_DEFAULTS, { termMonths: 1000, annualInterestRate: -2, extraMonthlyAmortization: -50 });
    expect(out.termMonths).toBe(420);
    expect(out.annualInterestRate).toBe(0);
    expect(out.extraMonthlyAmortization).toBe(0);
  });

  it('ignora sistema de amortização desconhecido e valores não finitos', () => {
    const out = sanitizeFinancing(FINANCING_DEFAULTS, {
      amortizationSystem: 'BALAO' as unknown as RealEstateParams['amortizationSystem'],
      propertyValue: NaN,
    });
    expect(out.amortizationSystem).toBe(FINANCING_DEFAULTS.amortizationSystem);
    expect(out.propertyValue).toBe(FINANCING_DEFAULTS.propertyValue);
  });
});
