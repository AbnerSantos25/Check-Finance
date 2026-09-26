import type React from 'react';
import type { RouteRecord } from 'vite-react-ssg';
import { RootLayout } from './RootLayout';
import { EconomicDataProvider } from './providers/EconomicDataProvider';
import { FormStateProvider } from './providers/FormStateProvider';
import { ModalsProvider } from './providers/ModalsProvider';
import { RouteError } from './RouteError';
import { getTool } from '../config/tools.data';
import { HubPage } from '../features/home/HubPage';
import { NotFoundPage } from '../features/not-found/NotFoundPage';

/**
 * Os providers ficam no elemento da rota-pai. O React Router não remonta esse
 * elemento ao trocar de rota filha, então os indicadores econômicos são buscados
 * uma vez por sessão e o estado dos formulários sobrevive à troca de ferramenta.
 */
const Shell = () => (
  <EconomicDataProvider>
    <FormStateProvider>
      <ModalsProvider>
        <RootLayout />
      </ModalsProvider>
    </FormStateProvider>
  </EconomicDataProvider>
);

/**
 * Carrega o módulo de uma rota sob demanda — e NUNCA rejeita.
 *
 * Usa o `lazy` do próprio React Router, não `React.lazy`: o roteador resolve o
 * módulo antes de renderizar a rota, o que dispensa `<Suspense>` e é o formato que
 * o `vite-react-ssg` consegue pré-renderizar.
 *
 *
 * O `vite-react-ssg` resolve o `lazy` da rota inicial num `await Promise.all` fora
 * do roteador, antes de chamar `render`. Uma rejeição ali — o caso real é o
 * navegador com um index.html em cache pedindo um chunk cujo hash sumiu no deploy —
 * aborta a montagem inteira: o `errorElement` nunca chega a existir e o visitante
 * fica preso no splash do index.html, sem nada na tela que explique o que houve.
 *
 * Absorver a falha aqui devolve um componente normal, a aplicação monta, e o
 * visitante recebe a tela de erro com o botão de recarregar.
 */
const lazyRoute = (load: () => Promise<{ default?: unknown } & Record<string, unknown>>, exportName: string) =>
  async () => {
    try {
      const mod = await load();
      return { Component: mod[exportName] as React.ComponentType };
    } catch (error) {
      console.error('[rota] falha ao carregar o chunk', error);
      return { Component: RouteError };
    }
  };

/**
 * Os caminhos saem do registry (`tools.data.ts`), nunca de string literal: é o mesmo
 * dado que alimenta sidebar, footer, o sitemap gerado e a lista de rotas que o
 * pré-render percorre.
 */
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Shell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HubPage /> },
      {
        path: getTool('investimentos').path.slice(1),
        lazy: lazyRoute(() => import('../features/investimentos/InvestmentPage'), 'InvestmentPage'),
      },
      {
        path: getTool('financiamento').path.slice(1),
        lazy: lazyRoute(() => import('../features/financiamento/FinancingPage'), 'FinancingPage'),
      },
      {
        path: getTool('independencia').path.slice(1),
        lazy: lazyRoute(() => import('../features/independencia/IndependencePage'), 'IndependencePage'),
      },
      // Rota concreta só para o pré-render gerar dist/404.html, que é o arquivo
      // que o Cloudflare serve (com status 404) em qualquer caminho sem
      // correspondência. O '*' abaixo continua cobrindo a navegação client-side.
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
