import { describe, expect, it } from 'vitest';
import { CONSENT_VERSION, consentSignals, isBrazilTimeZone, parseStoredConsent } from '../consent';

describe('parseStoredConsent', () => {
  it('lê a escolha gravada na versão atual', () => {
    const raw = JSON.stringify({ v: CONSENT_VERSION, analytics: true, ads: false, at: '2026-10-03T00:00:00Z' });
    expect(parseStoredConsent(raw)).toEqual({ analytics: true, ads: false });
  });

  it('ignora versão antiga, dado incompleto e JSON inválido', () => {
    expect(parseStoredConsent(JSON.stringify({ v: CONSENT_VERSION - 1, analytics: true, ads: true }))).toBeNull();
    expect(parseStoredConsent(JSON.stringify({ v: CONSENT_VERSION, analytics: 'sim', ads: true }))).toBeNull();
    expect(parseStoredConsent('{quebrado')).toBeNull();
    expect(parseStoredConsent(null)).toBeNull();
  });
});

describe('consentSignals', () => {
  it('separa análise de publicidade', () => {
    expect(consentSignals({ analytics: true, ads: false })).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    expect(consentSignals({ analytics: false, ads: true })).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });
});

describe('isBrazilTimeZone', () => {
  it('reconhece os fusos do Brasil e nada mais', () => {
    expect(isBrazilTimeZone('America/Sao_Paulo')).toBe(true);
    expect(isBrazilTimeZone('America/Manaus')).toBe(true);
    expect(isBrazilTimeZone('America/Noronha')).toBe(true);
    expect(isBrazilTimeZone('America/Argentina/Buenos_Aires')).toBe(false);
    expect(isBrazilTimeZone('Europe/Lisbon')).toBe(false);
    expect(isBrazilTimeZone(undefined)).toBe(false);
  });
});
