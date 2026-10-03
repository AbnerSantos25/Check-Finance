import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Table as TableIcon } from 'lucide-react';
import type { RentVsBuyParams, RentVsBuySummary } from '../../../types';
import { formatBRL } from '../../../shared/lib/format';
import type { ValueBasis } from '../../../shared/components/BasisToggle';
import { TableCard } from '../../../shared/components/TableCard';
import { ExportCsvButton } from '../../../shared/components/ExportCsvButton';

interface RentVsBuyTableProps {
  summary: RentVsBuySummary;
  params: RentVsBuyParams;
  basis: ValueBasis;
}

/** Linhas visíveis antes do "Ler mais". */
export const INITIAL_ROWS = 10;

// Ponto e vírgula e vírgula decimal, como o Excel em pt-BR espera.
const csvMoney = (value: number) => value.toFixed(2).replace('.', ',');

export const RentVsBuyTable: React.FC<RentVsBuyTableProps> = ({ summary, params, basis }) => {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const real = basis === 'real';
  const rows = summary.yearly;
  const visible = expanded ? rows : rows.slice(0, INITIAL_ROWS);
  const hidden = rows.length - visible.length;
  // Fator que leva o valor da época para o dinheiro de hoje.
  const toBasis = (value: number, year: number) => (real ? value / Math.pow(1 + params.inflation / 100, year) : value);

  const collapse = () => {
    setExpanded(false);
    containerRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const exportCsv = () => {
    const headers = [
      'Ano',
      'Aluguel mensal (R$)',
      'Parcela no fim do ano (R$)',
      'Saldo devedor (R$)',
      'Valor do imóvel (R$)',
      'Patrimônio comprando - nominal (R$)',
      'Patrimônio alugando - nominal (R$)',
      'Patrimônio comprando - hoje (R$)',
      'Patrimônio alugando - hoje (R$)',
    ];
    const lines = rows.map((y) =>
      [
        y.year,
        csvMoney(y.monthlyRent),
        csvMoney(y.monthlyInstallment),
        csvMoney(y.outstanding),
        csvMoney(y.propertyValue),
        csvMoney(y.buyNominal),
        csvMoney(y.rentNominal),
        csvMoney(y.buyReal),
        csvMoney(y.rentReal),
      ].join(';')
    );

    const blob = new Blob(['﻿' + [headers.join(';'), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alugar-ou-comprar-ano-a-ano.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <TableCard
      ref={containerRef}
      id="tabela-ano-a-ano"
      className="scroll-mt-20 mb-8"
      icon={TableIcon}
      iconClassName="text-amber-400"
      title="Projeção ano a ano"
      subtitle={`${real ? 'Em valores de hoje' : 'Em valores nominais'}, no fim de cada ano.`}
      actions={
        <ExportCsvButton
          onExport={exportCsv}
          title="Baixar todos os anos em planilha CSV"
          className="flex items-center gap-1.5 tap-target self-start sm:self-auto px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-line border border-line-strong text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        />
      }
    >
      <div className="mt-4 sm:overflow-x-auto">
        <table role="table" className="table-cards w-full text-left text-xs border-collapse">
          <thead role="rowgroup" className="bg-bg border-b border-line text-caption font-semibold text-slate-300 uppercase tracking-wider">
            <tr role="row">
              <th role="columnheader" className="py-3 px-3.5 rounded-tl-lg">Ano</th>
              <th role="columnheader" className="py-3 px-3.5 text-right">Aluguel</th>
              <th role="columnheader" className="py-3 px-3.5 text-right">Parcela</th>
              <th role="columnheader" className="py-3 px-3.5 text-right">Saldo devedor</th>
              <th role="columnheader" className="py-3 px-3.5 text-right">Imóvel vale</th>
              <th role="columnheader" className="py-3 px-3.5 text-right text-amber-400">Comprando</th>
              <th role="columnheader" className="py-3 px-3.5 text-right text-emerald-400 rounded-tr-lg">Alugando</th>
            </tr>
          </thead>
          <tbody role="rowgroup" className="divide-y divide-surface-2">
            {visible.map((y) => {
              const buy = real ? y.buyReal : y.buyNominal;
              const rent = real ? y.rentReal : y.rentNominal;
              return (
                <tr role="row" key={y.year} className="font-mono transition-colors hover:bg-white/[0.02]">
                  <td role="cell" data-label="Ano" className="py-2.5 px-3.5 font-sans font-semibold text-white whitespace-nowrap">
                    Ano {y.year}
                  </td>
                  <td role="cell" data-label="Aluguel" className="py-2.5 px-3.5 text-right text-slate-300">
                    {formatBRL(toBasis(y.monthlyRent, y.year))}
                  </td>
                  <td role="cell" data-label="Parcela" className="py-2.5 px-3.5 text-right text-slate-300">
                    {formatBRL(toBasis(y.monthlyInstallment, y.year))}
                  </td>
                  <td role="cell" data-label="Saldo devedor" className="py-2.5 px-3.5 text-right text-slate-300">
                    {formatBRL(toBasis(y.outstanding, y.year))}
                  </td>
                  <td role="cell" data-label="Imóvel vale" className="py-2.5 px-3.5 text-right text-slate-300">
                    {formatBRL(toBasis(y.propertyValue, y.year))}
                  </td>
                  <td
                    role="cell"
                    data-label="Comprando"
                    className={`py-2.5 px-3.5 text-right text-amber-400 ${buy >= rent ? 'font-bold' : ''}`}
                  >
                    {formatBRL(buy)}
                  </td>
                  <td
                    role="cell"
                    data-label="Alugando"
                    className={`py-2.5 px-3.5 text-right text-emerald-400 ${rent > buy ? 'font-bold' : ''}`}
                  >
                    {formatBRL(rent)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-line-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-caption text-slate-400">
          Mostrando {visible.length} de {rows.length} {rows.length === 1 ? 'ano' : 'anos'}. Em negrito, o caminho que está
          à frente naquele ano.
        </span>

        {rows.length > INITIAL_ROWS &&
          (expanded ? (
            <button
              type="button"
              onClick={collapse}
              aria-controls="tabela-ano-a-ano"
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
              aria-controls="tabela-ano-a-ano"
              aria-expanded="false"
              className="flex items-center gap-1.5 tap-target shrink-0 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
              Ler mais ({hidden} {hidden === 1 ? 'ano' : 'anos'})
            </button>
          ))}
      </div>
    </TableCard>
  );
};
