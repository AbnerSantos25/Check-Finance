import { SITE_NAME, absoluteUrl } from '../../config/site';
import type { ToolMeta } from '../../config/tools.data';

/** Um nó do grafo Schema.org. Solto de propósito: o vocabulário é grande. */
export type JsonLdNode = Record<string, unknown>;

/**
 * Nó `WebApplication` de uma calculadora.
 *
 * `isAccessibleForFree` + `offers` com preço zero é o par que o Google espera para
 * entender que a ferramenta é gratuita — só um dos dois costuma ser ignorado.
 */
export const toolApplicationNode = (tool: ToolMeta, featureList: string[]): JsonLdNode => ({
  '@type': 'WebApplication',
  '@id': `${absoluteUrl(tool.path)}#app`,
  name: tool.label,
  url: absoluteUrl(tool.path),
  description: tool.seo.description,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requer JavaScript',
  inLanguage: 'pt-BR',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
  featureList,
  publisher: { '@id': `${absoluteUrl('/')}#organization` },
});

/**
 * Trilha Início › Ferramenta. É o que faz o resultado da busca mostrar o caminho
 * em vez da URL crua.
 */
export const breadcrumbNode = (tool: ToolMeta): JsonLdNode => ({
  '@type': 'BreadcrumbList',
  '@id': `${absoluteUrl(tool.path)}#breadcrumb`,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: SITE_NAME,
      item: absoluteUrl('/'),
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: tool.label,
      item: absoluteUrl(tool.path),
    },
  ],
});
