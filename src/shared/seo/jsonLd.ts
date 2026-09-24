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

/** Uma pergunta do FAQ. A resposta é uma lista de parágrafos em texto puro. */
export interface FaqItem {
  question: string;
  /**
   * Texto puro de propósito, e não JSX: o mesmo valor alimenta a tela e o
   * `acceptedAnswer` do JSON-LD. O Google exige que a resposta marcada seja
   * idêntica à visível, e manter uma fonte só torna divergir impossível.
   */
  answer: string[];
}

/**
 * Nó `FAQPage` de uma rota.
 *
 * Não espere rich result disso: desde agosto de 2023 o Google restringiu o
 * carrossel de FAQ a sites de governo e saúde. O valor aqui é outro — os
 * rastreadores de assistentes de IA leem JSON-LD, e um par pergunta/resposta
 * explícito é o formato que eles conseguem citar sem interpretar a página.
 */
export const faqNode = (tool: ToolMeta, items: FaqItem[]): JsonLdNode => ({
  '@type': 'FAQPage',
  '@id': `${absoluteUrl(tool.path)}#faq`,
  inLanguage: 'pt-BR',
  isPartOf: { '@id': `${absoluteUrl(tool.path)}#app` },
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer.join('\n\n'),
    },
  })),
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
