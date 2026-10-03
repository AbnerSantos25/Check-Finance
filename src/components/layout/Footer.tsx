import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, TrendingUp } from 'lucide-react';
import { TOOLS } from '../../config/tools.data';
import { CONTACT_EMAIL, PRIVACY_PATH } from '../../config/site';
import { openConsentPreferences } from '../../shared/lib/consent';
import { useModals } from '../../app/providers/ModalsProvider';

export const Footer: React.FC = () => {
  const { openPix, openComingSoon } = useModals();

  return (
    <footer className="mt-16 border-t border-line-soft bg-bg-deep py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      {/* Empilhado até lg: com a barra lateral aberta, o tablet tem ~480px de conteúdo,
          pouco para marca, contato e links lado a lado. */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Marca e contato numa coluna só: na mesma linha dos links, o e-mail
            disputava espaço e acabava sozinho numa segunda linha no desktop. */}
        <div className="flex flex-col items-center lg:items-start shrink-0">
          <Link to="/" className="tap-target gap-2 text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">CheckFinance</span>
            <span className="hidden sm:inline">— Hub de Ferramentas Financeiras</span>
          </Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="tap-target gap-1.5 text-caption hover:text-slate-200 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            {CONTACT_EMAIL}
          </a>
        </div>
        {/* `flex-wrap`: cinco links numa linha só não cabem num celular estreito, e sem
            quebrar eles empurravam a página para além da largura da tela. */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-caption">
          {TOOLS.map((tool) =>
            tool.status === 'em-breve' ? (
              <button
                key={tool.id}
                onClick={() => openComingSoon(tool.id)}
                className="tap-target hover:text-slate-200 transition-colors"
              >
                {tool.shortLabel}
              </button>
            ) : (
              <Link
                key={tool.id}
                to={tool.path}
                className="tap-target hover:text-slate-200 transition-colors"
              >
                {tool.shortLabel}
              </Link>
            )
          )}
          <button
            onClick={() => openPix('rodape')}
            className="tap-target text-emerald-400 hover:underline transition-colors font-medium"
          >
            Doação PIX
          </button>
          <Link to={PRIVACY_PATH} className="tap-target hover:text-slate-200 transition-colors">
            Política de Privacidade
          </Link>
          <button
            type="button"
            onClick={openConsentPreferences}
            className="tap-target hover:text-slate-200 transition-colors cursor-pointer"
          >
            Preferências de cookies
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-white/5 text-caption text-slate-400 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-2 lg:gap-6">
        <span>
          © {__BUILD_YEAR__} CheckFinance. Ferramenta de fins educativos e de simulação. Não constitui recomendação de investimento.
        </span>
        <a
          href="https://www.abstecnologiadev.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="tap-target gap-2 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
        >
          <span>Desenvolvido por</span>
          <span className="flex items-center justify-center rounded p-0.5">
            {/* Um logo por tema. `lazy`: o rodapé está longe da primeira tela, e o
                que está escondido nem chega a ser baixado. */}
            <img src="/ABS_Tecnologia_Branca.svg" alt="" loading="lazy" className="h-4 w-4 light:hidden" />
            <img src="/ABS_Tecnologia_Escura.svg" alt="" loading="lazy" className="h-4 w-4 hidden light:block" />
          </span>
          <span className="font-semibold text-slate-300">ABS Tecnologia</span>
        </a>

        <span className="text-slate-400 font-mono whitespace-nowrap shrink-0">
          Português (Brasil) • v1.0 MVP
        </span>
      </div>
    </footer>
  );
};
