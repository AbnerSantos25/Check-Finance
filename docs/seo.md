# SEO: medição

Este documento define como medir a estratégia de visibilidade no Google (Fases 1 a 4) e como decidir o que vem depois.

**Regra de ouro:** só conta o que veio da busca orgânica. No GA4, analise sempre com **Origem/mídia da sessão = `google / organic`**. Não use a "origem do primeiro usuário", que o GA4 também oferece.

Esse filtro já resolve três problemas de uma vez:

- **Robôs de data center.** Ashburn, Cheyenne, San Jose e Praga eram cerca de 41 dos 115 "usuários" de out/2026.
- **Medições do PageSpeed.** Desde a Fase 1 elas também saem marcadas como `traffic_type: internal`.
- **Visitas do dono e de conhecidos.** Essas vêm diretas ou por link.

**GA4 e Search Console não se comparam em número absoluto.** O GA4 só registra quem aceitou os cookies de análise, já que no Brasil o padrão é negado. O site ainda é pequeno demais para a modelagem do Consent Mode preencher essa lacuna. Use o GA4 para **proporções** (quanto dos visitantes faz X) e o Search Console para **volume** (impressões e cliques).

## Ponto de partida (out/2026, antes da Fase 1)

| Métrica | Valor |
| --- | --- |
| Usuários no GA4 (todas as origens) | 115, dos quais ~41 de data centers |
| Usuários vindos da busca orgânica | perto de zero (site com poucos dias) |
| Taxa de rejeição no início | 67,7%, inflada pelos robôs |
| H1 da página de juros | "Calculadora de Investimento a Longo Prazo" (fora do termo buscado) |
| Termo principal (Trends BR) | "calculadora juros compostos": interesse 99–100, estável |

## KPIs

| # | KPI | Onde ver | Por que importa |
| --- | --- | --- | --- |
| 1 | **Impressões** das consultas com "juros" | Search Console → Desempenho → Resultados da pesquisa, filtro *Consulta contém* `juros` | Primeiro sinal de que o Google passou a mostrar a página. Sobe antes dos cliques. |
| 2 | **Posição média** de "calculadora de juros compostos" e variações | Search Console, mesmo relatório, aba Consultas | Fora das 10 primeiras posições (posição > 10), quase não há clique. A meta é entrar na primeira página. |
| 3 | **Cliques orgânicos** em `/calculadora-juros-compostos` | Search Console, filtro *Página* | O resultado que importa. |
| 4 | **CTR** da página | Search Console | CTR baixo com posição boa indica que o título ou a descrição não convencem. |
| 5 | **Sessões engajadas** (orgânico) | GA4 → Relatórios → Aquisição → Aquisição de tráfego, filtro `google / organic` | Mostra se quem chega usa a calculadora ou sai. |
| 6 | **Eventos por página** (orgânico) | GA4 → Relatórios → Engajamento → Eventos | Mostra o que o visitante faz (tabela abaixo). |

### Eventos do site

| Evento | Quando dispara | Parâmetros | Para que serve |
| --- | --- | --- | --- |
| `page_view` | Troca de página | — | Base de tudo |
| `share` | Compartilhar simulação | `method`, `content_type`, `item_id` | Evento principal. Divulgação boca a boca. |
| `apoiar_abrir` | Abrir o modal "Apoiar" | `local` | Evento principal |
| `pix_copiar` | Copiar a chave PIX | — | Evento principal |
| `exemplo_calcular` | Botão "Fazer esta conta na calculadora" | `exemplo` | Indica se o conteúdo educativo leva ao uso da calculadora |
| `unidade_trocar` | Trocar a.a.↔a.m. ou anos↔meses | `campo` (`taxa`/`prazo`), `unidade` | Mede a demanda real por taxa ao mês e prazo em meses |
| `porcentagem_calcular` | Primeiro uso de cada conta da calculadora de porcentagem, uma vez por visita | `modo` (`de`, `quantos`, `aumento_desconto`, `variacao`, `sucessivos`) | Mostra quais contas as pessoas procuram; `sucessivos` mede o interesse na questão viral |
| `outra_calculadora` | Clique em "Outras calculadoras" | `origem`, `destino` | Indica se os links internos levam a outra ferramenta. Analise pelo parâmetro `origem`, não pelo "Caminho da página": a navegação é imediata e o evento pode sair registrado já na página de destino. Clique do meio e "abrir em nova aba" não contam, então o número é um piso. |

Para ver os parâmetros nos relatórios, cadastre cada um como **dimensão personalizada**:

1. GA4 → Administrador → Definições personalizadas → Criar dimensão personalizada.
2. Escolha o escopo **Evento**.
3. Use o mesmo nome do parâmetro: `local`, `exemplo`, `campo`, `unidade`, `origem`, `destino`, `modo`.

**Crie as dimensões no dia do deploy.** Elas não valem para trás: os dados só aparecem a partir do dia em que cada dimensão é criada.

## Quando olhar

| Quando | O quê |
| --- | --- |
| Logo depois de cada deploy com página nova | Search Console → Inspeção de URL → endereço da página (`/calculadora-juros-compostos`, `/calculadora-porcentagem`) → **Solicitar indexação**. No GA4, criar as dimensões personalizadas da seção anterior. |
| **3 semanas depois** | Primeira leitura: exportar os dados abaixo e decidir a Fase 3 com as regras seguintes. |
| 8 semanas depois | Segunda leitura. O Google leva semanas para estabilizar a posição de uma página nova. Não mude o título no meio do caminho por causa de uma oscilação. |
| Depois, todo mês | Repetir a exportação e comparar com o mês anterior. |

### O que exportar

1. **Search Console:**
   - Desempenho → Resultados da pesquisa → últimos 28 dias.
   - Marque **Impressões, Cliques, CTR e Posição**.
   - Exporte (botão **Exportar** → CSV) as abas **Consultas** e **Páginas**.
2. **Google Trends:**
   - País **Brasil**, últimos 12 meses.
   - Termos: `calculadora de juros compostos`, `juros compostos`, `porcentagem`.
   - Para cada um, exporte (⤓) **Consultas relacionadas**, nas visões "Principais" e "Em ascensão".
   - Atenção: o arquivo de out/2026 veio com região **Mundo**, e por isso apareceram consultas em espanhol e norueguês.
3. **GA4:**
   - Aquisição de tráfego, filtrado por `google / organic`.
   - Eventos, nos últimos 28 dias.

## Regras de decisão (próximas fases)

Os limites são deliberadamente baixos. Para um site novo, 50 impressões em 28 dias já indicam que o Google associa a página ao assunto.

| Sinal (28 dias) | Decisão |
| --- | --- |
| Consultas com "porcentagem", "aumento" ou "desconto" no Trends BR continuam em alta | Manter a **calculadora de porcentagem** (Fase 3). Ela não depende do Search Console, porque o sinal veio do Trends. |
| ≥ 50 impressões em consultas com "diário"/"diária" | Criar a opção de **taxa diária** (prazo em dias). |
| ≥ 50 impressões em consultas com "cdi", "cdb" ou "tesouro" | Criar o **simulador CDB/CDI/Tesouro × Poupança**. |
| Consultas com "fórmula" ou "juros simples" com impressões, mas posição > 20 | A seção na calculadora não basta. Criar um **artigo próprio** em `/aprenda/...` com link para a calculadora. |
| Posição ≤ 10 e CTR < 2% | Reescrever `seo.title` e `seo.description` em `src/config/tools.data.ts`. |
| ≥ 30% das sessões orgânicas da página com `unidade_trocar` e `unidade = mensal` | Avaliar **taxa ao mês como padrão** (hoje é ao ano). A conta é por **sessões**, não por eventos, porque quem alterna várias vezes infla os eventos. Para fazer: GA4 → **Explorar** → Exploração livre, com a métrica Sessões e um segmento de sessões que tenham o evento `unidade_trocar` com `unidade = mensal`; divida pelas sessões orgânicas da página. |
| `exemplo_calcular` em menos de 2% das sessões orgânicas da página | O conteúdo educativo não está levando à calculadora. Rever o texto do botão e a posição do exemplo. |
| Consultas com "porcentagem" com impressões, mas posição > 20 depois de 8 semanas | Reforçar a página com a conta mais procurada pelo `modo` do evento `porcentagem_calcular` (exemplos, texto e FAQ dessa conta). |
| `outra_calculadora` quase zero | Destacar mais o bloco "Outras calculadoras", ou trazê-lo para mais perto do resultado. |

## IndexNow (Bing e outros buscadores)

O [IndexNow](https://www.indexnow.org/) é o jeito de o site avisar Bing, Yandex, Seznam e Naver: "estas páginas mudaram, venham buscar". Assim o Bing atualiza em horas, e não em dias. O Google não usa IndexNow; para ele vale o sitemap.

- **Quando dispara:** o workflow `.github/workflows/indexnow.yml` roda a cada push na `main` que muda conteúdo (`src/`, `index.html`, `public/`). Merges que só mexem em dependências não avisam, porque o protocolo pede para avisar apenas o que mudou.
- **O que faz** (`scripts/indexnow.mjs`):
  1. espera o deploy da Cloudflare terminar (check run "Workers Builds" do commit);
  2. confere se a chave está no ar;
  3. lê as URLs do `sitemap.xml` publicado e as envia para `api.indexnow.org`.

  Se o deploy falhar, não envia nada.
- **A chave** fica em `public/00d079488946675105c1f68a973e8a25.txt`. Ela é pública de propósito: prova ao buscador que o aviso vem de quem controla o domínio. Para trocar a chave, renomeie o arquivo, atualize o conteúdo e a constante `KEY` no script.
- **Impacto no site:** nenhum. Nenhuma página carrega nada novo; tudo acontece no GitHub Actions.
- **Conferir:** no resumo do job em Actions → IndexNow (URLs e resposta: 200 ou 202 é sucesso) e no Bing Webmaster Tools → **IndexNow**.
- **Rodar à mão:** Actions → IndexNow → **Run workflow**.

## Fora do site (Fase 4)

Links de outros sites e menções à marca pesam no ranqueamento, e o site sozinho não consegue gerá-los. O passo a passo está em [`docs/divulgacao.md`](divulgacao.md): Bing Webmaster Tools, link no site da ABS Tecnologia, perfis oficiais (que entram no `sameAs` do JSON-LD), comunidades e blogs.
