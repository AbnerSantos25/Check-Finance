import { describe, expect, it } from 'vitest';
import { lcpBreakdown, observedTimeline, renderReport } from './pagespeed.mjs';

const lhrWithLcp = {
  audits: {
    'largest-contentful-paint-element': {
      details: {
        items: [
          { items: [{ node: { nodeLabel: 'Simule juros | compostos', selector: 'main > p.text-xs' } }] },
          {
            items: [
              { phase: 'TTFB', timing: 470 },
              { phase: 'Load Delay', timing: 0 },
              { phase: 'Load Time', timing: 0 },
              { phase: 'Render Delay', timing: 1668 },
            ],
          },
        ],
      },
    },
  },
};

const lhr13 = {
  audits: {
    'lcp-breakdown-insight': {
      details: {
        type: 'list',
        items: [
          {
            type: 'table',
            items: [
              { subpart: 'timeToFirstByte', label: 'Time to first byte', duration: 35 },
              { subpart: 'elementRenderDelay', label: 'Element render delay', duration: 1237 },
            ],
          },
          { type: 'node', nodeLabel: 'Simule juros compostos', selector: 'main > p.text-xs' },
        ],
      },
    },
  },
};

describe('lcpBreakdown', () => {
  it('lê o formato do Lighthouse 13 (lcp-breakdown-insight)', () => {
    expect(lcpBreakdown(lhr13)).toEqual({
      element: { label: 'Simule juros compostos', selector: 'main > p.text-xs' },
      phases: { TTFB: 35, 'Render Delay': 1237 },
    });
  });

  it('lê o formato do Lighthouse 12 (largest-contentful-paint-element)', () => {
    expect(lcpBreakdown(lhrWithLcp)).toEqual({
      element: { label: 'Simule juros | compostos', selector: 'main > p.text-xs' },
      phases: { TTFB: 470, 'Load Delay': 0, 'Load Time': 0, 'Render Delay': 1668 },
    });
  });

  it('sem o audit, devolve null', () => {
    expect(lcpBreakdown({ audits: {} })).toBeNull();
  });
});

describe('renderReport', () => {
  it('inclui a tabela do elemento do LCP, escapando a barra vertical', () => {
    const result = {
      url: 'https://checkfinance.com.br/',
      scores: { performance: 85, accessibility: 100, 'best-practices': 100, seo: 100 },
      lab: { fcp: 1700, lcp: 3700, tbt: 168, cls: 0 },
      lcp: lcpBreakdown(lhrWithLcp),
      field: null,
    };
    const report = renderReport([result], [], 80);
    expect(report).toContain('### Elemento do LCP');
    expect(report).toContain('| / | Simule juros \\| compostos (`main > p.text-xs`) | 470 ms | 0 ms | 0 ms | 1.668 ms |');
  });
});

describe('observedTimeline', () => {
  it('lista as requisições que terminaram até o LCP observado, em ordem de término', () => {
    const lhr = {
      audits: {
        metrics: { details: { items: [{ observedFirstContentfulPaint: 300, observedLargestContentfulPaint: 900, observedDomContentLoaded: 200, observedLoad: 250 }] } },
        'network-requests': {
          details: {
            items: [
              { url: 'https://x/app.css', resourceType: 'Stylesheet', networkRequestTime: 50, networkEndTime: 400, transferSize: 12_000 },
              { url: 'https://x/', resourceType: 'Document', networkRequestTime: 0, networkEndTime: 30, transferSize: 5_000 },
              { url: 'https://ads/late.js', resourceType: 'Script', networkRequestTime: 800, networkEndTime: 1_500, transferSize: 90_000 },
            ],
          },
        },
      },
    };
    const t = observedTimeline(lhr);
    expect(t).toMatchObject({ fcp: 300, lcp: 900, domContentLoaded: 200, load: 250 });
    expect(t.requests.map((r) => r.url)).toEqual(['https://x/', 'https://x/app.css']);
    expect(t.requests[1].kb).toBe(12);
  });

  it('sem o audit de métricas, devolve null', () => {
    expect(observedTimeline({ audits: {} })).toBeNull();
  });
});
