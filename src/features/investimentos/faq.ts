import type { FaqItem } from '../../shared/seo/jsonLd';

/**
 * Perguntas da calculadora de investimentos.
 *
 * Todas as respostas descrevem o que o código realmente faz: as fórmulas estão
 * em `lib/calculateInvestment.ts` e detalhadas no modal de Metodologia. Ao mudar
 * o cálculo, mude o texto junto — ele também vai para o JSON-LD como resposta
 * oficial da página.
 */
export const INVESTMENT_FAQ: FaqItem[] = [
  {
    question: 'Por que o patrimônio "em valores de hoje" é tão menor que o saldo bruto?',
    answer: [
      'O saldo bruto é o número nominal: o que apareceria no extrato lá na frente. Dele saem duas coisas antes de virar poder de compra. Primeiro o Imposto de Renda sobre o rendimento. Depois a inflação, que encareceu tudo no mesmo período.',
      'A coluna "líquido em valores de hoje" já fez as duas contas. É ela que responde à pergunta que importa: quanto esse dinheiro futuro compraria hoje, no supermercado de agora.',
    ],
  },
  {
    question: 'A taxa anual é dividida por 12 para chegar à taxa mensal?',
    answer: [
      'Não, e a diferença é maior do que parece. A calculadora usa a taxa equivalente composta: i_mensal = (1 + i_anual)^(1/12) − 1, ou seja, a taxa mensal que capitalizada por 12 meses reproduz exatamente a taxa anual informada.',
      'Dividir por 12 superestima o resultado. 12% ao ano dividido por 12 dá 1% ao mês, que capitalizado por um ano vira 12,68% — quase 0,7 ponto de juros que não existem, repetido em cada ano da simulação.',
    ],
  },
  {
    question: 'Como o Imposto de Renda entra na conta?',
    answer: [
      'Pela tabela regressiva da renda fixa (Lei 11.033/2004), e aporte por aporte: cada depósito é tributado pelo tempo que ele mesmo ficou aplicado, e não pelo prazo total da simulação. As alíquotas vão de 22,5% até 180 dias a 15% acima de 720 dias.',
      'Em prazos longos a alíquota efetiva fica pouco acima de 15%, porque só os aportes mais recentes pagam mais. Há uma opção para marcar o investimento como isento, que serve para LCI, LCA, CRI, CRA e poupança.',
    ],
  },
  {
    question: 'O que é a "renda sustentável" e por que ela é menor que o rendimento?',
    answer: [
      'É quanto dá para sacar por mês sem que o patrimônio perca poder de compra. Do rendimento mensal sai o Imposto de Renda e sai também a parte que precisa ser reinvestida só para repor a inflação. O que sobra é a renda sustentável.',
      'Sacar o rendimento líquido inteiro mantém o saldo nominal parado, mas esse saldo compra menos a cada ano. Se o rendimento líquido não supera a inflação, a renda sustentável é zero: qualquer saque encolhe o patrimônio real.',
    ],
  },
  {
    question: 'Reajustar o aporte todo ano muda muito o resultado?',
    answer: [
      'Muda, e é o ajuste mais barato da simulação. Manter o mesmo aporte por 20 ou 30 anos parece disciplina, mas na prática é uma redução silenciosa: com a inflação, aportar R$ 1.000 daqui a 15 anos exige bem menos esforço do que aportar R$ 1.000 hoje.',
      'A calculadora reajusta o aporte a cada 12 meses pelo percentual que você definir. O bloco de conceitos logo abaixo da tabela mostra, no seu próprio cenário, quanto o patrimônio final cresce por causa desse reajuste.',
    ],
  },
  {
    question: 'De onde vêm as taxas de SELIC, CDI, IPCA e poupança?',
    answer: [
      'Do Sistema Gerenciador de Séries Temporais do Banco Central: SELIC meta (série 432), CDI anualizado (4389), IPCA acumulado em 12 meses (13522), poupança (195) e dólar PTAX de venda (1). O IBOVESPA vem da B3. As cotações ficam guardadas no seu navegador por até uma hora, para não repetir a mesma consulta a cada página aberta.',
      'Nenhum número fica fixo no código. Quando uma fonte está fora do ar, o valor aparece marcado como referência, com a data a que se refere, em vez de passar por atual.',
    ],
  },
  {
    question: 'O que esta calculadora não considera?',
    answer: [
      'Ela mantém juros e inflação constantes durante todo o período, coisa que nenhum investimento real faz. Também ficam de fora os custos: taxa de administração e de custódia, come-cotas semestral de fundos e IOF em resgates com menos de 30 dias.',
      'Regras próprias de renda variável, como IR sobre venda de ações e ganho de capital em fundos imobiliários, também não entram. O atalho do Tesouro Selic usa a SELIC meta como aproximação e não desconta a taxa de custódia.',
      'É uma ferramenta educativa, para comparar cenários. Não é recomendação de investimento.',
    ],
  },
];
