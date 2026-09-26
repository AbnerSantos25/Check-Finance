/**
 * Fonte única das ferramentas do hub: alimenta sidebar, footer, a home de hub,
 * o ComingSoonModal e a geração do sitemap.
 *
 * Mantido sem JSX e sem lucide: precisa ser importável por script de build em
 * Node, onde não há pipeline de React. Ícones e classes moram em tools.tsx.
 */

export type ToolId = 'investimentos' | 'financiamento' | 'independencia';

export type ToolStatus = 'ativo' | 'em-breve';

export type ToolAccent = 'emerald' | 'sky' | 'amber' | 'indigo';

export interface ToolMeta {
  id: ToolId;
  /** Slug da rota. Vira URL indexável a partir da Fase 4. */
  path: string;
  /** Nome completo: título do card do hub e do ComingSoonModal. */
  label: string;
  /** Nome curto para a navegação lateral. */
  shortLabel: string;
  description: string;
  accent: ToolAccent;
  status: ToolStatus;
  seo: { title: string; description: string; priority: number; changefreq: string };
}

export const TOOLS: ToolMeta[] = [
  {
    id: 'investimentos',
    path: '/calculadora-juros-compostos',
    label: 'Calculadora de Investimento a Longo Prazo',
    shortLabel: 'Investimento a Longo Prazo',
    description:
      'Descubra como aportes com reajustes anuais, juros compostos e o desconto da inflação afetam seu patrimônio real ao longo do tempo.',
    accent: 'emerald',
    status: 'ativo',
    seo: {
      title: 'Calculadora de Juros Compostos com Inflação e IR | CheckFinance',
      description:
        'Simulador de juros compostos com reajuste anual progressivo de aportes, desconto da inflação (IPCA) e tabela regressiva de IR para calcular sua rentabilidade real.',
      priority: 0.9,
      changefreq: 'weekly',
    },
  },
  {
    id: 'financiamento',
    path: '/simulador-financiamento-imobiliario',
    label: 'Simulador de Financiamento Imobiliário e Amortização',
    shortLabel: 'Financiamento Imobiliário',
    description:
      'Compare SAC e PRICE, veja o Custo Efetivo Total do imóvel e calcule quanto a amortização extra corta de juros e de prazo.',
    accent: 'sky',
    status: 'ativo',
    seo: {
      title: 'Simulador de Financiamento Imobiliário: SAC vs PRICE | CheckFinance',
      description:
        'Simule o Custo Efetivo Total do seu imóvel, compare os sistemas SAC e PRICE e calcule a redução de prazo e juros com amortizações extraordinárias.',
      priority: 0.9,
      changefreq: 'weekly',
    },
  },
  {
    id: 'independencia',
    path: '/calculadora-independencia-financeira',
    label: 'Calculadora de Independência Financeira (FIRE)',
    shortLabel: 'Independência Financeira',
    description:
      'Descubra com que idade seu patrimônio passa a pagar a renda que você quer, em valores de hoje, com a inflação descontada.',
    accent: 'indigo',
    status: 'ativo',
    seo: {
      title: 'Calculadora de Independência Financeira e Aposentadoria (FIRE) | CheckFinance',
      description:
        'Descubra quando você pode viver de renda: patrimônio necessário, idade da independência financeira e evolução mês a mês, com a inflação descontada.',
      priority: 0.9,
      changefreq: 'weekly',
    },
  },
];

export const getTool = (id: ToolId): ToolMeta => {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Ferramenta desconhecida: ${id}`);
  return tool;
};

export const ACTIVE_TOOLS = TOOLS.filter((t) => t.status === 'ativo');
