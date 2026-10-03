import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'cf-theme';
// O mesmo valor que o script do index.html põe antes da primeira pintura.
const THEME_COLOR: Record<Theme, string> = { dark: '#0b0d12', light: '#f4f6fa' };

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
};

const storedTheme = (): Theme | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
};

/**
 * Alterna entre tema claro e escuro e lembra a escolha.
 *
 * O tema inicial é decidido pelo script do index.html, antes do React. Os dois
 * ícones vão no HTML e o CSS mostra um deles conforme o `data-theme`: o botão sai
 * igual no pré-render e no cliente, sem estado de tema no React e sem re-render.
 */
export const ThemeToggle: React.FC = () => {
  // Sem escolha gravada, acompanha o sistema também com a página aberta.
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: light)');
    const follow = (event: MediaQueryListEvent) => {
      if (!storedTheme()) applyTheme(event.matches ? 'light' : 'dark');
    };
    media.addEventListener('change', follow);
    return () => media.removeEventListener('change', follow);
  }, []);

  const toggle = () => {
    const next: Theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Sem armazenamento (modo privado restrito): o tema vale até recarregar.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title="Alternar tema claro e escuro"
      aria-label="Alternar tema claro e escuro"
      className="flex items-center justify-center min-h-11 min-w-11 md:min-h-0 md:min-w-0 p-2 rounded-xl bg-surface hover:bg-line-soft border border-line text-slate-300 hover:text-white transition-colors"
    >
      <Moon className="w-3.5 h-3.5 light:hidden" aria-hidden="true" />
      <Sun className="w-3.5 h-3.5 hidden light:block" aria-hidden="true" />
    </button>
  );
};
