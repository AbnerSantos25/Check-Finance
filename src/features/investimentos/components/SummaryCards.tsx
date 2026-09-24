import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { CalculationSummary } from '../../../types';
import { formatBRL, formatNumber, formatPercent } from '../../../shared/lib/format';

interface SummaryCardsProps {
  summary: CalculationSummary;
  years: number;
  taxExempt: boolean;
}

const Row: React.FC<{ label: string; value: string; valueClass?: string; title?: string }> = ({
  label,
  value,
  valueClass = 'text-slate-300',
  title,
}) => (
  <div className="flex items-center justify-between gap-3 text-[12px] sm:text-[11px]">
    <span className="text-slate-400">{label}</span>
    <span className={`font-semibold font-mono text-right ${valueClass}`} title={title}>
      {value}
    </span>
  </div>
);

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, years, taxExempt }) => {
  const interestShare = summary.finalGrossBalance > 0
    ? (summary.totalInterestGained / summary.finalGrossBalance) * 100
    : 0;
  const investedShare = summary.finalGrossBalance > 0
    ? (summary.totalInvested / summary.finalGrossBalance) * 100
    : 0;
  const taxLabel = taxExempt ? 'isento de IR' : 'IR regressivo';
  const yearsLabel = `${years} ${years === 1 ? 'ano' : 'anos'}`;
  const incomeCoversInflation = summary.sustainableMonthlyIncome > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Patrimônio Final */}
      <div
        id="card-patrimonio-final"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-surface-2 to-bg border border-emerald-500/30 p-5 shadow-xl hover:border-emerald-500/50 transition-all group"
      >
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Patrimônio Final
              </div>
              <div className="text-[12px] sm:text-[11px] text-slate-300">
                Após {yearsLabel} · bruto
              </div>
            </div>
          </div>
          <span
            className="text-[12px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-mono"
            title="Patrimônio líquido em valores de hoje dividido pelos aportes em valores de hoje"
          >
            {formatNumber(summary.realMultiplier, 1)}x real
          </span>
        </div>

        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {formatBRL(summary.finalGrossBalance)}
          </div>
          <div className="mt-1.5 space-y-1">
            <Row
              label={`Líquido (${taxLabel}):`}
              value={formatBRL(summary.finalNetBalance)}
              title="Descontado o IR sobre os ganhos no resgate"
            />
            <Row
              label="Líquido em valores de hoje:"
              value={formatBRL(summary.finalRealNetBalance)}
              title="Descontados o IR e a inflação acumulada"
            />
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[12px] sm:text-[11px] text-slate-400">
          <span>Multiplicador real:</span>
          <span className="text-emerald-400 font-semibold font-mono">
            {formatNumber(summary.realMultiplier, 2)}x seu esforço
          </span>
        </div>
      </div>

      {/* Card 2: Total Aportado */}
      <div
        id="card-total-aportado"
        className="relative overflow-hidden rounded-2xl bg-surface border border-line p-5 shadow-lg hover:border-line-strong transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Aportado
              </div>
              <div className="text-[12px] sm:text-[11px] text-slate-300">
                Saído do seu bolso
              </div>
            </div>
          </div>
          <span className="text-[12px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
            {formatPercent(investedShare, 1)} do total
          </span>
        </div>

        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-mono">
            {formatBRL(summary.totalInvested)}
          </div>
          <div className="mt-1.5 space-y-1">
            <Row
              label="Em valores de hoje:"
              value={formatBRL(summary.totalInvestedReal)}
              title="Cada aporte descontado pela inflação até hoje"
            />
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-white/5">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, investedShare))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 3: Ganhos em Juros */}
      <div
        id="card-juros-compostos"
        className="relative overflow-hidden rounded-2xl bg-surface border border-line p-5 shadow-lg hover:border-line-strong transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ganhos em Juros
              </div>
              <div className="text-[12px] sm:text-[11px] text-slate-300">
                Bruto, antes do IR
              </div>
            </div>
          </div>
          <span className="text-[12px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
            {formatPercent(interestShare, 1)} do total
          </span>
        </div>

        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight font-mono">
            {formatBRL(summary.totalInterestGained)}
          </div>
          <div className="mt-1.5 space-y-1">
            <Row
              label={taxExempt ? 'IR (aplicação isenta):' : `IR no resgate (${formatPercent(summary.effectiveTaxRate, 1)}):`}
              value={`− ${formatBRL(summary.incomeTax)}`}
              title={taxExempt ? undefined : 'Tabela regressiva aplicada a cada aporte conforme o tempo investido'}
            />
            <Row label="Ganho líquido:" value={formatBRL(summary.totalInterestNet)} valueClass="text-emerald-400" />
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-white/5">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, interestShare))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 4: Renda Sustentável */}
      <div
        id="card-renda-passiva"
        className="relative overflow-hidden rounded-2xl bg-surface border border-line p-5 shadow-lg hover:border-emerald-500/40 transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Renda Sustentável
              </div>
              <div className="text-[12px] sm:text-[11px] text-slate-300">
                Em valores de hoje
              </div>
            </div>
          </div>
          <span className="text-[12px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
            Viver de Renda
          </span>
        </div>

        <div className="mt-2">
          <div
            className="text-2xl sm:text-3xl font-extrabold text-teal-300 tracking-tight font-mono"
            title="Rendimento mensal após IR e após repor a inflação, preservando o poder de compra do patrimônio"
          >
            {formatBRL(summary.sustainableMonthlyIncomeReal)}
            <span className="text-xs text-slate-400 font-normal ml-1">/mês</span>
          </div>
          <div className="mt-1.5 space-y-1">
            {incomeCoversInflation ? (
              <Row label={`No ano ${years} (nominal):`} value={`${formatBRL(summary.sustainableMonthlyIncome)}/mês`} />
            ) : (
              <div className="flex items-center gap-1.5 text-[12px] sm:text-[11px] text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>O rendimento líquido não cobre a inflação</span>
              </div>
            )}
            <Row label="Considera:" value={`${taxExempt ? 'isento' : 'IR 15%'} + inflação`} />
          </div>
        </div>

        <div
          className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between gap-3 text-[12px] sm:text-[11px] text-slate-400"
          title="Sacar todo o rendimento líquido todo mês faz o patrimônio perder poder de compra"
        >
          <span>Sacando todo o rendimento:</span>
          <span className="text-slate-300 font-semibold font-mono text-right">
            {formatBRL(summary.fullYieldMonthlyNetIncome)}/mês*
          </span>
        </div>
        <div className="text-[12px] sm:text-[10px] text-slate-400 mt-1 text-right">
          *nominal; consome o poder de compra
        </div>
      </div>
    </div>
  );
};
