import React from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ClientOnly } from 'vite-react-ssg';
import { BarChart3 } from 'lucide-react';
import type { IndependenceParams, IndependenceResult } from '../../../types';
import { formatBRL, formatCompactBRL, monthlyEquivalentRate } from '../../../shared/lib/format';
import { ChartFallback } from '../../../shared/components/ChartFallback';
import type { ValueBasis } from './IndependenceResult';

interface IndependenceChartProps {
  result: IndependenceResult;
  params: IndependenceParams;
  basis: ValueBasis;
}

interface Point {
  month: number;
  contributed: number;
  interest: number;
  balance: number;
  income: number;
  target: number;
}

/** Espaçamento dos rótulos do eixo X em anos, para caber cerca de 8 marcas. */
const tickStepYears = (totalMonths: number) => {
  const years = totalMonths / 12;
  for (const step of [1, 2, 5, 10, 20]) if (years / step <= 8) return step;
  return 25;
};

export const IndependenceChart: React.FC<IndependenceChartProps> = ({ result, params, basis }) => {
  const real = basis === 'real';
  const monthlyInflation = monthlyEquivalentRate(params.annualInflation);

  const data: Point[] = result.schedule.map((row) => ({
    month: row.month,
    contributed: real ? row.contributedReal : row.contributedNominal,
    interest: real ? row.interestReal : row.interestNominal,
    balance: real ? row.balanceReal : row.balanceNominal,
    income: real ? row.incomeReal : row.incomeNominal,
    // Em valores nominais a meta sobe junto com a inflação; em valores de hoje é uma reta.
    target: real ? result.targetReal : result.targetReal * Math.pow(1 + monthlyInflation, row.month),
  }));

  const totalMonths = result.months ?? 0;
  const step = tickStepYears(totalMonths) * 12;
  const ticks: number[] = [];
  for (let m = 0; m <= totalMonths; m += step) ticks.push(m);
  if (ticks[ticks.length - 1] !== totalMonths) ticks.push(totalMonths);

  return (
    <div className="rounded-2xl bg-surface border border-line p-5 sm:p-6 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Evolução até a independência
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            O que saiu do seu bolso e o que os juros fizeram, {real ? 'em valores de hoje' : 'em valores nominais'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5 text-blue-400 font-medium">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            Investido do bolso
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            Juros
          </span>
          <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
            <span className="w-4 border-t-2 border-dashed border-indigo-400 inline-block" />
            Patrimônio necessário
          </span>
        </div>
      </div>

      <div className="w-full h-72 sm:h-80">
        <ClientOnly fallback={<ChartFallback />}>
          {() => (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="indContributed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.15} />
                  </linearGradient>
                  <linearGradient id="indInterest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.15} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1c2333" vertical={false} />

                <XAxis
                  dataKey="month"
                  type="number"
                  domain={[0, totalMonths]}
                  ticks={ticks}
                  tickFormatter={(m: number) => (m === 0 ? 'Hoje' : `${params.currentAge + Math.floor(m / 12)} anos`)}
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1f2738' }}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val: number) => formatCompactBRL(val)}
                  width={80}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const p = payload[0].payload as Point;
                    const years = Math.floor(p.month / 12);
                    return (
                      <div className="p-3.5 rounded-xl bg-panel border border-line shadow-2xl text-xs space-y-2 min-w-[220px]">
                        <div className="font-bold text-white pb-1.5 border-b border-white/10 flex justify-between items-center gap-3">
                          <span>{p.month === 0 ? 'Hoje' : `Mês ${p.month}`}</span>
                          <span className="text-[12px] sm:text-[10px] text-slate-400 font-normal">
                            {params.currentAge + years} anos
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-3 text-white font-medium">
                          <span>Patrimônio:</span>
                          <span className="font-mono font-bold">{formatBRL(p.balance)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-3 text-blue-400">
                          <span>Investido do bolso:</span>
                          <span className="font-mono">{formatBRL(p.contributed)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-3 text-emerald-400">
                          <span>Juros:</span>
                          <span className="font-mono">{formatBRL(p.interest)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-3 text-indigo-300 pt-1 border-t border-white/5">
                          <span>Renda que já sustenta:</span>
                          <span className="font-mono font-bold">{formatBRL(p.income)}/mês</span>
                        </div>
                      </div>
                    );
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="contributed"
                  stackId="patrimonio"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#indContributed)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="interest"
                  stackId="patrimonio"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#indInterest)"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#818cf8"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ClientOnly>
      </div>
    </div>
  );
};
