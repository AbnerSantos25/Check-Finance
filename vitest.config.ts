import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Herda alias, plugins e `define` do build — senão um teste que importe via '@' ou
// leia uma constante de build quebra, mesmo com tsc e vite build passando.
export default mergeConfig(
  viteConfig({ command: 'serve', mode: 'test' }),
  defineConfig({
    test: {
      environment: 'node',
    },
  })
);
