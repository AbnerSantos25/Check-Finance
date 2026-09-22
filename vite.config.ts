import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {ACTIVE_TOOLS} from './src/config/tools.data';

/**
 * Escreve uma cópia do index.html em cada rota de ferramenta, mais um 404.html.
 *
 * Sem isto o Cloudflare precisaria de `not_found_handling = "single-page-application"`,
 * que responde 200 com HTML para *qualquer* caminho — inclusive `/assets/chunk-antigo.js`,
 * que o navegador tentaria interpretar como JavaScript, e inclusive URLs inexistentes,
 * que viram soft-404 aos olhos dos buscadores. Com um arquivo por rota, cada slug é um
 * 200 de verdade e o resto é um 404 de verdade.
 *
 * O conteúdo ainda é a casca vazia do SPA; a Fase 6 troca estas cópias por HTML
 * pré-renderizado sem mexer na configuração do Cloudflare.
 */
const staticRouteHtml = (): Plugin => ({
  name: 'check-finance:static-route-html',
  apply: 'build',
  closeBundle() {
    const dist = path.resolve(__dirname, 'dist');
    const shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

    for (const tool of ACTIVE_TOOLS) {
      fs.writeFileSync(path.join(dist, `${tool.path.replace(/^\//, '')}.html`), shell);
    }
    fs.writeFileSync(path.join(dist, '404.html'), shell);
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), staticRouteHtml()],
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'esnext',
      minify: 'esbuild' as const,
      cssMinify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-charts': ['recharts'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // As Pages Functions rodam no wrangler (npm run dev:api) na porta 8788.
      proxy: {
        '/api': 'http://localhost:8788',
      },
    },
  };
});
