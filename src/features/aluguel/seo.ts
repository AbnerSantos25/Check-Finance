import { getTool } from '../../config/tools.data';
import { breadcrumbNode, faqNode, toolApplicationNode, type JsonLdNode } from '../../shared/seo/jsonLd';
import { RENT_VS_BUY_FAQ } from './faq';

export const RENT_VS_BUY_TOOL = getTool('aluguel');

export const rentVsBuyJsonLd: JsonLdNode[] = [
  toolApplicationNode(RENT_VS_BUY_TOOL, [
    'Patrimônio de quem compra financiado contra quem aluga e investe a diferença',
    'Financiamento SAC ou PRICE com custos de aquisição e manutenção',
    'Valorização do imóvel e reajuste anual do aluguel',
    'Imposto de Renda regressivo por aporte, com opção de investimento isento',
    'Valores de hoje com a inflação descontada',
    'Valorização de equilíbrio a partir da qual comprar compensa',
    'Projeção ano a ano com exportação em CSV',
  ]),
  breadcrumbNode(RENT_VS_BUY_TOOL),
  faqNode(RENT_VS_BUY_TOOL, RENT_VS_BUY_FAQ),
];
