import React, { useState, useMemo, useEffect } from 'react';
import { AppSidebar } from './components/layout/AppSidebar';
import { Header } from './components/layout/Header';
import { SummaryCards } from './components/calculadora/SummaryCards';
import { InvestmentForm } from './components/calculadora/InvestmentForm';
import { ComparisonCharts } from './components/calculadora/ComparisonCharts';
import { InvestmentTable } from './components/calculadora/InvestmentTable';
import { RealEstateForm } from './components/financiamento/RealEstateForm';
import { RealEstateSummaryCards } from './components/financiamento/RealEstateSummaryCards';
import { RealEstateCharts } from './components/financiamento/RealEstateCharts';
import { RealEstateTable } from './components/financiamento/RealEstateTable';
import { PixModal } from './components/modals/PixModal';
import { ComingSoonModal } from './components/modals/ComingSoonModal';
import { MethodologyModal } from './components/modals/MethodologyModal';
import { InvestmentParams, RealEstateParams } from './types';
import { calculateInvestment, calculateFinancing, formatBRL, formatPercent, sanitizeParams } from './lib/calculations';
import { loadEconomicIndicators, buildReferenceData, EconomicData } from './lib/economicApi';
import { TrendingUp, HelpCircle, Heart } from 'lucide-react';

const DEFAULT_PARAMS: InvestmentParams = {
  initialDeposit: 5000,
  monthlyDeposit: 1000,
  annualAdjustmentRate: 5,
  annualInterestRate: 12,
  annualInflationRate: 4.5,
  years: 30,
  taxExempt: false,
};

const DEFAULT_RE_PARAMS: RealEstateParams = {
  propertyValue: 500000,
  downPayment: 100000,
  annualInterestRate: 9.5,
  termMonths: 360,
  amortizationSystem: 'SAC',
  extraMonthlyAmortization: 0,
};

export default function App() {
  const [params, setParams] = useState<InvestmentParams>(DEFAULT_PARAMS);
  const [reParams, setReParams] = useState<RealEstateParams>(DEFAULT_RE_PARAMS);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calculadora');

  const [economicData, setEconomicData] = useState<EconomicData>(buildReferenceData);
  const [hasFetchedRates, setHasFetchedRates] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  const fetchRates = async (force = false) => {
    setIsLoadingRates(true);
    try {
      setEconomicData(await loadEconomicIndicators({ force }));
    } catch (e) {
      console.error('Failed to load economic indicators', e);
    } finally {
      setHasFetchedRates(true);
      setIsLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Modals state
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [methodologyModalOpen, setMethodologyModalOpen] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState<{
    isOpen: boolean;
    toolName: string;
    description: string;
  }>({
    isOpen: false,
    toolName: '',
    description: '',
  });

  // Calculate results reactively with useMemo
  const summary = useMemo(() => {
    return calculateInvestment(params);
  }, [params]);

  const reSummary = useMemo(() => {
    return calculateFinancing(reParams);
  }, [reParams]);

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

  const handleResetParams = () => {
    setParams(DEFAULT_PARAMS);
  };

  const handleReParamChange = (newValues: Partial<RealEstateParams>) => {
    setReParams((prev) => ({ ...prev, ...newValues }));
  };

  const handleResetReParams = () => {
    setReParams(DEFAULT_RE_PARAMS);
  };

  const handleOpenComingSoon = (toolName: string, description: string) => {
    setComingSoonModal({
      isOpen: true,
      toolName,
      description,
    });
  };

  return (
    <div className="min-h-screen bg-bg text-slate-100 flex flex-row selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* 1. Desktop & Mobile Sidebar */}
      <div className="hidden md:block">
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onOpenPix={() => setPixModalOpen(true)}
          onOpenComingSoon={handleOpenComingSoon}
          onOpenMethodology={() => setMethodologyModalOpen(true)}
          yearsPeriod={params.years}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 h-full">
            <AppSidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              isCollapsed={false}
              setIsCollapsed={() => setIsMobileMenuOpen(false)}
              onOpenPix={() => {
                setIsMobileMenuOpen(false);
                setPixModalOpen(true);
              }}
              onOpenComingSoon={(tool, desc) => {
                setIsMobileMenuOpen(false);
                handleOpenComingSoon(tool, desc);
              }}
              onOpenMethodology={() => {
                setIsMobileMenuOpen(false);
                setMethodologyModalOpen(true);
              }}
              yearsPeriod={params.years}
            />
          </div>
        </div>
      )}

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenPix={() => setPixModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          indicators={economicData.indicators}
          hasFetchedRates={hasFetchedRates}
          isLoadingRates={isLoadingRates}
          onRefreshRates={() => fetchRates(true)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {activeTab === 'calculadora' ? (
            <>
              {/* Main Title & Status Section (Inspired by Live Crypto Updates in reference image) */}
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

                {/* Quick action: Methodology button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMethodologyModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-line-soft border border-line text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ver Fórmulas & Metodologia</span>
                  </button>
                </div>
              </div>

              {/* 3. Summary Metric Cards */}
              <SummaryCards summary={summary} years={params.years} taxExempt={params.taxExempt} />

              {/* 4. Interactive Simulation Form */}
              <InvestmentForm
                params={params}
                onChange={handleParamChange}
                onReset={handleResetParams}
                marketRates={economicData.rates}
                ratesAreLive={hasFetchedRates && economicData.liveCount > 0}
              />

              {/* 5. Responsive Charts (Evolution Area + Donut Breakdown) */}
              <ComparisonCharts summary={summary} taxExempt={params.taxExempt} />

              {/* 6. Yearly Breakdown Table with CSV Export */}
              <InvestmentTable summary={summary} years={params.years} taxExempt={params.taxExempt} />

              {/* 7. Educational & SEO Insights Section */}
              <section className="mt-12 pt-8 border-t border-line-soft">
                <div className="mb-6">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Conceitos Fundamentais
                  </div>
                  <h2 className="text-xl font-extrabold text-white">
                    Como os Juros Compostos Constróem sua Independência
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-2xl bg-surface border border-line">
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

                  <div className="p-5 rounded-2xl bg-surface border border-line">
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

                  <div className="p-5 rounded-2xl bg-surface border border-line">
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

                {/* Banner for Support & Roadmap */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-surface-2 via-surface-2 to-surface border border-line flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
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
                      onClick={() => setPixModalOpen(true)}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 fill-slate-950" />
                      <span>Fazer Doação PIX</span>
                    </button>
                  </div>
                </div>
              </section>
            </>
          ) : activeTab === 'financiamento' ? (
            <>
              {/* REAL ESTATE FINANCING SECTION */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    Simulador Imobiliário
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Financiamento & Amortização Extra
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Descubra o Custo Efetivo Total (CET) do seu imóvel, compare sistemas SAC vs PRICE e calcule o impacto fulminante de amortizações extraordinárias no abatimento de juros e prazo.
                  </p>
                </div>
              </div>

              <RealEstateSummaryCards summary={reSummary} params={reParams} />

              <RealEstateForm
                params={reParams}
                onChange={handleReParamChange}
                onReset={handleResetReParams}
                liveRates={economicData.rates}
              />

              <RealEstateCharts summary={reSummary} params={reParams} />

              <RealEstateTable summary={reSummary} />
            </>
          ) : null}
        </main>

        {/* Global Footer */}
        <footer className="mt-16 border-t border-line-soft bg-bg-deep py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-300">CheckFinance</span>
              <span>— Hub de Ferramentas Financeiras</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <button
                onClick={() => setMethodologyModalOpen(true)}
                className="hover:text-slate-200 transition-colors"
              >
                Metodologia
              </button>
              <button
                onClick={() => handleOpenComingSoon('Calculadora FIRE', 'Descubra sua data de independência financeira.')}
                className="hover:text-slate-200 transition-colors"
              >
                Calculadora FIRE
              </button>
              <button
                onClick={() => handleOpenComingSoon('Simulador de Financiamento', 'Compare amortizações e custo de parcelas.')}
                className="hover:text-slate-200 transition-colors"
              >
                Financiamento Imobiliário
              </button>
              <button
                onClick={() => setPixModalOpen(true)}
                className="text-emerald-400 hover:underline transition-colors font-medium"
              >
                Doação PIX
              </button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-white/5 text-[10px] text-slate-400 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>
              © {new Date().getFullYear()} CheckFinance. Ferramenta de fins educativos e de simulação. Não constitui recomendação de investimento.
            </span>
            <a
              href="https://www.abstecnologiadev.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-slate-200 transition-colors"
            >
              <span>Desenvolvido por</span>
              <span className="flex items-center justify-center rounded bg-white p-0.5">
                <img src="/ABSTecnologiaDev.svg" alt="" className="h-4 w-4" />
              </span>
              <span className="font-semibold text-slate-300">ABS Tecnologia</span>
            </a>
            <span className="text-slate-400 font-mono">
              Português (Brasil) • v1.0 MVP
            </span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {pixModalOpen && <PixModal onClose={() => setPixModalOpen(false)} />}

      {comingSoonModal.isOpen && (
        <ComingSoonModal
          onClose={() => setComingSoonModal((prev) => ({ ...prev, isOpen: false }))}
          toolName={comingSoonModal.toolName}
          description={comingSoonModal.description}
        />
      )}

      {methodologyModalOpen && (
        <MethodologyModal
          onClose={() => setMethodologyModalOpen(false)}
          taxExempt={params.taxExempt}
        />
      )}
    </div>
  );
}
