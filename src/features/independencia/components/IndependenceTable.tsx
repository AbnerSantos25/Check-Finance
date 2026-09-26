import React, { useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Download, Table as TableIcon } from 'lucide-react';
import type { IndependenceParams, IndependenceResult } from '../../../types';
import { formatBRL } from '../../../shared/lib/format';
import type { ValueBasis } from './IndependenceResult';

interface IndependenceTableProps {
  result: IndependenceResult;
  params: IndependenceParams;
  basis: ValueBasis;
}

/** Linhas visíveis antes do "Ler mais": o primeiro ano completo. */
export const INITIAL_ROWS = 12;

// Ponto e vírgula e vírgula decimal, como o Excel em pt-BR espera.
const csvMoney = (value: number) => value.toFixed(2).replace('.', ',');

export const IndependenceTable: React.FC<IndependenceTableProps> = ({ result, params, basis }) => {
  const [expanded, setExpanded] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // O mês 0 é o ponto de partida do gráfico; a tabela começa no primeiro aporte.
  const rows = result.schedule.slice(1);
  if (rows.length === 0) return null;

  const real = basis === 'real';
  const visible = expanded ? rows : rows.slice(0, INITIAL_ROWS);
  const hidden = rows.length - visible.length;
  const lastMonth = rows[rows.length - 1].month;

  const collapse = () => {
    setExpanded(false);
    // Recolher centenas de linhas deixaria o visitante perdido no meio do FAQ.
    containerRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const exportCsv = () => {
    const headers = [
      'Mês',
      'Idade',
      'Investido do bolso - hoje (R$)',
      'Juros acumulados - hoje (R$)',
      'Patrimônio - hoje (R$)',
      'Renda mensal - hoje (R$)',
      'Investido do bolso - nominal (R$)',
      'Juros acumulados - nominal (R$)',
      'Patrimônio - nominal (R$)',
      'Renda mensal - nominal (R$)',
    ];
    const lines = rows.map((row) =>
      [
        row.month,
        params.currentAge + Math.floor(row.month / 12),
        csvMoney(row.contributedReal),
        csvMoney(row.interestReal),
        csvMoney(row.balanceReal),
        csvMoney(row.incomeReal),
        csvMoney(row.contributedNominal),
        csvMoney(row.interestNominal),
        csvMoney(row.balanceNominal),
        csvMoney(row.incomeNominal),
      ].join(';')
    );

    const blob = new Blob(['﻿' + [headers.join(';'), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'independencia-financeira-mes-a-mes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div
      ref={containerRef}
      id="tabela-mes-a-mes"
      className="scroll-mt-20 rounded-2xl bg-surface border border-line p-5 sm:p-6 shadow-xl mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line-soft">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <TableIcon className="w-5 h-5 text-indigo-400" />
            Projeção mês a mês
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {real ? 'Em valores de hoje' : 'Em valores nominais'}, do primeiro aporte até o mês em que a meta é
            atingida.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="flex items-center gap-1.5 tap-target self-start sm:self-auto px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-line border border-line-strong text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Baixar todos os meses em planilha CSV"
        >
          {downloaded ? (
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

      <div className="mt-4 sm:overflow-x-auto">
        <table role="table" className="table-cards w-full text-left text-xs border-collapse">
          <thead role="rowgroup" className="bg-bg border-b border-line text-[12px] sm:text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            <tr role="row">
              <th role="columnheader" className="py-3 px-3.5 rounded-tl-lg">Mês</th>
              <th role="columnheader" className="py-3 px-3.5 text-right text-blue-400">Investido do bolso</th>
              <th role="columnheader" className="py-3 px-3.5 text-right text-emerald-400">Juros acumulados</th>
              <th role="columnheader" className="py-3 px-3.5 text-right text-white">Patrimônio</th>
              <th role="columnheader" className="py-3 px-3.5 text-right text-indigo-300 rounded-tr-lg">Renda mensal</th>
            </tr>
          </thead>
          <tbody role="rowgroup" className="divide-y divide-surface-2">
            {visible.map((row) => {
              const isGoal = row.month === lastMonth;
              return (
                <tr
                  role="row"
                  key={row.month}
                  className={`font-mono transition-colors ${
                    isGoal ? 'bg-indigo-500/10 font-bold border-t-2 border-b-2 border-indigo-500/30' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <td role="cell" data-label="Mês" className="py-2.5 px-3.5 font-sans whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      Mês {row.month}
                      {isGoal && (
                        <span className="px-1.5 py-0.5 rounded text-[12px] sm:text-[9px] bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                          Meta atingida
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] sm:text-[10px] text-slate-500 font-normal">
                      {params.currentAge + Math.floor(row.month / 12)} anos
                    </div>
                  </td>
                  <td role="cell" data-label="Investido do bolso" className="py-2.5 px-3.5 text-right text-slate-300">
                    {formatBRL(real ? row.contributedReal : row.contributedNominal)}
                  </td>
                  <td role="cell" data-label="Juros acumulados" className="py-2.5 px-3.5 text-right text-emerald-400">
                    {formatBRL(real ? row.interestReal : row.interestNominal)}
                  </td>
                  <td role="cell" data-label="Patrimônio" className="py-2.5 px-3.5 text-right font-semibold text-white">
                    {formatBRL(real ? row.balanceReal : row.balanceNominal)}
                  </td>
                  <td role="cell" data-label="Renda mensal" className="py-2.5 px-3.5 text-right text-indigo-300">
                    {formatBRL(real ? row.incomeReal : row.incomeNominal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-line-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-[12px] sm:text-[11px] text-slate-400">
          Mostrando {visible.length} de {rows.length} {rows.length === 1 ? 'mês' : 'meses'}. Renda mensal: quanto o
          patrimônio daquele mês já paga para sempre, sem perder poder de compra.
        </span>

        {rows.length > INITIAL_ROWS &&
          (expanded ? (
            <button
              type="button"
              onClick={collapse}
              aria-controls="tabela-mes-a-mes"
              aria-expanded="true"
              className="flex items-center gap-1.5 tap-target shrink-0 px-4 py-2 rounded-xl bg-surface-2 hover:bg-line border border-line-strong text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" />
              Mostrar menos
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-controls="tabela-mes-a-mes"
              aria-expanded="false"
              className="flex items-center gap-1.5 tap-target shrink-0 px-4 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-xs font-semibold text-indigo-200 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
              Ler mais ({hidden} {hidden === 1 ? 'mês' : 'meses'})
            </button>
          ))}
      </div>
    </div>
  );
};
