import type React from 'react';
import { useEffect, useRef } from 'react';
import { usePersistentState } from './providers/FormStateProvider';
import { decodeParams, encodeParams, type ShareSchema } from '../shared/lib/shareParams';

const URL_WRITE_DELAY_MS = 300;

/**
 * `usePersistentState` com os campos espelhados na query string, para o botão
 * Compartilhar copiar um link que reabre a mesma simulação.
 *
 * - Ao montar, se a URL traz campos, eles valem sobre o estado guardado: quem abre
 *   um link quer ver aquela simulação. Os campos ausentes voltam ao padrão.
 * - A cada mudança, a URL é reescrita com `history.replaceState`, sem entrada nova
 *   no histórico e sem passar pelo roteador, que re-renderizaria a árvore à toa.
 *
 * A leitura acontece num efeito, depois da hidratação: o HTML pré-renderizado
 * tem os valores padrão, e ler a URL durante o render desencontraria os dois.
 */
export function useShareableParams<T extends object>(
  storeKey: string,
  defaults: T,
  schema: ShareSchema<T>,
  sanitize: (current: T, changes: Partial<T>) => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [params, setParams] = usePersistentState<T>(storeKey, defaults);
  // Os valores da URL ainda vão entrar no estado: não sobrescrever a URL antes disso.
  const applyingUrl = useRef(false);

  useEffect(() => {
    const fromUrl = decodeParams(window.location.search, schema);
    if (Object.keys(fromUrl).length === 0) return;
    applyingUrl.current = true;
    setParams(sanitize(defaults, fromUrl));
    // Só na montagem: depois disso a URL segue o estado, não o contrário.
  }, []);

  useEffect(() => {
    if (applyingUrl.current) {
      applyingUrl.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const query = encodeParams(params, defaults, schema);
      const { pathname, search, hash } = window.location;
      const next = query ? `?${query}` : '';
      if (next !== search) window.history.replaceState(window.history.state, '', `${pathname}${next}${hash}`);
    }, URL_WRITE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [params, defaults, schema]);

  return [params, setParams];
}
