import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {DEFAULT_OG_IMAGE, SITE_LOCALE, SITE_NAME, absoluteUrl} from './src/config/site';
import {ACTIVE_TOOLS, type ToolId} from './src/config/tools.data';
import {HOME_SEO, homeJsonLd} from './src/features/home/seo';
import {investmentJsonLd} from './src/features/investimentos/seo';
import {financingJsonLd} from './src/features/financiamento/seo';

/** Grafo Schema.org de cada ferramenta, o mesmo que a rota emite em runtime. */
const TOOL_JSON_LD: Partial<Record<ToolId, unknown[]>> = {
  investimentos: investmentJsonLd,
  financiamento: financingJsonLd,
};

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

interface RoutePage {
  /** Nome do arquivo em dist/, sem barra inicial. */
  file: string;
  path: string;
  title: string;
  description: string;
  jsonLd?: unknown[];
  noIndex?: boolean;
  /** Entra no sitemap apenas quando definido. */
  sitemap?: { priority: number; changefreq: string };
}

/**
 * Todas as tags de SEO da rota, marcadas com `data-rh`.
 *
 * O atributo não é decorativo: é assim que o react-helmet-async reconhece uma tag
 * como sua e a SUBSTITUI ao montar. Sem ele, a tag estática permanece e convive com
 * a que o componente <Seo> cria — duas descriptions na mesma página, e a errada vindo
 * primeiro no DOM.
 */
const routeMetaTags = (page: RoutePage): string => {
  const url = absoluteUrl(page.path);
  const image = absoluteUrl(DEFAULT_OG_IMAGE);
  const robots = page.noIndex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1';

  const tags = [
    `<meta data-rh="true" name="description" content="${escapeAttr(page.description)}" />`,
    `<meta data-rh="true" name="robots" content="${robots}" />`,
    `<meta data-rh="true" property="og:title" content="${escapeAttr(page.title)}" />`,
    `<meta data-rh="true" property="og:description" content="${escapeAttr(page.description)}" />`,
    `<meta data-rh="true" property="og:url" content="${url}" />`,
    `<meta data-rh="true" property="og:type" content="website" />`,
    `<meta data-rh="true" property="og:site_name" content="${SITE_NAME}" />`,
    `<meta data-rh="true" property="og:locale" content="${SITE_LOCALE}" />`,
    `<meta data-rh="true" property="og:image" content="${image}" />`,
    `<meta data-rh="true" name="twitter:card" content="summary_large_image" />`,
    `<meta data-rh="true" name="twitter:title" content="${escapeAttr(page.title)}" />`,
    `<meta data-rh="true" name="twitter:description" content="${escapeAttr(page.description)}" />`,
    `<meta data-rh="true" name="twitter:image" content="${image}" />`,
  ];

  if (!page.noIndex) {
    tags.push(`<link data-rh="true" rel="canonical" href="${url}" />`);
  }
  if (page.jsonLd?.length) {
    tags.push(
      `<script data-rh="true" type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': page.jsonLd,
      })}</script>`
    );
  }

  return tags.join('\n    ');
};

/**
 * Escreve um HTML por rota, com os metadados daquela rota já no documento servido,
 * mais o 404.html e o sitemap.xml.
 *
 * Dois problemas resolvidos de uma vez:
 *
 * 1. Roteamento. Sem um arquivo por rota o Cloudflare precisaria de
 *    `not_found_handling = "single-page-application"`, que responde 200 com HTML para
 *    *qualquer* caminho — inclusive `/assets/chunk-antigo.js`, que o navegador tentaria
 *    interpretar como JavaScript, e inclusive URLs inexistentes, que viram soft-404.
 *
 * 2. Metadados. O <Seo> roda em JavaScript, e quem desdobra link — WhatsApp, Slack,
 *    LinkedIn, X — não executa JavaScript. Sem as tags no HTML servido, o link
 *    compartilhado aparece sem descrição e sem imagem.
 *
 * A Fase 6 troca estas cópias por HTML de fato pré-renderizado; o `wrangler.toml`
 * não muda.
 */
const staticRouteHtml = (): Plugin => ({
  name: 'check-finance:static-route-html',
  apply: 'build',
  writeBundle(_options, bundle) {
    const dist = path.resolve(__dirname, 'dist');
    let shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

    // O react-dom entra por import dinâmico do vite-react-ssg, então o Vite não
    // gera preload para ele: sem esta linha o navegador só descobre o segundo
    // arquivo depois de baixar e analisar o primeiro, em série.
    const clientChunk = Object.keys(bundle).find((f) => /^assets\/client-[\w-]+\.js$/.test(f));
    if (clientChunk && !shell.includes(clientChunk)) {
      shell = shell.replace(
        '</head>',
        `  <link rel="modulepreload" crossorigin href="/${clientChunk}" />\n  </head>`
      );
    }

    const pages: RoutePage[] = [
      {
        file: 'index.html',
        path: '/',
        title: HOME_SEO.title,
        description: HOME_SEO.description,
        jsonLd: homeJsonLd,
        sitemap: { priority: 1, changefreq: 'weekly' },
      },
      ...ACTIVE_TOOLS.map((tool) => ({
        file: `${tool.path.replace(/^\//, '')}.html`,
        path: tool.path,
        title: tool.seo.title,
        description: tool.seo.description,
        jsonLd: TOOL_JSON_LD[tool.id],
        sitemap: { priority: tool.seo.priority, changefreq: tool.seo.changefreq },
      })),
      {
        file: '404.html',
        path: '/404',
        title: 'Página não encontrada | CheckFinance',
        description:
          'O endereço acessado não existe no CheckFinance. Veja as calculadoras financeiras disponíveis.',
        noIndex: true,
      },
    ];

    for (const page of pages) {
      const html = shell.replace('</head>', `  ${routeMetaTags(page)}\n  </head>`);
      fs.writeFileSync(path.join(dist, page.file), html);
    }

    const lastmod = new Date().toISOString().slice(0, 10);
    const urls = pages
      .filter((page) => page.sitemap)
      .map(
        (page) => `  <url>
    <loc>${absoluteUrl(page.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.sitemap!.changefreq}</changefreq>
    <priority>${page.sitemap!.priority.toFixed(1)}</priority>
  </url>`
      )
      .join('\n');

    fs.writeFileSync(
      path.join(dist, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
    );
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
