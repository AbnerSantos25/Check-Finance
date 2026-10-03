/**
 * Consentimento de cookies (LGPD).
 *
 * Quem decide o estado inicial é o `index.html`, antes de qualquer tag do Google:
 * no Brasil, na Europa, no Reino Unido e na Suíça, análise e publicidade começam
 * "negadas"; uma escolha já gravada é reaplicada ali mesmo, de forma síncrona. Este
 * módulo grava a escolha nova e avisa o Google pelo Consent Mode.
 *
 * Na Europa quem pergunta é a mensagem do Google (FundingChoices). No Brasil é o
 * nosso aviso, seguindo o guia de cookies da ANPD: nada pré-marcado, recusar tão
 * fácil quanto aceitar, e a escolha pode ser revista a qualquer momento pelo rodapé.
 */

/** Mesma chave que o script do `index.html` lê. Ao mudar, mude lá também. */
export const CONSENT_STORAGE_KEY = 'cf-consent';

/** Versão do texto/categorias. Subir este número pede o consentimento de novo. */
export const CONSENT_VERSION = 1;

/** Evento de janela que reabre o aviso nas preferências (link do rodapé). */
export const OPEN_CONSENT_EVENT = 'cf:open-consent';

export interface ConsentChoice {
  /** Google Analytics: `analytics_storage`. */
  analytics: boolean;
  /** Google AdSense: `ad_storage`, `ad_user_data` e `ad_personalization`. */
  ads: boolean;
}

interface StoredConsent extends ConsentChoice {
  v: number;
  /** Data da escolha (ISO). Registro de quando o consentimento foi dado. */
  at: string;
}

/**
 * Fusos horários do Brasil (IANA). O aviso aparece para quem está num deles: é o
 * jeito de saber o país sem uma requisição a mais no carregamento. Quem estiver
 * fora do fuso pode abrir as preferências pelo rodapé a qualquer momento.
 */
const BRAZIL_TIME_ZONES = new Set([
  'America/Araguaina',
  'America/Bahia',
  'America/Belem',
  'America/Boa_Vista',
  'America/Campo_Grande',
  'America/Cuiaba',
  'America/Eirunepe',
  'America/Fortaleza',
  'America/Maceio',
  'America/Manaus',
  'America/Noronha',
  'America/Porto_Velho',
  'America/Recife',
  'America/Rio_Branco',
  'America/Santarem',
  'America/Sao_Paulo',
  'Brazil/Acre',
  'Brazil/DeNoronha',
  'Brazil/East',
  'Brazil/West',
]);

export const isBrazilTimeZone = (timeZone: string | undefined): boolean =>
  !!timeZone && BRAZIL_TIME_ZONES.has(timeZone);

/** Lê a escolha gravada. Versão antiga ou dado corrompido contam como "sem escolha". */
export function parseStoredConsent(raw: string | null): ConsentChoice | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredConsent>;
    if (value.v !== CONSENT_VERSION) return null;
    if (typeof value.analytics !== 'boolean' || typeof value.ads !== 'boolean') return null;
    return { analytics: value.analytics, ads: value.ads };
  } catch {
    return null;
  }
}

export function readConsent(): ConsentChoice | null {
  try {
    return parseStoredConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null; // armazenamento bloqueado: pergunta de novo a cada visita
  }
}

/** Sinais do Consent Mode v2 para uma escolha. */
export function consentSignals(choice: ConsentChoice): Record<string, 'granted' | 'denied'> {
  const ads = choice.ads ? 'granted' : 'denied';
  return {
    analytics_storage: choice.analytics ? 'granted' : 'denied',
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  };
}

/** Grava a escolha e avisa o Google. */
export function saveConsent(choice: ConsentChoice): void {
  const stored: StoredConsent = { ...choice, v: CONSENT_VERSION, at: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Sem armazenamento: a escolha vale só nesta visita.
  }
  window.gtag?.('consent', 'update', consentSignals(choice));
}

/** Abre o aviso direto nas preferências (usado pelo link do rodapé). */
export const openConsentPreferences = (): void => {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
};
