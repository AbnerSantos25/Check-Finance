import { getTool } from '../../config/tools.data';
import { breadcrumbNode, faqNode, toolApplicationNode, type JsonLdNode } from '../../shared/seo/jsonLd';
import { INVESTMENT_FAQ } from './faq';

export const INVESTMENT_TOOL = getTool('investimentos');

export const investmentJsonLd: JsonLdNode[] = [
  toolApplicationNode(INVESTMENT_TOOL, [
    'Juros compostos sobre aportes mensais',
    'Taxa de juros ao mês ou ao ano e prazo em meses ou anos',
    'Fórmula dos juros compostos com exemplo resolvido',
    'Comparação entre juros simples e juros compostos',
    'Reajuste anual progressivo do valor aportado',
    'Patrimônio em valor real, com a inflação descontada',
    'Imposto de Renda pela tabela regressiva, com opção de isenção',
    'Renda mensal sustentável em valores de hoje',
    'Taxas de referência do Banco Central (SELIC, CDI, IPCA e poupança)',
  ]),
  breadcrumbNode(INVESTMENT_TOOL),
  faqNode(INVESTMENT_TOOL, INVESTMENT_FAQ),
];
