import React from 'react';
import { HelpCircle, RotateCcw, Sliders } from 'lucide-react';
import type { IndependenceParams, MarketRates } from '../../../types';
import { formatNumber, formatPercent, monthlyEquivalentRate } from '../../../shared/lib/format';
import { REFERENCE_DATE } from '../../../shared/lib/economicApi';
import { DraftNumberInput } from '../../../shared/components/DraftNumberInput';
import { annualRealRate } from '../lib/calculateIndependence';
import { PARAM_LIMITS } from '../lib/sanitizeParams';

interface IndependenceFormProps {
  params: IndependenceParams;
  onChange: (changes: Partial<IndependenceParams>) => void;
  onReset: () => void;
  marketRates: MarketRates;
  ratesAreLive: boolean;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const chipClass = (active: boolean) =>
  `text-[12px] sm:text-[11px] tap-target px-2 py-1 rounded-lg border transition-all ${
    active
      ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-semibold'
      : 'bg-surface-2 border-line text-slate-400 hover:text-slate-200'
  }`;

const shortMoney = (value: number) =>
  value === 0 ? 'Zero' : value >= 1000 ? `R$ ${formatNumber(value / 1000, 0)}k` : `R$ ${value}`;

const FieldLabel: React.FC<{ htmlFor: string; hint: string; children: React.ReactNode }> = ({
  htmlFor,
  hint,
  children,
}) => (
  <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
    {children}
    <span className="cursor-help text-slate-400 hover:text-slate-300" title={hint}>
      <HelpCircle className="w-3.5 h-3.5" />
    </span>
  </label>
);

const MoneyInput: React.FC<{
  id: string;
  value: number;
  step: number;
  min: number;
  onCommit: (value: number) => void;
}> = ({ id, value, step, min, onCommit }) => (
  <div className="relative">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">R$</span>
    <DraftNumberInput
      id={id}
      inputMode="decimal"
      min={min}
      step={step}
      value={value}
      onCommit={onCommit}
      className="w-full tap-field pl-10 pr-3 py-2.5 bg-bg border border-line focus:border-indigo-500 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
    />
  </div>
);

const RateInput: React.FC<{
  id: string;
  value: number;
  sliderMax: number;
  max: number;
  step: number;
  accent: 'indigo' | 'amber';
  onCommit: (value: number) => void;
}> = ({ id, value, sliderMax, max, step, accent, onCommit }) => (
  <div className="flex items-center gap-3">
    <input
      id={`${id}-slider`}
      type="range"
      min="0"
      max={sliderMax}
      step={step}
      value={Math.min(value, sliderMax)}
      onChange={(e) => onCommit(Number(e.target.value))}
      aria-label="Ajuste rápido"
      className={`w-full range-touch cursor-pointer ${accent === 'amber' ? 'accent-amber-400' : 'accent-indigo-400'}`}
    />
    <div className="w-28 sm:w-24 shrink-0 relative">
      <DraftNumberInput
        id={id}
        inputMode="decimal"
        min="0"
        max={max}
        step={step}
        value={value}
        onCommit={onCommit}
        className={`w-full tap-field pl-2.5 pr-11 sm:pr-10 py-2 bg-bg border border-line rounded-xl text-xs font-mono text-center text-white focus:outline-none ${
          accent === 'amber' ? 'focus:border-amber-500' : 'focus:border-indigo-500'
        }`}
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] sm:text-[10px] text-slate-400">
        % a.a.
      </span>
    </div>
  </div>
);

export const IndependenceForm: React.FC<IndependenceFormProps> = ({
  params,
  onChange,
  onReset,
  marketRates,
  ratesAreLive,
}) => {
  const currentIpca = round2(marketRates.ipca);
  const realRate = annualRealRate(params.annualReturn, params.annualInflation);

  return (
    <div className="rounded-2xl bg-surface border border-line p-5 sm:p-7 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line-soft">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Seu ponto de partida
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            O resultado se atualiza enquanto você digita. Valores em reais de hoje.
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 tap-target px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-line border border-line-strong text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Restaurar padrões
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {/* 1. Renda desejada */}
        <div className="space-y-2">
          <FieldLabel
            htmlFor="income-goal-input"
            hint="Quanto você quer receber por mês quando parar de depender do salário, com o poder de compra de hoje"
          >
            Renda mensal desejada
          </FieldLabel>
          <MoneyInput
            id="income-goal-input"
            min={PARAM_LIMITS.monthlyIncomeGoal.min}
            step={500}
            value={params.monthlyIncomeGoal}
            onCommit={(v) => onChange({ monthlyIncomeGoal: v })}
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[5000, 10000, 20000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ monthlyIncomeGoal: val })}
                className={chipClass(params.monthlyIncomeGoal === val)}
              >
                {shortMoney(val)}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Patrimônio atual */}
        <div className="space-y-2">
          <FieldLabel
            htmlFor="current-wealth-input"
            hint="Tudo o que você já tem investido e vai destinar à independência financeira"
          >
            Quanto já tenho investido
          </FieldLabel>
          <MoneyInput
            id="current-wealth-input"
            min={0}
            step={1000}
            value={params.currentWealth}
            onCommit={(v) => onChange({ currentWealth: v })}
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[0, 50000, 200000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ currentWealth: val })}
                className={chipClass(params.currentWealth === val)}
              >
                {shortMoney(val)}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Aporte mensal */}
        <div className="space-y-2">
          <FieldLabel
            htmlFor="monthly-contribution-input"
            hint="Quanto você consegue investir todo mês a partir de agora"
          >
            Quanto consigo aportar por mês
          </FieldLabel>
          <MoneyInput
            id="monthly-contribution-input"
            min={0}
            step={100}
            value={params.monthlyContribution}
            onCommit={(v) => onChange({ monthlyContribution: v })}
          />
          <label className="tap-field flex items-center gap-2 pt-1 text-[12px] sm:text-[11px] text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={params.contributionFollowsInflation}
              onChange={(e) => onChange({ contributionFollowsInflation: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
            Reajustar o aporte pela inflação todo ano
          </label>
        </div>

        {/* 4. Rentabilidade */}
        <div className="space-y-2">
          <FieldLabel
            htmlFor="annual-return-input"
            hint="Rentabilidade média anual esperada da carteira, antes da inflação"
          >
            Rentabilidade esperada
          </FieldLabel>
          <RateInput
            id="annual-return-input"
            value={params.annualReturn}
            sliderMax={20}
            max={PARAM_LIMITS.annualReturn.max}
            step={0.5}
            accent="indigo"
            onCommit={(v) => onChange({ annualReturn: v })}
          />
          <p className="text-[12px] sm:text-[11px] text-slate-400 leading-relaxed">
            Referência: CDI {formatPercent(marketRates.cdi)} a.a. e IPCA {formatPercent(marketRates.ipca)} em 12
            meses
            {ratesAreLive ? ' (Banco Central).' : ` (valores de ${REFERENCE_DATE}).`} Acima da inflação, você ganha{' '}
            <span className={`font-mono font-semibold ${realRate > 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
              {formatPercent(realRate)} a.a.
            </span>{' '}
            reais ({formatNumber(monthlyEquivalentRate(realRate) * 100, 4)}% ao mês).
          </p>
        </div>

        {/* 5. Inflação */}
        <div className="space-y-2">
          <FieldLabel
            htmlFor="annual-inflation-input"
            hint="Inflação média esperada. Serve para manter a renda e o patrimônio em poder de compra de hoje"
          >
            Inflação esperada
          </FieldLabel>
          <RateInput
            id="annual-inflation-input"
            value={params.annualInflation}
            sliderMax={15}
            max={PARAM_LIMITS.annualInflation.max}
            step={0.5}
            accent="amber"
            onCommit={(v) => onChange({ annualInflation: v })}
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[3, 4.5, currentIpca].map((inf, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange({ annualInflation: inf })}
                title={
                  index === 0
                    ? 'Centro da meta de inflação do Banco Central'
                    : index === 2
                      ? 'IPCA acumulado nos últimos 12 meses (IBGE, via BCB)'
                      : undefined
                }
                className={`text-[12px] sm:text-[11px] tap-target px-2 py-1 rounded-lg border transition-all ${
                  params.annualInflation === inf
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                    : 'bg-surface-2 border-line text-slate-400 hover:text-slate-200'
                }`}
              >
                {index === 0 ? 'Meta BC (3%)' : index === 2 ? `IPCA 12m (${formatPercent(inf)})` : formatPercent(inf, 1)}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Idade */}
        <div className="space-y-2">
          <FieldLabel htmlFor="current-age-input" hint="Serve para dizer com que idade você chega lá">
            Sua idade hoje
          </FieldLabel>
          <div className="relative">
            <DraftNumberInput
              id="current-age-input"
              inputMode="numeric"
              min={PARAM_LIMITS.currentAge.min}
              max={PARAM_LIMITS.currentAge.max}
              step={1}
              value={params.currentAge}
              onCommit={(v) => onChange({ currentAge: v })}
              className="w-full tap-field pl-3.5 pr-14 py-2.5 bg-bg border border-line focus:border-indigo-500 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">anos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
