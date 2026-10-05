import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTipProps {
  /** O texto de ajuda. */
  text: string;
  /** Nome do campo, para o leitor de tela: "Ajuda: Aporte inicial". */
  label: string;
}

const WIDTH = 288; // largura do balão (18rem); encolhe em telas estreitas
const GUTTER = 12; // distância mínima das bordas da tela
const GAP = 8; // distância entre o ícone e o balão

interface Position {
  top: number;
  left: number;
  width: number;
  /** Abre para cima quando não cabe embaixo. */
  above: boolean;
}

/**
 * Ícone "?" com uma explicação curta.
 *
 * Substitui o atributo `title`, que no celular nunca aparece (não existe "passar o
 * mouse"). Abre com toque ou clique; no computador também ao passar o mouse e ao
 * receber foco pelo teclado. Fecha ao tocar fora, com Esc ou ao rolar a página.
 *
 * O balão usa posição fixa calculada a partir do ícone, então nunca sai da tela, nem
 * nos campos encostados na borda. Ele só existe enquanto está aberto: nada entra no
 * HTML pré-renderizado e a hidratação não muda.
 *
 * Fica AO LADO do <label>, não dentro: um botão dentro de <label> é HTML inválido.
 */
export const InfoTip: React.FC<InfoTipProps> = ({ text, label }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  // Aberto por toque/clique fica aberto até fechar de propósito; por hover, some ao sair.
  const pinned = useRef(false);
  const tipId = useId();

  const close = useCallback(() => {
    pinned.current = false;
    setOpen(false);
  }, []);

  // Posição depois de montar o balão, antes de pintar: mede a altura real dele.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const icon = buttonRef.current.getBoundingClientRect();
    const width = Math.min(WIDTH, window.innerWidth - GUTTER * 2);
    const height = tipRef.current?.offsetHeight ?? 0;
    const centered = icon.left + icon.width / 2 - width / 2;
    const left = Math.min(Math.max(centered, GUTTER), window.innerWidth - width - GUTTER);
    const above = icon.bottom + GAP + height > window.innerHeight - GUTTER && icon.top - GAP - height > GUTTER;
    setPosition({ top: above ? icon.top - GAP - height : icon.bottom + GAP, left, width, above });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !tipRef.current?.contains(target)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', close, { passive: true, capture: true });
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', close, { capture: true });
      window.removeEventListener('resize', close);
    };
  }, [open, close]);

  const hoverCapable = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Ajuda: ${label}`}
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onClick={() => {
          if (open && pinned.current) close();
          else {
            pinned.current = true;
            setOpen(true);
          }
        }}
        onMouseEnter={() => hoverCapable() && setOpen(true)}
        onMouseLeave={() => !pinned.current && setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!tipRef.current?.contains(event.relatedTarget as Node)) close();
        }}
        // Área de toque de 32px com margem negativa: o ícone continua com 16px e o
        // rótulo não sai do alinhamento.
        className="inline-flex items-center justify-center w-8 h-8 -m-2 shrink-0 rounded-full text-slate-400 hover:text-slate-200 focus-visible:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 cursor-pointer transition-colors"
      >
        <HelpCircle className="w-4 h-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={tipRef}
          id={tipId}
          role="tooltip"
          style={{
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            width: position?.width ?? WIDTH,
            // Invisível só no primeiro quadro, enquanto mede a própria altura.
            visibility: position ? 'visible' : 'hidden',
          }}
          className="fixed z-50 rounded-xl bg-panel border border-line-strong shadow-2xl px-3.5 py-3 text-sm leading-relaxed text-slate-200 font-normal normal-case tracking-normal text-left"
        >
          {text}
        </div>
      )}
    </>
  );
};
