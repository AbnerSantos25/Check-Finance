import React, { lazy, Suspense, useEffect, useState } from 'react';
import { isBrazilTimeZone, OPEN_CONSENT_EVENT, readConsent } from '../shared/lib/consent';

// O aviso só existe para quem ainda não escolheu (ou abriu as preferências), então
// o código dele fica fora do bundle que toda página baixa antes de pintar.
const ConsentBanner = lazy(() =>
  import('../components/consent/ConsentBanner').then((m) => ({ default: m.ConsentBanner }))
);

/** Mesmo gatilho do carregador de terceiros do `index.html`. */
const SHOW_DELAY_MS = 4000;
const INTERACTION_EVENTS = ['pointerdown', 'touchstart', 'scroll', 'keydown'] as const;

export type ConsentView = 'ask' | 'preferences';

/**
 * Decide quando mostrar o aviso de cookies (LGPD).
 *
 * Aparece para quem está num fuso horário do Brasil e ainda não escolheu, na
 * primeira interação ou 4 s depois do `load`, o que vier antes. Nunca antes da
 * primeira pintura: assim o aviso não vira o maior elemento da tela e não piora o
 * LCP. Até a escolha, o `index.html` já deixou análise e publicidade "negadas".
 *
 * O link "Preferências de cookies" do rodapé reabre o aviso para qualquer visitante.
 */
export const ConsentManager: React.FC = () => {
  const [view, setView] = useState<ConsentView | null>(null);

  useEffect(() => {
    const openPreferences = () => setView('preferences');
    window.addEventListener(OPEN_CONSENT_EVENT, openPreferences);
    const cleanup = () => window.removeEventListener(OPEN_CONSENT_EVENT, openPreferences);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (readConsent() || !isBrazilTimeZone(timeZone)) return cleanup;

    let timer = 0;
    const show = () => {
      INTERACTION_EVENTS.forEach((e) => removeEventListener(e, show));
      clearTimeout(timer);
      setView((current) => current ?? 'ask');
    };
    const schedule = () => {
      timer = window.setTimeout(show, SHOW_DELAY_MS);
    };

    INTERACTION_EVENTS.forEach((e) => addEventListener(e, show, { once: true, passive: true }));
    if (document.readyState === 'complete') schedule();
    else addEventListener('load', schedule, { once: true });

    return () => {
      cleanup();
      INTERACTION_EVENTS.forEach((e) => removeEventListener(e, show));
      removeEventListener('load', schedule);
      clearTimeout(timer);
    };
  }, []);

  if (!view) return null;

  return (
    <Suspense fallback={null}>
      <ConsentBanner initialView={view} onClose={() => setView(null)} />
    </Suspense>
  );
};
