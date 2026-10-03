import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig} from 'vite';
import {absoluteUrl} from './src/config/site.ts';
import {ACTIVE_TOOLS} from './src/config/tools.data.ts';

/** Os `.html` gerados pelo pré-render, um por rota. */
const htmlFiles = (dist: string) =>
  fs.readdirSync(dist).filter((f) => f.endsWith('.html')).map((f) => path.join(dist, f));

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
  for (const file of htmlFiles(dist)) {
    const html = fs.readFileSync(file, 'utf8');
    if (html.includes(chunk)) continue;
    fs.writeFileSync(file, html.replace('</head>', `${tag}</head>`));
  }
};

/**
 * Devolve `<meta charset>` e `<meta viewport>` ao topo do `<head>`.
 *
 * O `<Head>` de cada rota (título, description, OpenGraph, JSON-LD) é injetado no
 * começo do `<head>`, antes das tags do index.html. Com isso o charset caía além
 * dos primeiros 1024 bytes, onde o navegador procura a declaração — ele pode ter de
 * reinterpretar o documento, e o Lighthouse reprova a página em práticas
 * recomendadas por isso.
 */
const hoistHeadEssentials = (dist: string) => {
  const essentials = [/<meta charset="[^"]*"\s*\/?>/i, /<meta name="viewport"[^>]*>/i];
  for (const file of htmlFiles(dist)) {
    let html = fs.readFileSync(file, 'utf8');
    const tags: string[] = [];
    for (const pattern of essentials) {
      const match = html.match(pattern);
      if (!match) continue;
      tags.push(match[0]);
      html = html.replace(match[0], '');
    }
    fs.writeFileSync(file, html.replace(/<head>/i, `<head>${tags.join('')}`));
  }
};

/**
 * Preload do arquivo latino da Plus Jakarta Sans, a fonte de todo o texto.
 *
 * Sem ele o navegador só descobre a fonte depois de baixar e aplicar o CSS, e o
 * texto da LCP pinta duas vezes: na fonte do sistema e de novo na definitiva. O
 * nome tem hash, por isso a tag é escrita aqui e não no index.html.
 */
const preloadFont = (dist: string) => {
  const assets = path.join(dist, 'assets');
  const font = fs
    .readdirSync(assets)
    .find((file) => /^plus-jakarta-sans-latin-wght-normal-[\w-]+\.woff2$/.test(file));
  if (!font) throw new Error('[build] fonte latina da Plus Jakarta Sans não encontrada em dist/assets');

  const tag = `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${font}">`;
  for (const file of htmlFiles(dist)) {
    const html = fs.readFileSync(file, 'utf8');
    if (html.includes(tag)) continue;
    fs.writeFileSync(file, html.replace('</head>', `${tag}</head>`));
  }
};

/**
 * Tira do `<head>` publicado os comentários do index.html.
 *
 * Eles documentam o arquivo para quem o edita (por que o gtag é atrasado, como o
 * tema é decidido…) e iam inteiros para toda página, baixados por todo visitante.
 * Só o `<head>`: no `<body>` o React usa comentários (`<!--$-->`, `<!-- -->`) como
 * marcadores de hidratação, e removê-los quebraria a página.
 */
const stripHeadComments = (dist: string) => {
  for (const file of htmlFiles(dist)) {
    const html = fs.readFileSync(file, 'utf8');
    const stripped = html.replace(/<head>[\s\S]*?<\/head>/i, (head) => head.replace(/<!--[\s\S]*?-->\s*/g, ''));
    if (stripped !== html) fs.writeFileSync(file, stripped);
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
        '@': path.resolve(import.meta.dirname, '.'),
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
      // CSS crítico inline desligado. Com o Tailwind v4 o "crítico" dá ~8 kB gzip de
      // 13 kB do arquivo inteiro — regras globais, variáveis e @property que toda página
      // usa. Inline, isso engordava todo HTML (que não tem cache longo) e o CSS era
      // baixado de novo em seguida, para economizar uma requisição de mesma origem.
      beastiesOptions: false as const,
      // `mock` fica desligado de propósito: fingir `window` no Node faz bibliotecas
      // acharem que estão no navegador e renderem markup que a hidratação desmente.
      // O que depende de DOM — os gráficos — está dentro de <ClientOnly>.
      onFinished: () => {
        const dist = path.resolve(import.meta.dirname, 'dist');
        preloadClientChunk(dist);
        preloadFont(dist);
        hoistHeadEssentials(dist);
        writeSitemap(dist);
        stripHeadComments(dist);
        removeBuildMetadata(dist);
      },
    },
    build: {
      target: 'esnext',
      // Minificador padrão do Vite 8 (Oxc).
      minify: true,
      cssMinify: true,
      // Nenhuma fonte vira data: URI. O subconjunto cirílico da Plus Jakarta tem menos
      // de 4 kB e o Vite o embutia em base64 no CSS — CSS que bloqueia a renderização,
      // carregando bytes de uma fonte que texto em português nunca usa. Como arquivo,
      // o navegador só o baixa se o `unicode-range` casar.
      assetsInlineLimit: (file: string) => (file.endsWith('.woff2') ? false : undefined),
      sourcemap: false,
      rolldownOptions: {
        output: {
          // Os ícones do lucide trazem um comentário `@license` por arquivo, que o
          // bundler preserva por padrão: o chunk `vendor-icons` saía com dezenas deles
          // e o Lighthouse o apontava como não minificado. A licença (ISC) continua
          // no pacote; o bundle não precisa carregar uma cópia por ícone.
          comments: { legal: false },
          // Só no bundle do navegador: no build de servidor estas dependências ficam
          // externas, e um módulo externo não pode ser nomeado num grupo de chunk.
          //
          // O recharts NÃO entra aqui de propósito. Forçá-lo num chunk nomeado o
          // promovia ao grafo do entry, e o HTML de toda rota — inclusive o hub, que
          // não tem gráfico nenhum — saía com um `modulepreload` de 393 kB. Sem o
          // nome fixo, ele fica dentro do chunk das páginas que realmente o importam.
          //
          // O lucide fica, porque o shell (sidebar, header, rodapé) usa ícones em
          // todas as rotas: é carregamento legítimo e ganha cache próprio.
          ...(isSsrBuild
            ? {}
            : { codeSplitting: { groups: [{ name: 'vendor-icons', test: /[\\/]node_modules[\\/]lucide-react[\\/]/ }] } }),
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
