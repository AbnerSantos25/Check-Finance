import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, type LucideIcon } from 'lucide-react';
import { TOOLS, getTool, type ToolMeta } from '../../config/tools.data';
import { ACCENT_CLASSES, TOOL_ICONS } from '../../config/tools.tsx';
import { useModals } from '../../app/providers/ModalsProvider';
import { Seo } from '../../shared/seo/Seo';
import { HOME_SEO, homeJsonLd } from './seo';
import { StatusBadge } from '@/src/components/ui/StatusBadge.tsx';

const CARD_BASE =
  'group h-full text-left p-5 rounded-2xl bg-surface border border-line shadow-lg transition-all';

/** Miolo compartilhado pelos cards: só o invólucro (link ou botão) muda. */
const CardBody: React.FC<{ tool: ToolMeta; icon: LucideIcon }> = ({ tool, icon: Icon }) => {
  const accent = ACCENT_CLASSES[tool.accent];

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl text-slate-950 ${accent.iconSurface}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {tool.status === 'em-breve' ? (
          <span className="text-[12px] sm:text-[10px] px-2 py-1 rounded-md bg-slate-800 text-slate-400 font-medium shrink-0">
            Em breve
          </span>
        ) : (
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
        )}
      </div>

      <h2 className="text-sm font-bold text-white mb-1.5 leading-snug">{tool.label}</h2>
      <p className="text-xs text-slate-400 leading-relaxed">{tool.description}</p>
    </>
  );
};

export const HubPage: React.FC = () => {
  const { openComingSoon } = useModals();

  return (
    <>
      <Seo
        title={HOME_SEO.title}
        description={HOME_SEO.description}
        path="/"
        jsonLd={homeJsonLd}
      />

      <div className="mb-8 max-w-3xl">
        <StatusBadge color="emerald">Hub de Ferramentas Financeiras</StatusBadge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Calculadoras financeiras gratuitas, em português e sem cadastro
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Simule <strong>juros compostos com inflação e Imposto de Renda</strong>, compare{' '}
          <strong>SAC e PRICE</strong> no financiamento do seu imóvel e descubra o impacto real da
          amortização extra. Todas as ferramentas usam indicadores oficiais do Banco Central e
          funcionam direto no navegador, sem login.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const Icon = TOOL_ICONS[tool.id];
          const accent = ACCENT_CLASSES[tool.accent];

          return tool.status === 'em-breve' ? (
            <button
              key={tool.id}
              id={`hub-${tool.id}-card`}
              onClick={() => openComingSoon(tool.id)}
              className={`${CARD_BASE} ${accent.cardHover} cursor-pointer opacity-80 hover:opacity-100`}
            >
              <CardBody tool={tool} icon={Icon} />
            </button>
          ) : (
            <Link
              key={tool.id}
              id={`hub-${tool.id}-card`}
              to={tool.path}
              className={`${CARD_BASE} ${accent.cardHover} block`}
            >
              <CardBody tool={tool} icon={Icon} />
            </Link>
          );
        })}
      </div>

      <section aria-labelledby="qual-calculadora" className="mt-12 pt-8 border-t border-line-soft">
        <div className="mb-6">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            Por onde começar
          </div>
          <h2 id="qual-calculadora" className="text-xl font-extrabold text-white">
            Qual calculadora usar em cada situação
          </h2>
        </div>

        <div className="space-y-4 max-w-3xl">
          <div className="p-5 rounded-2xl bg-surface border border-line">
            <h3 className="text-sm font-bold text-white mb-1.5">
              Você quer saber quanto o seu dinheiro rende ao longo dos anos
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A calculadora de juros compostos responde "quanto eu terei" e "quanto preciso
              aportar por mês para chegar lá". Ela é a única aqui que desconta inflação e
              Imposto de Renda do resultado, então o número final já está em poder de compra de
              hoje. Serve para planejar aposentadoria, montar reserva de longo prazo ou juntar a
              entrada de um imóvel.
            </p>
            {/* Link em linha própria, e não dentro do parágrafo: um <a> inline herda a
                altura da linha (14px) e vira um alvo difícil de acertar no celular. */}
            <Link
              to={getTool('investimentos').path}
              className="tap-target mt-3 gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Abrir a calculadora de juros compostos
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-line">
            <h3 className="text-sm font-bold text-white mb-1.5">
              Você vai assumir uma dívida imobiliária, ou já tem uma
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O simulador de financiamento compara SAC e PRICE antes de você assinar, mostra
              quanto o contrato custa em juros do começo ao fim e, principalmente, mede o efeito
              de amortizar um valor extra todo mês. É onde aparece a diferença entre pagar o
              imóvel em trinta anos ou em dezenove.
            </p>
            <Link
              to={getTool('financiamento').path}
              className="tap-target mt-3 gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              Abrir o simulador de financiamento
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-line">
            <h3 className="text-sm font-bold text-white mb-1.5">
              As duas juntas respondem à pergunta mais comum
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Financiar o imóvel agora, ou continuar investindo e comprar à vista mais tarde?
              Simule o custo total do financiamento de um lado e o crescimento do mesmo dinheiro
              investido do outro. A comparação passa a ser entre dois números, e não entre duas
              opiniões.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="por-que-checkfinance" className="mt-12 pt-8 border-t border-line-soft">
        <div className="mb-6">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            Por que o CheckFinance
          </div>
          <h2 id="por-que-checkfinance" className="text-xl font-extrabold text-white">
            Simulações que consideram o que o mercado costuma esconder
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-surface border border-line">
            <h3 className="text-sm font-bold text-white mb-1.5">Inflação e IR incluídos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rentabilidade nominal engana. Aqui você vê o patrimônio em poder de compra de hoje,
              já com a tabela regressiva do Imposto de Renda aplicada.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-line">
            <h3 className="text-sm font-bold text-white mb-1.5">Indicadores oficiais</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              SELIC, CDI, IPCA e poupança vêm das APIs do Banco Central a cada visita, com data da
              referência sempre visível — nada de número chumbado no código.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-line">
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Sem login, sem rastreio
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nenhum dado seu sai do navegador: o cálculo roda na sua máquina e nada é enviado
              para servidor nenhum.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
