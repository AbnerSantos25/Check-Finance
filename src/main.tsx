import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './app/routes';
// Fonte servida pelo próprio site, e não pelo Google Fonts: o CSS de lá bloqueava a
// renderização por ~780 ms no mobile (conexão nova com dois domínios antes de pintar).
// Daqui ela sai em /assets/ com hash e cache longo, e o navegador só baixa os
// subconjuntos de caracteres que a página usa.
import '@fontsource-variable/plus-jakarta-sans';
import './index.css';

/**
 * O entry vem do `vite-react-ssg` em vez do `createRoot` do React DOM porque é ele
 * que monta o provider do `<Head>` — sem esse provider as tags de SEO por rota são
 * descartadas em silêncio, sem erro nenhum.
 *
 * É também o entry do pré-render: `vite-react-ssg build` executa estas rotas no Node
 * e grava um HTML por rota, com conteúdo e tags de SEO já dentro.
 */
export const createRoot = ViteReactSSG({ routes });
