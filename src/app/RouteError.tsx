import React from 'react';
import { useRouteError } from 'react-router-dom';
import { AlertTriangle, RotateCw } from 'lucide-react';

/**
 * Última barreira antes da tela de erro crua do React Router.
 *
 * O caso realista não é bug de renderização: é o `lazy()` da rota falhar porque o
 * navegador guardou um index.html antigo e pede um chunk cujo hash não existe mais
 * depois de um deploy. Recarregar busca o index novo e resolve — daí o botão.
 */
export const RouteError: React.FC = () => {
  const error = useRouteError();
  const detail = error instanceof Error ? error.message : String(error ?? 'Erro desconhecido');

  return (
    <div className="min-h-screen bg-bg text-slate-100 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-5">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>

        <h1 className="text-xl font-extrabold text-white tracking-tight">
          Não foi possível carregar esta página
        </h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Isso costuma acontecer logo depois de uma atualização do site, quando o navegador
          ainda tem a versão antiga em cache. Recarregar resolve.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Recarregar a página
        </button>

        <p className="mt-6 text-[10px] font-mono text-slate-400 break-words">{detail}</p>
      </div>
    </div>
  );
};
