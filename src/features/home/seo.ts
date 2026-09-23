import { SITE_NAME, absoluteUrl } from '../../config/site';
import { ACTIVE_TOOLS } from '../../config/tools.data';
import type { JsonLdNode } from '../../shared/seo/jsonLd';

export const HOME_SEO = {
  title: 'CheckFinance | Calculadoras Financeiras Gratuitas em Português',
  description:
    'Hub gratuito de calculadoras financeiras: juros compostos com inflação e Imposto de Renda, simulador de financiamento imobiliário SAC vs PRICE e amortização extra. Sem cadastro.',
};

/**
 * Lista as ferramentas publicadas de forma legível por máquina.
 *
 * Vale tanto para busca tradicional — que usa a lista para os sitelinks — quanto
 * para assistentes de IA, que assim descobrem as calculadoras sem depender de
 * conseguir executar o JavaScript da página.
 */
export const homeJsonLd: JsonLdNode[] = [
  {
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl('/')}#hub`,
    name: HOME_SEO.title,
    description: HOME_SEO.description,
    url: absoluteUrl('/'),
    inLanguage: 'pt-BR',
    isPartOf: { '@id': `${absoluteUrl('/')}#website` },
    about: {
      '@type': 'Thing',
      name: 'Planejamento financeiro pessoal',
    },
    mainEntity: {
      '@type': 'ItemList',
      name: `Ferramentas do ${SITE_NAME}`,
      itemListElement: ACTIVE_TOOLS.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.label,
        description: tool.description,
        url: absoluteUrl(tool.path),
      })),
    },
  },
];
