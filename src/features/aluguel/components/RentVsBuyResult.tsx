import React from 'react';
import { Info, Target } from 'lucide-react';
import type { RentVsBuyParams, RentVsBuySummary } from '../../../types';
import { formatBRL, formatCompactBRL, formatPercent } from '../../../shared/lib/format';
import { BasisToggle, type ValueBasis } from '../../../shared/components/BasisToggle';

interface RentVsBuyResultProps {
  summary: RentVsBuySummary;
  params: RentVsBuyParams;
  breakEven: number | 'always' | 'never';
  basis: ValueBasis;
  onBasisChange: (basis: ValueBasis) => void;
}

const Stat: React.FC<{ label: string; value: string; detail: string; valueClass: string }> = ({
  label,
  value,
  detail,
  valueClass,
}) => (
  <div className="p-4 rounded-xl bg-bg/60 border border-line">
    <div className="text-caption font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
    <div className={`text-lg sm:text-xl font-extrabold font-mono mt-1 ${valueClass}`}>{value}</div>
    <div className="text-caption text-slate-400 mt-0.5">{detail}</div>
  </div>
);

const yearsLabel = (years: number) => (years === 1 ? '1 ano' : `${years} anos`);

export const RentVsBuyResult: React.FC<RentVsBuyResultProps> = ({ summary, params, breakEven, basis, onBasisChange }) => {
  const real = basis === 'real';
  const last = summary.yearly[summary.yearly.length - 1];
  const buy = real ? last.buyReal : last.buyNominal;
  const rent = real ? last.rentReal : last.rentNominal;
  const difference = Math.abs(buy - rent);
  const horizon = yearsLabel(params.years);
  const basisLabel = real ? 'em valores de hoje' : 'em valores nominais';

  // Custo do primeiro mês de cada lado: é a diferença que quem gasta menos investe.
  const firstMaintenance = params.propertyValue * (params.maintenanceRate / 100 / 12);
  const firstBuyCost = summary.firstInstallment + firstMaintenance;

  const breakEvenValue =
    breakEven === 'always'
      ? 'Sempre'
      : breakEven === 'never'
        ? 'Nunca'
        : `${formatPercent(breakEven, 1)} a.a.`;
  const breakEvenDetail =
    breakEven === 'always'
      ? 'Comprar vence mesmo com o imóvel perdendo 10% ao ano'
      : breakEven === 'never'
        ? 'Nem com 30% de valorização ao ano comprar vence'
        : `Valorização mínima para comprar compensar. Você usou ${formatPercent(params.propertyAppreciation, 1)}`;

  return (
    <section
      aria-labelledby="resultado-title"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-surface-2 to-bg border border-amber-500/30 p-5 sm:p-7 shadow-xl mb-8"
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Target className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Resultado</div>
            <h2 id="resultado-title" className="text-lg sm:text-2xl font-extrabold text-white leading-snug max-w-3xl">
              {summary.winner === 'tie' ? (
                <>Em {horizon}, comprar e alugar praticamente empatam.</>
              ) : (
                <>
                  Em {horizon},{' '}
                  {summary.winner === 'rent' ? (
                    <span className="text-emerald-300">alugar e investir a diferença</span>
                  ) : (
                    <span className="text-amber-300">comprar</span>
                  )}{' '}
                  deixa você com <span className="text-white">{formatCompactBRL(difference)} a mais</span>,{' '}
                  {basisLabel}.
                </>
              )}
            </h2>
          </div>
        </div>
        <div className="shrink-0 self-start">
          <BasisToggle basis={basis} onChange={onBasisChange} />
        </div>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        <Stat
          label="Patrimônio comprando"
          value={formatBRL(buy)}
          detail="Imóvel menos o saldo devedor, mais o que sobrou para investir"
          valueClass="text-amber-300"
        />
        <Stat
          label="Patrimônio alugando"
          value={formatBRL(rent)}
          detail="Entrada e diferença mensal investidas, líquidas de IR"
          valueClass="text-emerald-300"
        />
        <Stat
          label="Comprar compensa acima de"
          value={breakEvenValue}
          detail={breakEvenDetail}
          valueClass="text-sky-300"
        />
      </div>

      <p className="relative mt-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
        No primeiro mês, comprar custa <strong className="text-amber-300">{formatBRL(firstBuyCost)}</strong> (parcela
        {params.maintenanceRate > 0 ? ' e manutenção' : ''}) e alugar,{' '}
        <strong className="text-emerald-300">{formatBRL(params.monthlyRent)}</strong>. Quem gasta menos investe a
        diferença.{' '}
        {summary.buyAheadFromYear === null ? (
          <>Em {horizon}, o patrimônio de quem compra não passa o de quem aluga.</>
        ) : summary.buyAheadFromYear === 1 ? (
          <>Quem compra fica à frente desde o primeiro ano.</>
        ) : (
          <>
            Quem compra passa à frente a partir do{' '}
            <strong className="text-white">{summary.buyAheadFromYear}º ano</strong>.
          </>
        )}
      </p>

      <p className="relative mt-5 pt-4 border-t border-line-soft flex items-start gap-2 text-caption text-slate-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
        Projeção com taxas constantes. Não inclui seguros do financiamento, FGTS, condomínio, IPTU nem custos de venda
        do imóvel. Não é garantia de resultado nem recomendação de investimento.
      </p>
    </section>
  );
};
