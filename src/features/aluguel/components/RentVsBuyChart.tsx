import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import type { RentVsBuyParams, RentVsBuySummary } from '../../../types';
import { formatBRL, formatCompactBRL } from '../../../shared/lib/format';
import { LazyChart } from '../../../shared/components/LazyChart';
import type { ValueBasis } from '../../../shared/components/BasisToggle';

interface RentVsBuyChartProps {
  summary: RentVsBuySummary;
  params: RentVsBuyParams;
  basis: ValueBasis;
}

interface Point {
  year: number;
  buy: number;
  rent: number;
}

// Cores fixas das séries: são preenchimento e traço, não texto, e funcionam nos dois temas.
//
// Áreas, e não linhas: é o mesmo conjunto de módulos do recharts que as outras
// ferramentas importam. Com LineChart, o bundler separava Area num chunk próprio e
// toda página com gráfico passava a baixar cerca de 2 kB a mais.
const BUY_COLOR = '#f59e0b';
const RENT_COLOR = '#10b981';

export const RentVsBuyChart: React.FC<RentVsBuyChartProps> = ({ summary, params, basis }) => {
  const real = basis === 'real';

  // Ano 0: quem compra tem só a entrada no imóvel (os custos de aquisição já foram);
  // quem aluga tem a entrada e esses custos investidos. Depois, um ponto por ano.
  const data: Point[] = [
    { year: 0, buy: params.propertyValue - summary.financed, rent: summary.initialOutlay },
    ...summary.yearly.map((y) => ({
      year: y.year,
      buy: real ? y.buyReal : y.buyNominal,
      rent: real ? y.rentReal : y.rentNominal,
    })),
  ];

  return (
    <div className="rounded-2xl bg-surface border border-line p-5 sm:p-6 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-amber-400" />
            Patrimônio ano a ano
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Os dois caminhos lado a lado, {real ? 'em valores de hoje' : 'em valores nominais'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            Comprando
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            Alugando e investindo
          </span>
        </div>
      </div>

      <div className="w-full h-72 sm:h-80">
        <LazyChart>
          {() => (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rvbBuy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BUY_COLOR} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={BUY_COLOR} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="rvbRent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={RENT_COLOR} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={RENT_COLOR} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line-soft)" vertical={false} />

                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[0, params.years]}
                  tickFormatter={(year: number) => (year === 0 ? 'Hoje' : `Ano ${year}`)}
                  stroke="var(--color-slate-500)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-line)' }}
                />

                <YAxis
                  stroke="var(--color-slate-500)"
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
                    const diff = p.buy - p.rent;
                    return (
                      <div className="p-3.5 rounded-xl bg-panel border border-line shadow-2xl text-xs space-y-2 min-w-[220px]">
                        <div className="font-bold text-white pb-1.5 border-b border-white/10">
                          {p.year === 0 ? 'Hoje' : `Ano ${p.year}`}
                        </div>
                        <div className="flex justify-between items-center gap-3 text-amber-400">
                          <span>Comprando:</span>
                          <span className="font-mono font-bold">{formatBRL(p.buy)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-3 text-emerald-400">
                          <span>Alugando:</span>
                          <span className="font-mono font-bold">{formatBRL(p.rent)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-3 text-slate-300 pt-1 border-t border-white/5">
                          <span>{diff >= 0 ? 'Comprar à frente:' : 'Alugar à frente:'}</span>
                          <span className="font-mono">{formatBRL(Math.abs(diff))}</span>
                        </div>
                      </div>
                    );
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="buy"
                  stroke={BUY_COLOR}
                  strokeWidth={2.5}
                  fill="url(#rvbBuy)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="rent"
                  stroke={RENT_COLOR}
                  strokeWidth={2.5}
                  fill="url(#rvbRent)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </LazyChart>
      </div>
    </div>
  );
};
