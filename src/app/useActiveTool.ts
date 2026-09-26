import { useLocation } from 'react-router-dom';
import { ACTIVE_TOOLS, type ToolMeta } from '../config/tools.data';

/**
 * A ferramenta correspondente à URL atual, ou `null` no hub e no 404.
 *
 * A URL é a única fonte de verdade da navegação: sidebar, breadcrumb e qualquer
 * outro destaque de "ferramenta ativa" derivam daqui, nunca de estado próprio.
 *
 * Procura só entre as ferramentas publicadas. As marcadas como `em-breve` têm
 * caminho no registry mas nenhuma rota: casar com elas faria o caminho de uma
 * ferramenta futura exibir "Simulador Ativo" na lateral enquanto o corpo da
 * página diz que ela não existe — e, como o 404 é pré-renderizado sem
 * ferramenta ativa, ainda quebraria a hidratação.
 */
export const useActiveTool = (): ToolMeta | null => {
  const { pathname } = useLocation();
  // Normaliza a barra final: /slug e /slug/ são a mesma ferramenta.
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return ACTIVE_TOOLS.find((tool) => tool.path === normalized) ?? null;
};
