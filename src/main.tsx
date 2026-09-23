import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './app/routes';
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
