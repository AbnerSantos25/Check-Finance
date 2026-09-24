import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { TOOLS } from '../../config/tools.data';
import { useModals } from '../../app/providers/ModalsProvider';

export const Footer: React.FC = () => {
  const { openPix, openComingSoon } = useModals();

  return (
    <footer className="mt-16 border-t border-line-soft bg-bg-deep py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">CheckFinance</span>
          <span>— Hub de Ferramentas Financeiras</span>
        </Link>
        <div className="flex items-center gap-4 text-[11px]">
          {TOOLS.map((tool) =>
            tool.status === 'em-breve' ? (
              <button
                key={tool.id}
                onClick={() => openComingSoon(tool.id)}
                className="hover:text-slate-200 transition-colors"
              >
                {tool.shortLabel}
              </button>
            ) : (
              <Link
                key={tool.id}
                to={tool.path}
                className="hover:text-slate-200 transition-colors"
              >
                {tool.shortLabel}
              </Link>
            )
          )}
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
          © {__BUILD_YEAR__} CheckFinance. Ferramenta de fins educativos e de simulação. Não constitui recomendação de investimento.
        </span>
        <a
          href="https://www.abstecnologiadev.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-slate-200 transition-colors"
        >
          <span>Desenvolvido por</span>
          <span className="flex items-center justify-center rounded p-0.5">
            <img src="/ABS_Tecnologia_Branca.svg" alt="" className="h-4 w-4" />
          </span>
          <span className="font-semibold text-slate-300">ABS Tecnologia</span>
        </a>

        <span className="text-slate-400 font-mono">
          Português (Brasil) • v1.0 MVP
        </span>
      </div>
    </footer>
  );
};
