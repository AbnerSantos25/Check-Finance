import React from 'react';

// Os tons 300/400 escurecem no tema claro (são a cor de texto de destaque, ver
// index.css). Aqui são fundo de texto escuro, então ficam fixos nos valores da
// paleta: o selo é igual nos dois temas.
const GRADIENTS = {
  emerald: 'from-emerald-700 via-[oklch(76.5%_0.177_163.223)] to-[oklch(85.5%_0.138_181.071)]',
  sky: 'from-sky-600 via-[oklch(74.6%_0.16_232.661)] to-[oklch(78.9%_0.154_211.53)]',
  indigo: 'from-indigo-600 via-[oklch(67.3%_0.182_276.935)] to-[oklch(70.2%_0.183_293.541)]',
} as const;

/**
 * Badge de status com o mesmo gradiente sólido do BrandMark (sem fundo semi-transparente).
 */
export const StatusBadge: React.FC<{ color: keyof typeof GRADIENTS; children: React.ReactNode }> = ({
  color,
  children,
}) => (
  <div
    className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gradient-to-tr ${GRADIENTS[color]} text-on-accent text-xs font-semibold mb-2`}
  >
    <span className="w-2 h-2 rounded-full bg-on-accent animate-pulse" />
    {children}
  </div>
);
