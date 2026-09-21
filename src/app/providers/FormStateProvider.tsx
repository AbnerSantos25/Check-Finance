import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

/**
 * Guarda o que o usuário preencheu em cada ferramenta enquanto a aba do navegador
 * viver. Sem isto, sair de uma calculadora e voltar desmonta a página e os campos
 * regridem aos valores padrão. Deliberadamente em memória: não sobrevive a reload.
 *
 * A chave é uma string opaca para o provider, que assim não precisa conhecer os
 * tipos de nenhuma feature.
 */
const FormStateContext = createContext<Map<string, unknown> | null>(null);

export const FormStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useRef<Map<string, unknown>>(new Map()).current;
  return <FormStateContext.Provider value={store}>{children}</FormStateContext.Provider>;
};

export function usePersistentState<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const store = useContext(FormStateContext);
  if (!store) throw new Error('usePersistentState precisa de um FormStateProvider acima');

  const [value, setValue] = useState<T>(() => (store.has(key) ? (store.get(key) as T) : initial));

  useEffect(() => {
    store.set(key, value);
  }, [store, key, value]);

  return [value, setValue];
}
