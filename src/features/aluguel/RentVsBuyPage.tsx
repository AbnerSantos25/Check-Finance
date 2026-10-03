import React, { useMemo } from 'react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { RentVsBuyParams } from '../../types';
import { useEconomicData } from '../../app/providers/EconomicDataProvider';
import { usePersistentState } from '../../app/providers/FormStateProvider';
import { useShareableParams } from '../../app/useShareableParams';
import { Seo } from '../../shared/seo/Seo';
import { Faq } from '../../shared/components/Faq';
import type { ValueBasis } from '../../shared/components/BasisToggle';
import { RentVsBuyForm } from './components/RentVsBuyForm';
import { RentVsBuyResult } from './components/RentVsBuyResult';
import { RentVsBuyChart } from './components/RentVsBuyChart';
import { RentVsBuyTable } from './components/RentVsBuyTable';
import { breakEvenAppreciation, calculateRentVsBuy } from './lib/calculateRentVsBuy';
import { sanitizeParams } from './lib/sanitizeParams';
import { DEFAULT_PARAMS } from './defaults';
import { SHARE_SCHEMA } from './share';
import { RENT_VS_BUY_TOOL, rentVsBuyJsonLd } from './seo';
import { RENT_VS_BUY_FAQ } from './faq';

export const RentVsBuyPage: React.FC = () => {
  const [params, setParams] = useShareableParams<RentVsBuyParams>('aluguel', DEFAULT_PARAMS, SHARE_SCHEMA, sanitizeParams);
  const [basis, setBasis] = usePersistentState<ValueBasis>('aluguel:base', 'real');
  const { rates, liveCount, hasFetched } = useEconomicData();

  // Uma rodada do motor custa uns 0,3 ms (laço mensal, IR dos aportes antigos numa
  // soma corrente). A valorização de equilíbrio são mais 14 rodadas: recalcula a
  // cada tecla, sem botão "Calcular" e sem debounce.
  const summary = useMemo(() => calculateRentVsBuy(params), [params]);
  const breakEven = useMemo(() => breakEvenAppreciation(params), [params]);

  return (
    <>
      <Seo
        title={RENT_VS_BUY_TOOL.seo.title}
        description={RENT_VS_BUY_TOOL.seo.description}
        path={RENT_VS_BUY_TOOL.path}
        jsonLd={rentVsBuyJsonLd}
      />

      <div className="mb-6">
        <StatusBadge color="amber">Alugar ou comprar · Imóvel</StatusBadge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Alugar ou comprar imóvel: qual vale mais a pena?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Compare o patrimônio de quem <strong>financia o imóvel</strong> com o de quem <strong>aluga e investe a
          diferença</strong>, com o mesmo dinheiro dos dois lados. Valorização, reajuste do aluguel, inflação e Imposto
          de Renda entram na conta.
        </p>
      </div>

      <RentVsBuyForm
        params={params}
        onChange={(changes) => setParams((prev) => sanitizeParams(prev, changes))}
        onReset={() => setParams(DEFAULT_PARAMS)}
        marketRates={rates}
        ratesAreLive={hasFetched && liveCount > 0}
      />

      <RentVsBuyResult
        summary={summary}
        params={params}
        breakEven={breakEven}
        basis={basis}
        onBasisChange={setBasis}
      />

      <RentVsBuyChart summary={summary} params={params} basis={basis} />
      <RentVsBuyTable summary={summary} params={params} basis={basis} />

      <Faq items={RENT_VS_BUY_FAQ} title="Dúvidas sobre alugar ou comprar imóvel" />
    </>
  );
};
