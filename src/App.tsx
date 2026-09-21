import { useState } from 'react';
import { RootLayout } from './app/RootLayout';
import { EconomicDataProvider } from './app/providers/EconomicDataProvider';
import { ModalsProvider } from './app/providers/ModalsProvider';
import { FormStateProvider } from './app/providers/FormStateProvider';
import { InvestmentPage } from './features/investimentos/InvestmentPage';
import { FinancingPage } from './features/financiamento/FinancingPage';
import type { ToolId } from './config/tools.data';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('investimentos');

  // Sem o scroll, trocar de ferramenta pelo footer troca o conteúdo fora da tela
  // e parece que o clique não fez nada.
  const handleSelectTool = (toolId: ToolId) => {
    setActiveTool(toolId);
    window.scrollTo({ top: 0 });
  };

  return (
    <EconomicDataProvider>
      <FormStateProvider>
        <ModalsProvider>
          <RootLayout activeTab={activeTool} onSelectTool={handleSelectTool}>
            {activeTool === 'financiamento' ? <FinancingPage /> : <InvestmentPage />}
          </RootLayout>
        </ModalsProvider>
      </FormStateProvider>
    </EconomicDataProvider>
  );
}
