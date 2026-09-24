import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '../seo/jsonLd';

interface FaqProps {
  items: FaqItem[];
  /** Título visível da seção, específico da ferramenta. */
  title: string;
  /** Prefixo dos ids, caso um dia haja mais de um FAQ na mesma rota. */
  idPrefix?: string;
}

/**
 * FAQ em `<details>` nativo.
 *
 * O conteúdo fechado continua no HTML pré-renderizado: `<details>` esconde pela
 * apresentação, não removendo do documento. Buscadores e rastreadores de IA leem
 * a resposta inteira sem precisar executar JavaScript nem abrir nada — e o
 * visitante no celular não recebe uma parede de texto.
 *
 * Sem estado em React de propósito: abrir e fechar é comportamento nativo do
 * elemento, que funciona antes de a hidratação terminar.
 */
export const Faq: React.FC<FaqProps> = ({ items, title, idPrefix = '' }) => (
  <section
    aria-labelledby={`${idPrefix}faq-title`}
    className="mt-12 pt-8 border-t border-line-soft"
  >
    <div className="mb-6">
      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
        Perguntas frequentes
      </div>
      <h2 id={`${idPrefix}faq-title`} className="text-xl font-extrabold text-white">
        {title}
      </h2>
    </div>

    <div className="space-y-3">
      {items.map((item, index) => (
        <details
          key={item.question}
          /* A primeira já abre: mostra de cara que há resposta de verdade aqui,
             em vez de uma lista de títulos que o visitante não sabe se vale abrir. */
          open={index === 0}
          className="group rounded-2xl bg-surface border border-line"
        >
          <summary className="tap-field flex items-center justify-between gap-3 px-5 py-3.5 cursor-pointer list-none text-sm font-bold text-white hover:text-emerald-300 transition-colors [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <ChevronDown className="w-4 h-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
          </summary>

          {/* `max-w-2xl` limita a medida do texto: no desktop o card tem mais de
              1000px, e a linha de 160 caracteres que resultava disso é cansativa
              de ler. O card continua largo; só a prosa é contida. */}
          <div className="px-5 pb-5 space-y-2.5 max-w-2xl">
            {item.answer.map((paragraph) => (
              <p key={paragraph} className="text-xs text-slate-400 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </details>
      ))}
    </div>
  </section>
);
