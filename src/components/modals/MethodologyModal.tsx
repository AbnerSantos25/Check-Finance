import React from 'react';
import { type LucideIcon, BookOpen, Calculator, Sparkles, CheckCircle2, Landmark, Database, AlertTriangle } from 'lucide-react';
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog';
import { BrandMark } from '../ui/BrandMark';
import { REFERENCE_DATE } from '../../lib/economicApi';

interface MethodologyModalProps {
  onClose: () => void;
  taxExempt: boolean;
}

const Formula: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div className={`p-2.5 rounded-lg bg-surface-2 font-mono text-xs ${color}`}>{children}</div>
);

const Lead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-slate-400 text-xs">{children}</p>
);

const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] text-slate-400">{children}</p>
);

const Bullets: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">{children}</ul>
);

const Block: React.FC<{
  icon: LucideIcon;
  accent: string;
  title: string;
  children: React.ReactNode;
}> = ({ icon: Icon, accent, title, children }) => (
  <div className="p-4 rounded-xl bg-bg-deep border border-line space-y-2">
    <div className="flex items-center gap-2 font-bold text-white">
      <Icon className={`w-4 h-4 ${accent}`} />
      {title}
    </div>
    {children}
  </div>
);

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ onClose, taxExempt }) => {
  const incomeTaxDecimal = taxExempt ? '0' : '0,15';

  return (
    <Dialog id="methodology-modal-content" onClose={onClose} className="max-w-2xl">
      <DialogHeader mark={<BrandMark icon={BookOpen} />}>
        <DialogTitle>Metodologia & Fórmulas Financeiras</DialogTitle>
        <DialogDescription>Como cada número do simulador é calculado, e o que ele não considera.</DialogDescription>
      </DialogHeader>

      <div className="space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <Block icon={Calculator} accent="text-emerald-400" title="1. Taxa mensal equivalente">
          <Lead>
            A taxa anual informada é convertida na taxa mensal que, capitalizada por 12 meses, reproduz exatamente a taxa anual:
          </Lead>
          <Formula color="text-emerald-400">i_mensal = (1 + i_anual)^(1/12) − 1</Formula>
          <Note>
            Dividir a taxa anual por 12 superestimaria o resultado: 12% ÷ 12 = 1% ao mês, que capitaliza para 12,68% ao ano.
          </Note>
        </Block>

        <Block icon={Sparkles} accent="text-blue-400" title="2. Aportes e saldo">
          <Lead>
            O aporte inicial é feito no mês zero. Os aportes mensais entram no <strong className="text-slate-300">fim</strong> de cada mês e são reajustados a cada 12 meses:
          </Lead>
          <Formula color="text-blue-400">
            Aporte(ano k) = Aporte_mensal × (1 + reajuste)^(k − 1)
            <br />
            Saldo(mês) = Saldo(mês anterior) × (1 + i_mensal) + Aporte
          </Formula>
        </Block>

        <Block icon={Landmark} accent="text-amber-400" title="3. Imposto de Renda">
          <Lead>
            O saldo bruto é o valor antes do imposto. O saldo líquido desconta o IR como num resgate total. Cada aporte é tributado
            pelo seu próprio prazo, conforme a tabela regressiva da renda fixa (Lei 11.033/2004):
          </Lead>
          <Formula color="text-amber-300">
            IR = Σ ganho_do_aporte × alíquota(dias aplicado)
            <br />
            até 180 dias: 22,5% · até 360: 20% · até 720: 17,5% · acima: 15%
          </Formula>
          <Note>
            {taxExempt
              ? 'Opção selecionada: isento. Nenhum IR é descontado.'
              : 'Opção selecionada: tributado. Em prazos longos, a alíquota efetiva fica pouco acima de 15%, porque só os aportes mais recentes pagam mais.'}{' '}
            Os dias são contados como meses × 30,44.
          </Note>
        </Block>

        <Block icon={CheckCircle2} accent="text-amber-400" title="4. Valores de hoje (inflação)">
          <Lead>
            Valores futuros são trazidos para o poder de compra atual. Cada aporte também é deflacionado pelo mês em que foi feito:
          </Lead>
          <Formula color="text-amber-300">
            Valor_hoje = Valor_futuro / (1 + inflação_anual)^anos
            <br />
            Multiplicador_real = Saldo_líquido_hoje / Aportes_em_valores_de_hoje
          </Formula>
        </Block>

        <Block icon={Calculator} accent="text-teal-400" title="5. Renda sustentável">
          <Lead>
            É quanto se pode sacar por mês sem reduzir o poder de compra do patrimônio: o rendimento após o IR, menos a parte que
            precisa ser reinvestida para repor a inflação. O cálculo parte do saldo líquido, uma premissa conservadora, e usa IR de
            15% sobre o rendimento, porque na fase de renda o capital já está aplicado há mais de 720 dias.
          </Lead>
          <Formula color="text-teal-300">
            Renda = Saldo_líquido × (i_mensal × (1 − {incomeTaxDecimal}) − inflação_mensal)
          </Formula>
          <Note>
            Sacar o rendimento líquido inteiro mantém o saldo nominal, mas a inflação reduz seu poder de compra ano após ano.
            Se o rendimento líquido não supera a inflação, a renda sustentável é zero.
          </Note>
        </Block>

        <Block icon={Database} accent="text-emerald-400" title="6. Fontes dos indicadores">
          <Lead>Séries do Sistema Gerenciador de Séries Temporais (SGS) do Banco Central:</Lead>
          <Bullets>
            <li>SELIC meta: série 432, considerando só a taxa já em vigor</li>
            <li>CDI anualizado: série 4389</li>
            <li>IPCA acumulado em 12 meses: série 13522</li>
            <li>Poupança: série 195, rentabilidade mensal vigente anualizada</li>
            <li>Dólar PTAX de venda: série 1</li>
          </Bullets>
          <Note>
            O IBOVESPA vem da B3, via HG Brasil, consultado pelo nosso servidor a cada 10 minutos. A cotação pode ter atraso em
            relação ao pregão, e o horário exibido é o da consulta. Quando não há cotação disponível, o indicador sai do painel
            em vez de mostrar um valor antigo.
          </Note>
          <Note>
            Quando uma fonte do Banco Central está indisponível, o valor aparece marcado como referência de {REFERENCE_DATE}. O atalho Tesouro Selic
            usa a Selic meta como aproximação e não inclui taxa de custódia.
          </Note>
        </Block>

        <Block icon={AlertTriangle} accent="text-amber-400" title="7. O que o simulador não considera">
          <Bullets>
            <li>Variação das taxas ao longo do tempo: juros e inflação são constantes durante todo o período.</li>
            <li>Custos: taxas de administração e custódia, come-cotas de fundos e IOF em resgates antes de 30 dias.</li>
            <li>Regras próprias de renda variável, como IR sobre vendas de ações e ganho de capital em FIIs.</li>
            <li>Mudanças futuras na legislação tributária.</li>
          </Bullets>
          <Note>Ferramenta educativa. Não constitui recomendação de investimento.</Note>
        </Block>
      </div>

      <DialogFooter>
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-line-soft hover:bg-line-strong text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Fechar
        </button>
      </DialogFooter>
    </Dialog>
  );
};
