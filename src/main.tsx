import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './app/routes';
import './index.css';

/**
 * O entry vem do `vite-react-ssg` em vez do `createRoot` do React DOM porque é ele
 * que monta o provider do `<Head>` — sem esse provider as tags de SEO por rota são
 * descartadas em silêncio, sem erro nenhum.
 *
 * Por ora o build continua sendo `vite build` (client-only); a Fase 6 troca para
 * `vite-react-ssg build` e este mesmo arquivo passa a pré-renderizar.
 *
 * `v7_partialHydration` é o que faz o roteador exibir o `HydrateFallback` da rota
 * enquanto o chunk baixa, no lugar do `fallbackElement` que o ViteReactSSG não expõe.
 */
export const createRoot = ViteReactSSG({
  routes,
  future: { v7_partialHydration: true },
});
