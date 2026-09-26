import React from 'react';
import { ChevronDown } from 'lucide-react';
import { EXAMPLE } from '../example';

const Block: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2.5">
    <h3 className="text-sm font-bold text-white">{title}</h3>
    {children}
  </div>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">{children}</p>
);

/**
 * Texto educativo da página, recolhido atrás de um "Leia mais".
 *
 * Em `<details>` nativo, como o FAQ: o conteúdo fechado continua no HTML
 * pré-renderizado, então buscadores e assistentes de IA leem tudo sem executar
 * JavaScript, e o visitante não recebe uma parede de texto no meio da ferramenta.
 */
export const LearnMore: React.FC = () => (
  <section aria-labelledby="entenda-title" className="mt-12 pt-8 border-t border-line-soft">
    <div className="mb-4 max-w-2xl">
      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Entenda a conta</div>
      <h2 id="entenda-title" className="text-xl font-extrabold text-white">
        Independência financeira: quanto é preciso e quando você chega lá
      </h2>
      <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed mt-2">
        Independência financeira é o ponto em que o seu patrimônio paga o seu custo de vida sem depender de salário.
        A calculadora acima encontra esse ponto a partir da renda que você quer ter, do que já investiu, de quanto
        consegue aportar e da rentabilidade e inflação esperadas.
      </p>
    </div>

    <details className="group max-w-2xl">
      <summary className="tap-target inline-flex items-center gap-1.5 cursor-pointer list-none text-xs font-semibold text-indigo-400 hover:text-indigo-300 [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">Leia mais</span>
        <span className="hidden group-open:inline">Mostrar menos</span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
      </summary>

      <div className="mt-5 space-y-7">
        <Block title="Como a calculadora faz a conta">
          <P>
            Primeiro ela converte a rentabilidade para a taxa real, a que sobra acima da inflação, pela relação de
            Fisher: (1 + rentabilidade) ÷ (1 + inflação) − 1. Com {EXAMPLE.annualReturn} de rentabilidade e{' '}
            {EXAMPLE.inflation} de inflação, a taxa real é de {EXAMPLE.realRate} ao ano, e não a diferença simples
            entre as duas. Depois transforma a taxa anual em mensal pela equivalência composta, nunca dividindo por 12.
          </P>
          <P>
            Com a taxa real mensal, o patrimônio necessário é a renda desejada dividida por essa taxa. A partir daí a
            simulação avança mês a mês: o saldo rende, recebe o aporte e, no primeiro mês em que alcança o patrimônio
            necessário, a meta é atingida.
          </P>
        </Block>

        <Block title="Por que a inflação muda tudo">
          <P>
            No cenário padrão, com renda de {EXAMPLE.goal}, aporte de {EXAMPLE.contribution} e sem patrimônio inicial,
            ignorar a inflação daria um patrimônio necessário de {EXAMPLE.targetNoInflation} e um prazo de{' '}
            {EXAMPLE.durationNoInflation}. Com {EXAMPLE.inflation} de inflação ao ano, o patrimônio necessário em
            valores de hoje sobe para {EXAMPLE.target} e o prazo vai para {EXAMPLE.duration}.
          </P>
          <P>
            A diferença não é pessimismo. No dia em que a meta chegar, manter o padrão de {EXAMPLE.goal} de hoje vai
            exigir {EXAMPLE.goalNominal} por mês. Uma calculadora que ignora isso entrega uma renda que compra bem
            menos do que você planejou.
          </P>
        </Block>

        <Block title="Viver só do rendimento ou usar a regra dos 4%?">
          <P>
            Esta calculadora usa a renda perpétua: o patrimônio paga a sua renda e ainda repõe a inflação, então nunca
            diminui em poder de compra. É o critério mais seguro para quem quer deixar o patrimônio intacto.
          </P>
          <P>
            O movimento FIRE popularizou a regra dos 4%: acumular 25 vezes o gasto anual ({EXAMPLE.targetFourPercent}{' '}
            para {EXAMPLE.goal} por mês) e sacar 4% no primeiro ano, reajustando pela inflação. Ela vem de estudos
            com o mercado americano, aceita consumir parte do principal em cerca de 30 anos e não depende da
            rentabilidade que você informa. Os dois números servem de referência; nenhum é garantia.
          </P>
        </Block>

        <Block title="Como usar a calculadora">
          <P>
            Informe a renda mensal que você quer ter, em valores de hoje, quanto já tem investido e quanto consegue
            aportar por mês. Ajuste a rentabilidade esperada da carteira e a inflação. A referência de CDI e IPCA
            logo abaixo do campo ajuda a calibrar: uma rentabilidade muito acima do CDI por décadas pede uma carteira
            com mais risco.
          </P>
          <P>
            Depois brinque com os cenários. A faixa de sensibilidade mostra quanto o prazo muda com um ponto de
            rentabilidade a mais ou a menos, e o alternador de valores mostra os mesmos números como vão aparecer no
            extrato no futuro.
          </P>
        </Block>

        <Block title="O aporte também precisa acompanhar a inflação">
          <P>
            Manter o mesmo aporte por décadas parece disciplina, mas é uma redução silenciosa do esforço. Por isso a
            opção de reajustar o aporte pela inflação vem marcada. No cenário padrão, com o aporte reajustado, a meta
            leva {EXAMPLE.duration}; com o aporte nominal fixo, leva {EXAMPLE.durationFixedContribution}.
          </P>
        </Block>

        <Block title="Limites da simulação">
          <P>
            A rentabilidade e a inflação são constantes em todo o período, e a simulação não inclui Imposto de Renda,
            taxas nem a volatilidade do mercado. Use o resultado como bússola para comparar cenários e revise o plano
            ao longo dos anos. As simulações são projeções matemáticas e não garantem resultados futuros.
          </P>
        </Block>
      </div>
    </details>
  </section>
);
