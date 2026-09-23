import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig} from 'vite';
import {absoluteUrl} from './src/config/site';
import {ACTIVE_TOOLS} from './src/config/tools.data';

/**
 * Acrescenta o `modulepreload` do chunk do react-dom a cada página gerada.
 *
 * O `vite-react-ssg` carrega o react-dom por import dinâmico, então o Vite não
 * emite preload para ele: o navegador só descobre esse arquivo de 210 kB depois de
 * baixar e analisar o bundle principal, uma ida e volta em série antes da primeira
 * renderização.
 */
const preloadClientChunk = (dist: string) => {
  const assets = path.join(dist, 'assets');
  if (!fs.existsSync(assets)) return;

  const chunk = fs.readdirSync(assets).find((file) => /^client-[\w-]+\.js$/.test(file));
  if (!chunk) return;

  const tag = `<link rel="modulepreload" crossorigin href="/assets/${chunk}">`;
  for (const file of fs.readdirSync(dist).filter((f) => f.endsWith('.html'))) {
    const full = path.join(dist, file);
    const html = fs.readFileSync(full, 'utf8');
    if (html.includes(chunk)) continue;
    fs.writeFileSync(full, html.replace('</head>', `${tag}</head>`));
  }
};

/**
 * Apaga o `dist/.vite/`, que o build deixa para trás.
 *
 * São metadados de compilação: nenhum bundle os busca em runtime, mas o Cloudflare
 * serve tudo que está no diretório de assets — então iam ao ar como 200 públicos.
 * Além dos 248 kB inúteis, o `ssr-manifest.json` lista o grafo completo de módulos
 * com os caminhos absolutos da máquina que gerou o build.
 */
const removeBuildMetadata = (dist: string) => {
  fs.rmSync(path.join(dist, '.vite'), { recursive: true, force: true });
};

interface SitemapEntry {
  path: string;
  priority: number;
  changefreq: string;
}

/**
 * Escreve o sitemap.xml a partir do registry, depois que o pré-render termina.
 *
 * Ferramentas marcadas como `em-breve` ficam de fora: elas não têm rota, e
 * anunciá-las entregaria um 404 ao rastreador.
 */
const writeSitemap = (dist: string) => {
  const entries: SitemapEntry[] = [
    { path: '/', priority: 1, changefreq: 'weekly' },
    ...ACTIVE_TOOLS.map((tool) => ({
      path: tool.path,
      priority: tool.seo.priority,
      changefreq: tool.seo.changefreq,
    })),
  ];

  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${absoluteUrl(entry.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  fs.writeFileSync(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
};

export default defineConfig(({ isSsrBuild }) => {
  return {
    plugins: [react(), tailwindcss()],
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      // Constante de build: `new Date()` em render daria um valor na
      // pré-renderização e outro na hidratação. Ver src/vite-env.d.ts.
      __BUILD_YEAR__: new Date().getFullYear(),
    },
    ssgOptions: {
      entry: 'src/main.tsx',
      // 'flat' gera dist/calculadora-juros-compostos.html, que é o formato que o
      // `html_handling = "auto-trailing-slash"` do Cloudflare resolve sem redirect.
      dirStyle: 'flat' as const,
      // 'defer', não 'async': o vite-react-ssg injeta `__VITE_REACT_SSG_HASH__` num
      // script inline no fim do body, e com `async` o bundle executa antes dele.
      // O hash sai `undefined`, o app pede
      // /static-loader-data-manifest-undefined.json, toma 404, cai na tela de erro
      // e o resultado é um descasamento de hidratação contra o HTML pré-renderizado.
      script: 'defer' as const,
      // `mock` fica desligado de propósito: fingir `window` no Node faz bibliotecas
      // acharem que estão no navegador e renderem markup que a hidratação desmente.
      // O que depende de DOM — os gráficos — está dentro de <ClientOnly>.
      onFinished: () => {
        const dist = path.resolve(__dirname, 'dist');
        preloadClientChunk(dist);
        writeSitemap(dist);
        removeBuildMetadata(dist);
      },
    },
    build: {
      target: 'esnext',
      minify: 'esbuild' as const,
      cssMinify: true,
      sourcemap: false,
      rollupOptions: {
        // Só no bundle do navegador: no build de servidor estas dependências ficam
        // externas, e o Rollup recusa nomear um módulo externo em manualChunks.
        output: isSsrBuild
          ? {}
          : {
              manualChunks: {
                'vendor-charts': ['recharts'],
                'vendor-icons': ['lucide-react'],
              },
            },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // O Worker roda no wrangler (npm run dev:api) na porta 8788.
      proxy: {
        '/api': 'http://localhost:8788',
      },
    },
  };
});
