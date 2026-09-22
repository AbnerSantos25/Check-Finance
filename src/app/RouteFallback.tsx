import React from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * Tela do intervalo entre abrir um deep link e o chunk da rota terminar de baixar.
 * Sem isto o `RouterProvider` renderiza `null` e a página fica em branco — o que é
 * curto na banda do escritório e bem visível no 4G.
 */
export const RouteFallback: React.FC = () => (
  <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-200 text-slate-950 animate-pulse">
      <TrendingUp className="w-6 h-6" />
    </div>
    <p className="text-xs font-medium text-slate-400">Carregando a calculadora…</p>
  </div>
);
