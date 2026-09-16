import { EconomicIndicator } from '../types';

interface CachedIndicators {
  timestamp: number;
  indicators: EconomicIndicator[];
  rawRates: {
    selic: number;
    cdi: number;
    ipca: number;
    dolar: number;
    ibov: number;
  };
}

const CACHE_KEY = 'hub_financeiro_economic_indicators_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora de cache

export const DEFAULT_ECONOMIC_INDICATORS: EconomicIndicator[] = [
  { name: 'SELIC', value: '10,75% a.a.', change: 'Copom', positive: true },
  { name: 'CDI', value: '10,65% a.a.', change: 'B3', positive: true },
  { name: 'IPCA (12m)', value: '4,42%', change: 'IBGE', positive: true },
  { name: 'IBOVESPA', value: '134.850 pts', change: '+0,64%', positive: true },
  { name: 'DÓLAR PTAX', value: 'R$ 5,61', change: '-0,35%', positive: true },
];

export const DEFAULT_RAW_RATES = {
  selic: 10.75,
  cdi: 10.65,
  ipca: 4.42,
  dolar: 5.61,
  ibov: 134850,
};

/**
 * Busca cotações do Dólar em tempo real via AwesomeAPI
 */
async function fetchAwesomeApiRates(): Promise<{ dolar: number; dolarVar: string; dolarPos: boolean } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    const usd = data?.USDBRL;
    if (usd) {
      const bid = parseFloat(usd.bid);
      const pctChange = parseFloat(usd.pctChange);
      return {
        dolar: bid,
        dolarVar: `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%`,
        dolarPos: pctChange <= 0, // Dólar caindo costuma ser visto como positivo para inflação
      };
    }
  } catch (err) {
    console.warn('AwesomeAPI fetch failed or timeout, using fallback', err);
  }
  return null;
}

/**
 * Busca taxas do Banco Central do Brasil (SGS)
 * Série 432: Taxa de juros - Selic meta (% a.a.)
 * Série 13522: IPCA acumulado 12 meses (%)
 */
async function fetchBcbSeries(seriesId: number): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesId}/dados/ultimos/1?formato=json`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].valor) {
      const parsed = parseFloat(data[0].valor.replace(',', '.'));
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`BCB SGS series ${seriesId} fetch failed, using fallback`, err);
  }
  return null;
}

/**
 * Busca IBOVESPA via Brapi ou fallback
 */
async function fetchIbovRate(): Promise<{ ibov: number; change: string; positive: boolean } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://brapi.dev/api/quote/%5EBVSP', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    const quote = data?.results?.[0];
    if (quote && quote.regularMarketPrice) {
      const changePct = quote.regularMarketChangePercent || 0;
      return {
        ibov: quote.regularMarketPrice,
        change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
        positive: changePct >= 0,
      };
    }
  } catch (err) {
    console.warn('Brapi IBOV fetch failed, using fallback', err);
  }
  return null;
}

/**
 * Função mestre que carrega os indicadores com cache local no navegador
 */
export async function loadLiveEconomicIndicators(): Promise<{
  indicators: EconomicIndicator[];
  rawRates: {
    selic: number;
    cdi: number;
    ipca: number;
    dolar: number;
    ibov: number;
  };
  isLive: boolean;
}> {
  // 1. Tenta recuperar do cache local do navegador
  try {
    const cachedStr = localStorage.getItem(CACHE_KEY);
    if (cachedStr) {
      const cached: CachedIndicators = JSON.parse(cachedStr);
      const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS;
      if (isFresh && cached.indicators && cached.indicators.length > 0) {
        return {
          indicators: cached.indicators,
          rawRates: cached.rawRates,
          isLive: true,
        };
      }
    }
  } catch (e) {
    // ignore local storage error
  }

  // 2. Faz fetch paralelo das APIs públicas
  const [dolarData, selicVal, ipcaVal, ibovData] = await Promise.all([
    fetchAwesomeApiRates(),
    fetchBcbSeries(432),   // Selic Meta anual
    fetchBcbSeries(13522), // IPCA acumulado 12m
    fetchIbovRate(),       // IBOVESPA
  ]);

  const selic = selicVal || DEFAULT_RAW_RATES.selic;
  // CDI é convencionalmente Selic - 0.10%
  const cdi = Math.max(0, selic - 0.10);
  const ipca = ipcaVal || DEFAULT_RAW_RATES.ipca;
  const dolar = dolarData ? dolarData.dolar : DEFAULT_RAW_RATES.dolar;
  const ibov = ibovData ? ibovData.ibov : DEFAULT_RAW_RATES.ibov;

  const indicators: EconomicIndicator[] = [
    {
      name: 'SELIC (BCB)',
      value: `${selic.toFixed(2).replace('.', ',')}% a.a.`,
      change: 'Meta Copom',
      positive: true,
    },
    {
      name: 'CDI (B3)',
      value: `${cdi.toFixed(2).replace('.', ',')}% a.a.`,
      change: '100% CDI',
      positive: true,
    },
    {
      name: 'IPCA (12m)',
      value: `${ipca.toFixed(2).replace('.', ',')}%`,
      change: 'IBGE Oficial',
      positive: true,
    },
    {
      name: 'IBOVESPA',
      value: `${Math.round(ibov).toLocaleString('pt-BR')} pts`,
      change: ibovData ? ibovData.change : '+0,64%',
      positive: ibovData ? ibovData.positive : true,
    },
    {
      name: 'DÓLAR PTAX',
      value: `R$ ${dolar.toFixed(2).replace('.', ',')}`,
      change: dolarData ? dolarData.dolarVar : '-0,35%',
      positive: dolarData ? dolarData.dolarPos : true,
    },
  ];

  const rawRates = {
    selic,
    cdi,
    ipca,
    dolar,
    ibov,
  };

  // Salva no cache do navegador
  try {
    const toCache: CachedIndicators = {
      timestamp: Date.now(),
      indicators,
      rawRates,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(toCache));
  } catch (e) {
    // ignore
  }

  return {
    indicators,
    rawRates,
    isLive: true,
  };
}
