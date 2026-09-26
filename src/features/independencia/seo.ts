import { getTool } from '../../config/tools.data';
import { breadcrumbNode, faqNode, toolApplicationNode, type JsonLdNode } from '../../shared/seo/jsonLd';
import { INDEPENDENCE_FAQ } from './faq';

export const INDEPENDENCE_TOOL = getTool('independencia');

export const independenceJsonLd: JsonLdNode[] = [
  toolApplicationNode(INDEPENDENCE_TOOL, [
    'Idade e prazo até a independência financeira',
    'Patrimônio necessário para viver de renda em valores de hoje',
    'Inflação descontada com taxa real pela relação de Fisher',
    'Alternância entre valores de hoje e valores nominais',
    'Análise de sensibilidade da rentabilidade',
    'Projeção mês a mês com exportação em CSV',
  ]),
  breadcrumbNode(INDEPENDENCE_TOOL),
  faqNode(INDEPENDENCE_TOOL, INDEPENDENCE_FAQ),
];
