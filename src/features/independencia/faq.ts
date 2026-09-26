import type { FaqItem } from '../../shared/seo/jsonLd';
import { EXAMPLE } from './example';

/**
 * Perguntas da calculadora de independência financeira.
 *
 * Todas as respostas descrevem o que `lib/calculateIndependence.ts` realmente faz,
 * e os números vêm de `example.ts`, calculados pelo próprio motor. O texto também
 * vai para o JSON-LD como resposta oficial da página: ao mudar o cálculo, revise
 * as respostas.
 */
export const INDEPENDENCE_FAQ: FaqItem[] = [
  {
    question: 'Quanto dinheiro preciso para viver de renda?',
    answer: [
      'O patrimônio necessário é a renda mensal desejada dividida pela rentabilidade real mensal, isto é, o quanto a carteira rende acima da inflação a cada mês. Nesse patamar, o rendimento paga a sua renda e o que sobra repõe a inflação, então o patrimônio nunca perde poder de compra.',
      `Com ${EXAMPLE.annualReturn} de rentabilidade e ${EXAMPLE.inflation} de inflação ao ano, a rentabilidade real é de ${EXAMPLE.realRate} ao ano. Para uma renda de ${EXAMPLE.goal} por mês, em valores de hoje, são necessários ${EXAMPLE.target}.`,
    ],
  },
  {
    question: 'Por que o resultado é tão diferente de outras calculadoras?',
    answer: [
      'Por dois motivos. O primeiro é a taxa: muitas calculadoras dividem a rentabilidade anual por 12, o que inventa juros que não existem. Aqui a taxa mensal é a equivalente composta, (1 + taxa anual)^(1/12) − 1, que capitalizada por 12 meses reproduz exatamente a taxa anual informada.',
      `O segundo é a inflação. Sem descontá-la, uma meta de ${EXAMPLE.goal} parece mais perto do que está: no cenário padrão, ignorar a inflação encurta o prazo de ${EXAMPLE.duration} para ${EXAMPLE.durationNoInflation}. Só que, no dia em que a meta chegasse, esses ${EXAMPLE.goal} comprariam muito menos do que compram hoje.`,
    ],
  },
  {
    question: 'O que significa "valores de hoje" e "valores nominais"?',
    answer: [
      'Valores de hoje estão em poder de compra atual: R$ 10.000 em valores de hoje compram, no futuro, o mesmo que R$ 10.000 compram agora. Valores nominais são o que vai aparecer de fato no extrato lá na frente, já inflados.',
      `A calculadora faz toda a conta em valores de hoje e converte para nominal quando você escolhe essa visão. No cenário padrão, manter o padrão de ${EXAMPLE.goal} de hoje exige ${EXAMPLE.goalNominal} por mês no dia em que a meta for atingida.`,
    ],
  },
  {
    question: 'O que é FIRE e onde entra a regra dos 4%?',
    answer: [
      'FIRE (Financial Independence, Retire Early) é o movimento de quem busca a independência financeira cedo, poupando uma fatia grande da renda e investindo até que o patrimônio pague o custo de vida.',
      `A regra dos 4% é um atalho de planejamento: sacar 4% do patrimônio no primeiro ano e reajustar pela inflação, o que pede um patrimônio de 25 vezes o gasto anual (${EXAMPLE.targetFourPercent} para ${EXAMPLE.goal} por mês). Ela aceita consumir parte do principal ao longo de cerca de 30 anos. Esta calculadora usa um critério diferente, a renda perpétua: o patrimônio necessário depende da rentabilidade real informada e nunca é consumido.`,
    ],
  },
  {
    question: 'Com rentabilidade zero, por que a calculadora não mostra um prazo?',
    answer: [
      'Porque não existe um. Se a carteira não rende acima da inflação, nenhum patrimônio paga uma renda para sempre sem encolher: cada saque reduz o poder de compra do que sobra. Algumas calculadoras mostram um prazo mesmo com 0% de rentabilidade, o que só é possível com um rendimento embutido que o usuário não informou.',
      'Aqui, quando a rentabilidade não supera a inflação, a calculadora avisa que a meta não é atingível nessas condições e pede para revisar os números.',
    ],
  },
  {
    question: 'Reajustar o aporte pela inflação faz tanta diferença?',
    answer: [
      `Faz. Com a opção marcada, o aporte sobe todo ano junto com a inflação e mantém o mesmo esforço real. Sem ela, os mesmos ${EXAMPLE.contribution} por mês valem cada vez menos. No cenário padrão, a meta leva ${EXAMPLE.duration} com aporte reajustado e ${EXAMPLE.durationFixedContribution} com aporte nominal fixo.`,
    ],
  },
  {
    question: 'O que esta calculadora não considera?',
    answer: [
      'Ela mantém a rentabilidade e a inflação constantes durante todo o período, coisa que nenhuma carteira real faz. Anos ruins logo no começo da fase de renda pesam mais do que anos ruins no meio da acumulação, e isso fica de fora.',
      'Também não entram Imposto de Renda, taxa de administração, custódia e corretagem, que reduzem a rentabilidade líquida. Use uma rentabilidade já descontada desses custos para um resultado mais realista.',
      'É uma ferramenta educativa, para comparar cenários. Não é recomendação de investimento.',
    ],
  },
];
