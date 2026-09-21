import React from 'react';
import { FinancingSummary, RealEstateParams } from '../../../types';
import { formatBRL } from '../../../shared/lib/format';
import { Clock, TrendingDown, Landmark, CheckCircle2, AlertTriangle } from 'lucide-react';

interface RealEstateSummaryCardsProps {
  summary: FinancingSummary;
  params: RealEstateParams;
}

export const RealEstateSummaryCards: React.FC<RealEstateSummaryCardsProps> = ({ summary, params }) => {
  const isSaving = summary.monthsSaved > 0 || summary.interestSaved > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Financiado */}
      <div className="bg-surface border border-line rounded-2xl p-5 relative overflow-hidden group">
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Landmark className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-semibold text-slate-300">Valor Financiado</h3>
        </div>
        <div className="relative z-10">
          <span className="text-2xl font-bold text-white tracking-tight">
            {formatBRL(summary.totalFinanced)}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 relative z-10">
          Imóvel: {formatBRL(params.propertyValue)} | Entrada: {formatBRL(params.downPayment)}
        </div>
      </div>

      {/* Custo Efetivo Total (O que saiu do bolso) */}
      <div className="bg-surface border border-line rounded-2xl p-5 relative overflow-hidden group">
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <TrendingDown className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-semibold text-slate-300">Custo Total Desembolsado</h3>
        </div>
        <div className="relative z-10">
          <span className="text-2xl font-bold text-rose-400 tracking-tight">
            {formatBRL(summary.totalPaidOut)}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 relative z-10">
          Você pagará quase {((summary.totalPaidOut / (summary.totalFinanced || 1)) * 100).toFixed(0)}% do valor pego emprestado.
        </div>
      </div>

      {/* Parcelas (Primeira e Última) */}
      <div className="bg-surface border border-line rounded-2xl p-5 relative overflow-hidden group">
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-semibold text-slate-300">Valor das Parcelas (S/ Seguros)</h3>
        </div>
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <div className="text-[10px] text-slate-400 mb-0.5">Primeira:</div>
            <span className="text-lg font-bold text-white tracking-tight">
              {formatBRL(summary.firstInstallment)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 mb-0.5">Última:</div>
            <span className="text-lg font-bold text-sky-400 tracking-tight">
              {formatBRL(summary.lastInstallment)}
            </span>
          </div>
        </div>
      </div>

      {/* Economia de Juros e Tempo (Amortização Extra) */}
      <div className={`rounded-2xl p-5 relative overflow-hidden group border transition-all ${
        isSaving ? 'bg-gradient-to-br from-emerald-900/40 to-surface border-emerald-500/30' : 'bg-surface border-line'
      }`}>
        <div className="flex items-center gap-2 mb-3 relative z-10">
          {isSaving ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-slate-500" />
          )}
          <h3 className="text-xs font-semibold text-slate-300">Economia c/ Amortização Extra</h3>
        </div>
        <div className="relative z-10">
          {isSaving ? (
            <>
              <span className="text-2xl font-bold text-emerald-400 tracking-tight flex items-center gap-1.5">
                -{formatBRL(summary.interestSaved)}
              </span>
              <div className="mt-1 text-[11px] font-medium text-emerald-400/80">
                Você reduziu a dívida em {Math.floor(summary.monthsSaved / 12)} anos e {summary.monthsSaved % 12} meses!
              </div>
            </>
          ) : (
            <>
              <span className="text-lg font-medium text-slate-500 tracking-tight">
                Nenhuma amortização
              </span>
              <div className="mt-1 text-[10px] text-slate-500">
                Adicione um valor mensal extra no painel abaixo para ver a mágica acontecer.
              </div>
            </>
          )}
        </div>
        {isSaving && (
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl z-0 group-hover:bg-emerald-500/20 transition-all" />
        )}
      </div>

    </div>
  );
};
