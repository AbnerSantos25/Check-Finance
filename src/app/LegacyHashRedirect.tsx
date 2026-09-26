import type React from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resolveLegacyHash } from './legacyHashes';

/**
 * Manda quem chegou por um endereço antigo (`/#calculadora` e companhia) para a
 * rota equivalente.
 *
 * Só age na raiz: era lá que o site inteiro vivia antes das rotas. Numa rota de
 * ferramenta, um `#` é âncora de seção e tem de continuar sendo.
 *
 * Troca a entrada no histórico em vez de empilhar — senão o botão "voltar"
 * devolveria o visitante ao endereço antigo e o desvio aconteceria de novo, sem
 * nunca deixar ele sair.
 */
export const LegacyHashRedirect: React.FC = () => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname !== '/' || !hash) return;

    const target = resolveLegacyHash(hash);
    // Se um dia o destino for a própria raiz, navegar mesmo assim limpa o
    // fragmento da barra de endereço. Como o `hash` fica vazio depois disso, o
    // efeito não se repete.
    if (target) navigate(target, { replace: true });
  }, [pathname, hash, navigate]);

  return null;
};
