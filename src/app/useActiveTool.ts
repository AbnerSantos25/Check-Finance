import { useLocation } from 'react-router-dom';
import { TOOLS, type ToolMeta } from '../config/tools.data';

/**
 * A ferramenta correspondente à URL atual, ou `null` no hub e no 404.
 *
 * A URL é a única fonte de verdade da navegação: sidebar, breadcrumb e qualquer
 * outro destaque de "ferramenta ativa" derivam daqui, nunca de estado próprio.
 */
export const useActiveTool = (): ToolMeta | null => {
  const { pathname } = useLocation();
  // Normaliza a barra final: /slug e /slug/ são a mesma ferramenta.
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return TOOLS.find((tool) => tool.path === normalized) ?? null;
};
