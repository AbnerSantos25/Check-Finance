import React, { useState } from 'react';
import { 
  Heart, 
  Share2, 
  Check, 
  Menu, 
  TrendingUp, 
  Activity,
  DollarSign
} from 'lucide-react';
import { EconomicIndicator } from '../../types';
import { EXPECTED_INDICATORS } from '../../lib/economicApi';

interface HeaderProps {
  onOpenPix: () => void;
  onOpenMobileMenu: () => void;
  indicators: EconomicIndicator[];
  hasFetchedRates: boolean;
  isLoadingRates?: boolean;
  onRefreshRates?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPix,
  onOpenMobileMenu,
  indicators,
  hasFetchedRates,
  isLoadingRates = false,
  onRefreshRates,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const liveCount = indicators.filter((ind) => ind.status === 'live').length;
  const sourceStatus = !hasFetchedRates
    ? { text: 'Consultando as fontes oficiais…', dot: 'bg-slate-500', color: 'text-slate-400' }
    : liveCount === EXPECTED_INDICATORS
      ? { text: 'Indicadores atualizados', dot: 'bg-emerald-500', color: 'text-emerald-400' }
      : liveCount === 0
        ? { text: 'Sem conexão com as fontes · valores de referência', dot: 'bg-amber-500', color: 'text-amber-400' }
        : { text: `${liveCount} de ${EXPECTED_INDICATORS} fontes atualizadas`, dot: 'bg-amber-500', color: 'text-amber-400' };

  const handleShare = async () => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch (err) {
        console.error('Error copying link', err);
      }
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-[#1c2230] bg-[#0c0e15]/85 backdrop-blur-xl">
      {/* Upper Economic Ticker Bar (inspired by Quantix ticker bar) */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 bg-[#090b10] border-b border-[#181d28] text-xs">
        <div className="flex items-center gap-6 overflow-x-auto py-0.5 scrollbar-none">
          <span className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] shrink-0">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Indicadores:
          </span>
          {indicators.map((ind, i) => (
            <div
              key={ind.name}
              className="flex items-center gap-2 shrink-0"
              title={
                ind.status === 'live'
                  ? `${ind.source} · dado de ${ind.asOf}`
                  : `${ind.source} · valor de ${ind.asOf}: fonte indisponível agora`
              }
            >
              <span className="text-slate-400 font-medium text-[11px]">{ind.name}</span>
              <span className="text-slate-200 font-mono font-semibold text-[11px]">{ind.value}</span>
              {ind.status === 'reference' ? (
                <span className="text-[10px] font-medium text-amber-400">
                  ref. {ind.asOf.replace(/^(\d{2}\/\d{2})\/\d{4}$/, '$1')}
                </span>
              ) : (
                ind.change && (
                  <span
                    className={`text-[10px] font-medium ${
                      ind.positive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {ind.change}
                  </span>
                )
              )}
              {i < indicators.length - 1 && (
                <span className="text-slate-700 mx-1">|</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
          <span className={`flex items-center gap-1.5 font-medium ${sourceStatus.color}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${sourceStatus.dot}`} />
            <span>{sourceStatus.text}</span>
          </span>
          {onRefreshRates && (
            <button
              onClick={onRefreshRates}
              disabled={isLoadingRates}
              title="Atualizar cotações do Banco Central"
              className="text-slate-400 hover:text-slate-200 cursor-pointer disabled:opacity-50"
            >
              {isLoadingRates ? 'Atualizando...' : '↻ Atualizar'}
            </button>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Abrir menu mobile"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Início
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-none">
              Calculadora de Investimento a Longo Prazo
            </span>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Share Button */}
          <button
            id="share-btn"
            onClick={handleShare}
            title="Compartilhar simulador"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151924] hover:bg-[#1c2233] border border-[#232a3d] text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Compartilhar</span>
              </>
            )}
          </button>

          {/* PIX Donation Button with subtle glow */}
          <button
            id="header-pix-btn"
            onClick={onOpenPix}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>Apoiar (PIX)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
