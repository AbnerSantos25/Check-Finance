import React, { useState } from 'react';
import { 
  Table as TableIcon, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Filter,
  Check
} from 'lucide-react';
import { CalculationSummary, YearlyResult } from '../../types';
import { formatBRL, formatCompactBRL } from '../../lib/calculations';

interface InvestmentTableProps {
  summary: CalculationSummary;
  years: number;
}

export const InvestmentTable: React.FC<InvestmentTableProps> = ({ summary, years }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'milestones'>('all');
  const [copiedCsv, setCopiedCsv] = useState(false);

  // Filter rows if milestones (every 5 years or last year)
  const displayData = filterMode === 'milestones' && years > 5
    ? summary.yearlyData.filter(d => d.year === 1 || d.year % 5 === 0 || d.year === years)
    : summary.yearlyData;

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Ano',
      'Total Aportado (R$)',
      'Valor Total com Juros (R$)',
      'Juros Acumulados (R$)',
      'Rendimento no Ano (R$)',
      'Apenas Guardado no Cofre (R$)',
      'Diferença a Mais com Juros (R$)',
      'Renda Mensal Líquida (R$)',
      'Poder de Compra Real (R$)'
    ];

    const rows = summary.yearlyData.map(d => [
      d.year,
      d.totalDeposited.toFixed(2),
      d.grossBalance.toFixed(2),
      d.totalInterestGained.toFixed(2),
      d.yearlyInterestGained.toFixed(2),
      d.savingsOnlyBalance.toFixed(2),
      d.differenceWithSavings.toFixed(2),
      d.monthlyNetIncome.toFixed(2),
      d.realBalance.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `simulacao-investimento-${years}-anos.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  return (
    <div 
      id="investment-table-container"
      className="rounded-2xl bg-[#12151e] border border-[#1f2636] p-5 sm:p-6 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1c2230]">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <TableIcon className="w-5 h-5 text-emerald-400" />
            Tabela Detalhada Ano a Ano
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe o crescimento gradual e a aceleração dos juros compostos com o tempo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Milestones toggle */}
          {years > 7 && (
            <div className="flex items-center rounded-xl bg-[#0d1017] p-1 border border-[#212738] text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterMode === 'all'
                    ? 'bg-[#1c2333] text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({years})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('milestones')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterMode === 'milestones'
                    ? 'bg-[#1c2333] text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Marcos (5 em 5)
              </button>
            </div>
          )}

          {/* Export CSV button */}
          <button
            id="export-csv-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171c28] hover:bg-[#202738] border border-[#263044] text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Baixar planilha CSV"
          >
            {copiedCsv ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Baixado!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Exportar CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table responsive container */}
      <div className="overflow-x-auto mt-4 max-h-[500px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-[#0e111a] border-b border-[#21283a] text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3.5 rounded-tl-lg">Ano</th>
              <th className="py-3 px-3.5">Total Aportado</th>
              <th className="py-3 px-3.5 text-emerald-400">Valor Total com Juros</th>
              <th className="py-3 px-3.5">Juros no Ano</th>
              <th className="py-3 px-3.5">Apenas Guardado</th>
              <th className="py-3 px-3.5 text-emerald-400">Ganho Adicional</th>
              <th className="py-3 px-3.5 text-teal-300">Renda Mensal Líq.</th>
              <th className="py-3 px-3.5 rounded-tr-lg">Poder de Compra Real</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#191f2e]">
            {displayData.map((row) => {
              const isLastYear = row.year === years;
              return (
                <tr
                  key={row.year}
                  className={`transition-colors font-mono ${
                    isLastYear
                      ? 'bg-emerald-500/10 font-bold border-t-2 border-b-2 border-emerald-500/30'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <td className="py-3 px-3.5 font-sans font-semibold text-white flex items-center gap-1.5">
                    Ano {row.year}
                    {isLastYear && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans">
                        Final
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-slate-300">
                    {formatBRL(row.totalDeposited)}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-emerald-400">
                    {formatBRL(row.grossBalance)}
                  </td>
                  <td className="py-3 px-3.5 text-amber-300/90">
                    +{formatBRL(row.yearlyInterestGained)}
                  </td>
                  <td className="py-3 px-3.5 text-slate-400">
                    {formatBRL(row.savingsOnlyBalance)}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20 text-[11px]">
                      +{formatBRL(row.differenceWithSavings)}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-teal-300">
                    {formatBRL(row.monthlyNetIncome)}/mês
                  </td>
                  <td className="py-3 px-3.5 text-slate-400">
                    {formatBRL(row.realBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table footer note */}
      <div className="mt-4 pt-3 border-t border-[#1c2230] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>Renda líquida estimada considerando alíquota de 15% de imposto sobre os rendimentos futuros.</span>
        </div>
        <div className="text-slate-400">
          Total de {years} períodos anuais calculados
        </div>
      </div>
    </div>
  );
};
