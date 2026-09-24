import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { CalculationSummary } from '../../../types';
import { formatBRL, formatCompactBRL, formatPercent } from '../../../shared/lib/format';
import { BarChart3, PieChart as PieIcon, Sparkles } from 'lucide-react';
import { ClientOnly } from 'vite-react-ssg';
import { ChartFallback } from '../../../shared/components/ChartFallback';

interface ComparisonChartsProps {
  summary: CalculationSummary;
  taxExempt: boolean;
}

export const ComparisonCharts: React.FC<ComparisonChartsProps> = ({ summary, taxExempt }) => {
  const areaData = summary.yearlyData.map((d) => ({
    name: `Ano ${d.year}`,
    year: d.year,
    grossBalance: d.grossBalance,
    totalDeposited: d.totalDeposited,
    savingsOnlyBalance: d.savingsOnlyBalance,
    totalInterestGained: d.totalInterestGained,
    netBalance: d.netBalance,
    realNetBalance: d.realNetBalance,
  }));

  // Prepare data for Pie chart
  const pieData = [
    {
      name: 'Total Aportado',
      value: summary.totalInvested,
      color: '#3b82f6', // blue-500
    },
    {
      name: 'Ganhos em Juros',
      value: summary.totalInterestGained,
      color: '#10b981', // emerald-500
    },
  ];

  const interestPercentage = summary.finalGrossBalance > 0
    ? (summary.totalInterestGained / summary.finalGrossBalance) * 100
    : 0;

  return (
    <div 
      id="comparison-charts-container"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
    >
      {/* 1. Main Evolution Chart (Takes 2 cols on lg) */}
      <div className="lg:col-span-2 rounded-2xl bg-surface border border-line p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Evolução do Patrimônio ao Longo do Tempo
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Saldo bruto investido vs apenas guardar os aportes, em valores nominais.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Com Investimento</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400 font-medium">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span>Apenas Guardado</span>
            </div>
          </div>
        </div>

        {/* Chart container */}
        <div className="w-full h-72 sm:h-80">
          <ClientOnly fallback={<ChartFallback />}>{() => (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1c2333" vertical={false} />
              
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1f2738' }}
                interval="preserveStartEnd"
              />
              
              <YAxis 
                stroke="#64748b" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCompactBRL(val)}
                width={70}
              />
              
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3.5 rounded-xl bg-panel border border-line shadow-2xl text-xs space-y-2 min-w-[210px]">
                        <div className="font-bold text-white pb-1.5 border-b border-white/10 flex justify-between items-center">
                          <span>{label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Ano {data.year}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400 font-medium">
                          <span>Saldo bruto:</span>
                          <span className="font-mono font-bold">{formatBRL(data.grossBalance)}</span>
                        </div>
                        <div className="flex justify-between items-center text-blue-400 font-medium">
                          <span>Total Aportado:</span>
                          <span className="font-mono">{formatBRL(data.totalDeposited)}</span>
                        </div>
                        <div className="flex justify-between items-center text-amber-300 font-medium pt-1 border-t border-white/5">
                          <span>Juros brutos:</span>
                          <span className="font-mono font-bold">+{formatBRL(data.totalInterestGained)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300 text-[10px] pt-1">
                          <span>{taxExempt ? 'Líquido (isento):' : 'Líquido de IR:'}</span>
                          <span className="font-mono">{formatBRL(data.netBalance)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 text-[10px]">
                          <span>Líquido em valores de hoje:</span>
                          <span className="font-mono">{formatBRL(data.realNetBalance)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area 
                type="monotone" 
                dataKey="grossBalance" 
                name="Com Investimento"
                stroke="#10b981" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorGross)" 
              />
              
              <Area 
                type="monotone" 
                dataKey="savingsOnlyBalance" 
                name="Apenas Guardado"
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorSavings)" 
              />
            </AreaChart>
          </ResponsiveContainer>
          )}</ClientOnly>
        </div>
      </div>

      {/* 2. Donut Composition Chart (Takes 1 col on lg) */}
      <div className="rounded-2xl bg-surface border border-line p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-400" />
            Composição do Patrimônio
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribuição do saldo bruto ao final do período, antes do IR.
          </p>
        </div>

        {/* Donut Chart with centered multiplier */}
        <div className="relative w-full h-56 flex items-center justify-center my-2">
          <ClientOnly fallback={<ChartFallback />}>{() => (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={88}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [formatBRL(Number(value)), '']}
                contentStyle={{
                  backgroundColor: '#0f121a',
                  borderColor: '#232a3d',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          )}</ClientOnly>

          {/* Centered label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Juros
            </span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {formatPercent(interestPercentage, 1)}
            </span>
            <span className="text-[10px] text-slate-400">
              do total
            </span>
          </div>
        </div>

        {/* Legend pills */}
        <div className="space-y-2 pt-2 border-t border-line-soft text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-surface-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300 font-medium">Juros (brutos)</span>
            </div>
            <span className="font-mono font-bold text-emerald-400">
              {formatBRL(summary.totalInterestGained)}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-surface-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-300 font-medium">Total Aportado</span>
            </div>
            <span className="font-mono font-bold text-blue-400">
              {formatBRL(summary.totalInvested)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
