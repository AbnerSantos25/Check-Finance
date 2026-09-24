import { describe, expect, it } from 'vitest';
import { resolveLegacyHash } from '../legacyHashes';
import { getTool } from '../../config/tools.data';

const INVESTIMENTOS = getTool('investimentos').path;
const FINANCIAMENTO = getTool('financiamento').path;

describe('resolveLegacyHash', () => {
  // Os quatro que estavam no sitemap antigo, isto é, os que o Google rastreou.
  it.each([
    ['#calculadora', INVESTIMENTOS],
    ['#metodologia', INVESTIMENTOS],
    ['#simulador-financiamento', FINANCIAMENTO],
    ['#calculadora-fire', '/'],
  ])('leva %s para %s', (hash, expected) => {
    expect(resolveLegacyHash(hash)).toBe(expected);
  });

  // Identificadores que apareciam no JSON-LD do index.html antigo.
  it('reconhece os fragmentos que vinham do Schema.org', () => {
    expect(resolveLegacyHash('#investment-calculator')).toBe(INVESTIMENTOS);
    expect(resolveLegacyHash('#real-estate-simulator')).toBe(FINANCIAMENTO);
  });

  it('aceita o fragmento sem a cerquilha e ignora maiúsculas', () => {
    expect(resolveLegacyHash('calculadora')).toBe(INVESTIMENTOS);
    expect(resolveLegacyHash('#CALCULADORA')).toBe(INVESTIMENTOS);
  });

  // Sem isto, uma âncora comum dentro de uma página jogaria o visitante para fora.
  it.each(['', '#', '#tabela', '#secao-qualquer', '#constructor', '#toString'])(
    'devolve null para %s',
    (hash) => {
      expect(resolveLegacyHash(hash)).toBeNull();
    }
  );
});
