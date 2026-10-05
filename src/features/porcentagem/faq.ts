import type { FaqItem } from '../../shared/seo/jsonLd';
import { EXAMPLE } from './example';

const { of, whole, change, variation, viral } = EXAMPLE;

/**
 * Perguntas da calculadora de porcentagem. Os números saem de `example.ts`, que usa
 * as mesmas funções da calculadora. Também vão para o JSON-LD da página.
 */
export const PERCENTAGE_FAQ: FaqItem[] = [
  {
    question: 'Como calcular porcentagem?',
    answer: [
      `Multiplique o valor pelo percentual dividido por 100. Para saber quanto é ${of.percent} de ${of.value}: ${of.value} × ${of.decimal} = ${of.result}.`,
      'É a mesma conta da regra de três: se o valor inteiro é 100%, a parte que você procura está para ele assim como o percentual está para 100.',
    ],
  },
  {
    question: 'Um aumento de 10% seguido de um desconto de 10% volta ao valor inicial?',
    answer: [
      `Não. O desconto incide sobre o valor já aumentado, que é maior. ${viral.start} com aumento de ${viral.up} viram ${viral.afterUp}; o desconto de ${viral.down} incide sobre ${viral.afterUp}, e o valor final é ${viral.final}: ${viral.loss} a menos, uma variação total de ${viral.total}.`,
      `A ordem não muda o resultado: desconto primeiro e aumento depois também dá ${viral.final}. Para voltar exatamente ao valor inicial depois de um desconto de ${viral.down}, o aumento precisa ser de cerca de ${viral.recovery} (a dízima 11,111…%).`,
    ],
  },
  {
    question: 'Como calcular desconto?',
    answer: [
      `Multiplique o preço por (1 − desconto ÷ 100). Um desconto de ${change.percent} sobre ${change.value} é ${change.value} × ${change.discountFactor} = ${change.discounted}. Para aumento, some em vez de subtrair: ${change.increased}.`,
    ],
  },
  {
    question: 'Como calcular a variação percentual entre dois valores?',
    answer: [
      `Subtraia o valor inicial do final, divida pelo inicial e multiplique por 100. De ${variation.from} para ${variation.to}, a variação é de ${variation.up}.`,
      `A volta não tem o mesmo percentual, porque a base muda: de ${variation.to} para ${variation.from}, a variação é de ${variation.down}.`,
    ],
  },
  {
    question: 'Como saber quantos por cento um número é de outro?',
    answer: [
      `Divida a parte pelo total e multiplique por 100. ${whole.part} de ${whole.whole}: ${whole.part} ÷ ${whole.whole} × 100 = ${whole.result}.`,
    ],
  },
];
