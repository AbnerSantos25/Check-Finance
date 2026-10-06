import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { KEY, buildPayload, deployStatus, describeResponse, isSuccess } from './indexnow.mjs';

describe('deployStatus', () => {
  const cf = (status, conclusion) => ({ name: 'Workers Builds: check-finance', status, conclusion });

  it('acha o check da Cloudflare entre os outros', () => {
    const runs = [{ name: 'build-and-lighthouse', status: 'in_progress', conclusion: null }, cf('completed', 'success')];
    expect(deployStatus(runs)).toBe('sucesso');
  });

  it('pendente enquanto o deploy não termina', () => {
    expect(deployStatus([cf('queued', null)])).toBe('pendente');
    expect(deployStatus([cf('in_progress', null)])).toBe('pendente');
  });

  it('falhou quando o deploy não deu certo', () => {
    expect(deployStatus([cf('completed', 'failure')])).toBe('falhou');
    expect(deployStatus([cf('completed', 'cancelled')])).toBe('falhou');
  });

  it('ausente quando a Cloudflare ainda não criou o check', () => {
    expect(deployStatus([])).toBe('ausente');
  });
});

describe('buildPayload', () => {
  it('só URLs do domínio, sem repetição, com a chave e onde ela está', () => {
    const payload = buildPayload([
      'https://checkfinance.com.br/',
      'https://checkfinance.com.br/calculadora-porcentagem',
      'https://checkfinance.com.br/',
      'https://outro-site.com/pagina',
      'não é url',
    ]);
    expect(payload).toEqual({
      host: 'checkfinance.com.br',
      key: KEY,
      keyLocation: `https://checkfinance.com.br/${KEY}.txt`,
      urlList: ['https://checkfinance.com.br/', 'https://checkfinance.com.br/calculadora-porcentagem'],
    });
  });
});

describe('respostas do IndexNow', () => {
  it('200 e 202 são sucesso; o resto falha com explicação', () => {
    expect(isSuccess(200)).toBe(true);
    expect(isSuccess(202)).toBe(true);
    for (const status of [400, 403, 422, 429, 500]) {
      expect(isSuccess(status)).toBe(false);
      expect(describeResponse(status)).toContain(String(status));
    }
  });
});

describe('arquivo da chave', () => {
  it('public/<chave>.txt existe e contém exatamente a chave', () => {
    expect(fs.readFileSync(new URL(`../public/${KEY}.txt`, import.meta.url), 'utf8')).toBe(KEY);
  });

  it('a chave segue o formato do protocolo (8 a 128 caracteres a-z, A-Z, 0-9, -)', () => {
    expect(KEY).toMatch(/^[a-zA-Z0-9-]{8,128}$/);
  });
});
