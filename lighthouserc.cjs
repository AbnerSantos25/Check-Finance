/**
 * Lighthouse CI: roda em cada PR (ver .github/workflows/ci.yml) contra o
 * build de produção servido pelo `vite preview`, que resolve as URLs sem `.html`
 * como a Cloudflare faz. Acessar /rota.html cairia no 404 do roteador no cliente.
 *
 * Configuração padrão do Lighthouse = emulação mobile (Moto G Power, 4G lento, CPU
 * 4x mais lenta), a mesma aba "Celular" do PageSpeed.
 *
 * Os limites de `performance` e das métricas levam em conta que o runner do GitHub
 * é mais lento e mais ruidoso que o servidor do PageSpeed. Para mexer neles, veja
 * docs/performance.md.
 */
const PORT = 4173;
const ROUTES = [
  '/',
  '/calculadora-juros-compostos',
  '/simulador-financiamento-imobiliario',
  '/calculadora-independencia-financeira',
];

module.exports = {
  ci: {
    collect: {
      startServerCommand: `npx vite preview --port ${PORT} --strictPort`,
      startServerReadyPattern: 'Local',
      url: ROUTES.map((route) => `http://localhost:${PORT}${route}`),
      numberOfRuns: 3,
      settings: {
        // O runner do GitHub não tem sandbox de usuário para o Chrome.
        chromeFlags: '--no-sandbox',
        // O CI mede o código do site, não o dos terceiros. Nas páginas mais lentas o
        // prazo do carregador de anúncios (index.html) vence dentro da medição, e o
        // AdSense servido para `localhost` grava cookie de terceiro — reprovando
        // "práticas recomendadas" por algo que em produção não acontece assim.
        // AdSense e Analytics são medidos de verdade pelo PageSpeed semanal.
        //
        // O `/api/*` (indicadores do BCB e IBOVESPA) é do Worker da Cloudflare, que
        // o `vite preview` não roda: sem o bloqueio ele responde 500 e vira erro de
        // console. A página mostra os valores de referência, como quando a API cai.
        blockedUrlPatterns: [
          '*googlesyndication.com*',
          '*doubleclick.net*',
          '*googletagmanager.com*',
          '*google-analytics.com*',
          '*fundingchoicesmessages.google.com*',
          '*adtrafficquality.google*',
          '*/api/*',
        ],
      },
    },
    assert: {
      // Cada bloco compara a execução mediana de cada URL, não a pior: com 3 execuções,
      // um pico isolado do runner não reprova o PR.
      assertMatrix: [
        {
          // Todas as rotas: acessibilidade, práticas, SEO e estabilidade visual não
          // dependem do peso da página, então o piso é o mesmo para todas.
          matchingUrlPattern: '.*',
          aggregationMethod: 'median-run',
          assertions: {
            'categories:accessibility': ['error', { minScore: 0.95 }],
            'categories:best-practices': ['error', { minScore: 0.95 }],
            'categories:seo': ['error', { minScore: 0.95 }],
            'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
          },
        },
        {
          // Hub: a página que o PageSpeed do Search Console mede.
          matchingUrlPattern: `^http://localhost:${PORT}/$`,
          aggregationMethod: 'median-run',
          assertions: {
            'categories:performance': ['error', { minScore: 0.9 }],
            'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
            'total-blocking-time': ['warn', { maxNumericValue: 200 }],
          },
        },
        {
          // Ferramentas: com os gráficos montados só ao entrar na tela (LazyChart), a
          // medição local ficou em 0,91 a 0,93. O piso fica abaixo disso para absorver
          // o ruído do runner; o FCP das ferramentas (~2,6 s, HTML maior que o do hub)
          // é o que ainda as separa da nota do hub.
          matchingUrlPattern: `^http://localhost:${PORT}/.+`,
          aggregationMethod: 'median-run',
          assertions: {
            'categories:performance': ['error', { minScore: 0.8 }],
            'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
            'total-blocking-time': ['warn', { maxNumericValue: 300 }],
          },
        },
      ],
    },
    upload: {
      // Relatório completo num link público temporário (~7 dias), impresso no log.
      target: 'temporary-public-storage',
    },
  },
};
