import React from 'react';
import {
  Sliders,
  RotateCcw,
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
import { InfoTip } from '../../../shared/components/InfoTip';
import { annualToMonthly, formatPeriod, monthlyToAnnual, toMonths, type DisplayUnits } from '../lib/units';

interface InvestmentFormProps {
  params: InvestmentParams;
  onChange: (newParams: Partial<InvestmentParams>) => void;
  /** Unidade em que a taxa e o prazo são digitados. Os parâmetros seguem anuais. */
  units: DisplayUnits;
  onUnitsChange: (units: DisplayUnits) => void;
  onReset: () => void;
  marketRates: MarketRates;
  ratesAreLive: boolean;
}

const round2 = (value: number) => Math.round(value * 100) / 100;
const round4 = (value: number) => Math.round(value * 10000) / 10000;

/** Seletor compacto de unidade (a.a./a.m., anos/meses). */
function UnitSwitch<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  /**
   * [valor, texto visível, rótulo falado opcional]. O rótulo falado começa pelo
   * texto visível (WCAG 2.5.3): quem usa comando de voz diz "a.m." e acha o botão.
   */
  options: [T, string, string?][];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 rounded-lg bg-bg-deep p-0.5 border border-line">
      {options.map(([option, text, spoken]) => (
        <button
          key={option}
          type="button"
          aria-label={spoken ? `${text}, ${spoken}` : undefined}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`min-h-8 px-2.5 rounded-md text-caption font-medium transition-colors cursor-pointer ${value === option ? 'bg-line-soft text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  params,
  onChange,
  units,
  onUnitsChange,
  onReset,
  marketRates,
  ratesAreLive,
}) => {
  const currentIpca = round2(marketRates.ipca);

  // Taxa e prazo são guardados ao ano; a unidade só muda o que se digita e se lê.
  const monthlyRate = units.rate === 'mensal';
  const shownRate = monthlyRate ? round4(annualToMonthly(params.annualInterestRate)) : params.annualInterestRate;
  const commitRate = (value: number) =>
    onChange({ annualInterestRate: monthlyRate ? monthlyToAnnual(value) : value });
  const inMonths = units.period === 'meses';
  // Em anos, um prazo que não fecha ano (ex.: 128 meses) aparece com duas casas, não como 10.666…
  const shownPeriod = inMonths ? toMonths(params.years) : Math.round(params.years * 100) / 100;
  const commitPeriod = (value: number) => onChange({ years: inMonths ? value / 12 : value });

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
            <div className="flex items-center gap-1.5">
              <label htmlFor="initial-deposit-input" className="text-xs font-semibold text-slate-300">
                Aporte Inicial (R$)
              </label>
              <InfoTip label="Aporte Inicial (R$)" text="Capital que você já possui hoje para começar a investir" />
            </div>
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
                className={`text-caption tap-target px-2 py-1 rounded-lg border transition-all ${params.initialDeposit === val
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
            <div className="flex items-center gap-1.5">
              <label htmlFor="monthly-deposit-input" className="text-xs font-semibold text-slate-300">
                Aporte Mensal (R$)
              </label>
              <InfoTip label="Aporte Mensal (R$)" text="Valor que você economizará e investirá religiosamente todo mês" />
            </div>
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
                className={`text-caption tap-target px-2 py-1 rounded-lg border transition-all ${params.monthlyDeposit === val
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
            <div className="flex items-center gap-1.5">
              <label htmlFor="annual-adjustment-input" className="text-xs font-semibold text-slate-300">
                Reajuste Anual do Aporte (%)
              </label>
              <InfoTip label="Reajuste Anual do Aporte (%)" text="Aumento anual no aporte para acompanhar aumentos salariais e inflação" />
            </div>
            <span className="text-xs font-mono font-medium text-emerald-400">
              {formatNumber(params.annualAdjustmentRate, 1)}% a.a.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="annual-adjustment-slider"
              aria-label="Reajuste anual do aporte (%)"
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
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-caption text-slate-400">
                %
              </span>
            </div>
          </div>

          <div className="text-caption text-slate-400 pt-1">
            {params.annualAdjustmentRate === 0
              ? 'Aporte fixo ao longo dos anos'
              : `A cada 12 meses o aporte cresce ${formatPercent(params.annualAdjustmentRate, 1)}`}
          </div>
        </div>

        {/* 4. Taxa de juros, ao ano ou ao mês */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <label htmlFor="annual-interest-input" className="text-xs font-semibold text-slate-300">
                Taxa de Juros Bruta (%)
              </label>
              <InfoTip
                label="Taxa de Juros Bruta (%)"
                text="Rentabilidade bruta média esperada. Digite ao ano ou ao mês: a conversão usa a taxa equivalente composta (1% ao mês = 12,68% ao ano, e não 12%)."
              />
            </div>
            <UnitSwitch
              label="Unidade da taxa"
              value={units.rate}
              options={[['anual', 'a.a.', 'ao ano'], ['mensal', 'a.m.', 'ao mês']]}
              onChange={(rate) => onUnitsChange({ ...units, rate })}
            />
          </div>
          <div className="text-xs font-mono font-medium text-emerald-400">
            {formatNumber(params.annualInterestRate)}% a.a. · {formatNumber(annualToMonthly(params.annualInterestRate), 4)}% a.m.
          </div>

          <div className="flex items-center gap-3">
            <input
              id="annual-interest-slider"
              aria-label={monthlyRate ? 'Taxa de juros mensal bruta (%)' : 'Taxa de juros anual bruta (%)'}
              type="range"
              min={monthlyRate ? '0.1' : '1'}
              max={monthlyRate ? '2.5' : '25'}
              step={monthlyRate ? '0.05' : '0.25'}
              value={shownRate}
              onChange={(e) => commitRate(Number(e.target.value))}
              className="w-full accent-emerald-400 range-touch cursor-pointer"
            />
            <div className="w-28 sm:w-24 shrink-0 relative">
              <DraftNumberInput
                id="annual-interest-input"
                min={monthlyRate ? '0.01' : '0.1'}
                max={monthlyRate ? '9.5' : '200'}
                step={monthlyRate ? '0.05' : '0.25'}
                value={shownRate}
                onCommit={commitRate}
                aria-describedby="annual-interest-unit"
                className="w-full tap-field pl-2.5 pr-11 py-2 bg-bg border border-line rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-emerald-500"
              />
              <span id="annual-interest-unit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-caption text-slate-400">
                {monthlyRate ? '% a.m.' : '% a.a.'}
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
                className={`text-caption tap-field px-2 py-1 rounded-lg border text-left flex items-center justify-between gap-2 transition-all ${params.annualInterestRate === preset.rate && params.taxExempt === preset.taxExempt
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-surface-2 border-line text-slate-400 hover:text-slate-200'
                  }`}
              >
                <span className="truncate">
                  {preset.name}
                  <span className="text-slate-400 font-normal"> · {preset.taxExempt ? 'isento' : 'com IR'}</span>
                </span>
                <span className="font-mono text-emerald-400/80 light:text-emerald-400 shrink-0">
                  {monthlyRate
                    ? `${formatNumber(annualToMonthly(preset.rate), 2)}% a.m.`
                    : `${formatNumber(preset.rate)}% a.a.`}
                </span>
              </button>
            ))}
          </div>
          <div className="text-caption text-slate-400">
            {ratesAreLive
              ? 'Taxas atuais do Banco Central; não garantem rentabilidade futura.'
              : `Taxas de referência de ${REFERENCE_DATE}; Banco Central indisponível.`}
          </div>
        </div>

        {/* 5. Inflação Anual Estimada */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label htmlFor="annual-inflation-input" className="text-xs font-semibold text-slate-300">
                Inflação Anual Média (IPCA) (%)
              </label>
              <InfoTip label="Inflação Anual Média (IPCA) (%)" text="Para descontar e revelar o poder de compra real do patrimônio" />
            </div>
            <span className="text-xs font-mono font-medium text-amber-400">
              {formatNumber(params.annualInflationRate)}% a.a.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="annual-inflation-slider"
              aria-label="Inflação anual média (IPCA) (%)"
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
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-caption text-slate-400">
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
                className={`text-caption tap-target px-2 py-1 rounded-lg border transition-all ${params.annualInflationRate === inf
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                    : 'bg-surface-2 border-line text-slate-400 hover:text-slate-200'
                  }`}
              >
                {index === 1 ? `IPCA 12m (${formatPercent(inf)})` : formatPercent(inf, 1)}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Prazo, em anos ou meses */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <label htmlFor="years-period-input" className="text-xs font-semibold text-slate-300">
                Período do Investimento
              </label>
              <InfoTip
                label="Período do Investimento"
                text="Tempo total em que você deixará o dinheiro rendendo, em anos ou em meses. O aporte é reajustado a cada 12 meses."
              />
            </div>
            <UnitSwitch
              label="Unidade do período"
              value={units.period}
              options={[['anos', 'anos'], ['meses', 'meses']]}
              onChange={(period) => onUnitsChange({ ...units, period })}
            />
          </div>
          <div className="text-xs font-mono font-medium text-emerald-400">
            {formatPeriod(params.years)}
            {!inMonths && toMonths(params.years) % 12 === 0 ? ` (${toMonths(params.years)} meses)` : ''}
          </div>

          <div className="flex items-center gap-3">
            <input
              id="years-period-slider"
              aria-label={inMonths ? 'Período de investimento (meses)' : 'Período de investimento (anos)'}
              type="range"
              min="1"
              max={inMonths ? '120' : '45'}
              step="1"
              value={shownPeriod}
              onChange={(e) => commitPeriod(Number(e.target.value))}
              className="w-full accent-emerald-400 range-touch cursor-pointer"
            />
            <div className="w-28 sm:w-24 shrink-0 relative">
              <DraftNumberInput
                id="years-period-input"
                // Em anos, o mínimo é 1 mês (0,08 ano): 7 meses aparecem como 0,58.
                min={inMonths ? '1' : '0.08'}
                max={inMonths ? '720' : '60'}
                // Em anos o prazo pode ser fracionário (100 meses = 8,33 anos).
                step={inMonths ? '1' : 'any'}
                value={shownPeriod}
                onCommit={commitPeriod}
                aria-describedby="years-period-unit"
                className="w-full tap-field pl-2.5 pr-12 py-2 bg-bg border border-line rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-emerald-500"
              />
              <span id="years-period-unit" className="absolute right-2 top-1/2 -translate-y-1/2 text-caption text-slate-400">
                {inMonths ? 'meses' : 'anos'}
              </span>
            </div>
          </div>

          {/* Atalhos de prazo */}
          <div className="flex items-center gap-1.5 pt-1">
            {(inMonths ? [6, 12, 24, 36] : [5, 10, 20, 30]).map((value) => {
              const years = inMonths ? value / 12 : value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ years })}
                  className={`text-caption tap-target px-2 py-1 rounded-lg border transition-all ${toMonths(params.years) === toMonths(years)
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'bg-surface-2 border-line text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {value} {inMonths ? 'meses' : 'anos'}
                </button>
              );
            })}
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
              className={`tap-target px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${!params.taxExempt
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-surface-2 border-line text-slate-400'
                }`}
            >
              Tributado (tabela regressiva: 22,5% a 15%)
            </button>
            <button
              type="button"
              onClick={() => onChange({ taxExempt: true })}
              className={`tap-target px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${params.taxExempt
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-surface-2 border-line text-slate-400'
                }`}
            >
              Isento (poupança, LCI, LCA, CRI, CRA)
            </button>
          </div>
        </div>

        <div className="text-caption text-slate-400">
          Taxa mensal equivalente: <span className="text-white font-mono font-semibold">{formatNumber(monthlyEquivalentRate(params.annualInterestRate) * 100, 4)}% ao mês</span>
        </div>
      </div>
    </div>
  );
};