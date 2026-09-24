import type { FaqItem } from '../../shared/seo/jsonLd';

/**
 * Perguntas do simulador de financiamento.
 *
 * As respostas descrevem o comportamento real de `lib/calculateFinancing.ts` —
 * inclusive o que ele não faz. A parcela calculada é juros mais amortização, sem
 * seguros nem tarifas, e a amortização extra reduz prazo, não parcela. Ao mudar
 * o cálculo, mude o texto junto: ele também vai para o JSON-LD.
 */
export const FINANCING_FAQ: FaqItem[] = [
  {
    question: 'Qual a diferença entre SAC e PRICE?',
    answer: [
      'No SAC a amortização é fixa: todo mês você abate a mesma fatia da dívida. Como os juros incidem sobre um saldo que só diminui, a parcela cai mês a mês — a primeira é a mais cara de todo o contrato.',
      'Na PRICE a parcela é constante do começo ao fim. No início quase tudo dentro dela é juros e quase nada abate a dívida; a amortização só ganha peso na segunda metade do contrato.',
      'Nas mesmas condições, a PRICE custa mais juros no total, porque o saldo devedor cai mais devagar. Em troca começa mais barata, o que às vezes é justamente o que faz a renda exigida caber na aprovação do crédito.',
    ],
  },
  {
    question: 'A amortização extra reduz o prazo ou a parcela?',
    answer: [
      'Este simulador modela a redução de prazo, que é a opção que economiza mais juros: a parcela segue igual e o contrato simplesmente termina antes.',
      'Reduzir a parcela alivia o orçamento no mês, mas mantém a dívida viva pelo prazo inteiro, rendendo juros até o fim. Os dois caminhos existem no banco e a escolha é sua na hora de amortizar. Se você pretende reduzir a parcela, a economia mostrada aqui será maior que a que você vai obter.',
    ],
  },
  {
    question: 'Por que um valor extra pequeno corta tantos anos do financiamento?',
    answer: [
      'Porque a amortização extra não paga juros: ela vai inteira contra o saldo devedor. E é sobre esse saldo que todos os juros dos anos seguintes serão calculados.',
      'Cada real abatido hoje elimina, junto, todos os juros que ele geraria até o fim do contrato. Por isso o efeito é desproporcional no começo do financiamento e vai perdendo força conforme a quitação se aproxima.',
    ],
  },
  {
    question: 'A parcela do simulador é a que o banco vai cobrar?',
    answer: [
      'Não. Aqui aparece a parcela de juros mais amortização, que é o núcleo do financiamento. A cobrança real ainda soma os seguros obrigatórios MIP (morte e invalidez permanente) e DFI (danos físicos ao imóvel), além da taxa de administração mensal do contrato.',
      'Esses acréscimos variam conforme o banco, a idade do comprador e o valor do imóvel, e costumam pesar alguns pontos percentuais sobre a parcela. Use o resultado daqui para comparar cenários, prazos e sistemas de amortização; use a proposta do banco para o valor exato que vai sair da conta.',
    ],
  },
  {
    question: 'O que é o CET e por que ele é maior que a taxa anunciada?',
    answer: [
      'O Custo Efetivo Total reúne numa única taxa anual tudo o que você paga além do dinheiro emprestado: juros, seguros, tarifa de avaliação do imóvel e taxa de administração. É o número que permite comparar propostas de bancos diferentes em pé de igualdade.',
      'A taxa de juros da propaganda é sempre menor que o CET, porque deixa esses custos de fora. No campo de taxa deste simulador vale informar o CET da proposta, e não a taxa anunciada: o resultado fica bem mais perto do custo real.',
    ],
  },
  {
    question: 'Vale a pena alongar o financiamento para 35 anos?',
    answer: [
      'O prazo longo resolve um problema imediato — a parcela cabe no orçamento e na renda exigida pelo banco — e cria outro: o saldo devedor cai devagar e os juros se acumulam por muito mais tempo.',
      'Simule os dois prazos aqui e compare o total de juros pagos. Uma saída comum é contratar o prazo longo pela segurança da parcela menor e amortizar por fora sempre que sobrar dinheiro: você fica com a folga do prazo longo e um custo mais próximo do prazo curto.',
    ],
  },
  {
    question: 'O simulador considera a entrada, o ITBI e o cartório?',
    answer: [
      'O valor financiado é o preço do imóvel menos a entrada, e é sobre ele que os juros correm. Os custos de aquisição não entram na conta: ITBI, escritura e registro são pagos à vista, fora do financiamento, e somam em torno de 4% a 5% do valor do imóvel na maioria dos municípios.',
      'Na prática, quem tem exatamente a entrada informada aqui ainda precisa de uma reserva adicional para conseguir fechar o negócio.',
    ],
  },
];
