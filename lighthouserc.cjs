/**
 * Lighthouse CI: roda em cada PR (ver .github/workflows/lighthouse.yml) contra o
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
          // Ferramentas: a hidratação com os gráficos do recharts ainda custa caro no
          // celular (0,72 a 0,85 medidos localmente). O piso barra regressão grande sem
          // deixar o CI instável; suba-o quando os gráficos passarem a montar só ao
          // entrar na tela.
          matchingUrlPattern: `^http://localhost:${PORT}/.+`,
          aggregationMethod: 'median-run',
          assertions: {
            'categories:performance': ['error', { minScore: 0.6 }],
            'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
            'total-blocking-time': ['warn', { maxNumericValue: 600 }],
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
