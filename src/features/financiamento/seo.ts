import { getTool } from '../../config/tools.data';
import { breadcrumbNode, toolApplicationNode, type JsonLdNode } from '../../shared/seo/jsonLd';

export const FINANCING_TOOL = getTool('financiamento');

export const financingJsonLd: JsonLdNode[] = [
  toolApplicationNode(FINANCING_TOOL, [
    'Comparação entre os sistemas de amortização SAC e PRICE',
    'Custo Efetivo Total do financiamento imobiliário',
    'Evolução das parcelas, da primeira à última',
    'Simulação de amortização extraordinária mensal',
    'Economia de juros e redução de prazo com amortização extra',
  ]),
  breadcrumbNode(FINANCING_TOOL),
];
