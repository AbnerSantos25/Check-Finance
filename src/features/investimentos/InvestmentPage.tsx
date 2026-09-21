import React, { useMemo, useState } from 'react';
import { Coins, Heart, HelpCircle, TrendingUp, Zap } from 'lucide-react';
import type { InvestmentParams } from '../../types';
import { formatBRL, formatPercent } from '../../shared/lib/format';
import { useEconomicData } from '../../app/providers/EconomicDataProvider';
import { useModals } from '../../app/providers/ModalsProvider';
import { usePersistentState } from '../../app/providers/FormStateProvider';
import { SummaryCards } from './components/SummaryCards';
import { InvestmentForm } from './components/InvestmentForm';
import { ComparisonCharts } from './components/ComparisonCharts';
import { InvestmentTable } from './components/InvestmentTable';
import { MethodologyModal } from './components/MethodologyModal';
import { calculateInvestment } from './lib/calculateInvestment';
import { sanitizeParams } from './lib/sanitizeParams';
import { DEFAULT_PARAMS } from './defaults';

export const InvestmentPage: React.FC = () => {
  const [params, setParams] = usePersistentState<InvestmentParams>('investimentos', DEFAULT_PARAMS);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const { rates, liveCount, hasFetched } = useEconomicData();

  const summary = useMemo(() => calculateInvestment(params), [params]);

  // Compares the user's deposit adjustment against a fixed deposit (or 5% a.a. when already fixed).
  const adjustmentEffect = useMemo(() => {
    const userAdjusts = params.annualAdjustmentRate > 0;
    const rate = userAdjusts ? params.annualAdjustmentRate : 5;
    const withAdjustment = userAdjusts
      ? summary.finalGrossBalance
      : calculateInvestment({ ...params, annualAdjustmentRate: rate }).finalGrossBalance;
    const fixed = userAdjusts
      ? calculateInvestment({ ...params, annualAdjustmentRate: 0 }).finalGrossBalance
      : summary.finalGrossBalance;
    const increase = fixed > 0 ? (withAdjustment / fixed - 1) * 100 : 0;
    return { userAdjusts, rate, increase };
  }, [params, summary.finalGrossBalance]);

  const handleParamChange = (newValues: Partial<InvestmentParams>) => {
    setParams((prev) => sanitizeParams(prev, newValues));
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Simulação Financeira Ativa
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Calculadora de Investimento a Longo Prazo
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            A ferramenta mais completa do mercado: descubra como aportes com <strong>reajustes anuais</strong>, <strong>juros compostos</strong> e o <strong>desconto da inflação</strong> afetam seu patrimônio real ao longo do tempo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMethodologyOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141824] hover:bg-[#1c2233] border border-[#212738] text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ver Fórmulas & Metodologia</span>
          </button>
        </div>
      </div>

      <SummaryCards summary={summary} years={params.years} taxExempt={params.taxExempt} />

      <InvestmentForm
        params={params}
        onChange={handleParamChange}
        onReset={() => setParams(DEFAULT_PARAMS)}
        marketRates={rates}
        ratesAreLive={hasFetched && liveCount > 0}
      />

      <ComparisonCharts summary={summary} taxExempt={params.taxExempt} />

      <InvestmentTable summary={summary} years={params.years} taxExempt={params.taxExempt} />

      <section className="mt-12 pt-8 border-t border-[#1c2230]">
        <div className="mb-6">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            Conceitos Fundamentais
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Como os Juros Compostos Constróem sua Independência
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#12151e] border border-[#1f2636]">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">
              1. O Tempo é o Maior Fator
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Na fórmula de juros compostos, o tempo está no expoente. No começo, quase todo o patrimônio vem dos seus aportes; com os anos, os juros passam a crescer mais rápido que eles.{' '}
              {summary.interestSurpassesDepositsYear
                ? `No seu cenário, os juros acumulados superam o total aportado no ano ${summary.interestSurpassesDepositsYear}.`
                : 'No seu cenário, os juros acumulados ainda não superam o total aportado dentro do período.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#12151e] border border-[#1f2636]">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">
              2. Reajuste Anual dos Aportes
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manter o mesmo valor de aporte por décadas reduz seu esforço real, porque a inflação corrói esse valor.{' '}
              {adjustmentEffect.userAdjusts
                ? `No seu cenário, reajustar o aporte em ${formatPercent(adjustmentEffect.rate, 1)} ao ano deixa o patrimônio final ${formatPercent(adjustmentEffect.increase, 1)} maior do que manter o aporte fixo.`
                : `No seu cenário, reajustar o aporte em ${formatPercent(adjustmentEffect.rate, 1)} ao ano deixaria o patrimônio final ${formatPercent(adjustmentEffect.increase, 1)} maior.`}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#12151e] border border-[#1f2636]">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">
              3. Viver de Renda Passiva
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Para viver de renda sem empobrecer, saque só o que sobra do rendimento depois do IR e de repor a inflação.{' '}
              {summary.sustainableMonthlyIncomeReal > 0
                ? `No seu cenário, isso dá ${formatBRL(summary.sustainableMonthlyIncomeReal)}/mês em valores de hoje. Sacar o rendimento inteiro (${formatBRL(summary.fullYieldMonthlyNetIncome)}/mês nominais) consumiria o poder de compra do patrimônio.`
                : 'No seu cenário, o rendimento líquido não cobre a inflação: qualquer saque reduz o poder de compra do patrimônio.'}
            </p>
          </div>
        </div>

        <SupportBanner />
      </section>

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        taxExempt={params.taxExempt}
      />
    </>
  );
};

const SupportBanner: React.FC = () => {
  const { openPix } = useModals();

  return (
    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-[#141824] via-[#161d2e] to-[#121622] border border-[#232b3d] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
      <div className="space-y-1 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 text-xs font-semibold">
          <Heart className="w-4 h-4 fill-emerald-400" />
          Gostou da calculadora?
        </div>
        <h3 className="text-lg font-bold text-white">
          Ajude a manter este site no ar e gratuito
        </h3>
        <p className="text-xs text-slate-400 max-w-xl">
          Somos um hub de ferramentas financeiras independente. Sua contribuição via PIX financia novas ferramentas como a Calculadora FIRE e o Simulador de Financiamento.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={openPix}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-2"
        >
          <Heart className="w-4 h-4 fill-slate-950" />
          <span>Fazer Doação PIX</span>
        </button>
      </div>
    </div>
  );
};
