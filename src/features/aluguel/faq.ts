import type { FaqItem } from '../../shared/seo/jsonLd';
import { EXAMPLE } from './example';

const WINNER_TEXT = {
  rent: 'quem aluga e investe a diferença termina à frente',
  buy: 'quem compra termina à frente',
  tie: 'os dois caminhos praticamente empatam',
} as const;

/**
 * Perguntas da calculadora alugar ou comprar.
 *
 * As respostas descrevem o que `lib/calculateRentVsBuy.ts` realmente faz, inclusive
 * o que ele deixa de fora, e os números vêm de `example.ts`. O texto também vai
 * para o JSON-LD como resposta oficial da página: ao mudar o cálculo, revise.
 */
export const RENT_VS_BUY_FAQ: FaqItem[] = [
  {
    question: 'Vale mais a pena alugar ou comprar um imóvel?',
    answer: [
      'Depende de três relações: quanto o aluguel custa em proporção ao preço do imóvel, quanto o dinheiro rende investido comparado aos juros do financiamento e quanto o imóvel valoriza. Não existe resposta que sirva para todo mundo, por isso a calculadora faz a conta com os seus números.',
      `No cenário padrão (imóvel de ${EXAMPLE.property}, entrada de ${EXAMPLE.down}, aluguel de ${EXAMPLE.rent}, financiamento a ${EXAMPLE.financingRate} e investimento a ${EXAMPLE.investmentReturn} ao ano), ${WINNER_TEXT[EXAMPLE.winner]} depois de ${EXAMPLE.years} anos: ${EXAMPLE.finalBuy} comprando contra ${EXAMPLE.finalRent} alugando, em valores de hoje.`,
    ],
  },
  {
    question: 'Como a calculadora compara os dois caminhos?',
    answer: [
      `Os dois partem do mesmo dinheiro e gastam o mesmo por mês. Quem compra paga a entrada e os custos de aquisição; quem aluga investe esse mesmo valor no primeiro dia. No cenário padrão, são ${EXAMPLE.down} de entrada mais ${EXAMPLE.acquisition} de ITBI e escritura.`,
      'Todo mês, o orçamento de cada um é o maior entre o custo de comprar (parcela mais manutenção) e o aluguel. Quem gastou menos investe a diferença. Depois de quitado o imóvel, quem comprou passa a investir o equivalente ao aluguel que não paga.',
      'No fim de cada ano, o patrimônio de quem compra é o imóvel valorizado, menos o saldo devedor, mais o que investiu. O de quem aluga é a carteira de investimentos.',
    ],
  },
  {
    question: 'E se eu não investir a diferença?',
    answer: [
      'Aí a comparação muda de lado. Alugar só compete com comprar se a diferença entre a parcela e o aluguel for investida todo mês, com disciplina, por décadas. Se ela for gasta, quem aluga termina sem patrimônio, e o imóvel quitado vence com folga.',
      'A parcela do financiamento funciona como uma poupança forçada. Para muita gente, esse é o argumento mais forte a favor de comprar, e ele não aparece em nenhuma taxa.',
    ],
  },
  {
    question: 'O que é a valorização de equilíbrio?',
    answer: [
      'É a valorização anual do imóvel a partir da qual comprar passa a compensar, mantidas todas as outras premissas. Se você acredita que o imóvel vai valorizar mais do que isso, comprar vence; se menos, alugar e investir vence.',
      `Como referência, o padrão da calculadora é ${EXAMPLE.appreciation} ao ano, perto da inflação. Historicamente, imóveis residenciais no Brasil acompanham a inflação no longo prazo, com ciclos longos acima e abaixo dela.`,
    ],
  },
  {
    question: 'Como o Imposto de Renda entra na conta?',
    answer: [
      'Os investimentos de quem aluga (e o que quem compra investe depois) pagam IR pela tabela regressiva da renda fixa, aporte por aporte: 22,5% até 180 dias, 20% até 360, 17,5% até 720 e 15% depois disso. O valor mostrado é o líquido, como num resgate total naquela data.',
      'Se você investiria em algo isento, como LCI, LCA ou poupança, marque a opção de investimento isento de IR. Do lado do imóvel, a calculadora não cobra IR sobre ganho de capital na venda nem custos de corretagem: o patrimônio é o valor do imóvel, não o que sobraria vendendo.',
    ],
  },
  {
    question: 'O que são os custos de aquisição?',
    answer: [
      `São o ITBI, cobrado pela prefeitura (de 2% a 3% do valor na maioria das capitais), mais escritura e registro em cartório. Somados, costumam ficar entre 3% e 5% do imóvel; o padrão é ${EXAMPLE.acquisitionRate}. É dinheiro que sai no dia da compra e não volta, e quem aluga começa investindo esse valor.`,
    ],
  },
  {
    question: 'O que significa "valores de hoje"?',
    answer: [
      'São os valores descontados da inflação, em poder de compra atual. Daqui a 30 anos, R$ 1 milhão compra muito menos do que hoje; em valores de hoje, a calculadora mostra quanto aquele patrimônio vale em dinheiro de agora. Valores nominais são os que aparecerão de fato no extrato.',
    ],
  },
  {
    question: 'O que a calculadora não considera?',
    answer: [
      'Seguros obrigatórios e taxa de administração do financiamento, uso do FGTS, condomínio e IPTU (que, em geral, os dois lados pagam), custos de mudança e de venda do imóvel. Também não mede o que não tem preço: a segurança de não depender do proprietário, de um lado, e a liberdade de mudar de cidade, do outro.',
      'É uma projeção com taxas constantes. Não é garantia de resultado nem recomendação de investimento.',
    ],
  },
];
