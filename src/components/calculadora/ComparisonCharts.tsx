import React, { useState } from 'react';
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
import { CalculationSummary } from '../../types';
import { formatBRL, formatCompactBRL, formatPercent } from '../../lib/calculations';
import { BarChart3, PieChart as PieIcon, Sparkles } from 'lucide-react';

interface ComparisonChartsProps {
  summary: CalculationSummary;
}

export const ComparisonCharts: React.FC<ComparisonChartsProps> = ({ summary }) => {
  const [chartView, setChartView] = useState<'area' | 'pie'>('area');

  // Prepare data for Area chart
  const areaData = summary.yearlyData.map((d) => ({
    name: `Ano ${d.year}`,
    year: d.year,
    grossBalance: d.grossBalance,
    totalDeposited: d.totalDeposited,
    savingsOnlyBalance: d.savingsOnlyBalance,
    totalInterestGained: d.totalInterestGained,
    realBalance: d.realBalance,
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
    ? ((summary.totalInterestGained / summary.finalGrossBalance) * 100).toFixed(1)
    : '0';

  return (
    <div 
      id="comparison-charts-container"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
    >
      {/* 1. Main Evolution Chart (Takes 2 cols on lg) */}
      <div className="lg:col-span-2 rounded-2xl bg-[#12151e] border border-[#1f2636] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Evolução do Patrimônio ao Longo do Tempo
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparativo entre poupar sem juros vs o efeito exponencial dos juros compostos.
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
                      <div className="p-3.5 rounded-xl bg-[#0f121a] border border-[#232a3d] shadow-2xl text-xs space-y-2 min-w-[210px]">
                        <div className="font-bold text-white pb-1.5 border-b border-white/10 flex justify-between items-center">
                          <span>{label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Ano {data.year}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400 font-medium">
                          <span>Patrimônio Investido:</span>
                          <span className="font-mono font-bold">{formatBRL(data.grossBalance)}</span>
                        </div>
                        <div className="flex justify-between items-center text-blue-400 font-medium">
                          <span>Total Aportado:</span>
                          <span className="font-mono">{formatBRL(data.totalDeposited)}</span>
                        </div>
                        <div className="flex justify-between items-center text-amber-300 font-medium pt-1 border-t border-white/5">
                          <span>Ganho em Juros:</span>
                          <span className="font-mono font-bold">+{formatBRL(data.totalInterestGained)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 text-[10px] pt-1">
                          <span>Poder de compra real:</span>
                          <span className="font-mono">{formatBRL(data.realBalance)}</span>
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
        </div>
      </div>

      {/* 2. Donut Composition Chart (Takes 1 col on lg) */}
      <div className="rounded-2xl bg-[#12151e] border border-[#1f2636] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-400" />
            Composição do Patrimônio
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribuição do montante acumulado ao final do período.
          </p>
        </div>

        {/* Donut Chart with centered multiplier */}
        <div className="relative w-full h-56 flex items-center justify-center my-2">
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

          {/* Centered label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Juros
            </span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {interestPercentage}%
            </span>
            <span className="text-[10px] text-slate-400">
              do total
            </span>
          </div>
        </div>

        {/* Legend pills */}
        <div className="space-y-2 pt-2 border-t border-[#1c2230] text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#161a25]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300 font-medium">Juros Compostos</span>
            </div>
            <span className="font-mono font-bold text-emerald-400">
              {formatBRL(summary.totalInterestGained)}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#161a25]">
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
