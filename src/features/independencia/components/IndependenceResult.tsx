import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Target, TrendingDown, TrendingUp } from 'lucide-react';
import type { IndependenceParams, IndependenceResult as Result } from '../../../types';
import { formatBRL, formatCompactBRL, formatPercent } from '../../../shared/lib/format';
import { formatDuration, type Sensitivity } from '../lib/calculateIndependence';

export type ValueBasis = 'real' | 'nominal';

interface IndependenceResultProps {
  result: Result;
  params: IndependenceParams;
  basis: ValueBasis;
  onBasisChange: (basis: ValueBasis) => void;
  sensitivity: Sensitivity | null;
}

/**
 * Mês e ano da meta. A página é pré-renderizada no build, então a data de hoje só
 * existe no navegador: calcular no render gravaria a data do build no HTML e
 * descasaria da hidratação. Fica null até o componente montar.
 */
const useTargetDate = (months: number | null): string | null => {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  if (!now || months === null) return null;
  return new Date(now.getFullYear(), now.getMonth() + months, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
};

export const BasisToggle: React.FC<{ basis: ValueBasis; onChange: (basis: ValueBasis) => void }> = ({
  basis,
  onChange,
}) => (
  <div role="group" aria-label="Base dos valores" className="flex items-center rounded-xl bg-bg-deep p-1 border border-line text-xs">
    {(
      [
        ['real', 'Valores de hoje'],
        ['nominal', 'Valores nominais'],
      ] as const
    ).map(([value, label]) => (
      <button
        key={value}
        type="button"
        aria-pressed={basis === value}
        onClick={() => onChange(value)}
        className={`tap-target px-2.5 py-1 rounded-lg transition-all ${
          basis === value ? 'bg-line-soft text-white font-medium' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const Stat: React.FC<{ label: string; value: string; detail: string; valueClass: string }> = ({
  label,
  value,
  detail,
  valueClass,
}) => (
  <div className="p-4 rounded-xl bg-bg/60 border border-line">
    <div className="text-[12px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
    <div className={`text-lg sm:text-xl font-extrabold font-mono mt-1 ${valueClass}`}>{value}</div>
    <div className="text-[12px] sm:text-[11px] text-slate-400 mt-0.5">{detail}</div>
  </div>
);

const Disclaimer: React.FC = () => (
  <p className="mt-5 pt-4 border-t border-line-soft flex items-start gap-2 text-[12px] sm:text-[11px] text-slate-400 leading-relaxed">
    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
    Projeção matemática com rentabilidade e inflação constantes, sem Imposto de Renda nem taxas. Não é garantia de
    resultado nem recomendação de investimento.
  </p>
);

const Problem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-2xl bg-surface border border-amber-500/30 p-5 sm:p-7 shadow-xl mb-8" role="status">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed max-w-2xl">{children}</p>
      </div>
    </div>
    <Disclaimer />
  </div>
);

export const IndependenceResult: React.FC<IndependenceResultProps> = ({
  result,
  params,
  basis,
  onBasisChange,
  sensitivity,
}) => {
  const targetDate = useTargetDate(result.months);

  switch (result.status) {
    case 'no-real-return':
      return (
        <Problem title="Com essa rentabilidade, a meta nunca chega">
          {formatPercent(params.annualReturn)} ao ano não supera a inflação de {formatPercent(params.annualInflation)}
          . Sem ganho real, nenhum patrimônio paga uma renda para sempre sem perder poder de compra. Aumente a
          rentabilidade esperada ou revise a inflação.
        </Problem>
      );
    case 'no-savings':
      return (
        <Problem title="Não há o que acumular">
          Sem patrimônio atual nem aporte mensal, o saldo fica em zero. Informe quanto já tem investido ou quanto
          consegue aportar por mês.
        </Problem>
      );
    case 'over-limit':
      return (
        <Problem title="Levaria mais de 100 anos">
          Com esses valores, o patrimônio necessário de {formatBRL(result.targetReal)} (em valores de hoje) não é
          alcançado em 100 anos. Aumente o aporte, reduza a renda desejada ou revise a rentabilidade.
        </Problem>
      );
  }

  const real = basis === 'real';
  const target = real ? result.targetReal : result.targetNominal;
  const contributed = real ? result.totalContributedReal : result.totalContributedNominal;
  const interest = real ? result.totalInterestReal : result.totalInterestNominal;
  const balance = real ? result.finalBalanceReal : result.finalBalanceNominal;
  const interestShare = balance > 0 ? (interest / balance) * 100 : 0;
  const basisLabel = real ? 'em valores de hoje' : 'em valores da época';
  const months = result.months ?? 0;
  const age = Math.floor(result.ageAtIndependence ?? params.currentAge);

  if (result.status === 'already-reached') {
    return (
      <div className="rounded-2xl bg-surface border border-emerald-500/30 p-5 sm:p-7 shadow-xl mb-8" role="status">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-snug">
              Você já atingiu a independência financeira.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed max-w-2xl">
              Seu patrimônio de {formatBRL(params.currentWealth)} já passa do necessário ({formatBRL(result.targetReal)})
              e sustenta {formatBRL(result.schedule[0].incomeReal)} por mês em valores de hoje, sem perder poder de
              compra — acima dos {formatBRL(params.monthlyIncomeGoal)} desejados.
            </p>
          </div>
        </div>
        <Disclaimer />
      </div>
    );
  }

  const higherReturn = params.annualReturn + 1;
  const lowerReturn = Math.max(0, params.annualReturn - 1);

  return (
    <section
      aria-labelledby="resultado-title"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-surface-2 to-bg border border-indigo-500/30 p-5 sm:p-7 shadow-xl mb-8"
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Target className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
          <div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Resultado</div>
            <h2 id="resultado-title" className="text-lg sm:text-2xl font-extrabold text-white leading-snug max-w-3xl">
              Você atinge a independência financeira aos <span className="text-indigo-300">{age} anos</span>, em{' '}
              <span className="text-indigo-300">{formatDuration(months)}</span>
              {targetDate && <>, em {targetDate}</>}, com{' '}
              <span className="text-indigo-300">{formatCompactBRL(target)}</span> {basisLabel}.
            </h2>
          </div>
        </div>
        <div className="shrink-0 self-start">
          <BasisToggle basis={basis} onChange={onBasisChange} />
        </div>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        <Stat
          label="Patrimônio necessário"
          value={formatBRL(target)}
          detail={`Rende ${formatBRL(real ? params.monthlyIncomeGoal : result.incomeGoalNominal)}/mês preservando o poder de compra`}
          valueClass="text-indigo-300"
        />
        <Stat
          label="Total investido do bolso"
          value={formatBRL(contributed)}
          detail={params.currentWealth > 0 ? 'Patrimônio atual + aportes' : 'Soma dos aportes mensais'}
          valueClass="text-sky-300"
        />
        <Stat
          label={real ? 'Juros acima da inflação' : 'Juros nominais'}
          value={formatBRL(interest)}
          detail={`${formatPercent(interestShare, 0)} do patrimônio final veio dos juros`}
          valueClass="text-emerald-300"
        />
      </div>

      {params.annualInflation > 0 && (
        <p className="relative mt-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          Para manter o padrão de <strong className="text-white">{formatBRL(params.monthlyIncomeGoal)}</strong> de hoje,
          você precisará de <strong className="text-amber-300">{formatBRL(result.incomeGoalNominal)} por mês</strong>{' '}
          daqui a {formatDuration(months)}, com inflação de {formatPercent(params.annualInflation, 1)} ao ano.
        </p>
      )}

      {sensitivity && (
        <div className="relative mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] sm:text-xs">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-slate-300">
            <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Com rentabilidade de {formatPercent(lowerReturn, 1)} a.a.,{' '}
              {sensitivity.lower === null ? (
                <strong className="text-rose-300">a meta deixa de ser atingida.</strong>
              ) : sensitivity.lower === 0 ? (
                <>o prazo não muda.</>
              ) : (
                <>
                  são <strong className="text-rose-300">mais {formatDuration(sensitivity.lower)}</strong>.
                </>
              )}
            </span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-slate-300">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Com rentabilidade de {formatPercent(higherReturn, 1)} a.a.,{' '}
              {sensitivity.higher === null || sensitivity.higher === 0 ? (
                <>o prazo não muda.</>
              ) : (
                <>
                  são <strong className="text-emerald-300">{formatDuration(sensitivity.higher)} a menos</strong>.
                </>
              )}
            </span>
          </div>
        </div>
      )}

      <Disclaimer />
    </section>
  );
};
