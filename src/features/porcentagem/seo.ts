import { getTool } from '../../config/tools.data';
import { breadcrumbNode, faqNode, toolApplicationNode, type JsonLdNode } from '../../shared/seo/jsonLd';
import { PERCENTAGE_FAQ } from './faq';

export const PERCENTAGE_TOOL = getTool('porcentagem');

export const percentageJsonLd: JsonLdNode[] = [
  toolApplicationNode(PERCENTAGE_TOOL, [
    'Quanto é X% de um valor',
    'Quantos por cento um número é de outro',
    'Aumento e desconto percentual',
    'Variação percentual entre dois valores',
    'Aumentos e descontos sucessivos com a variação total equivalente',
    'Conta explicada passo a passo',
  ]),
  breadcrumbNode(PERCENTAGE_TOOL),
  faqNode(PERCENTAGE_TOOL, PERCENTAGE_FAQ),
];
