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
}

// Classes escritas por extenso: o Tailwind varre o código como texto e não
// enxergaria nomes montados por interpolação.
export const ACCENT_CLASSES: Record<ToolAccent, AccentClasses> = {
  emerald: {
    activeIcon: 'text-emerald-400',
    indicator: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    idleIcon: 'text-emerald-400/80 group-hover:text-emerald-400',
  },
  sky: {
    activeIcon: 'text-sky-400',
    indicator: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
    idleIcon: 'text-sky-400/80 group-hover:text-sky-400',
  },
  amber: {
    activeIcon: 'text-amber-400',
    indicator: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    idleIcon: 'text-amber-400/80 group-hover:text-amber-400',
  },
  indigo: {
    activeIcon: 'text-indigo-400',
    indicator: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]',
    idleIcon: 'text-indigo-400/80 group-hover:text-indigo-400',
  },
};
