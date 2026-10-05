import React from 'react';
import { Home, KeyRound, Percent, RotateCcw, Sliders } from 'lucide-react';
import type { AmortizationSystem, MarketRates, RentVsBuyParams } from '../../../types';
import { formatNumber, formatPercent } from '../../../shared/lib/format';
import { REFERENCE_DATE } from '../../../shared/lib/economicApi';
import { DraftNumberInput } from '../../../shared/components/DraftNumberInput';
import { InfoTip } from '../../../shared/components/InfoTip';
import { PARAM_LIMITS } from '../lib/sanitizeParams';

interface RentVsBuyFormProps {
  params: RentVsBuyParams;
  onChange: (changes: Partial<RentVsBuyParams>) => void;
  onReset: () => void;
  marketRates: MarketRates;
  ratesAreLive: boolean;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const INPUT_BASE =
  'w-full tap-field py-2.5 bg-bg border border-line focus:border-amber-500 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all';

const chipClass = (active: boolean) =>
  `text-caption tap-target px-2 py-1 rounded-lg border transition-all ${
    active
      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
      : 'bg-surface-2 border-line text-slate-400 hover:text-slate-200'
  }`;

const FieldLabel: React.FC<{ htmlFor: string; hint: string; children: string }> = ({
  htmlFor,
  hint,
  children,
}) => (
  <div className="flex items-center gap-1.5">
    <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-300">
      {children}
    </label>
    <InfoTip label={children} text={hint} />
  </div>
);

const MoneyInput: React.FC<{ id: string; value: number; step: number; onCommit: (value: number) => void }> = ({
  id,
  value,
  step,
  onCommit,
}) => (
  <div className="relative">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">R$</span>
    <DraftNumberInput
      id={id}
      inputMode="decimal"
      min={0}
      step={step}
      value={value}
      onCommit={onCommit}
      className={`${INPUT_BASE} pl-10 pr-3`}
    />
  </div>
);

/** Campo numérico com unidade à direita: "% a.a.", "meses", "anos". */
const UnitInput: React.FC<{
  id: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onCommit: (value: number) => void;
}> = ({ id, value, unit, min, max, step, onCommit }) => (
  <div className="relative">
    <DraftNumberInput
      id={id}
      inputMode="decimal"
      min={min}
      max={max}
      step={step}
      value={value}
      onCommit={onCommit}
      // Recuo do tamanho da unidade: "% do valor" é bem mais largo que "anos".
      className={`${INPUT_BASE} pl-3.5 ${unit.length > 6 ? 'pr-24' : 'pr-16'}`}
    />
    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">{unit}</span>
  </div>
);

const Group: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({
  icon: Icon,
  title,
  children,
}) => (
  <fieldset className="space-y-5 min-w-0">
    <legend className="flex items-center gap-2 text-sm font-bold text-white mb-4">
      <Icon className="w-4 h-4 text-amber-400" />
      {title}
    </legend>
    {children}
  </fieldset>
);

const Field: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="space-y-2">{children}</div>;

const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-caption text-slate-400 leading-relaxed">{children}</p>
);

export const RentVsBuyForm: React.FC<RentVsBuyFormProps> = ({
  params,
  onChange,
  onReset,
  marketRates,
  ratesAreLive,
}) => {
  const currentCdi = round2(marketRates.cdi);
  const currentIpca = round2(marketRates.ipca);
  const downShare = params.propertyValue > 0 ? (params.downPayment / params.propertyValue) * 100 : 0;
  const rentShare = params.propertyValue > 0 ? (params.monthlyRent / params.propertyValue) * 100 : 0;
  const source = ratesAreLive ? 'Banco Central' : `valores de ${REFERENCE_DATE}`;

  return (
    <div className="rounded-2xl bg-surface border border-line p-5 sm:p-7 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line-soft">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            Suas premissas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">O resultado se atualiza enquanto você digita.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        <Group icon={Home} title="Comprar financiado">
          <Field>
            <FieldLabel htmlFor="rvb-property" hint="Preço de compra do imóvel">
              Valor do imóvel
            </FieldLabel>
            <MoneyInput
              id="rvb-property"
              step={10000}
              value={params.propertyValue}
              onCommit={(v) => onChange({ propertyValue: v })}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="rvb-down" hint="Quanto você paga à vista; o restante é financiado">
              Entrada
            </FieldLabel>
            <MoneyInput
              id="rvb-down"
              step={5000}
              value={params.downPayment}
              onCommit={(v) => onChange({ downPayment: v })}
            />
            <Note>{formatPercent(downShare, 0)} do imóvel. Os bancos costumam exigir ao menos 20%.</Note>
          </Field>

          {/* Lado a lado só onde a coluna é larga: nas três colunas do desktop o valor cortava. */}
          <div className="grid grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-3 lg:gap-5 2xl:gap-3">
            <Field>
              <FieldLabel htmlFor="rvb-rate" hint="Taxa de juros efetiva anual do financiamento">
                Juros
              </FieldLabel>
              <UnitInput
                id="rvb-rate"
                unit="% a.a."
                min={PARAM_LIMITS.financingRate.min}
                max={PARAM_LIMITS.financingRate.max}
                step={0.1}
                value={params.financingRate}
                onCommit={(v) => onChange({ financingRate: v })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="rvb-term" hint="Prazo do financiamento, de 60 a 420 meses">
                Prazo
              </FieldLabel>
              <UnitInput
                id="rvb-term"
                unit="meses"
                min={PARAM_LIMITS.termMonths.min}
                max={PARAM_LIMITS.termMonths.max}
                step={12}
                value={params.termMonths}
                onCommit={(v) => onChange({ termMonths: v })}
              />
            </Field>
          </div>

          <div role="group" aria-label="Sistema de amortização" className="flex bg-bg-deep p-1 rounded-xl border border-line">
            {(['SAC', 'PRICE'] as AmortizationSystem[]).map((sys) => (
              <button
                key={sys}
                type="button"
                aria-pressed={params.amortizationSystem === sys}
                onClick={() => onChange({ amortizationSystem: sys })}
                className={`flex-1 tap-target text-xs font-medium py-2 rounded-lg transition-all ${
                  params.amortizationSystem === sys ? 'bg-line text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {sys === 'SAC' ? 'SAC (decrescente)' : 'PRICE (constante)'}
              </button>
            ))}
          </div>
        </Group>

        <Group icon={Percent} title="O que mais pesa na compra">
          <Field>
            <FieldLabel
              htmlFor="rvb-acquisition"
              hint="ITBI, escritura e registro, pagos no dia da compra. Costumam somar de 3% a 5% do imóvel"
            >
              Custos de aquisição
            </FieldLabel>
            <UnitInput
              id="rvb-acquisition"
              unit="% do valor"
              min={PARAM_LIMITS.acquisitionCostRate.min}
              max={PARAM_LIMITS.acquisitionCostRate.max}
              step={0.5}
              value={params.acquisitionCostRate}
              onCommit={(v) => onChange({ acquisitionCostRate: v })}
            />
          </Field>

          <Field>
            <FieldLabel
              htmlFor="rvb-maintenance"
              hint="Reformas e consertos que ficam por conta do dono, por ano, em % do valor do imóvel"
            >
              Manutenção
            </FieldLabel>
            <UnitInput
              id="rvb-maintenance"
              unit="% a.a."
              min={PARAM_LIMITS.maintenanceRate.min}
              max={PARAM_LIMITS.maintenanceRate.max}
              step={0.1}
              value={params.maintenanceRate}
              onCommit={(v) => onChange({ maintenanceRate: v })}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="rvb-appreciation" hint="Quanto o imóvel valoriza por ano, em média. Pode ser negativo">
              Valorização do imóvel
            </FieldLabel>
            <UnitInput
              id="rvb-appreciation"
              unit="% a.a."
              min={PARAM_LIMITS.propertyAppreciation.min}
              max={PARAM_LIMITS.propertyAppreciation.max}
              step={0.5}
              value={params.propertyAppreciation}
              onCommit={(v) => onChange({ propertyAppreciation: v })}
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onChange({ propertyAppreciation: params.inflation })}
                className={chipClass(params.propertyAppreciation === params.inflation)}
              >
                Igual à inflação
              </button>
            </div>
          </Field>
        </Group>

        <Group icon={KeyRound} title="Alugar e investir">
          <Field>
            <FieldLabel htmlFor="rvb-rent" hint="Aluguel de um imóvel equivalente, hoje">
              Aluguel mensal
            </FieldLabel>
            <MoneyInput
              id="rvb-rent"
              step={100}
              value={params.monthlyRent}
              onCommit={(v) => onChange({ monthlyRent: v })}
            />
            <Note>
              {formatNumber(rentShare, 2)}% do valor do imóvel por mês. Nas capitais, fica em geral entre 0,3% e 0,5%.
            </Note>
          </Field>

          <Field>
            <FieldLabel htmlFor="rvb-rent-adjustment" hint="Reajuste anual do aluguel, em geral pelo IPCA ou IGP-M">
              Reajuste do aluguel
            </FieldLabel>
            <UnitInput
              id="rvb-rent-adjustment"
              unit="% a.a."
              min={PARAM_LIMITS.rentAdjustment.min}
              max={PARAM_LIMITS.rentAdjustment.max}
              step={0.5}
              value={params.rentAdjustment}
              onCommit={(v) => onChange({ rentAdjustment: v })}
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onChange({ rentAdjustment: params.inflation })}
                className={chipClass(params.rentAdjustment === params.inflation)}
              >
                Igual à inflação
              </button>
            </div>
          </Field>

          <Field>
            <FieldLabel
              htmlFor="rvb-return"
              hint="Rentabilidade anual de onde você investiria a entrada e a diferença mensal, antes do IR"
            >
              Rendimento do investimento
            </FieldLabel>
            <UnitInput
              id="rvb-return"
              unit="% a.a."
              min={PARAM_LIMITS.investmentReturn.min}
              max={PARAM_LIMITS.investmentReturn.max}
              step={0.5}
              value={params.investmentReturn}
              onCommit={(v) => onChange({ investmentReturn: v })}
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onChange({ investmentReturn: currentCdi })}
                title={`CDI atual (${source})`}
                className={chipClass(params.investmentReturn === currentCdi)}
              >
                100% do CDI ({formatPercent(currentCdi)})
              </button>
            </div>
            <label className="tap-field flex items-center gap-2 pt-1 text-caption text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={params.taxExempt}
                onChange={(e) => onChange({ taxExempt: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
              Investimento isento de IR (LCI, LCA)
            </label>
          </Field>
        </Group>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-6 border-t border-line-soft">
        <Field>
          <FieldLabel htmlFor="rvb-inflation" hint="Inflação média esperada. Serve para mostrar os valores em dinheiro de hoje">
            Inflação esperada
          </FieldLabel>
          <UnitInput
            id="rvb-inflation"
            unit="% a.a."
            min={PARAM_LIMITS.inflation.min}
            max={PARAM_LIMITS.inflation.max}
            step={0.5}
            value={params.inflation}
            onCommit={(v) => onChange({ inflation: v })}
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[3, currentIpca].map((value, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange({ inflation: value })}
                title={index === 0 ? 'Centro da meta de inflação do Banco Central' : `IPCA de 12 meses (${source})`}
                className={chipClass(params.inflation === value)}
              >
                {index === 0 ? 'Meta BC (3%)' : `IPCA 12m (${formatPercent(value)})`}
              </button>
            ))}
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="rvb-years" hint="Por quantos anos comparar os dois caminhos">
            Comparar por
          </FieldLabel>
          <UnitInput
            id="rvb-years"
            unit="anos"
            min={PARAM_LIMITS.years.min}
            max={PARAM_LIMITS.years.max}
            step={1}
            value={params.years}
            onCommit={(v) => onChange({ years: v })}
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[10, 20, Math.round(params.termMonths / 12)]
              .filter((value, index, all) => all.indexOf(value) === index)
              .map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ years: value })}
                  className={chipClass(params.years === value)}
                >
                  {value === Math.round(params.termMonths / 12) ? `Prazo do financiamento (${value})` : `${value} anos`}
                </button>
              ))}
          </div>
        </Field>
      </div>
    </div>
  );
};
