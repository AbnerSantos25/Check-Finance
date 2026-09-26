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
import { InvestmentParams, MarketRates } from '../../../types';
import { formatBRL, formatNumber, formatPercent, monthlyEquivalentRate } from '../../../shared/lib/format';
import { REFERENCE_DATE } from '../../../shared/lib/economicApi';
import { DraftNumberInput } from '../../../shared/components/DraftNumberInput';

interface InvestmentFormProps {
  params: InvestmentParams;
  onChange: (newParams: Partial<InvestmentParams>) => void;
  onReset: () => void;
  marketRates: MarketRates;
  ratesAreLive: boolean;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  params,
  onChange,
  onReset,
  marketRates,
  ratesAreLive,
}) => {
  const currentIpca = round2(marketRates.ipca);

  // Each preset carries the IR regime of the product it represents.
  const presets = [
    { name: 'Poupança', rate: round2(marketRates.poupanca), taxExempt: true, hint: 'Rentabilidade vigente (BCB), isenta de IR' },
    { name: 'Tesouro Selic', rate: round2(marketRates.selic), taxExempt: false, hint: 'Aproximação pela Selic meta, IR pela tabela regressiva' },
    { name: 'CDB 100% do CDI', rate: round2(marketRates.cdi), taxExempt: false, hint: 'CDI anualizado (BCB), IR pela tabela regressiva' },
  ];

  const inflationPresets = [3.5, currentIpca, 6];

  return (
    <div 
      id="investment-form-container"
      className="rounded-2xl bg-surface border border-line p-5 sm:p-7 shadow-xl mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line-soft">
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
            className="flex items-center gap-1.5 tap-target px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-line border border-line-strong text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
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
              className="w-full tap-field pl-10 pr-3 py-2.5 bg-bg border border-line focus:border-emerald-500 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
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
                className={`text-[12px] sm:text-[11px] tap-target px-2 py-1 rounded-lg border transition-all ${
                  params.initialDeposit === val
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-surface-2 border-line text-slate-400 hover:text-slate-200'
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
              className="w-full tap-field pl-10 pr-3 py-2.5 bg-bg border border-line focus:border-emerald-500 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
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
                className={`text-[12px] sm:text-[11px] tap-target px-2 py-1 rounded-lg border transition-all ${
                  params.monthlyDeposit === val
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-surface-2 border-line text-slate-400 hover:text-slate-200'
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
              {formatNumber(params.annualAdjustmentRate, 1)}% a.a.
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
              className="w-full accent-emerald-400 range-touch cursor-pointer"
            />
            <div className="w-28 sm:w-20 shrink-0 relative">
              <DraftNumberInput
                id="annual-adjustment-input"
                min="0"
                max="50"
                step="0.5"
                value={params.annualAdjustmentRate}
                onCommit={(v) => onChange({ annualAdjustmentRate: v })}
                className="w-full tap-field pl-2.5 pr-7 sm:pr-2.5 py-2 bg-bg border border-line rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] sm:text-[10px] text-slate-400">
                %
              </span>
            </div>
          </div>

          <div className="text-[12px] sm:text-[11px] text-slate-400 pt-1">
            {params.annualAdjustmentRate === 0 
              ? 'Aporte fixo ao longo dos anos' 
              : `A cada 12 meses o aporte cresce ${formatPercent(params.annualAdjustmentRate, 1)}`}
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
              {formatNumber(params.annualInterestRate)}% a.a.
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
              className="w-full accent-emerald-400 range-touch cursor-pointer"
            />
            <div className="w-28 sm:w-20 shrink-0 relative">
              <DraftNumberInput
                id="annual-interest-input"
                min="0.1"
                max="50"
                step="0.25"
                value={params.annualInterestRate}
                onCommit={(v) => onChange({ annualInterestRate: v })}
                className="w-full tap-field pl-2.5 pr-7 sm:pr-2.5 py-2 bg-bg border border-line rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] sm:text-[10px] text-slate-400">
                %
              </span>
            </div>
          </div>

          {/* Presets rápidos de mercado */}
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            {presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                title={preset.hint}
                onClick={() => onChange({ annualInterestRate: preset.rate, taxExempt: preset.taxExempt })}
                className={`text-[12px] sm:text-[10px] tap-field px-2 py-1 rounded-lg border text-left flex items-center justify-between gap-2 transition-all ${
                  params.annualInterestRate === preset.rate && params.taxExempt === preset.taxExempt
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-surface-2 border-line text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="truncate">
                  {preset.name}
                  <span className="text-slate-400 font-normal"> · {preset.taxExempt ? 'isento' : 'com IR'}</span>
                </span>
                <span className="font-mono text-emerald-400/80 shrink-0">{formatNumber(preset.rate)}% a.a.</span>
              </button>
            ))}
          </div>
          <div className="text-[12px] sm:text-[10px] text-slate-400">
            {ratesAreLive
              ? 'Taxas atuais do Banco Central; não garantem rentabilidade futura.'
              : `Taxas de referência de ${REFERENCE_DATE}; Banco Central indisponível.`}
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
              {formatNumber(params.annualInflationRate)}% a.a.
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
              className="w-full accent-amber-400 range-touch cursor-pointer"
            />
            <div className="w-28 sm:w-20 shrink-0 relative">
              <DraftNumberInput
                id="annual-inflation-input"
                min="0"
                max="30"
                step="0.5"
                value={params.annualInflationRate}
                onCommit={(v) => onChange({ annualInflationRate: v })}
                className="w-full tap-field pl-2.5 pr-7 sm:pr-2.5 py-2 bg-bg border border-line rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] sm:text-[10px] text-slate-400">
                %
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            {inflationPresets.map((inf, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange({ annualInflationRate: inf })}
                title={index === 1 ? 'IPCA acumulado nos últimos 12 meses (IBGE, via BCB)' : undefined}
                className={`text-[12px] sm:text-[11px] tap-target px-2 py-1 rounded-lg border transition-all ${
                  params.annualInflationRate === inf
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                    : 'bg-surface-2 border-line text-slate-400 hover:text-slate-200'
                }`}
              >
                {index === 1 ? `IPCA 12m (${formatPercent(inf)})` : formatPercent(inf, 1)}
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
              className="w-full accent-emerald-400 range-touch cursor-pointer"
            />
            <div className="w-28 sm:w-20 shrink-0 relative">
              <DraftNumberInput
                id="years-period-input"
                min="1"
                max="60"
                step="1"
                value={params.years}
                onCommit={(v) => onChange({ years: v })}
                className="w-full tap-field pl-2.5 pr-7 sm:pr-2.5 py-2 bg-bg border border-line rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] sm:text-[10px] text-slate-400">
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
                className={`text-[12px] sm:text-[11px] tap-target px-2 py-1 rounded-lg border transition-all ${
                  params.years === y
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-surface-2 border-line text-slate-400 hover:text-slate-200'
                }`}
              >
                {y} anos
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alíquota de IR e Regime Tributário */}
      <div className="mt-6 pt-5 border-t border-line-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Imposto de Renda sobre os ganhos:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ taxExempt: false })}
              title="22,5% até 180 dias, 20% até 360, 17,5% até 720 e 15% acima, aplicado a cada aporte"
              className={`tap-target px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                !params.taxExempt
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-surface-2 border-line text-slate-400'
              }`}
            >
              Tributado (tabela regressiva: 22,5% a 15%)
            </button>
            <button
              type="button"
              onClick={() => onChange({ taxExempt: true })}
              className={`tap-target px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                params.taxExempt
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-surface-2 border-line text-slate-400'
              }`}
            >
              Isento (poupança, LCI, LCA, CRI, CRA)
            </button>
          </div>
        </div>

        <div className="text-[12px] sm:text-[11px] text-slate-400">
          Taxa mensal equivalente: <span className="text-white font-mono font-semibold">{formatNumber(monthlyEquivalentRate(params.annualInterestRate) * 100, 4)}% ao mês</span>
        </div>
      </div>
    </div>
  );
};
