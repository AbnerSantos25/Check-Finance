import { Compass, Flame, Home, TrendingUp, type LucideIcon } from 'lucide-react';
import type { ToolAccent, ToolId } from './tools.data';

export const TOOL_ICONS: Record<ToolId, LucideIcon> = {
  investimentos: TrendingUp,
  financiamento: Home,
  fire: Flame,
  independencia: Compass,
};

interface AccentClasses {
  /** Ícone da ferramenta em destaque (rota ativa). */
  activeIcon: string;
  /** Barra luminosa que marca a rota ativa na sidebar. */
  indicator: string;
  /** Ícone das ferramentas ainda não lançadas, que acendem no hover. */
  idleIcon: string;
  /** Selo do ícone no card do hub: gradiente sólido como o BrandMark, na cor da ferramenta. */
  iconSurface: string;
  /** Borda e brilho do card do hub sob o cursor. */
  cardHover: string;
}

// Classes escritas por extenso: o Tailwind varre o código como texto e não
// enxergaria nomes montados por interpolação.
export const ACCENT_CLASSES: Record<ToolAccent, AccentClasses> = {
  emerald: {
    activeIcon: 'text-emerald-400',
    indicator: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    idleIcon: 'text-emerald-400/80 group-hover:text-emerald-400',
    iconSurface: 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-200',
    cardHover: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
  },
  sky: {
    activeIcon: 'text-sky-400',
    indicator: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
    idleIcon: 'text-sky-400/80 group-hover:text-sky-400',
    iconSurface: 'bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-200',
    cardHover: 'hover:border-sky-500/40 hover:shadow-sky-500/10',
  },
  amber: {
    activeIcon: 'text-amber-400',
    indicator: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    idleIcon: 'text-amber-400/80 group-hover:text-amber-400',
    iconSurface: 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-200',
    cardHover: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
  },
  indigo: {
    activeIcon: 'text-indigo-400',
    indicator: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]',
    idleIcon: 'text-indigo-400/80 group-hover:text-indigo-400',
    iconSurface: 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-200',
    cardHover: 'hover:border-indigo-500/40 hover:shadow-indigo-500/10',
  },
};
