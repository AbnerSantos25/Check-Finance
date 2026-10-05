/**
 * Fonte única das ferramentas do hub: alimenta sidebar, footer, a home de hub,
 * o ComingSoonModal e a geração do sitemap.
 *
 * Mantido sem JSX e sem lucide: precisa ser importável por script de build em
 * Node, onde não há pipeline de React. Ícones e classes moram em tools.tsx.
 */

export type ToolId = 'investimentos' | 'financiamento' | 'aluguel' | 'independencia' | 'porcentagem';

export type ToolStatus = 'ativo' | 'em-breve';

export type ToolAccent = 'emerald' | 'sky' | 'amber' | 'indigo' | 'violet';

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
    label: 'Calculadora de Juros Compostos',
    shortLabel: 'Juros Compostos',
    description:
      'Simule juros compostos com aportes mensais, taxa ao mês ou ao ano, inflação e Imposto de Renda, e veja quanto o patrimônio vale em dinheiro de hoje.',
    accent: 'emerald',
    status: 'ativo',
    seo: {
      title: 'Calculadora de Juros Compostos com Inflação e IR | CheckFinance',
      description:
        'Calcule juros compostos com aportes, taxa mensal ou anual, inflação e IR, com taxas do Banco Central. Veja a fórmula, exemplos e juros simples x compostos.',
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
    id: 'aluguel',
    path: '/alugar-ou-comprar-imovel',
    label: 'Calculadora Alugar ou Comprar Imóvel',
    shortLabel: 'Alugar ou Comprar',
    description:
      'Compare financiar o imóvel com morar de aluguel e investir a diferença, com valorização, inflação e Imposto de Renda no mesmo cálculo.',
    accent: 'amber',
    status: 'ativo',
    seo: {
      title: 'Alugar ou comprar imóvel: calculadora com inflação e IR | CheckFinance',
      description:
        'Vale mais a pena alugar ou comprar? Compare o patrimônio de quem financia o imóvel com o de quem aluga e investe a diferença, em valores de hoje e com IR.',
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
  {
    id: 'porcentagem',
    path: '/calculadora-porcentagem',
    label: 'Calculadora de Porcentagem',
    shortLabel: 'Porcentagem',
    description:
      'Quanto é X% de um valor, quantos por cento um número é de outro, aumento, desconto, variação e aumentos e descontos sucessivos.',
    accent: 'violet',
    status: 'ativo',
    seo: {
      title: 'Calculadora de Porcentagem: aumento, desconto e variação | CheckFinance',
      description:
        'Calcule porcentagem: X% de um valor, quantos por cento é, aumento, desconto, variação percentual e aumentos e descontos sucessivos, com a conta explicada.',
      // Ferramenta de apoio: as calculadoras financeiras continuam na frente no sitemap.
      priority: 0.8,
      changefreq: 'monthly',
    },
  },
];

export const getTool = (id: ToolId): ToolMeta => {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Ferramenta desconhecida: ${id}`);
  return tool;
};

export const ACTIVE_TOOLS = TOOLS.filter((t) => t.status === 'ativo');
