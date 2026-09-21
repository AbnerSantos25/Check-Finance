import React from 'react';
import { TrendingUp } from 'lucide-react';
import { TOOLS, type ToolId } from '../../config/tools.data';
import { useModals } from '../../app/providers/ModalsProvider';

interface FooterProps {
  onSelectTool: (toolId: ToolId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTool }) => {
  const { openPix, openComingSoon } = useModals();

  return (
    <footer className="mt-16 border-t border-[#1a1f2c] bg-[#080a0f] py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">CheckFinance</span>
          <span>— Hub de Ferramentas Financeiras</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() =>
                tool.status === 'em-breve' ? openComingSoon(tool.id) : onSelectTool(tool.id)
              }
              className="hover:text-slate-200 transition-colors"
            >
              {tool.shortLabel}
            </button>
          ))}
          <button
            onClick={openPix}
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
  );
};
