import React, { useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { PercentageParams } from '../../types';
import { useShareableParams } from '../../app/useShareableParams';
import { Seo } from '../../shared/seo/Seo';
import { Faq } from '../../shared/components/Faq';
import { RelatedTools } from '../../shared/components/RelatedTools';
import { trackEvent } from '../../shared/lib/analytics';
import { PercentCalculators, type PercentMode } from './components/PercentCalculators';
import { LearnPercentage } from './components/LearnPercentage';
import { sanitizeParams } from './lib/sanitizeParams';
import { DEFAULT_PARAMS } from './defaults';
import { SHARE_SCHEMA } from './share';
import { PERCENTAGE_TOOL, percentageJsonLd } from './seo';
import { PERCENTAGE_FAQ } from './faq';

export const PercentagePage: React.FC = () => {
  const [params, setParams] = useShareableParams<PercentageParams>(
    'porcentagem',
    DEFAULT_PARAMS,
    SHARE_SCHEMA,
    sanitizeParams
  );
  // Um evento por conta e por visita: mede quais das cinco as pessoas usam, sem
  // disparar a cada tecla.
  const tracked = useRef(new Set<PercentMode>());

  const handleChange = (mode: PercentMode, changes: Partial<PercentageParams>) => {
    if (!tracked.current.has(mode)) {
      tracked.current.add(mode);
      trackEvent('porcentagem_calcular', { modo: mode });
    }
    setParams((prev) => sanitizeParams(prev, changes));
  };

  return (
    <>
      <Seo
        title={PERCENTAGE_TOOL.seo.title}
        description={PERCENTAGE_TOOL.seo.description}
        path={PERCENTAGE_TOOL.path}
        jsonLd={percentageJsonLd}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <StatusBadge color="violet">Porcentagem · Aumento e desconto</StatusBadge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Calculadora de Porcentagem</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Quanto é X% de um valor, quantos por cento um número é de outro, aumento, desconto, variação e aumentos e
            descontos sucessivos. O resultado sai enquanto você digita, com a conta explicada.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setParams(DEFAULT_PARAMS)}
          className="flex items-center gap-1.5 tap-target px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-line border border-line-strong text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          Restaurar exemplos
        </button>
      </div>

      <PercentCalculators params={params} onChange={handleChange} />

      <LearnPercentage />

      <RelatedTools current="porcentagem" />

      <Faq items={PERCENTAGE_FAQ} title="Dúvidas sobre porcentagem" />
    </>
  );
};
