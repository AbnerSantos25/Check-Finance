import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FinancingSummary, RealEstateParams } from '../../../types';
import { formatBRL } from '../../../shared/lib/format';
import { PieChart as PieIcon, LineChart } from 'lucide-react';
import { ClientOnly } from 'vite-react-ssg';
import { ChartFallback } from '../../../shared/components/ChartFallback';

interface RealEstateChartsProps {
  summary: FinancingSummary;
  params: RealEstateParams;
}

export const RealEstateCharts: React.FC<RealEstateChartsProps> = ({ summary, params }) => {
  // 1. Prepare Donut Chart Data (Principal vs Interest)
  const donutData = useMemo(() => [
    { name: 'Valor do Imóvel (Pago ao vendedor)', value: summary.totalFinanced, color: '#38bdf8' }, // sky-400
    { name: 'Juros Bancários (Custo do dinheiro)', value: summary.totalInterestPaid, color: '#fb7185' }, // rose-400
  ], [summary]);

  // 2. Prepare Area Chart Data (Debt evolution over time)
  // We sample the data to avoid rendering hundreds of points (slows down Recharts)
  const areaData = useMemo(() => {
    const data = [];
    const step = Math.max(1, Math.floor(summary.schedule.length / 40)); 
    
    for (let i = 0; i < summary.schedule.length; i += step) {
      data.push({
        month: summary.schedule[i].month,
        year: Math.floor(summary.schedule[i].month / 12),
        label: `Ano ${Math.floor(summary.schedule[i].month / 12)}`,
        saldoDevedor: summary.schedule[i].outstandingBalance,
      });
    }
    // Always include the last point
    if (summary.schedule.length > 0 && data[data.length - 1].month !== summary.schedule[summary.schedule.length - 1].month) {
       const last = summary.schedule[summary.schedule.length - 1];
       data.push({
        month: last.month,
        year: Math.floor(last.month / 12),
        label: `Ano ${Math.floor(last.month / 12)}`,
        saldoDevedor: last.outstandingBalance,
      });
    }
    return data;
  }, [summary]);

  const CustomTooltipArea = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg/95 border border-line p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-xs font-bold text-slate-200 mb-2">{payload[0].payload.label} (Mês {payload[0].payload.month})</p>
          <div className="space-y-1">
            <p className="text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-slate-400">Saldo Devedor:</span>
              <span className="font-mono text-rose-400 font-medium">{formatBRL(payload[0].value)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipDonut = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg/95 border border-line p-3 rounded-xl shadow-xl backdrop-blur-md max-w-[200px]">
          <p className="text-xs font-medium text-slate-300 mb-1">{data.name}</p>
          <p className="text-sm font-mono font-bold" style={{ color: data.color }}>
            {formatBRL(data.value)}
          </p>
          <p className="text-[12px] sm:text-[10px] text-slate-500 mt-1">
            {((data.value / summary.totalPaidOut) * 100).toFixed(1)}% do Custo Efetivo Total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Gráfico 1: Composição do Custo (Donut) */}
      <div className="rounded-2xl bg-surface border border-line p-5 shadow-xl lg:col-span-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <PieIcon className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-white">Composição do Custo Total</h3>
        </div>
        
        <div className="flex-1 min-h-[250px] relative">
          {summary.totalPaidOut > 0 ? (
            <ClientOnly fallback={<ChartFallback />}>{() => (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltipDonut />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    // 12px é o piso de legibilidade que a auditoria fixou para o
                    // celular; a legenda do recharts vem por estilo inline, fora do
                    // alcance das classes do Tailwind.
                    fontSize: '12px',
                    color: '#94a3b8',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            )}</ClientOnly>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
              Sem financiamento (Pago à vista)
            </div>
          )}
          {summary.totalPaidOut > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-[12px] sm:text-[10px] text-slate-400 uppercase tracking-wider">Custo Total</span>
              <span className="text-sm font-bold text-white tracking-tight">
                {formatBRL(summary.totalPaidOut)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico 2: Evolução do Saldo Devedor (Area) */}
      <div className="rounded-2xl bg-surface border border-line p-5 shadow-xl lg:col-span-2 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-white">Evolução do Saldo Devedor</h3>
          </div>
          {summary.monthsSaved > 0 && (
            <div className="text-[12px] sm:text-[10px] font-semibold text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              Dívida encurtada em {summary.monthsSaved} meses
            </div>
          )}
        </div>

        <div className="flex-1 min-h-[250px]">
          {summary.totalFinanced > 0 ? (
            <ClientOnly fallback={<ChartFallback />}>{() => (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2636" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltipArea />} />
                <Area 
                  type="monotone" 
                  dataKey="saldoDevedor" 
                  stroke="#fb7185" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSaldo)" 
                />
              </AreaChart>
            </ResponsiveContainer>
            )}</ClientOnly>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
              Nenhuma dívida projetada.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
