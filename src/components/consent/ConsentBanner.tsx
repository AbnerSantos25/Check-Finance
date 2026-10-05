import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { readConsent, saveConsent, type ConsentChoice } from '../../shared/lib/consent';
import type { ConsentView } from '../../app/ConsentManager';
import { PRIVACY_PATH } from '../../config/site';

interface ConsentBannerProps {
  initialView: ConsentView;
  onClose: () => void;
}

// "Recusar" e "Aceitar" com o mesmo peso visual: o guia da ANPD pede que recusar
// seja tão fácil quanto aceitar.
const PRIMARY =
  'tap-target justify-center px-4 py-2 rounded-xl bg-surface-2 hover:bg-line border border-line-strong text-xs font-semibold text-slate-100 transition-colors cursor-pointer';
const LINK = 'tap-target text-xs font-medium text-slate-300 underline underline-offset-2 hover:text-white cursor-pointer';

const Toggle: React.FC<{
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}> = ({ id, label, description, checked, disabled, onChange }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-t border-line-soft first:border-t-0">
    <label htmlFor={id} className="min-w-0">
      <span className="block text-xs font-semibold text-white">{label}</span>
      <span className="block text-caption text-slate-400 leading-relaxed mt-0.5">{description}</span>
    </label>
    <input
      id={id}
      type="checkbox"
      role="switch"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.checked)}
      className="mt-0.5 w-5 h-5 shrink-0 accent-emerald-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    />
  </div>
);

/**
 * Aviso de cookies (LGPD). Barra fixa no rodapé da tela: não desloca o conteúdo.
 *
 * Nada vem pré-marcado: na primeira visita, análise e publicidade começam desligadas
 * nas preferências. Ao reabrir pelo rodapé, mostra a escolha atual.
 */
export const ConsentBanner: React.FC<ConsentBannerProps> = ({ initialView, onClose }) => {
  const [view, setView] = useState<ConsentView>(initialView);
  const [choice, setChoice] = useState<ConsentChoice>(() => readConsent() ?? { analytics: false, ads: false });

  const decide = (next: ConsentChoice) => {
    saveConsent(next);
    onClose();
  };

  return (
    <section
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-40 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md rounded-2xl bg-panel border border-line shadow-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        <h2 className="text-sm font-bold text-white">
          {view === 'ask' ? 'Sua privacidade' : 'Preferências de cookies'}
        </h2>
      </div>

      {view === 'ask' ? (
        <p className="text-caption text-slate-300 leading-relaxed">
          Usamos cookies para medir o uso do site (Google Analytics) e exibir anúncios (Google AdSense). As
          calculadoras funcionam do mesmo jeito se você recusar.{' '}
          <Link to={PRIVACY_PATH} className="underline underline-offset-2 hover:text-white">
            Política de Privacidade
          </Link>
          .
        </p>
      ) : (
        <div className="mt-1">
          <Toggle
            id="consent-necessary"
            label="Necessários"
            description="Lembram o tema claro ou escuro e esta escolha. Ficam só no seu navegador."
            checked
            disabled
          />
          <Toggle
            id="consent-analytics"
            label="Análise"
            description="Google Analytics: quantas pessoas usam o site e quais calculadoras."
            checked={choice.analytics}
            onChange={(analytics) => setChoice((c) => ({ ...c, analytics }))}
          />
          <Toggle
            id="consent-ads"
            label="Publicidade personalizada"
            description="Google AdSense: anúncios com base nos seus interesses. Sem isso, os anúncios continuam, mas genéricos."
            checked={choice.ads}
            onChange={(ads) => setChoice((c) => ({ ...c, ads }))}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button type="button" onClick={() => decide({ analytics: false, ads: false })} className={PRIMARY}>
          Recusar
        </button>
        <button type="button" onClick={() => decide({ analytics: true, ads: true })} className={PRIMARY}>
          Aceitar
        </button>
        {view === 'ask' ? (
          <button type="button" onClick={() => setView('preferences')} className={`${LINK} ml-auto`}>
            Personalizar
          </button>
        ) : (
          <button type="button" onClick={() => decide(choice)} className={`${PRIMARY} ml-auto`}>
            Salvar escolhas
          </button>
        )}
      </div>
    </section>
  );
};
