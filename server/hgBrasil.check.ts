/**
 * Self-check do parseIbovespa. Roda com: npm run check
 * As fixtures são respostas reais da HG Brasil — inclusive as que vêm com HTTP 200
 * e erro só no corpo, que é o caso que a validação existe para pegar.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseIbovespa } from './hgBrasil';

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./__fixtures__/${name}.json`, import.meta.url), 'utf-8'));

const ok = parseIbovespa(fixture('hg-finance-ok'));
assert.deepEqual(ok, { points: 185229.17, changePercent: -0.41 });

assert.equal(parseIbovespa(fixture('hg-finance-invalid-key')), null, 'valid_key:false deve ser rejeitado');
assert.equal(parseIbovespa(fixture('hg-v2-unauthorized')), null, 'errors[] deve ser rejeitado');

// Respostas corrompidas / fora de faixa.
const stocks = (ibovespa: unknown) => ({ valid_key: true, results: { stocks: { IBOVESPA: ibovespa } } });
assert.equal(parseIbovespa(stocks({ points: 9_999, variation: 0 })), null, 'pontos abaixo da faixa');
assert.equal(parseIbovespa(stocks({ points: 1_000_001, variation: 0 })), null, 'pontos acima da faixa');
assert.equal(parseIbovespa(stocks({ points: 185_000, variation: 21 })), null, 'variação além do circuit breaker');
assert.equal(parseIbovespa(stocks({ points: 'n/a', variation: 0 })), null, 'pontos não numéricos');
assert.equal(parseIbovespa(stocks(null)), null, 'IBOVESPA ausente');
assert.equal(parseIbovespa({ valid_key: true, results: { error: true } }), null, 'results.error');
assert.equal(parseIbovespa(null), null, 'payload vazio');

console.log('hgBrasil: ok');
