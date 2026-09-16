import React from 'react';
import { 
  Sliders, 
  RotateCcw, 
  HelpCircle, 
  Percent, 
  Calendar, 
  DollarSign, 
  Sparkles,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { InvestmentParams } from '../../types';
import { formatBRL } from '../../lib/calculations';

interface InvestmentFormProps {
  params: InvestmentParams;
  onChange: (newParams: Partial<InvestmentParams>) => void;
  onReset: () => void;
  liveRates?: {
    selic: number;
    cdi: number;
    ipca: number;
  };
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  params,
  onChange,
  onReset,
  liveRates,
}) => {
  const currentSelic = liveRates?.selic || 10.75;
  const currentIpca = liveRates?.ipca || 4.42;

  // Market benchmark presets with live Selic / CDI
  const presets = [
    { name: 'Poupança', rate: 6.17, desc: '6,17% a.a.' },
    { 
      name: 'Tesouro Selic / CDI', 
      rate: Number(currentSelic.toFixed(2)), 
      desc: `${currentSelic.toFixed(2).replace('.', ',')}% a.a.` 
    },
    { name: 'Fundos Imob. (FIIs)', rate: 11.5, desc: '11,5% a.a.' },
    { name: 'Bolsa / S&P 500', rate: 13.0, desc: '13% a.a.' },
  ];

  return (
    <div 
      id="investment-form-container"
      className="rounded-2xl bg-[#12151e] border border-[#1f2636] p-5 sm:p-7 shadow-xl mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2230]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-400" />
            Parâmetros da Simulação
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ajuste os valores para visualizar a evolução do patrimônio em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="reset-form-btn"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#191e2b] hover:bg-[#22293b] border border-[#273044] text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Restaurar Padrões
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {/* 1. Aporte Inicial */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="initial-deposit-input"
              className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              Aporte Inicial (R$)
              <span 
                className="cursor-pointer text-slate-400 hover:text-slate-300" 
                title="Capital que você já possui hoje para começar a investir"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className="text-xs font-mono font-medium text-emerald-400">
              {formatBRL(params.initialDeposit)}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              R$
            </span>
            <input
              id="initial-deposit-input"
              type="number"
              min="0"
              step="500"
              value={params.initialDeposit || ''}
              onChange={(e) => onChange({ initialDeposit: Math.max(0, Number(e.target.value)) })}
              className="w-full pl-10 pr-3 py-2.5 bg-[#0b0e14] border border-[#22293b] focus:border-emerald-500 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="0,00"
            />
          </div>

          {/* Quick chips */}
          <div className="flex items-center gap-1.5 pt-1">
            {[0, 5000, 10000, 50000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ initialDeposit: val })}
                className={`text-[11px] px-2 py-1 rounded-lg border transition-all ${
                  params.initialDeposit === val
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-[#161a25] border-[#222938] text-slate-400 hover:text-slate-200'
                }`}
              >
                {val === 0 ? 'Zero' : `R$ ${val >= 1000 ? `${val / 1000}k` : val}`}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Aporte Mensal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="monthly-deposit-input"
              className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              Aporte Mensal (R$)
              <span 
                className="cursor-pointer text-slate-400 hover:text-slate-300" 
                title="Valor que você economizará e investirá religiosamente todo mês"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className="text-xs font-mono font-medium text-emerald-400">
              {formatBRL(params.monthlyDeposit)}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              R$
            </span>
            <input
              id="monthly-deposit-input"
              type="number"
              min="0"
              step="100"
              value={params.monthlyDeposit || ''}
              onChange={(e) => onChange({ monthlyDeposit: Math.max(0, Number(e.target.value)) })}
              className="w-full pl-10 pr-3 py-2.5 bg-[#0b0e14] border border-[#22293b] focus:border-emerald-500 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="1000"
            />
          </div>

          {/* Quick chips */}
          <div className="flex items-center gap-1.5 pt-1">
            {[500, 1000, 2000, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ monthlyDeposit: val })}
                className={`text-[11px] px-2 py-1 rounded-lg border transition-all ${
                  params.monthlyDeposit === val
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-[#161a25] border-[#222938] text-slate-400 hover:text-slate-200'
                }`}
              >
                R$ {val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Reajuste Anual do Aporte */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="annual-adjustment-input"
              className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              Reajuste Anual do Aporte (%)
              <span 
                className="cursor-pointer text-slate-400 hover:text-slate-300" 
                title="Aumento anual no aporte para acompanhar aumentos salariais e inflação"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className="text-xs font-mono font-medium text-emerald-400">
              {params.annualAdjustmentRate}% a.a.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="annual-adjustment-slider"
              type="range"
              min="0"
              max="20"
              step="1"
              value={params.annualAdjustmentRate}
              onChange={(e) => onChange({ annualAdjustmentRate: Number(e.target.value) })}
              className="w-full accent-emerald-400 h-1.5 bg-[#1f2638] rounded-lg cursor-pointer"
            />
            <div className="w-20 shrink-0 relative">
              <input
                id="annual-adjustment-input"
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={params.annualAdjustmentRate}
                onChange={(e) => onChange({ annualAdjustmentRate: Number(e.target.value) })}
                className="w-full px-2.5 py-2 bg-[#0b0e14] border border-[#22293b] rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                %
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-1">
            {params.annualAdjustmentRate === 0 
              ? 'Aporte fixo ao longo dos anos' 
              : `A cada 12 meses o aporte cresce ${params.annualAdjustmentRate}%`}
          </div>
        </div>

        {/* 4. Taxa de Rentabilidade Anual Bruta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="annual-interest-input"
              className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              Taxa de Juros Anual Bruta (%)
              <span 
                className="cursor-pointer text-slate-400 hover:text-slate-300" 
                title="Rentabilidade bruta média esperada por ano em sua carteira"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className="text-xs font-mono font-medium text-emerald-400">
              {params.annualInterestRate}% a.a.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="annual-interest-slider"
              type="range"
              min="1"
              max="25"
              step="0.25"
              value={params.annualInterestRate}
              onChange={(e) => onChange({ annualInterestRate: Number(e.target.value) })}
              className="w-full accent-emerald-400 h-1.5 bg-[#1f2638] rounded-lg cursor-pointer"
            />
            <div className="w-20 shrink-0 relative">
              <input
                id="annual-interest-input"
                type="number"
                min="0.1"
                max="50"
                step="0.25"
                value={params.annualInterestRate}
                onChange={(e) => onChange({ annualInterestRate: Number(e.target.value) })}
                className="w-full px-2.5 py-2 bg-[#0b0e14] border border-[#22293b] rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                %
              </span>
            </div>
          </div>

          {/* Presets rápidos de mercado */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onChange({ annualInterestRate: preset.rate })}
                className={`text-[10px] px-2 py-1 rounded-lg border text-left flex items-center justify-between transition-all ${
                  params.annualInterestRate === preset.rate
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-[#161a25] border-[#222938] text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="truncate">{preset.name}</span>
                <span className="font-mono text-emerald-400/80 shrink-0">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Inflação Anual Estimada */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="annual-inflation-input"
              className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              Inflação Anual Média (IPCA) (%)
              <span 
                className="cursor-pointer text-slate-400 hover:text-slate-300" 
                title="Para descontar e revelar o poder de compra real do patrimônio"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className="text-xs font-mono font-medium text-amber-400">
              {params.annualInflationRate}% a.a.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="annual-inflation-slider"
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={params.annualInflationRate}
              onChange={(e) => onChange({ annualInflationRate: Number(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-[#1f2638] rounded-lg cursor-pointer"
            />
            <div className="w-20 shrink-0 relative">
              <input
                id="annual-inflation-input"
                type="number"
                min="0"
                max="30"
                step="0.5"
                value={params.annualInflationRate}
                onChange={(e) => onChange({ annualInflationRate: Number(e.target.value) })}
                className="w-full px-2.5 py-2 bg-[#0b0e14] border border-[#22293b] rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                %
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            {[3.5, Number(currentIpca.toFixed(2)), 6.0].map((inf) => (
              <button
                key={inf}
                type="button"
                onClick={() => onChange({ annualInflationRate: inf })}
                className={`text-[11px] px-2 py-1 rounded-lg border transition-all ${
                  params.annualInflationRate === inf
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                    : 'bg-[#161a25] border-[#222938] text-slate-400 hover:text-slate-200'
                }`}
              >
                {inf === Number(currentIpca.toFixed(2)) 
                  ? `IPCA Oficial (${currentIpca.toFixed(2).replace('.', ',')}%)` 
                  : `${inf}%`}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Período em Anos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="years-period-input"
              className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              Período de Investimento (Anos)
              <span 
                className="cursor-pointer text-slate-400 hover:text-slate-300" 
                title="Tempo total em que você deixará o dinheiro rendendo"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className="text-xs font-mono font-medium text-emerald-400">
              {params.years} {params.years === 1 ? 'ano' : 'anos'} ({params.years * 12} meses)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="years-period-slider"
              type="range"
              min="1"
              max="45"
              step="1"
              value={params.years}
              onChange={(e) => onChange({ years: Number(e.target.value) })}
              className="w-full accent-emerald-400 h-1.5 bg-[#1f2638] rounded-lg cursor-pointer"
            />
            <div className="w-20 shrink-0 relative">
              <input
                id="years-period-input"
                type="number"
                min="1"
                max="60"
                step="1"
                value={params.years}
                onChange={(e) => onChange({ years: Number(e.target.value) })}
                className="w-full px-2.5 py-2 bg-[#0b0e14] border border-[#22293b] rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                anos
              </span>
            </div>
          </div>

          {/* Quick year pills */}
          <div className="flex items-center gap-1.5 pt-1">
            {[5, 10, 20, 30].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => onChange({ years: y })}
                className={`text-[11px] px-2 py-1 rounded-lg border transition-all ${
                  params.years === y
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-[#161a25] border-[#222938] text-slate-400 hover:text-slate-200'
                }`}
              >
                {y} anos
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alíquota de IR e Regime Tributário */}
      <div className="mt-6 pt-5 border-t border-[#1c2230] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Imposto de Renda para Renda Passiva Líquida:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ taxRate: 15 })}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                params.taxRate === 15
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#161a25] border-[#222938] text-slate-400'
              }`}
            >
              15% (Longo Prazo / Tabela Regressiva)
            </button>
            <button
              type="button"
              onClick={() => onChange({ taxRate: 0 })}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                params.taxRate === 0
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#161a25] border-[#222938] text-slate-400'
              }`}
            >
              0% (Isento: LCI, LCA, FIIs, CRI, CRA)
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Taxa mensal efetiva: <span className="text-white font-mono font-semibold">{((Math.pow(1 + params.annualInterestRate/100, 1/12) - 1) * 100).toFixed(2)}% ao mês</span>
        </div>
      </div>
    </div>
  );
};
