/**
 * Constantes do site inteiro. Fica sem JSX e sem import de React pelo mesmo motivo
 * de `tools.data.ts`: o `vite.config.ts` importa daqui na geração do sitemap.
 */

export const SITE_URL = 'https://checkfinance.com.br';

export const SITE_NAME = 'CheckFinance';

export const SITE_TAGLINE = 'Hub de Ferramentas Financeiras';

/** Cartão social padrão, usado quando a rota não define o seu. */
export const DEFAULT_OG_IMAGE = '/og-image.png';

export const SITE_LOCALE = 'pt_BR';

/**
 * Caminho relativo → URL absoluta. Canonical e og:url exigem absoluta.
 *
 * As barras iniciais são normalizadas para exatamente uma porque o caminho pode vir
 * da URL que o visitante digitou (a página 404 usa o próprio pathname): `new URL`
 * lê `//outro-site.com` como protocol-relative e devolveria `https://outro-site.com/`,
 * ou seja, um og:url apontando para fora do domínio.
 *
 * A contrabarra entra na mesma normalização porque o parser de URL a trata como
 * barra em esquemas especiais: `\\outro-site.com` escapa da origem exatamente como
 * `//outro-site.com`. Hoje nenhum chamador consegue entregar uma contrabarra crua
 * (o navegador já a converte em `location.pathname`), mas a função é de uso geral e
 * o próximo chamador pode não ter essa proteção.
 */
export const absoluteUrl = (path: string): string =>
  new URL(`/${String(path).replace(/^[/\\]+/, '')}`, SITE_URL).toString();
