import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { EconomicIndicator, MarketRates } from '../../types';
import { buildReferenceData, loadEconomicIndicators } from '../../shared/lib/economicApi';

interface EconomicDataValue {
  indicators: EconomicIndicator[];
  rates: MarketRates;
  liveCount: number;
  hasFetched: boolean;
  isLoading: boolean;
  refresh: () => void;
}

const EconomicDataContext = createContext<EconomicDataValue | null>(null);

export const useEconomicData = (): EconomicDataValue => {
  const value = useContext(EconomicDataContext);
  if (!value) throw new Error('useEconomicData precisa de um EconomicDataProvider acima');
  return value;
};

export const EconomicDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(buildReferenceData);
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRates = useCallback(async (force: boolean) => {
    setIsLoading(true);
    try {
      setData(await loadEconomicIndicators({ force }));
    } catch (e) {
      console.error('Failed to load economic indicators', e);
    } finally {
      setHasFetched(true);
      setIsLoading(false);
    }
  }, []);

  // O provider fica acima da navegação e sobrevive à troca de ferramenta, então
  // esta busca acontece uma vez por sessão. O ref existe porque o StrictMode
  // executa o efeito duas vezes em desenvolvimento.
  //
  // A busca espera o navegador ficar ocioso: disparada no meio da hidratação, a
  // requisição e o re-render que ela causa competiam com a primeira pintura no
  // celular. Até lá a tela mostra os valores de referência, como já fazia.
  const fetchedOnce = useRef(false);
  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => fetchRates(false), { timeout: 2000 });
    } else {
      setTimeout(() => fetchRates(false), 1);
    }
  }, [fetchRates]);

  return (
    <EconomicDataContext.Provider
      value={{
        indicators: data.indicators,
        rates: data.rates,
        liveCount: data.liveCount,
        hasFetched,
        isLoading,
        refresh: () => fetchRates(true),
      }}
    >
      {children}
    </EconomicDataContext.Provider>
  );
};
