import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { ACTIVE_TOOLS } from '../../config/tools.data';
import { TOOL_ICONS } from '../../config/tools.tsx';
import { Seo } from '../../shared/seo/Seo';

export const NotFoundPage: React.FC = () => {
  const { pathname } = useLocation();

  return (
  <div className="max-w-2xl mx-auto py-12 text-center">
    <Seo
      title="Página não encontrada | CheckFinance"
      description="O endereço acessado não existe no CheckFinance. Veja as calculadoras financeiras disponíveis."
      path={pathname}
      noIndex
    />
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-2 border border-line mb-5">
      <Compass className="w-6 h-6 text-slate-400" />
    </div>

    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Erro 404</p>
    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
      Esta página não existe
    </h1>
    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
      O endereço pode ter mudado ou o link estar incompleto. As calculadoras disponíveis estão
      logo abaixo.
    </p>

    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
      {ACTIVE_TOOLS.map((tool) => {
        const Icon = TOOL_ICONS[tool.id];

        return (
          <Link
            key={tool.id}
            to={tool.path}
            className="group flex items-center gap-3 p-4 rounded-2xl bg-surface border border-line hover:border-line-strong transition-all"
          >
            <Icon className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="flex-1 text-sm font-semibold text-white">{tool.shortLabel}</span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
          </Link>
        );
      })}
    </div>

    <Link
      to="/"
      className="inline-block mt-6 text-xs font-medium text-emerald-400 hover:underline"
    >
      Voltar para o início
    </Link>
  </div>
  );
};
