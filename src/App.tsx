import React, { useState, useMemo, useEffect } from 'react';
import { AppSidebar } from './components/layout/AppSidebar';
import { Header } from './components/layout/Header';
import { SummaryCards } from './components/calculadora/SummaryCards';
import { InvestmentForm } from './components/calculadora/InvestmentForm';
import { ComparisonCharts } from './components/calculadora/ComparisonCharts';
import { InvestmentTable } from './components/calculadora/InvestmentTable';
import { PixModal } from './components/modals/PixModal';
import { ComingSoonModal } from './components/modals/ComingSoonModal';
import { MethodologyModal } from './components/modals/MethodologyModal';
import { InvestmentParams, EconomicIndicator } from './types';
import { calculateInvestment, formatBRL } from './lib/calculations';
import { 
  loadLiveEconomicIndicators, 
  DEFAULT_ECONOMIC_INDICATORS, 
  DEFAULT_RAW_RATES 
} from './lib/economicApi';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle, 
  HelpCircle,
  Coins,
  ArrowRight,
  Zap,
  Info,
  Layers,
  Heart
} from 'lucide-react';

const DEFAULT_PARAMS: InvestmentParams = {
  initialDeposit: 5000,
  monthlyDeposit: 1000,
  annualAdjustmentRate: 5,
  annualInterestRate: 12,
  annualInflationRate: 4.5,
  years: 30,
  taxRate: 15,
};

export default function App() {
  const [params, setParams] = useState<InvestmentParams>(DEFAULT_PARAMS);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calculadora');

  // Economic indicators state
  const [indicators, setIndicators] = useState<EconomicIndicator[]>(DEFAULT_ECONOMIC_INDICATORS);
  const [rawRates, setRawRates] = useState(DEFAULT_RAW_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Fetch live economic rates from BCB & AwesomeAPI on mount
  const fetchRates = async () => {
    setIsLoadingRates(true);
    try {
      const data = await loadLiveEconomicIndicators();
      setIndicators(data.indicators);
      setRawRates(data.rawRates);
    } catch (e) {
      console.error('Failed to load economic indicators', e);
    } finally {
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

  const handleParamChange = (newValues: Partial<InvestmentParams>) => {
    setParams((prev) => ({ ...prev, ...newValues }));
  };

  const handleResetParams = () => {
    setParams(DEFAULT_PARAMS);
  };

  const handleOpenComingSoon = (toolName: string, description: string) => {
    setComingSoonModal({
      isOpen: true,
      toolName,
      description,
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100 flex flex-row selection:bg-emerald-500/30 selection:text-emerald-300">
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
          indicators={indicators}
          isLoadingRates={isLoadingRates}
          onRefreshRates={fetchRates}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141824] hover:bg-[#1c2233] border border-[#212738] text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ver Fórmulas & Metodologia</span>
              </button>
            </div>
          </div>

          {/* 3. Summary Metric Cards */}
          <SummaryCards summary={summary} years={params.years} />

          {/* 4. Interactive Simulation Form */}
          <InvestmentForm
            params={params}
            onChange={handleParamChange}
            onReset={handleResetParams}
            liveRates={rawRates}
          />

          {/* 5. Responsive Charts (Evolution Area + Donut Breakdown) */}
          <ComparisonCharts summary={summary} />

          {/* 6. Yearly Breakdown Table with CSV Export */}
          <InvestmentTable summary={summary} years={params.years} />

          {/* 7. Educational & SEO Insights Section */}
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
                  Na fórmula de juros compostos, o tempo está no expoente. Nos primeiros 5 a 10 anos, a maior parte do patrimônio vem dos seus aportes. Depois de 15 a 20 anos, os juros superam os aportes e geram uma bola de neve imparável.
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
                  Manter o mesmo valor de aporte por 30 anos reduz seu esforço real devido à inflação. Ao aumentar seu aporte em apenas 5% ao ano (acompanhando promoções e dissídios), o patrimônio final chega a dobrar.
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
                  Ao acumular o patrimônio final, você não precisa gastar o capital principal: os rendimentos mensais líquidos ({formatBRL(summary.finalMonthlyNetIncome)}/mês) pagam seu custo de vida perpétuo com margem de segurança.
                </p>
              </div>
            </div>

            {/* Banner for Support & Roadmap */}
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
                  onClick={() => setPixModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-slate-950" />
                  <span>Fazer Doação PIX</span>
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Global Footer */}
        <footer className="mt-16 border-t border-[#1a1f2c] bg-[#080a0f] py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
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
            <span className="text-slate-400 font-mono">
              Português (Brasil) • v1.0 MVP
            </span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <PixModal 
        isOpen={pixModalOpen} 
        onClose={() => setPixModalOpen(false)} 
      />

      <ComingSoonModal
        isOpen={comingSoonModal.isOpen}
        onClose={() => setComingSoonModal((prev) => ({ ...prev, isOpen: false }))}
        toolName={comingSoonModal.toolName}
        description={comingSoonModal.description}
      />

      <MethodologyModal
        isOpen={methodologyModalOpen}
        onClose={() => setMethodologyModalOpen(false)}
      />
    </div>
  );
}
