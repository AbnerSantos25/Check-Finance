import { getTool } from '../../config/tools.data';
import { breadcrumbNode, toolApplicationNode, type JsonLdNode } from '../../shared/seo/jsonLd';

export const INVESTMENT_TOOL = getTool('investimentos');

export const investmentJsonLd: JsonLdNode[] = [
  toolApplicationNode(INVESTMENT_TOOL, [
    'Juros compostos sobre aportes mensais',
    'Reajuste anual progressivo do valor aportado',
    'Patrimônio em valor real, com a inflação descontada',
    'Imposto de Renda pela tabela regressiva, com opção de isenção',
    'Renda mensal sustentável em valores de hoje',
    'Taxas de referência do Banco Central (SELIC, CDI, IPCA e poupança)',
  ]),
  breadcrumbNode(INVESTMENT_TOOL),
];
