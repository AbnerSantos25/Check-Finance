import React, { createContext, lazy, Suspense, useContext, useState } from 'react';
import { getTool, type ToolId } from '../../config/tools.data';

// Os modais só existem depois de um clique, então o código deles (e o `qrcode.react`
// do PIX) fica fora do bundle que toda rota baixa antes de pintar. O chunk chega
// em poucos milissegundos após o clique; até lá o fallback é nada.
const PixModal = lazy(() =>
  import('../../components/modals/PixModal').then((m) => ({ default: m.PixModal }))
);
const ComingSoonModal = lazy(() =>
  import('../../components/modals/ComingSoonModal').then((m) => ({ default: m.ComingSoonModal }))
);

interface ModalsValue {
  openPix: () => void;
  openComingSoon: (toolId: ToolId) => void;
}

const ModalsContext = createContext<ModalsValue | null>(null);

export const useModals = (): ModalsValue => {
  const value = useContext(ModalsContext);
  if (!value) throw new Error('useModals precisa de um ModalsProvider acima');
  return value;
};

export const ModalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPixOpen, setIsPixOpen] = useState(false);
  const [comingSoonTool, setComingSoonTool] = useState<ToolId | null>(null);

  return (
    <ModalsContext.Provider
      value={{
        openPix: () => setIsPixOpen(true),
        openComingSoon: setComingSoonTool,
      }}
    >
      {children}

      {/* Os modais são montados sob demanda: o <dialog> nativo chama showModal() ao montar. */}
      <Suspense fallback={null}>
        {isPixOpen && <PixModal onClose={() => setIsPixOpen(false)} />}

        {comingSoonTool && (
          <ComingSoonModal
            onClose={() => setComingSoonTool(null)}
            toolName={getTool(comingSoonTool).label}
            description={getTool(comingSoonTool).description}
          />
        )}
      </Suspense>
    </ModalsContext.Provider>
  );
};
