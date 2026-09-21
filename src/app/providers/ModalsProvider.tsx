import React, { createContext, useContext, useState } from 'react';
import { getTool, type ToolId } from '../../config/tools.data';
import { PixModal } from '../../components/modals/PixModal';
import { ComingSoonModal } from '../../components/modals/ComingSoonModal';

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

      <PixModal isOpen={isPixOpen} onClose={() => setIsPixOpen(false)} />

      <ComingSoonModal
        isOpen={comingSoonTool !== null}
        onClose={() => setComingSoonTool(null)}
        toolName={comingSoonTool ? getTool(comingSoonTool).label : ''}
        description={comingSoonTool ? getTool(comingSoonTool).description : ''}
      />
    </ModalsContext.Provider>
  );
};
