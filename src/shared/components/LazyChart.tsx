import React, { useEffect, useRef, useState } from 'react';
import { ChartFallback } from './ChartFallback';

/**
 * Monta um gráfico só quando ele se aproxima da área visível.
 *
 * Substitui o `<ClientOnly>` nos gráficos: continua fora do HTML pré-renderizado
 * (o `ResponsiveContainer` do recharts mede o DOM, ver `ChartFallback`), mas também
 * deixa de montar logo depois da hidratação. No celular os gráficos ficam abaixo
 * do formulário, e montá-los de saída somava centenas de milissegundos de
 * JavaScript à carga da página — era o que segurava o TBT das calculadoras.
 *
 * Servidor e primeira renderização no navegador mostram o mesmo fallback, então a
 * hidratação não diverge. O invólucro ocupa 100% do contêiner, como o
 * `ResponsiveContainer` que ele envolve, e o layout não pula quando o gráfico entra.
 */
export const LazyChart: React.FC<{ children: () => React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    // A margem começa a montar um pouco antes de o gráfico entrar na tela, para
    // quem rola não chegar a ver o placeholder.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full h-full">
      {visible ? children() : <ChartFallback />}
    </div>
  );
};
