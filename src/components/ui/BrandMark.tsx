import React from 'react';
import { type LucideIcon } from 'lucide-react';

/**
 * Selo da marca: quadrado com o gradiente emerald→teal e o ícone em negativo.
 * `className` substitui tamanho e raio; o gradiente e a cor do ícone são fixos.
 */
export const BrandMark: React.FC<{
  icon: LucideIcon;
  className?: string;
  iconClass?: string;
}> = ({ icon: Icon, className = 'w-10 h-10 rounded-xl', iconClass = 'w-5 h-5' }) => (
  <div
    className={`flex items-center justify-center shrink-0 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-200 text-slate-950 ${className}`}
  >
    <Icon className={iconClass} />
  </div>
);
