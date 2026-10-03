/**
 * Eventos do Google Analytics.
 *
 * O `gtag()` é definido no `index.html` antes de qualquer script do app e só
 * empilha comandos no `dataLayer`; o gtag.js, carregado depois da primeira pintura
 * (e só no domínio de produção), envia a fila quando chega. Chamar daqui antes
 * disso é seguro e não custa nada no caminho da renderização.
 */

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === 'undefined') return; // pré-render
  window.gtag?.('event', name, params);
}

/** De onde o visitante abriu o modal do PIX. Vira o parâmetro `local` do evento. */
export type PixOrigin = 'cabecalho' | 'menu_lateral' | 'menu_lateral_rodape' | 'rodape' | 'banner_calculadora';
