import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import type { PercentageParams } from '../../../types';
import { formatBRL } from '../../../shared/lib/format';
import { DraftNumberInput } from '../../../shared/components/DraftNumberInput';
import { applyChange, chainChanges, percentChange, percentOf, percentageOfWhole } from '../lib/percentage';
import { formatPct, formatSignedPct, formatValue } from '../lib/format';
import { CHAIN_STEP_KEYS, MAX_CHAIN_STEPS, chainPercents } from '../defaults';

/** Qual das cinco contas a pessoa usou. Vira o parâmetro `modo` do evento no GA4. */
export type PercentMode = 'de' | 'quantos' | 'aumento_desconto' | 'variacao' | 'sucessivos';

interface PercentCalculatorsProps {
  params: PercentageParams;
  onChange: (mode: PercentMode, changes: Partial<PercentageParams>) => void;
}

const INPUT =
  'w-full tap-field py-2.5 bg-bg border border-line focus:border-violet-500 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all';

const NumberField: React.FC<{
  id: string;
  label: string;
  value: number;
  onCommit: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  /** Rótulo só para leitor de tela, quando o contexto visível já diz o que é o campo. */
  hideLabel?: boolean;
}> = ({ id, label, value, onCommit, prefix, suffix, min, max, hideLabel }) => (
  <div className="space-y-1.5 min-w-0">
    <label htmlFor={id} className={hideLabel ? 'sr-only' : 'block text-xs font-semibold text-slate-300'}>
      {label}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400" aria-hidden="true">
          {prefix}
        </span>
      )}
      <DraftNumberInput
        id={id}
        inputMode="decimal"
        step="any"
        min={min}
        max={max}
        value={value}
        onCommit={onCommit}
        className={`${INPUT} ${prefix ? 'pl-10' : 'pl-3.5'} ${suffix ? 'pr-9' : 'pr-3'}`}
      />
      {suffix && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400" aria-hidden="true">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const Card: React.FC<{ id: string; title: string; className?: string; children: React.ReactNode }> = ({
  id,
  title,
  className = '',
  children,
}) => (
  <section aria-labelledby={id} className={`rounded-2xl bg-surface border border-line p-5 shadow-xl ${className}`}>
    <h2 id={id} className="text-base font-bold text-white mb-4">
      {title}
    </h2>
    {children}
  </section>
);

/** Resultado ao vivo. `<output>` é região viva: o leitor de tela anuncia a mudança. */
const Result: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <output
    htmlFor={htmlFor}
    className="block mt-4 rounded-xl bg-bg-deep border border-line px-4 py-3 text-sm text-slate-400 leading-relaxed"
  >
    {children}
  </output>
);

const Big: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="block text-2xl font-extrabold font-mono text-violet-400 break-words">{children}</strong>
);

function chainSummary(totalPercent: number | null): string {
  if (totalPercent === null) return 'Com valor inicial zero, não existe variação percentual.';
  const shown = formatSignedPct(totalPercent);
  if (shown === '0%') return 'Variação total de 0%: as etapas se anulam.';
  return `Variação total de ${shown}: o mesmo que ${totalPercent < 0 ? 'um único desconto' : 'um único aumento'} de ${formatPct(
    Math.abs(Math.round(totalPercent * 100) / 100),
  )}.`;
}

/** −0 conta como desconto: é o que sobra ao escolher "Desconto" numa etapa ainda zerada. */
const isDiscount = (percent: number) => percent < 0 || Object.is(percent, -0);

export const PercentCalculators: React.FC<PercentCalculatorsProps> = ({ params, onChange }) => {
  const of = percentOf(params.ofPercent, params.ofValue);
  const whole = percentageOfWhole(params.partValue, params.wholeValue);
  const increased = applyChange(params.changeValue, params.changePercent);
  const discounted = applyChange(params.changeValue, -params.changePercent);
  const changeAmount = params.changeValue * (params.changePercent / 100);
  const variation = percentChange(params.fromValue, params.toValue);
  const chain = chainChanges(params.chainStart, chainPercents(params));

  const setStep = (index: number, percent: number) => onChange('sucessivos', { [CHAIN_STEP_KEYS[index]]: percent });

  // Tira a etapa e sobe as seguintes: a lista continua sem buracos.
  const removeStep = (index: number) => {
    const steps = CHAIN_STEP_KEYS.map((key) => params[key]);
    steps.splice(index, 1);
    steps.push(0);
    onChange('sucessivos', {
      chainCount: params.chainCount - 1,
      ...Object.fromEntries(CHAIN_STEP_KEYS.map((key, i) => [key, steps[i]])),
    });
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card id="calc-porcentagem-de" title="Quanto é X% de um valor">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="pct-of-percent"
              label="Porcentagem"
              suffix="%"
              value={params.ofPercent}
              onCommit={(ofPercent) => onChange('de', { ofPercent })}
            />
            <NumberField
              id="pct-of-value"
              label="Do valor"
              value={params.ofValue}
              onCommit={(ofValue) => onChange('de', { ofValue })}
            />
          </div>
          <Result htmlFor="pct-of-percent pct-of-value">
            {formatPct(params.ofPercent)} de {formatValue(params.ofValue)} é
            <Big>{formatValue(of)}</Big>
            <span className="font-mono text-xs">
              {formatValue(params.ofValue)} × {formatValue(params.ofPercent)} ÷ 100 = {formatValue(of)}
            </span>
          </Result>
        </Card>

        <Card id="calc-porcentagem-quantos" title="Um número é quantos % de outro">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="pct-part"
              label="Número"
              value={params.partValue}
              onCommit={(partValue) => onChange('quantos', { partValue })}
            />
            <NumberField
              id="pct-whole"
              label="É quantos % de"
              value={params.wholeValue}
              onCommit={(wholeValue) => onChange('quantos', { wholeValue })}
            />
          </div>
          <Result htmlFor="pct-part pct-whole">
            {whole === null ? (
              'O total não pode ser zero: não existe porcentagem de zero.'
            ) : (
              <>
                {formatValue(params.partValue)} de {formatValue(params.wholeValue)} é
                <Big>{formatPct(whole)}</Big>
                <span className="font-mono text-xs">
                  {formatValue(params.partValue)} ÷ {formatValue(params.wholeValue)} × 100 = {formatPct(whole)}
                </span>
              </>
            )}
          </Result>
        </Card>

        <Card id="calc-porcentagem-aumento" title="Aumento e desconto">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="pct-change-value"
              label="Valor"
              prefix="R$"
              value={params.changeValue}
              onCommit={(changeValue) => onChange('aumento_desconto', { changeValue })}
            />
            <NumberField
              id="pct-change-percent"
              label="Percentual"
              suffix="%"
              min={0}
              value={params.changePercent}
              onCommit={(changePercent) => onChange('aumento_desconto', { changePercent })}
            />
          </div>
          <Result htmlFor="pct-change-value pct-change-percent">
            <span className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span>Com aumento de {formatPct(params.changePercent)}</span>
              <span className="font-mono text-xs">+{formatBRL(changeAmount)}</span>
            </span>
            <Big>{formatBRL(increased)}</Big>
            <span className="flex flex-wrap items-baseline justify-between gap-x-3 mt-3">
              <span>Com desconto de {formatPct(params.changePercent)}</span>
              {params.changePercent <= 100 && <span className="font-mono text-xs">−{formatBRL(changeAmount)}</span>}
            </span>
            {params.changePercent <= 100 ? (
              <Big>{formatBRL(discounted)}</Big>
            ) : (
              <span className="block mt-1">Desconto acima de 100% deixaria o valor negativo.</span>
            )}
          </Result>
        </Card>

        <Card id="calc-porcentagem-variacao" title="Variação percentual entre dois valores">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="pct-from"
              label="Valor inicial"
              value={params.fromValue}
              onCommit={(fromValue) => onChange('variacao', { fromValue })}
            />
            <NumberField
              id="pct-to"
              label="Valor final"
              value={params.toValue}
              onCommit={(toValue) => onChange('variacao', { toValue })}
            />
          </div>
          <Result htmlFor="pct-from pct-to">
            {variation === null ? (
              'O valor inicial não pode ser zero: não existe variação percentual a partir de zero.'
            ) : (
              <>
                De {formatValue(params.fromValue)} para {formatValue(params.toValue)}, a variação é de
                <Big>{formatSignedPct(variation)}</Big>
                <span className="font-mono text-xs">
                  ({formatValue(params.toValue)} − {formatValue(params.fromValue)}) ÷ {formatValue(Math.abs(params.fromValue))}{' '}
                  × 100 = {formatSignedPct(variation)}
                </span>
              </>
            )}
          </Result>
        </Card>
      </div>

      <Card id="calc-porcentagem-sucessivos" title="Aumentos e descontos sucessivos">
        <p className="text-xs text-slate-400 leading-relaxed -mt-2 mb-4 max-w-2xl">
          Cada etapa incide sobre o resultado da anterior, então um aumento e um desconto do mesmo percentual não se
          anulam.
        </p>
        <div className="max-w-xs">
          <NumberField
            id="pct-chain-start"
            label="Valor inicial"
            prefix="R$"
            value={params.chainStart}
            onCommit={(chainStart) => onChange('sucessivos', { chainStart })}
          />
        </div>

        <ol className="mt-4 space-y-3">
          {chain.steps.map((step, index) => {
            const key = CHAIN_STEP_KEYS[index];
            const raw = params[key];
            const discount = isDiscount(raw);
            const inputId = `pct-chain-step-${index + 1}`;
            return (
              <li key={key} className="pb-3 border-b border-line-soft last:border-0">
                <div className="flex items-center justify-between gap-3 min-h-8">
                  <span className="text-xs font-semibold text-slate-300">Etapa {index + 1}</span>
                  <span className="flex items-center gap-1 text-sm">
                    <span className="text-slate-400">vira</span>
                    <span className="font-mono font-semibold text-white">{formatBRL(step.value)}</span>
                    {params.chainCount > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        aria-label={`Remover etapa ${index + 1}`}
                        className="tap-target -my-1 ml-1 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-2 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    role="group"
                    aria-label={`Tipo da etapa ${index + 1}`}
                    className="flex shrink-0 rounded-xl bg-bg-deep p-0.5 border border-line"
                  >
                    {([
                      [false, 'Aumento', Plus],
                      [true, 'Desconto', Minus],
                    ] as const).map(([isDown, text, Icon]) => (
                      <button
                        key={text}
                        type="button"
                        aria-pressed={discount === isDown}
                        onClick={() => setStep(index, isDown ? -Math.abs(raw) : Math.abs(raw))}
                        className={`inline-flex items-center gap-1 min-h-10 px-2.5 rounded-lg text-caption font-medium transition-colors cursor-pointer ${
                          discount === isDown ? 'bg-line-soft text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        {text}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 max-w-[8rem]">
                    <NumberField
                      id={inputId}
                      label={`Percentual da etapa ${index + 1}`}
                      hideLabel
                      suffix="%"
                      min={0}
                      max={discount ? 100 : 1000}
                      value={Math.abs(raw)}
                      onCommit={(value) => setStep(index, discount ? -Math.abs(value) : Math.abs(value))}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {params.chainCount < MAX_CHAIN_STEPS && (
          <button
            type="button"
            onClick={() =>
              onChange('sucessivos', { chainCount: params.chainCount + 1, [CHAIN_STEP_KEYS[params.chainCount]]: 0 })
            }
            className="mt-1 inline-flex items-center gap-1.5 tap-target px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-line border border-line-strong text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Adicionar etapa
          </button>
        )}

        <Result htmlFor={['pct-chain-start', ...chain.steps.map((_, i) => `pct-chain-step-${i + 1}`)].join(' ')}>
          De {formatBRL(params.chainStart)} para
          <Big>{formatBRL(chain.final)}</Big>
          {chainSummary(chain.totalPercent)}
        </Result>
      </Card>
    </div>
  );
};
