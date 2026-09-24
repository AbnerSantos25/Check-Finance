import React from 'react';
import { FinancingSummary } from '../../../types';
import { formatBRL } from '../../../shared/lib/format';
import { Table, Download } from 'lucide-react';

interface RealEstateTableProps {
  summary: FinancingSummary;
}

export const RealEstateTable: React.FC<RealEstateTableProps> = ({ summary }) => {
  if (summary.schedule.length === 0) return null;

  // We only show yearly milestones (month 12, 24, 36...) to avoid a giant table of 360 lines
  // But we always show Month 1 and the very last month
  const tableData = summary.schedule.filter((item, index, arr) => {
    return item.month === 1 || item.month % 12 === 0 || index === arr.length - 1;
  });

  const exportCSV = () => {
    const headers = ['Mes', 'Ano', 'Parcela (Amortizacao + Juros)', 'Amortizacao Base', 'Amortizacao Extra', 'Juros Pagos', 'Saldo Devedor'];
    const rows = summary.schedule.map(row => [
      row.month,
      Math.ceil(row.month / 12),
      row.payment.toFixed(2),
      row.amortization.toFixed(2),
      row.extraAmortization.toFixed(2),
      row.interest.toFixed(2),
      row.outstandingBalance.toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'cronograma_financiamento.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl bg-surface border border-line shadow-xl overflow-hidden mb-8">
      <div className="p-5 sm:p-6 border-b border-line-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-sky-400" />
            Cronograma Resumido (Anual)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evolução do saldo devedor e parcelas ao final de cada ano de contrato.
          </p>
        </div>
        
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 tap-target px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-xs font-medium text-sky-400 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Baixar Cronograma Completo (CSV)
        </button>
      </div>

      <div className="sm:overflow-x-auto">
        <table role="table" className="table-cards w-full text-left border-collapse">
          <thead role="rowgroup">
            <tr className="bg-bg/50">
              <th role="columnheader" className="px-4 py-3 text-[12px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-line">Período</th>
              <th role="columnheader" className="px-4 py-3 text-[12px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-line text-right">Parcela Base</th>
              <th role="columnheader" className="px-4 py-3 text-[12px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider border-b border-line text-right">Abatimento Extra</th>
              <th role="columnheader" className="px-4 py-3 text-[12px] sm:text-[10px] font-bold text-rose-400 uppercase tracking-wider border-b border-line text-right">Juros (Custo)</th>
              <th role="columnheader" className="px-4 py-3 text-[12px] sm:text-[10px] font-bold text-sky-400 uppercase tracking-wider border-b border-line text-right">Saldo Devedor</th>
            </tr>
          </thead>
          <tbody role="rowgroup" className="divide-y divide-line/50">
            {tableData.map((row, idx) => {
              const isLast = idx === tableData.length - 1;
              return (
                <tr 
                  role="row"
                  key={row.month}
                  className={`hover:bg-white/[0.02] transition-colors ${
                    isLast ? 'bg-sky-900/10' : ''
                  }`}
                >
                  <td role="cell" data-label="Período" className="px-4 py-3 whitespace-nowrap">
                    <div className="text-xs font-medium text-slate-300">
                      Mês {row.month}
                    </div>
                    <div className="text-[12px] sm:text-[10px] text-slate-500">
                      Ano {Math.ceil(row.month / 12)}
                    </div>
                  </td>
                  <td role="cell" data-label="Parcela base" className="px-4 py-3 whitespace-nowrap text-right">
                    <span className="text-xs font-mono text-slate-300">
                      {formatBRL(row.payment - row.extraAmortization)}
                    </span>
                  </td>
                  <td role="cell" data-label="Abatimento extra" className="px-4 py-3 whitespace-nowrap text-right">
                    <span className="text-xs font-mono text-emerald-400">
                      {row.extraAmortization > 0 ? `+${formatBRL(row.extraAmortization)}` : '-'}
                    </span>
                  </td>
                  <td role="cell" data-label="Juros (custo)" className="px-4 py-3 whitespace-nowrap text-right">
                    <span className="text-xs font-mono text-rose-400/80">
                      {formatBRL(row.interest)}
                    </span>
                  </td>
                  <td role="cell" data-label="Saldo devedor" className="px-4 py-3 whitespace-nowrap text-right">
                    <span className={`text-xs font-mono font-bold ${isLast ? 'text-sky-400' : 'text-slate-200'}`}>
                      {formatBRL(row.outstandingBalance)}
                    </span>
                    {isLast && (
                      <div className="text-[12px] sm:text-[10px] text-sky-400/70 mt-0.5">Quitação</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
