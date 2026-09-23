import React, { useMemo } from 'react';
import type { RealEstateParams } from '../../types';
import { useEconomicData } from '../../app/providers/EconomicDataProvider';
import { usePersistentState } from '../../app/providers/FormStateProvider';
import { RealEstateForm } from './components/RealEstateForm';
import { RealEstateSummaryCards } from './components/RealEstateSummaryCards';
import { RealEstateCharts } from './components/RealEstateCharts';
import { RealEstateTable } from './components/RealEstateTable';
import { calculateFinancing } from './lib/calculateFinancing';
import { DEFAULT_RE_PARAMS } from './defaults';
import { Seo } from '../../shared/seo/Seo';
import { FINANCING_TOOL, financingJsonLd } from './seo';

export const FinancingPage: React.FC = () => {
  const [params, setParams] = usePersistentState<RealEstateParams>('financiamento', DEFAULT_RE_PARAMS);
  const { rates } = useEconomicData();

  const summary = useMemo(() => calculateFinancing(params), [params]);

  return (
    <>
      <Seo
        title={FINANCING_TOOL.seo.title}
        description={FINANCING_TOOL.seo.description}
        path={FINANCING_TOOL.path}
        jsonLd={financingJsonLd}
      />

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Simulador Imobiliário
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financiamento &amp; Amortização Extra
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Descubra o Custo Efetivo Total (CET) do seu imóvel, compare sistemas SAC vs PRICE e calcule o impacto fulminante de amortizações extraordinárias no abatimento de juros e prazo.
          </p>
        </div>
      </div>

      <RealEstateSummaryCards summary={summary} params={params} />

      <RealEstateForm
        params={params}
        onChange={(newValues) => setParams((prev) => ({ ...prev, ...newValues }))}
        onReset={() => setParams(DEFAULT_RE_PARAMS)}
        liveRates={rates}
      />

      <RealEstateCharts summary={summary} params={params} />

      <RealEstateTable summary={summary} />
    </>
  );
};
