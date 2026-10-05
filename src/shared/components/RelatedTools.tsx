import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ACTIVE_TOOLS, type ToolId } from '../../config/tools.data';
import { ACCENT_CLASSES, TOOL_ICONS } from '../../config/tools.tsx';
import { trackEvent } from '../lib/analytics';

/**
 * "Outras calculadoras": links entre as ferramentas, no fim de cada uma.
 *
 * Ajuda quem chegou pela busca a achar a próxima conta (de juros compostos para o
 * financiamento, por exemplo) e distribui a relevância entre as páginas. Lê o
 * registry: uma ferramenta nova aparece aqui sem mexer neste componente.
 */
export const RelatedTools: React.FC<{ current: ToolId }> = ({ current }) => {
  const others = ACTIVE_TOOLS.filter((tool) => tool.id !== current);
  if (others.length === 0) return null;

  return (
    <nav aria-labelledby="outras-calculadoras" className="mt-12 pt-8 border-t border-line-soft">
      <h2 id="outras-calculadoras" className="text-xl font-extrabold text-white mb-4">
        Outras calculadoras
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {others.map((tool) => {
          const Icon = TOOL_ICONS[tool.id];
          return (
            <Link
              key={tool.id}
              to={tool.path}
              // Mede se os links internos levam gente de uma calculadora para outra.
              onClick={() => trackEvent('outra_calculadora', { origem: current, destino: tool.id })}
              className={`group flex items-start gap-3 p-4 rounded-2xl bg-surface border border-line transition-all ${ACCENT_CLASSES[tool.accent].cardHover}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${ACCENT_CLASSES[tool.accent].activeIcon}`} aria-hidden="true" />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                  {tool.label}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </span>
                <span className="block text-caption text-slate-400 leading-relaxed mt-1">{tool.description}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
