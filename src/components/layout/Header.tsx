import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Share2,
  Check,
  Menu,
  TrendingUp,
  Activity,
  DollarSign
} from 'lucide-react';
import { EXPECTED_INDICATORS } from '../../shared/lib/economicApi';
import { useEconomicData } from '../../app/providers/EconomicDataProvider';
import { useModals } from '../../app/providers/ModalsProvider';
import { useActiveTool } from '../../app/useActiveTool';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const { indicators, liveCount, hasFetched, isLoading, refresh } = useEconomicData();
  const { openPix } = useModals();
  const activeTool = useActiveTool();

  const sourceStatus = !hasFetched
    ? { text: 'Consultando as fontes oficiais…', dot: 'bg-slate-500', color: 'text-slate-400' }
    : liveCount === EXPECTED_INDICATORS
      ? { text: 'Indicadores atualizados', dot: 'bg-emerald-500', color: 'text-emerald-400' }
      : liveCount === 0
        ? { text: 'Sem conexão com as fontes · valores de referência', dot: 'bg-amber-500', color: 'text-amber-400' }
        : { text: `${liveCount} de ${EXPECTED_INDICATORS} fontes atualizadas`, dot: 'bg-amber-500', color: 'text-amber-400' };

  // Nas ferramentas, a URL carrega os campos preenchidos (useShareableParams):
  // o link reabre a mesma simulação.
  const shareTitle = activeTool ? 'Compartilhar esta simulação' : 'Compartilhar o CheckFinance';

  const handleShare = async () => {
    const url = window.location.href;
    // No celular, o menu nativo (WhatsApp, Telegram…) é o caminho natural. No
    // desktop o menu do sistema é pouco útil; lá o link vai para a área de transferência.
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch (err) {
        // Fechar o menu sem escolher nada não é erro.
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch (err) {
        console.error('Error copying link', err);
      }
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-line-soft bg-bg/85 backdrop-blur-xl">
      {/* Upper Economic Ticker Bar (inspired by Quantix ticker bar) */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 bg-bg-deep border-b border-surface-2 text-xs">
        <div className="flex items-center gap-6 overflow-x-auto py-0.5 scrollbar-none">
          <span className="flex items-center gap-1.5 text-slate-400 font-semibold text-caption shrink-0">
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
              <span className="text-slate-400 font-medium text-caption">{ind.name}</span>
              <span className="text-slate-200 font-mono font-semibold text-caption">{ind.value}</span>
              {ind.status === 'reference' ? (
                <span className="text-caption font-medium text-amber-400">
                  ref. {ind.asOf.replace(/^(\d{2}\/\d{2})\/\d{4}$/, '$1')}
                </span>
              ) : (
                ind.change && (
                  <span
                    className={`text-caption font-medium ${
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

        <div className="flex items-center gap-3 text-caption text-slate-400 shrink-0">
          <span className={`flex items-center gap-1.5 font-medium ${sourceStatus.color}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${sourceStatus.dot}`} />
            <span>{sourceStatus.text}</span>
          </span>
          <button
            onClick={refresh}
            disabled={isLoading}
            title="Atualizar cotações do Banco Central"
            className="text-slate-400 hover:text-slate-200 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Atualizando...' : '↻ Atualizar'}
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-6 lg:px-8 h-16">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        {/* `min-w-0` é o que permite o filho encolher: sem isso um item flex tem
            largura mínima igual ao conteúdo, e o `truncate` abaixo nunca corta. */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* `md:hidden` acompanha o drawer que este botão abre, que também é
              `md:hidden`. Com `lg:hidden` o botão aparecia entre 768px e 1023px
              e o clique não fazia nada. */}
          <button
            onClick={onOpenMobileMenu}
            aria-label="Abrir menu mobile"
            className="p-3 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav aria-label="Trilha de navegação" className="flex items-center gap-2 text-xs sm:text-sm font-medium min-w-0">
            <Link
              to="/"
              className="tap-target text-slate-400 hover:text-slate-200 transition-colors gap-1.5 shrink-0 whitespace-nowrap"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Início
            </Link>
            {/* No celular fica só "Início": o nome da ferramenta já é o <h1> logo
                abaixo, e era ele que empurrava as ações para fora da tela. O nó
                BreadcrumbList do JSON-LD não depende desta marcação e segue completo. */}
            {activeTool && (
              <span className="hidden sm:flex items-center gap-2 min-w-0">
                <span className="text-slate-600">/</span>
                <span className="text-slate-200 font-semibold truncate">
                  {activeTool.label}
                </span>
              </span>
            )}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <ThemeToggle />

          {/* Share Button */}
          <button
            id="share-btn"
            onClick={handleShare}
            title={shareTitle}
            className="flex items-center justify-center gap-1.5 min-h-11 min-w-11 md:min-h-0 md:min-w-0 px-3 py-1.5 rounded-xl bg-surface hover:bg-line-soft border border-line text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {/* Escondido no celular como o rótulo "Compartilhar": o texto fazia o
                    botão saltar de 44px para 119px por 2,5s, comprimindo a trilha de
                    navegação a ponto de "Início" sumir da tela. O check já comunica. */}
                <span className="hidden sm:inline text-emerald-400">
                  {activeTool ? 'Link da simulação copiado!' : 'Link copiado!'}
                </span>
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
            onClick={openPix}
            className="flex items-center justify-center gap-1.5 min-h-11 min-w-11 md:min-h-0 md:min-w-0 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-on-accent text-xs font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer shrink-0"
          >
            <Heart className="w-3.5 h-3.5 fill-on-accent text-on-accent" />
            {/* Nos celulares estreitos o rótulo encolhe para caber o botão de tema
                sem cortar o "Início": "Apoiar" abaixo de 400px, só o coração abaixo
                de 340px. `sr-only`, e não `hidden`, mantém o nome para leitor de tela. */}
            <span className="max-[339px]:sr-only">
              Apoiar<span className="max-[399px]:sr-only"> (PIX)</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
