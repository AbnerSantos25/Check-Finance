import React from 'react';

/**
 * Ocupa o lugar de um gráfico até o JavaScript assumir.
 *
 * O `ResponsiveContainer` do recharts mede o DOM para se dimensionar, coisa que não
 * existe na pré-renderização: ele sairia vazio no HTML e diferente depois da
 * hidratação, que é exatamente o descasamento que o React reclama. Como o gráfico
 * não tem valor de indexação, é mais simples deixá-lo fora do HTML e só montar no
 * navegador.
 *
 * Ocupa 100% do contêiner, que já tem altura fixa — o layout não pula quando o
 * gráfico real entra.
 */
export const ChartFallback: React.FC = () => (
  <div className="w-full h-full rounded-xl bg-surface-2/40 animate-pulse" aria-hidden="true" />
);
