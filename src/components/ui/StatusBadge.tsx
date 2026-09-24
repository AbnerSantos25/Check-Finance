import React from 'react';

const GRADIENTS = {
  emerald: 'from-emerald-700 via-emerald-400 to-teal-700',
  sky: 'from-sky-600 via-sky-400 to-cyan-400',
} as const;

/**
 * Badge de status com o mesmo gradiente sólido do BrandMark (sem fundo semi-transparente).
 */
export const StatusBadge: React.FC<{ color: keyof typeof GRADIENTS; children: React.ReactNode }> = ({
  color,
  children,
}) => (
  <div
    className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gradient-to-tr ${GRADIENTS[color]} text-slate-950 text-xs font-semibold mb-2`}
  >
    <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
    {children}
  </div>
);
