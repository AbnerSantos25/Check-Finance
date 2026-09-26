import React, { useMemo, useState } from 'react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { IndependenceParams } from '../../types';
import { useEconomicData } from '../../app/providers/EconomicDataProvider';
import { usePersistentState } from '../../app/providers/FormStateProvider';
import { Seo } from '../../shared/seo/Seo';
import { Faq } from '../../shared/components/Faq';
import { IndependenceForm } from './components/IndependenceForm';
import { IndependenceResult, type ValueBasis } from './components/IndependenceResult';
import { IndependenceChart } from './components/IndependenceChart';
import { IndependenceTable } from './components/IndependenceTable';
import { LearnMore } from './components/LearnMore';
import { calculateIndependence, sensitivity } from './lib/calculateIndependence';
import { sanitizeParams } from './lib/sanitizeParams';
import { DEFAULT_PARAMS } from './defaults';
import { INDEPENDENCE_TOOL, independenceJsonLd } from './seo';
import { INDEPENDENCE_FAQ } from './faq';

export const IndependencePage: React.FC = () => {
  const [params, setParams] = usePersistentState<IndependenceParams>('independencia', DEFAULT_PARAMS);
  const [basis, setBasis] = usePersistentState<ValueBasis>('independencia:base', 'real');
  const { rates, liveCount, hasFetched } = useEconomicData();

  // O motor é barato (no máximo 1200 iterações), então recalcula a cada tecla,
  // sem botão "Calcular" e sem debounce.
  const result = useMemo(() => calculateIndependence(params), [params]);
  const sens = useMemo(
    () => (result.status === 'reached' && result.months !== null ? sensitivity(params, result.months) : null),
    [params, result]
  );

  const hasProjection = result.status === 'reached';

  return (
    <>
      <Seo
        title={INDEPENDENCE_TOOL.seo.title}
        description={INDEPENDENCE_TOOL.seo.description}
        path={INDEPENDENCE_TOOL.path}
        jsonLd={independenceJsonLd}
      />

      <div className="mb-6">
        <StatusBadge color="indigo">Independência Financeira · FIRE</StatusBadge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Calculadora de Independência Financeira
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Descubra <strong>com que idade</strong> seu patrimônio passa a pagar a renda que você quer,{' '}
          <strong>para sempre</strong> e <strong>com a inflação descontada</strong>. Todos os valores em poder de
          compra de hoje.
        </p>
      </div>

      <IndependenceForm
        params={params}
        onChange={(changes) => setParams((prev) => sanitizeParams(prev, changes))}
        onReset={() => setParams(DEFAULT_PARAMS)}
        marketRates={rates}
        ratesAreLive={hasFetched && liveCount > 0}
      />

      <IndependenceResult
        result={result}
        params={params}
        basis={basis}
        onBasisChange={setBasis}
        sensitivity={sens}
      />

      {hasProjection && (
        <>
          <IndependenceChart result={result} params={params} basis={basis} />
          <IndependenceTable result={result} params={params} basis={basis} />
        </>
      )}

      <LearnMore />

      <Faq items={INDEPENDENCE_FAQ} title="Dúvidas sobre independência financeira e FIRE" />
    </>
  );
};
