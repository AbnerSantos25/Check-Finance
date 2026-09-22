import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './app/routes';
import { RouteFallback } from './app/RouteFallback';

const router = createBrowserRouter(routes);

export default function App() {
  // O `fallbackElement` cobre o primeiro carregamento: até o `lazy` da rota
  // resolver, o RouterProvider não tem o que renderizar.
  return <RouterProvider router={router} fallbackElement={<RouteFallback />} />;
}
