import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** Aparece depois de uma tela e meia de rolagem. */
const SHOW_AFTER_SCREENS = 1.5;

/**
 * Botão "Voltar ao topo", no canto inferior direito, só no celular e no tablet.
 * No desktop a barra lateral fixa já leva a qualquer parte do site.
 *
 * Começa escondido: o HTML pré-renderizado não muda e a hidratação também não.
 * Some enquanto um campo está em foco, porque com o teclado virtual aberto ele
 * poderia cobrir o campo que está sendo digitado.
 */
export const BackToTop: React.FC = () => {
  const [scrolledDown, setScrolledDown] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolledDown(window.scrollY > window.innerHeight * SHOW_AFTER_SCREENS);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const isField = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.matches('input, textarea, select, [contenteditable="true"]');
    const onFocusIn = (event: FocusEvent) => setTyping(isField(event.target));
    const onFocusOut = () => setTyping(false);

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const visible = scrolledDown && !typing;

  const goToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    // Leva o foco junto: quem usa teclado ou leitor de tela não fica preso lá embaixo.
    document.getElementById('conteudo')?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={goToTop}
      aria-label="Voltar ao topo"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      // Acima da barra do iPhone; abaixo do aviso de cookies (z-40) e do menu (z-50).
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      className={`md:hidden fixed right-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-panel border border-line-strong shadow-xl text-emerald-400 hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 cursor-pointer motion-safe:transition-[opacity,transform] motion-safe:duration-200 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
    </button>
  );
};
