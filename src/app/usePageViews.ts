import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../shared/lib/analytics';

/**
 * Envia `page_view` a cada troca de página feita pelo roteador.
 *
 * A primeira visualização sai do `gtag('config')` do `index.html`, com o endereço
 * completo (e as UTMs, se houver). Daí em diante, só conta quando o *caminho* muda:
 * as ferramentas reescrevem a query a cada campo editado (useShareableParams), e a
 * detecção automática do GA4 ("alterações de página com base em eventos do
 * histórico") transformava cada edição numa visualização nova. Essa opção precisa
 * ficar desligada no Analytics, ou as trocas de página contam duas vezes.
 */
export function usePageViews(): void {
  const { pathname } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    // O <Head> atualiza o <title> num quadro seguinte ao render da página nova;
    // esperar esse quadro faz o evento sair com o título certo.
    let timer = 0;
    const frame = requestAnimationFrame(() => {
      timer = window.setTimeout(() =>
        trackEvent('page_view', {
          page_location: window.location.origin + pathname,
          page_title: document.title,
        })
      );
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [pathname]);
}
