import React from 'react';
import {
  TrendingUp,
  Heart,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { TOOLS, getTool, type ToolId } from '../../config/tools.data';
import { ACCENT_CLASSES, TOOL_ICONS } from '../../config/tools.tsx';

interface AppSidebarProps {
  activeTab: ToolId;
  setActiveTab: (tab: ToolId) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenPix: () => void;
  onOpenComingSoon: (toolId: ToolId) => void;
  onOpenMethodology: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  onOpenPix,
  onOpenComingSoon,
  onOpenMethodology,
}) => {
  const activeTool = getTool(activeTab);

  return (
    <aside
      id="app-sidebar"
      className={`relative z-30 flex flex-col border-r border-[#1c2230] bg-[#0c0e15]/95 backdrop-blur-xl transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      } shrink-0 h-screen sticky top-0`}
    >
      {/* Top Header / Logo */}
      <div className="flex items-center justify-between p-5 border-b border-[#1a1f2c]">
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 shrink-0">
            <TrendingUp className="w-5 h-5 text-slate-950" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-bold tracking-tight text-white truncate flex items-center gap-1.5">
                CheckFinance
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <span className="text-[11px] font-medium text-slate-400 tracking-wide">
                Hub Financeiro Público
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            id="toggle-sidebar-btn"
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
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#161a26] to-[#121520] border border-[#212738] relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                Simulador Ativo
              </span>
            </div>
            <div className="text-sm font-semibold text-white">
              {activeTool.shortLabel}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {activeTool.description}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {/* Ferramentas */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[11px] font-semibold text-slate-300 tracking-wider">
              FERRAMENTAS
            </div>
          )}
          <nav className="space-y-1">
            {TOOLS.map((tool) => {
              const Icon = TOOL_ICONS[tool.id];
              const accent = ACCENT_CLASSES[tool.accent];
              const isComingSoon = tool.status === 'em-breve';
              const isActive = !isComingSoon && activeTab === tool.id;

              return (
                <button
                  key={tool.id}
                  id={`nav-${tool.id}-btn`}
                  onClick={() => (isComingSoon ? onOpenComingSoon(tool.id) : setActiveTab(tool.id))}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-white/10 to-white/5 border border-white/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isComingSoon ? accent.idleIcon : isActive ? accent.activeIcon : 'text-slate-400'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{tool.shortLabel}</span>
                  )}
                  {!isCollapsed && isComingSoon && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                      Em breve
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <span className={`w-1.5 h-5 rounded-full absolute left-0 ${accent.indicator}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Informações & Apoio */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[11px] font-semibold text-slate-300 tracking-wider">
              APOIO & SOBRE
            </div>
          )}
          <nav className="space-y-1">
            <button
              id="nav-pix-btn"
              onClick={onOpenPix}
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

            <button
              id="nav-methodology-btn"
              onClick={onOpenMethodology}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] transition-all"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              {!isCollapsed && (
                <span className="truncate flex-1 text-left">Fórmulas & Metodologia</span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Footer / Transparency Card */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[#1a1f2c] bg-[#090b10]/80">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Gratuito, Seguro & Sem Login</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex justify-between items-center">
            <span>v1.0 MVP • pt-BR</span>
            <button 
              onClick={onOpenPix}
              className="text-emerald-400 hover:underline cursor-pointer font-medium"
            >
              Doe via PIX
            </button>
          </div>
        </div>
      )}

      {/* Button to expand when collapsed */}
      {isCollapsed && (
        <div className="p-3 border-t border-[#1a1f2c] flex justify-center">
          <button
            id="expand-sidebar-btn"
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
