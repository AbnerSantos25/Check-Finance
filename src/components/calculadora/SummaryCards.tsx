import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Sparkles, 
  Coins, 
  ShieldAlert,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { CalculationSummary } from '../../types';
import { formatBRL, formatCompactBRL, formatPercent } from '../../lib/calculations';

interface SummaryCardsProps {
  summary: CalculationSummary;
  years: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, years }) => {
  // Proportions
  const interestShare = summary.finalGrossBalance > 0 
    ? (summary.totalInterestGained / summary.finalGrossBalance) * 100 
    : 0;
  const investedShare = summary.finalGrossBalance > 0 
    ? (summary.totalInvested / summary.finalGrossBalance) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Patrimônio Total Final (Main Hero Card) */}
      <div 
        id="card-patrimonio-final"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#161a26] to-[#10131d] border border-emerald-500/30 p-5 shadow-xl hover:border-emerald-500/50 transition-all group"
      >
        {/* Glow effect backdrop */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Patrimônio Final
              </div>
              <div className="text-[11px] text-slate-300">
                Após {years} anos
              </div>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <ArrowUpRight className="w-3 h-3" />
            +{formatPercent(summary.interestPercentage, 0)}
          </span>
        </div>

        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {formatBRL(summary.finalGrossBalance)}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Poder de compra real:</span>
            <span className="font-semibold text-slate-300 font-mono" title="Descontada a inflação acumulada">
              {formatBRL(summary.finalRealBalance)}
            </span>
          </div>
        </div>

        {/* Mini sparkline visualization at bottom */}
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Multiplicador:</span>
          <span className="text-emerald-400 font-semibold font-mono">
            {summary.profitMultiplier.toFixed(1)}x seu esforço
          </span>
        </div>
      </div>

      {/* Card 2: Total Investido (Aportes) */}
      <div 
        id="card-total-aportado"
        className="relative overflow-hidden rounded-2xl bg-[#131620] border border-[#202738] p-5 shadow-lg hover:border-[#2f384f] transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Aportado
              </div>
              <div className="text-[11px] text-slate-300">
                Saído do seu bolso
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
            {investedShare.toFixed(1)}% do total
          </span>
        </div>

        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-mono">
            {formatBRL(summary.totalInvested)}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Sem investir renderia:</span>
            <span className="font-semibold text-slate-400 font-mono">
              {formatBRL(summary.savingsOnlyTotal)}
            </span>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="mt-3 pt-2 border-t border-white/5">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(5, investedShare))}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Card 3: Ganhos em Juros Compostos */}
      <div 
        id="card-juros-compostos"
        className="relative overflow-hidden rounded-2xl bg-[#131620] border border-[#202738] p-5 shadow-lg hover:border-[#2f384f] transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ganhos em Juros
              </div>
              <div className="text-[11px] text-slate-300">
                Efeito exponencial
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
            {interestShare.toFixed(1)}% do total
          </span>
        </div>

        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight font-mono">
            {formatBRL(summary.totalInterestGained)}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Supera o cofre em:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              +{formatCompactBRL(summary.totalInterestGained)}
            </span>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="mt-3 pt-2 border-t border-white/5">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(5, interestShare))}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Card 4: Renda Passiva Mensal Líquida */}
      <div 
        id="card-renda-passiva"
        className="relative overflow-hidden rounded-2xl bg-[#131620] border border-[#202738] p-5 shadow-lg hover:border-emerald-500/40 transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Renda Mensal Líquida
              </div>
              <div className="text-[11px] text-slate-300">
                Ao término do período
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
            Viver de Renda
          </span>
        </div>

        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 tracking-tight font-mono">
            {formatBRL(summary.finalMonthlyNetIncome)}
            <span className="text-xs text-slate-400 font-normal ml-1">/mês</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Alíquota estimada:</span>
            <span className="font-semibold text-slate-300">
              15% IR longo prazo
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Rendimento anual líq:</span>
          <span className="text-teal-300 font-semibold font-mono">
            ~{formatBRL(summary.finalMonthlyNetIncome * 12)}
          </span>
        </div>
      </div>
    </div>
  );
};
