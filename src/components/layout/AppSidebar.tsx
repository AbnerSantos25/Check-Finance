import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  type LucideIcon,
  TrendingUp,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { BrandMark } from '../ui/BrandMark';
import { TOOLS, type ToolMeta } from '../../config/tools.data';
import { ACCENT_CLASSES, TOOL_ICONS } from '../../config/tools.tsx';
import { useModals } from '../../app/providers/ModalsProvider';

interface AppSidebarProps {
  /** Ferramenta correspondente à URL atual; `null` no hub e no 404. */
  activeTool: ToolMeta | null;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  /** No mobile a sidebar é um drawer, que precisa fechar depois de qualquer ação. */
  onAfterAction?: () => void;
  /**
   * Prefixo dos `id` deste painel.
   *
   * O layout monta a sidebar duas vezes — a fixa do desktop, escondida por CSS, e o
   * drawer do mobile. Com o drawer aberto as duas coexistem no DOM, e sem prefixo os
   * sete `id` apareceriam em dobro: HTML inválido, e leitor de tela e automação
   * passam a resolver o alvo errado.
   */
  idPrefix?: string;
}

const NAV_BASE =
  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all';

/**
 * Altura fixa dos itens de ferramenta e o espaço entre eles. O destaque deslizante
 * se posiciona por essas duas medidas, sem medir o DOM: assim ele sai no lugar
 * certo já no HTML pré-renderizado, antes de qualquer JavaScript.
 */
const TOOL_ITEM_HEIGHT = 'h-10';
const TOOL_ITEM_STEP = '2.75rem'; // h-10 (2.5rem) + gap-1 (0.25rem)

/**
 * Ferramenta publicada: é um link de verdade, não um botão. Crawlers seguem o
 * href, e o usuário pode abrir em nova aba ou copiar o endereço.
 */
const TabNavItem: React.FC<{
  id: string;
  to: string;
  icon: LucideIcon;
  label: string;
  accentIcon: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ id, to, icon: Icon, label, accentIcon, isActive, isCollapsed, onClick }) => (
  // O fundo do item ativo não é pintado aqui: quem pinta é o destaque deslizante do
  // <nav>. O item cuida só da cor do texto e do ícone.
  <Link
    id={id}
    to={to}
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
    className={`${NAV_BASE} ${TOOL_ITEM_HEIGHT} relative ${isActive
      ? 'text-white'
      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
      }`}
  >
    <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? accentIcon : 'text-slate-400'}`} />
    {!isCollapsed && <span className="truncate flex-1 text-left">{label}</span>}
  </Link>
);

/**
 * Fundo e barrinha colorida do item ativo, desenhados uma vez só e deslizando até
 * o item da ferramenta atual. No hub e no 404 some no lugar em que estava, em vez
 * de voltar ao topo.
 */
const ActiveToolHighlight: React.FC<{
  index: number;
  visible: boolean;
  marker: string;
  isCollapsed: boolean;
}> = ({ index, visible, marker, isCollapsed }) => (
  <span
    aria-hidden="true"
    className={`${TOOL_ITEM_HEIGHT} absolute inset-x-0 top-0 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10 pointer-events-none transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
      visible ? 'opacity-100' : 'opacity-0'
    }`}
    style={{ transform: `translateY(calc(${index} * ${TOOL_ITEM_STEP}))` }}
  >
    {!isCollapsed && (
      <span
        className={`w-1.5 h-5 rounded-full absolute left-0 top-1/2 -translate-y-1/2 transition-colors duration-300 motion-reduce:transition-none ${marker}`}
      />
    )}
  </span>
);

const ComingSoonNavItem: React.FC<{
  id: string;
  icon: LucideIcon;
  iconClass: string;
  label: string;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ id, icon: Icon, iconClass, label, isCollapsed, onClick }) => (
  <button
    id={id}
    onClick={onClick}
    className={`${NAV_BASE} ${TOOL_ITEM_HEIGHT} text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] group`}
  >
    <Icon className={`w-4 h-4 ${iconClass}`} />
    {!isCollapsed && (
      <>
        <span className="truncate flex-1 text-left">{label}</span>
        <span className="text-[12px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
          Em breve
        </span>
      </>
    )}
  </button>
);

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTool,
  isCollapsed,
  setIsCollapsed,
  onAfterAction,
  idPrefix = '',
}) => {
  const { openPix, openComingSoon } = useModals();

  // Sem ferramenta ativa, o destaque fica no último item em que esteve e só some:
  // voltar ao índice 0 o faria deslizar até o topo enquanto desaparece, e perder a
  // cor apagaria a barrinha de uma vez em vez de acompanhar o fade.
  const activeIndex = TOOLS.findIndex((tool) => tool.id === activeTool?.id);
  const lastIndex = useRef(Math.max(activeIndex, 0));
  const lastMarker = useRef(ACCENT_CLASSES[TOOLS[lastIndex.current].accent].indicator);
  if (activeIndex >= 0) {
    lastIndex.current = activeIndex;
    lastMarker.current = ACCENT_CLASSES[TOOLS[activeIndex].accent].indicator;
  }

  const act = (action: () => void) => {
    action();
    onAfterAction?.();
  };

  return (
    <aside
      id={`${idPrefix}app-sidebar`}
      className={`relative z-30 flex flex-col border-r border-line-soft bg-bg/95 backdrop-blur-xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'
        } shrink-0 h-screen sticky top-0`}
    >
      {/* Top Header / Logo */}
      <div className="flex items-center justify-between p-5 border-b border-line-soft">
        <Link
          to="/"
          onClick={() => onAfterAction?.()}
          aria-label="Ir para o início"
          className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}
        >
          <BrandMark icon={TrendingUp} />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-bold tracking-tight text-white truncate flex items-center gap-1.5">
                CheckFinance
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <span className="text-[12px] sm:text-[11px] font-medium text-slate-400 tracking-wide">
                Hub Financeiro Público
              </span>
            </div>
          )}
        </Link>

        {!isCollapsed && (
          <button
            id={`${idPrefix}toggle-sidebar-btn`}
            onClick={() => setIsCollapsed(true)}
            aria-label="Recolher menu lateral"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile/Context Card (like "Welcome Back" in Quantix) */}
      {!isCollapsed && (
        <div className="px-5 pt-5 pb-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-surface-2 to-surface border border-line relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                {activeTool ? 'Simulador Ativo' : 'Nenhuma ferramenta aberta'}
              </span>
            </div>
            <div className="text-sm font-semibold text-white">
              {activeTool ? activeTool.shortLabel : 'Todas as ferramentas'}
            </div>
            <p className="text-[12px] sm:text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {activeTool
                ? activeTool.description
                : 'Selecione uma calculadora na lista abaixo para começar a simular.'}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {/* Ferramentas */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[12px] sm:text-[11px] font-semibold text-slate-300 tracking-wider">
              FERRAMENTAS
            </div>
          )}
          <nav className="relative flex flex-col gap-1">
            <ActiveToolHighlight
              index={lastIndex.current}
              visible={activeIndex >= 0}
              marker={lastMarker.current}
              isCollapsed={isCollapsed}
            />
            {TOOLS.map((tool) => {
              const Icon = TOOL_ICONS[tool.id];
              const accent = ACCENT_CLASSES[tool.accent];

              return tool.status === 'em-breve' ? (
                <ComingSoonNavItem
                  key={tool.id}
                  id={`${idPrefix}nav-${tool.id}-btn`}
                  icon={Icon}
                  iconClass={accent.idleIcon}
                  label={tool.shortLabel}
                  isCollapsed={isCollapsed}
                  onClick={() => act(() => openComingSoon(tool.id))}
                />
              ) : (
                <TabNavItem
                  key={tool.id}
                  id={`${idPrefix}nav-${tool.id}-btn`}
                  to={tool.path}
                  icon={Icon}
                  label={tool.shortLabel}
                  accentIcon={accent.activeIcon}
                  isActive={activeTool?.id === tool.id}
                  isCollapsed={isCollapsed}
                  onClick={() => onAfterAction?.()}
                />
              );
            })}
          </nav>
        </div>

        {/* Informações & Apoio */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[12px] sm:text-[11px] font-semibold text-slate-300 tracking-wider">
              APOIO & SOBRE
            </div>
          )}
          <nav className="space-y-1">
            <button
              id={`${idPrefix}nav-pix-btn`}
              onClick={() => act(openPix)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all group border border-emerald-500/20"
            >
              <Heart className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform fill-emerald-500/20" />
              {!isCollapsed && (
                <span className="truncate flex-1 text-left font-semibold">Apoiar Projeto (PIX)</span>
              )}
              {!isCollapsed && (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400/70" />
              )}
            </button>

          </nav>
        </div>
      </div>

      {/* Bottom Footer / Transparency Card */}
      {!isCollapsed && (
        <div className="p-4 border-t border-line-soft bg-bg-deep/80">
          <div className="flex items-center gap-2 text-[12px] sm:text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Gratuito, Seguro & Sem Login</span>
          </div>
          <div className="mt-2 text-[12px] sm:text-[10px] text-slate-400 flex justify-between items-center">
            <span>v1.0 MVP • pt-BR</span>
            <button
              onClick={() => act(openPix)}
              className="text-emerald-400 hover:underline cursor-pointer font-medium"
            >
              Doe via PIX
            </button>
          </div>
        </div>
      )}

      {/* Button to expand when collapsed */}
      {isCollapsed && (
        <div className="p-3 border-t border-line-soft flex justify-center">
          <button
            id={`${idPrefix}expand-sidebar-btn`}
            onClick={() => setIsCollapsed(false)}
            aria-label="Expandir menu lateral"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
};
