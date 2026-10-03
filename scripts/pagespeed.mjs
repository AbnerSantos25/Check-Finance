/**
 * Mede o site em produção pela API do PageSpeed Insights (aba "Celular") e escreve
 * um relatório em Markdown. Roda no workflow .github/workflows/pagespeed.yml.
 *
 * As URLs vêm do sitemap publicado, não de uma lista aqui: ferramenta nova entra no
 * sitemap pelo registry (tools.data.ts) e passa a ser medida sem ninguém lembrar
 * deste arquivo.
 *
 * Saídas:
 * - pagespeed-report.md, também anexado ao resumo do job;
 * - `below_threshold=true` em $GITHUB_OUTPUT se alguma página ficar abaixo de
 *   PSI_MIN_PERFORMANCE (padrão 80), o que faz o workflow abrir uma issue.
 *
 * Uso local: PSI_API_KEY=... node scripts/pagespeed.mjs
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const SITE = 'https://checkfinance.com.br';
const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
// Uma análise do PSI leva de 20 a 60 s.
const REQUEST_TIMEOUT_MS = 120_000;
const REPORT_FILE = 'pagespeed-report.md';

const pct = (score) => (typeof score === 'number' ? Math.round(score * 100) : null);
const seconds = (ms) => (typeof ms === 'number' ? `${(ms / 1000).toFixed(1).replace('.', ',')} s` : '—');
const millis = (ms) => (typeof ms === 'number' ? `${Math.round(ms).toLocaleString('pt-BR')} ms` : '—');
const cls = (value) => (typeof value === 'number' ? value.toFixed(3).replace('.', ',') : '—');

// Nomes das fases no Lighthouse 13 (`lcp-breakdown-insight`) → nomes do 12.
const LCP_SUBPARTS = {
  timeToFirstByte: 'TTFB',
  resourceLoadDelay: 'Load Delay',
  resourceLoadDuration: 'Load Time',
  elementRenderDelay: 'Render Delay',
};

/**
 * Qual elemento foi o LCP e em que fase o tempo dele foi gasto: TTFB, atraso até
 * começar a carregar, carregamento e atraso de renderização.
 *
 * O Lighthouse 13 (o do PSI desde 2026) traz isso no `lcp-breakdown-insight`; o 12,
 * no `largest-contentful-paint-element`. Lê os dois, para o relatório não ficar
 * mudo quando o PSI trocar de versão.
 */
export function lcpBreakdown(lhr) {
  const insight = lhr.audits['lcp-breakdown-insight']?.details?.items;
  if (Array.isArray(insight)) {
    const node = insight.find((item) => item.type === 'node');
    const rows = insight.find((item) => item.type === 'table')?.items ?? [];
    if (node || rows.length > 0) {
      return {
        element: node ? { label: node.nodeLabel ?? '', selector: node.selector ?? '' } : null,
        phases: Object.fromEntries(rows.map((r) => [LCP_SUBPARTS[r.subpart] ?? r.subpart, r.duration])),
      };
    }
  }

  const tables = lhr.audits['largest-contentful-paint-element']?.details?.items ?? [];
  const node = tables[0]?.items?.[0]?.node;
  const phases = tables[1]?.items ?? [];
  if (!node && phases.length === 0) return null;
  return {
    element: node ? { label: node.nodeLabel ?? '', selector: node.selector ?? '' } : null,
    phases: Object.fromEntries(phases.map((p) => [p.phase, p.timing])),
  };
}

/**
 * O que o navegador do PSI de fato viu, sem a simulação de rede lenta: quando
 * aconteceram a primeira pintura, o LCP e o `load`, e quais requisições terminaram
 * até o LCP. É o que separa "o HTML chegou tarde" de "algo segurou a pintura".
 */
export function observedTimeline(lhr) {
  const m = lhr.audits.metrics?.details?.items?.[0];
  if (!m) return null;
  const lcpAt = m.observedLargestContentfulPaint;
  const requests = (lhr.audits['network-requests']?.details?.items ?? [])
    .filter((r) => typeof r.networkEndTime === 'number' && r.networkEndTime <= lcpAt)
    .sort((a, b) => a.networkEndTime - b.networkEndTime)
    .map((r) => ({
      url: r.url,
      type: r.resourceType ?? '',
      start: r.networkRequestTime,
      end: r.networkEndTime,
      kb: typeof r.transferSize === 'number' ? Math.round(r.transferSize / 1024) : null,
    }));
  return {
    fcp: m.observedFirstContentfulPaint,
    lcp: lcpAt,
    domContentLoaded: m.observedDomContentLoaded,
    load: m.observedLoad,
    requests,
  };
}

/** Extrai o que interessa de uma resposta da API v5. */
export function summarize(url, response) {
  const lhr = response.lighthouseResult;
  const audit = (id) => lhr.audits[id]?.numericValue;
  // Dados de campo (CrUX): da própria URL quando ela tem tráfego suficiente, senão
  // do domínio inteiro. Site com pouco tráfego pode não ter nenhum dos dois.
  const field = response.loadingExperience?.metrics
    ? response.loadingExperience
    : response.originLoadingExperience?.metrics
      ? response.originLoadingExperience
      : null;
  const fieldMetric = (id) => field?.metrics?.[id]?.percentile;

  return {
    url,
    scores: Object.fromEntries(CATEGORIES.map((c) => [c, pct(lhr.categories[c]?.score)])),
    lab: {
      fcp: audit('first-contentful-paint'),
      lcp: audit('largest-contentful-paint'),
      tbt: audit('total-blocking-time'),
      cls: audit('cumulative-layout-shift'),
    },
    lcp: lcpBreakdown(lhr),
    timeline: observedTimeline(lhr),
    field: field
      ? {
          scope: field === response.loadingExperience ? 'página' : 'domínio',
          verdict: field.overall_category ?? '—',
          lcp: fieldMetric('LARGEST_CONTENTFUL_PAINT_MS'),
          inp: fieldMetric('INTERACTION_TO_NEXT_PAINT'),
          // A API entrega o CLS de campo multiplicado por 100.
          cls: typeof fieldMetric('CUMULATIVE_LAYOUT_SHIFT_SCORE') === 'number'
            ? fieldMetric('CUMULATIVE_LAYOUT_SHIFT_SCORE') / 100
            : undefined,
        }
      : null,
  };
}

/** Relatório em Markdown para o resumo do job e para a issue. */
export function renderReport(results, failures, minPerformance) {
  const lines = [
    `## PageSpeed Insights — celular`,
    '',
    `Medido em ${new Date().toISOString().slice(0, 10)}. Limite de desempenho: **${minPerformance}**.`,
    '',
    '| Página | Desempenho | Acessib. | Práticas | SEO | FCP | LCP | TBT | CLS |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const r of results) {
    const perf = r.scores.performance;
    const flag = perf !== null && perf < minPerformance ? ' 🔴' : '';
    lines.push(
      `| ${new URL(r.url).pathname} | **${perf ?? '—'}**${flag} | ${r.scores.accessibility ?? '—'} | ` +
        `${r.scores['best-practices'] ?? '—'} | ${r.scores.seo ?? '—'} | ${seconds(r.lab.fcp)} | ` +
        `${seconds(r.lab.lcp)} | ${millis(r.lab.tbt)} | ${cls(r.lab.cls)} |`
    );
  }

  // Sem isto o relatório só diz que o LCP piorou; o elemento e a fase dizem onde.
  const withLcp = results.filter((r) => r.lcp);
  if (withLcp.length > 0) {
    lines.push(
      '',
      '### Elemento do LCP',
      '',
      '| Página | Elemento | TTFB | Atraso p/ carregar | Carregamento | Atraso de renderização |',
      '| --- | --- | --- | --- | --- | --- |'
    );
    const cell = (text) => text.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
    for (const r of withLcp) {
      const el = r.lcp.element;
      const label = el ? `${cell(el.label).slice(0, 60)} (\`${cell(el.selector).slice(-50)}\`)` : '—';
      const ph = r.lcp.phases;
      lines.push(
        `| ${new URL(r.url).pathname} | ${label} | ${millis(ph.TTFB)} | ${millis(ph['Load Delay'])} | ` +
          `${millis(ph['Load Time'])} | ${millis(ph['Render Delay'])} |`
      );
    }
  }

  // Recolhido: é para investigar, não para ler toda semana.
  const withTimeline = results.filter((r) => r.timeline);
  if (withTimeline.length > 0) {
    lines.push('', '<details><summary>Linha do tempo observada (sem simulação)</summary>', '');
    for (const r of withTimeline) {
      const t = r.timeline;
      lines.push(
        `**${new URL(r.url).pathname}** — FCP ${millis(t.fcp)}, LCP ${millis(t.lcp)}, ` +
          `DOMContentLoaded ${millis(t.domContentLoaded)}, load ${millis(t.load)}`,
        '',
        '| Início | Fim | Tipo | kB | Requisição até o LCP |',
        '| --- | --- | --- | --- | --- |'
      );
      for (const q of t.requests.slice(0, 25)) {
        lines.push(`| ${millis(q.start)} | ${millis(q.end)} | ${q.type} | ${q.kb ?? '—'} | ${q.url.slice(0, 90)} |`);
      }
      lines.push('');
    }
    lines.push('</details>');
  }

  const withField = results.filter((r) => r.field);
  lines.push('', '### Usuários reais (CrUX, últimos 28 dias)', '');
  if (withField.length === 0) {
    lines.push('Sem dados de campo: o site ainda não tem tráfego suficiente no Chrome UX Report.');
  } else {
    lines.push('| Página | Base | Veredito | LCP (p75) | INP (p75) | CLS (p75) |', '| --- | --- | --- | --- | --- | --- |');
    for (const r of withField) {
      lines.push(
        `| ${new URL(r.url).pathname} | ${r.field.scope} | ${r.field.verdict} | ${seconds(r.field.lcp)} | ` +
          `${millis(r.field.inp)} | ${cls(r.field.cls)} |`
      );
    }
  }

  if (failures.length > 0) {
    lines.push('', '### Falhas na consulta', '');
    for (const f of failures) lines.push(`- ${f.url}: ${f.error}`);
  }

  lines.push(
    '',
    'Relatório completo de cada página: https://pagespeed.web.dev/report?url=' + encodeURIComponent(`${SITE}/`),
    '',
    'Como agir: docs/performance.md.'
  );
  return lines.join('\n') + '\n';
}

async function sitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`sitemap respondeu ${res.status}`);
  const urls = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (urls.length === 0) throw new Error('sitemap sem nenhuma <loc>');
  return urls;
}

async function runPagespeed(url, key) {
  const params = new URLSearchParams({ url, strategy: 'mobile', locale: 'pt_BR' });
  for (const c of CATEGORIES) params.append('category', c);
  if (key) params.set('key', key);

  // Uma segunda tentativa: a API às vezes devolve 500 numa URL que passa em seguida.
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(`${PSI_ENDPOINT}?${params}`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
      return body;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function main() {
  const key = process.env.PSI_API_KEY;
  if (!key) console.warn('PSI_API_KEY ausente: usando a cota anônima da API, que costuma estar esgotada.');
  const minPerformance = Number(process.env.PSI_MIN_PERFORMANCE ?? 80);

  const urls = await sitemapUrls();
  const results = [];
  const failures = [];
  // Em série: a API limita consultas simultâneas por chave.
  for (const url of urls) {
    try {
      console.log(`Medindo ${url}…`);
      results.push(summarize(url, await runPagespeed(url, key)));
    } catch (error) {
      failures.push({ url, error: error.message });
      console.error(`Falhou ${url}: ${error.message}`);
    }
  }

  const report = renderReport(results, failures, minPerformance);
  fs.writeFileSync(REPORT_FILE, report);
  console.log('\n' + report);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);

  const below = results.some((r) => r.scores.performance !== null && r.scores.performance < minPerformance);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `below_threshold=${below}\n`);

  // Nenhuma medição concluída é falha do job, não do site: deixa o workflow vermelho
  // para a chave vencida ou a API fora do ar não passarem despercebidas.
  if (results.length === 0) process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
