import type { RouteObject } from 'react-router-dom';
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
 * Os caminhos saem do registry (`tools.data.ts`), nunca de string literal: é o
 * mesmo dado que alimenta sidebar, footer e — na Fase 6 — o sitemap gerado.
 *
 * O code splitting usa o `lazy` do próprio React Router em vez de `React.lazy`:
 * o roteador resolve o módulo antes de renderizar a rota, o que dispensa
 * `<Suspense>` e é o formato que o `vite-react-ssg` consegue pré-renderizar.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Shell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HubPage /> },
      {
        path: getTool('investimentos').path.slice(1),
        lazy: async () => ({
          Component: (await import('../features/investimentos/InvestmentPage')).InvestmentPage,
        }),
      },
      {
        path: getTool('financiamento').path.slice(1),
        lazy: async () => ({
          Component: (await import('../features/financiamento/FinancingPage')).FinancingPage,
        }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
