import React, { useLayoutEffect, useRef } from 'react';
import { type LucideIcon, X } from 'lucide-react';

// Em todas as peças, `className` substitui só a parte variável (largura, margem, justify,
// tamanho do título) em vez de ser somada à base: sem tailwind-merge no projeto, classes
// da mesma família concatenadas resolveriam pela ordem do CSS, silenciosamente.

export const Dialog: React.FC<{
  onClose: () => void;
  className?: string;
  id?: string;
  children: React.ReactNode;
}> = ({ onClose, className = 'max-w-md', id, children }) => {
  const ref = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const dialog = ref.current;
    // Quem desmonta o <dialog> é o React, então o browser não devolve o foco sozinho.
    const opener = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  return (
    <dialog
      id={id}
      ref={ref}
      // Esc fecha pelo React: quem monta o modal é o estado em App.tsx, não o browser.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // O padding abaixo é backdrop clicável; o conteúdo fica na div interna.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`m-auto w-full border-0 bg-transparent p-4 text-white backdrop:bg-black/75 backdrop:backdrop-blur-md ${className}`}
    >
      <div className="relative w-full max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-surface-2 to-panel border border-line-strong p-6 sm:p-7 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </dialog>
  );
};

/** Quadrado translúcido do cabeçalho; `frameClass` traz as cores. Para o selo da
 *  marca (gradiente), use <BrandMark /> no lugar deste. */
export const DialogIcon: React.FC<{
  icon: LucideIcon;
  frameClass: string;
  iconClass?: string;
}> = ({ icon: Icon, frameClass, iconClass = 'w-6 h-6' }) => (
  <div
    className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-md ${frameClass}`}
  >
    <Icon className={iconClass} />
  </div>
);

export const DialogHeader: React.FC<{
  mark: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ mark, className = 'mb-4', children }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    {mark}
    <div>{children}</div>
  </div>
);

export const DialogTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = 'text-lg',
  children,
}) => <h3 className={`font-bold text-white ${className}`}>{children}</h3>;

export const DialogDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-slate-400">{children}</p>
);

export const DialogFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = 'mt-6 justify-end',
  children,
}) => <div className={`pt-4 border-t border-line-soft flex ${className}`}>{children}</div>;
