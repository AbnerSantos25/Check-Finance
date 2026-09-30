# Desempenho

Meta: **≥ 90 no PageSpeed Insights, aba Celular**, em todas as páginas. O desktop passa com folga quando o celular passa, porque o celular é medido com CPU 4× mais lenta e 4G lento.

## Por que a nota era 40 (set/2026)

O HTML, o CSS e o JavaScript do site são leves. O que derrubava a nota era o JavaScript de terceiros executado durante o carregamento:

| Script | Custo na thread principal |
| --- | --- |
| AdSense / DoubleClick | 1.214 ms |
| FundingChoices (mensagem de consentimento do AdSense) | 609 ms |
| Tag Manager | 405 ms |

Somava-se a isso o CSS do Google Fonts bloqueando a renderização por 780 ms. Resultado: LCP de 6,8 s e TBT de 1,4 s.

## Regras para manter a nota

1. **Nenhum script de terceiro no `<head>` nem síncrono.** AdSense e Analytics entram pelo carregador em `index.html`, no primeiro toque, rolagem ou tecla, ou `THIRD_PARTY_DELAY_MS` (4 s) depois do `load`.
   - Qualquer tag nova (pixel, chat, heatmap) entra no mesmo carregador, dentro de `load()`.
   - A conta do AdSense é verificada pela meta `google-adsense-account`. O `ads.txt` continua em `public/`.
2. **Fontes só autohospedadas.** A Plus Jakarta Sans vem de `@fontsource-variable/plus-jakarta-sans`, importada em `src/main.tsx`. O build faz preload do arquivo latino (`preloadFont` em `vite.config.ts`).
   - Nada de `fonts.googleapis.com`.
   - Fonte nova precisa de uso real no CSS: o JetBrains Mono era baixado sem nunca ser usado.
3. **Código que só roda depois de um clique vai em import dinâmico.** Modais usam `React.lazy`: veja `ModalsProvider.tsx` e o `MethodologyModal` em `InvestmentPage.tsx`. Biblioteca pesada (gráficos, QR code) nunca entra no bundle do hub.
4. **O `<meta charset>` precisa estar nos primeiros 1024 bytes.** O pré-render injeta o `<Head>` da rota no topo do `<head>`, e o `hoistHeadEssentials` em `vite.config.ts` devolve charset e viewport ao começo. Não remova esse passo.
5. **Busca de dados não compete com a primeira pintura.** Os indicadores do BCB esperam o navegador ficar ocioso (`requestIdleCallback` no `EconomicDataProvider`).

## Guardas automáticas

### Em cada PR: Lighthouse CI (`.github/workflows/ci.yml`)

Roda lint, testes e build. Depois roda o Lighthouse mobile 3 vezes em cada rota, contra o build servido pelo `vite preview`. Os limites ficam em `lighthouserc.cjs`:

| Rota | Desempenho mínimo | Demais |
| --- | --- | --- |
| Hub (`/`) | 0,90 | Acessibilidade, práticas e SEO ≥ 0,95 e CLS ≤ 0,1 em todas as rotas |
| Ferramentas | 0,60 (medido: 0,72 a 0,85) | idem |

- O PR fica vermelho se algum limite for violado.
- LCP e TBT acima do alvo geram só aviso.
- O link do relatório completo de cada execução aparece no log do passo "Lighthouse CI".
- Na maioria das execuções, o Lighthouse termina antes do carregador de AdSense e Analytics disparar, então o CI mede sobretudo o código do site. Nas páginas de ferramenta, mais lentas, às vezes o prazo de 4 s vence dentro da medição. O efeito real dos terceiros aparece na medição semanal.
- **Ajustar limites:** só suba. Baixar um limite para o PR passar esconde uma regressão.

### Toda segunda-feira: PageSpeed em produção (`.github/workflows/pagespeed.yml`)

- Consulta a API do PageSpeed Insights para cada URL do `sitemap.xml` publicado.
- Escreve a tabela de notas e métricas no resumo do job, com dados de usuários reais (CrUX) quando houver tráfego suficiente.
- Abre, ou comenta, a issue **"PageSpeed abaixo do limite"** se alguma página ficar abaixo de 80.
- Pode ser disparado à mão em Actions → PageSpeed semanal → Run workflow.

**Configuração (uma vez):**

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto (ou use um existente) e ative a **PageSpeed Insights API**.
2. Em "APIs e serviços → Credenciais", crie uma **chave de API**. Restrinja a chave à PageSpeed Insights API.
3. No GitHub, em Settings → Secrets and variables → Actions, crie o secret **`PSI_API_KEY`** com a chave.

Sem a chave, a cota anônima da API costuma estar esgotada e o job falha.

## Cloudflare

O **Web Analytics** da Cloudflare injetava o `beacon.min.js`, que traz 10 KiB com polyfills legados e cache de 1 dia. O Google Analytics já mede o tráfego, então ele deve ficar desligado:

1. No painel da Cloudflare, abra **Analytics & Logs → Web Analytics**.
2. Em checkfinance.com.br, abra **Manage site** e desative a medição automática (*Enable/Disable* ou *Automatic setup*).
3. Confirme no código-fonte da página publicada que `beacon.min.js` não aparece mais.

## Como investigar uma queda

1. Abra o relatório no [PageSpeed Insights](https://pagespeed.web.dev/report?url=https%3A%2F%2Fcheckfinance.com.br%2F) na aba Celular e olhe **"Reduza o tempo de execução do JavaScript"** e **"Terceiros"**.
   - Se o peso for de terceiros, alguém carregou script fora do carregador.
   - Se for do próprio site, o chunk que cresceu aparece pelo nome.
2. No CI, compare o relatório do PR com o de `main`.
3. Métricas de laboratório variam de uma execução para outra. Uma queda de poucos pontos numa única medição não é regressão; uma que se repete é.
