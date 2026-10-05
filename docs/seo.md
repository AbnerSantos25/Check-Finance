# SEO: medição

Este documento define como medir a estratégia de visibilidade no Google (Fases 1 a 4) e como decidir o que vem depois.

**Regra de ouro:** só conta o que veio da busca orgânica. No GA4, analise sempre com **Origem/mídia = `google / organic`**.

Esse filtro já resolve três problemas de uma vez:

- **Robôs de data center.** Ashburn, Cheyenne, San Jose e Praga eram cerca de 41 dos 115 "usuários" de out/2026.
- **Medições do PageSpeed.** Desde a Fase 1 elas também saem marcadas como `traffic_type: internal`.
- **Visitas do dono e de conhecidos.** Essas vêm diretas ou por link.

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
| 2 | **Posição média** de "calculadora de juros compostos" e variações | Search Console, mesmo relatório, aba Consultas | Abaixo de 10 quase não há clique. A meta é entrar na primeira página. |
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
| `outra_calculadora` | Clique em "Outras calculadoras" | `origem`, `destino` | Indica se os links internos levam a outra ferramenta |

Para ver os parâmetros nos relatórios, cadastre cada um como **dimensão personalizada**:

1. GA4 → Administrador → Definições personalizadas → Criar dimensão personalizada.
2. Escolha o escopo **Evento**.
3. Use o mesmo nome do parâmetro: `local`, `exemplo`, `campo`, `unidade`, `origem`, `destino`.

Os dados só aparecem a partir do dia em que a dimensão é criada.

## Quando olhar

| Quando | O quê |
| --- | --- |
| Logo depois do deploy da Fase 1 | Search Console → Inspeção de URL → `https://checkfinance.com.br/calculadora-juros-compostos` → **Solicitar indexação**. |
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
| `unidade_trocar` com `unidade = mensal` em ≥ 30% das sessões orgânicas da página | Avaliar **taxa ao mês como padrão** (hoje é ao ano). |
| `outra_calculadora` quase zero | Destacar mais o bloco "Outras calculadoras", ou trazê-lo para mais perto do resultado. |

## Fora do site (Fase 4)

Links de outros sites e menções à marca pesam no ranqueamento, e o site sozinho não consegue gerá-los. O passo a passo entra na Fase 4.
