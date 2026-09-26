import { getTool } from '../config/tools.data';

/**
 * Endereços da época em que o site inteiro vivia em `/` e a "navegação" era um
 * fragmento na URL.
 *
 * Eles ainda circulam: estavam no sitemap que o Google rastreou por meses, e
 * quem salvou um favorito guardou um deles. Como fragmento não é enviado ao
 * servidor, o Cloudflare não tem como redirecionar — só o navegador enxerga o
 * `#`, então o desvio precisa acontecer aqui.
 *
 * `#metodologia` não tem rota própria: a metodologia é um modal da calculadora
 * de juros, então o visitante aterrissa na página que tem o botão para abri-la.
 * `#calculadora-fire` vai para a calculadora de independência financeira, que
 * absorveu a FIRE.
 */
// Um Map, e não um objeto literal: com objeto, `LEGACY_HASHES['constructor']`
// devolveria uma função herdada do protótipo em vez de undefined, e `#constructor`
// viraria um destino de navegação.
const LEGACY_HASHES = new Map<string, string>([
  ['calculadora', getTool('investimentos').path],
  ['investment-calculator', getTool('investimentos').path],
  ['metodologia', getTool('investimentos').path],
  ['simulador-financiamento', getTool('financiamento').path],
  ['real-estate-simulator', getTool('financiamento').path],
  ['calculadora-fire', getTool('independencia').path],
]);

/**
 * Rota correspondente a um fragmento legado, ou `null` quando não for um deles.
 *
 * Devolver `null` para o desconhecido é o que permite que âncoras normais dentro
 * de uma página (`#tabela`, por exemplo) continuem funcionando.
 */
export const resolveLegacyHash = (hash: string): string | null => {
  const key = hash.replace(/^#/, '').trim().toLowerCase();
  if (!key) return null;
  return LEGACY_HASHES.get(key) ?? null;
};
