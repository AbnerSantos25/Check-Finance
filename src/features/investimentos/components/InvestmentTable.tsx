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
import { CalculationSummary, YearlyResult } from '../../../types';
import { formatBRL, formatPercent } from '../../../shared/lib/format';

interface InvestmentTableProps {
  summary: CalculationSummary;
  years: number;
  taxExempt: boolean;
}

export const InvestmentTable: React.FC<InvestmentTableProps> = ({ summary, years, taxExempt }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'milestones'>('all');
  const [copiedCsv, setCopiedCsv] = useState(false);

  // Filter rows if milestones (every 5 years or last year)
  const displayData = filterMode === 'milestones' && years > 5
    ? summary.yearlyData.filter(d => d.year === 1 || d.year % 5 === 0 || d.year === years)
    : summary.yearlyData;

  // Export to CSV
  const handleExportCsv = () => {
    // Semicolon-separated with decimal comma, as Excel expects in pt-BR.
    const money = (value: number) => value.toFixed(2).replace('.', ',');
    const headers = [
      'Ano',
      'Total Aportado (R$)',
      'Saldo Bruto (R$)',
      'Juros Acumulados Brutos (R$)',
      'Juros no Ano (R$)',
      taxExempt ? 'Saldo Líquido - Isento (R$)' : 'Saldo Líquido de IR - Tabela Regressiva (R$)',
      'Renda Sustentável Mensal Nominal (R$)',
      'Saldo Líquido em Valores de Hoje (R$)'
    ];

    const rows = summary.yearlyData.map(d => [
      d.year,
      money(d.totalDeposited),
      money(d.grossBalance),
      money(d.totalInterestGained),
      money(d.yearlyInterestGained),
      money(d.netBalance),
      money(d.sustainableMonthlyIncome),
      money(d.realNetBalance)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      '﻿' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');

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
      className="rounded-2xl bg-surface border border-line p-5 sm:p-6 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line-soft">
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
            <div className="flex items-center rounded-xl bg-bg-deep p-1 border border-line text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`tap-target px-2.5 py-1 rounded-lg transition-all ${
                  filterMode === 'all'
                    ? 'bg-line-soft text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({years})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('milestones')}
                className={`tap-target px-2.5 py-1 rounded-lg transition-all ${
                  filterMode === 'milestones'
                    ? 'bg-line-soft text-white font-medium'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-line border border-line-strong text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
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
          <thead className="sticky top-0 z-10 bg-bg border-b border-line text-[12px] sm:text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3.5 rounded-tl-lg">Ano</th>
              <th className="py-3 px-3.5">Total Aportado</th>
              <th className="py-3 px-3.5 text-emerald-400">Saldo Bruto</th>
              <th className="py-3 px-3.5">Juros no Ano</th>
              <th className="py-3 px-3.5 text-emerald-400">Juros Acumulados</th>
              <th className="py-3 px-3.5">Líquido de IR</th>
              <th className="py-3 px-3.5 text-teal-300">Renda Sustentável</th>
              <th className="py-3 px-3.5 rounded-tr-lg">Líquido (valores de hoje)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-2">
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
                      <span className="px-1.5 py-0.5 rounded text-[12px] sm:text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans">
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
                  <td className="py-3 px-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20 text-[12px] sm:text-[11px]">
                      +{formatBRL(row.totalInterestGained)}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-300">
                    {formatBRL(row.netBalance)}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-teal-300">
                    {formatBRL(row.sustainableMonthlyIncome)}/mês
                  </td>
                  <td className="py-3 px-3.5 text-slate-400">
                    {formatBRL(row.realNetBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table footer note */}
      <div className="mt-4 pt-3 border-t border-line-soft flex flex-col sm:flex-row items-center justify-between text-[12px] sm:text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>
            {taxExempt
              ? 'Sem IR (aplicação isenta).'
              : `Líquido de IR: tabela regressiva aplicada a cada aporte, como num resgate total no fim do ano (efetivo no período: ${formatPercent(summary.effectiveTaxRate, 1)}).`}{' '}
            Renda sustentável: rendimento mensal após IR e reposição da inflação, em valores nominais de cada ano.
          </span>
        </div>
        <div className="text-slate-400">
          Total de {years} períodos anuais calculados
        </div>
      </div>
    </div>
  );
};
