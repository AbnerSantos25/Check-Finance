/**
 * Avisa o IndexNow (Bing, Yandex, Seznam, Naver) de que as páginas do site mudaram,
 * para serem buscadas de novo em horas, e não em dias. Roda no workflow
 * .github/workflows/indexnow.yml depois de cada push na main que muda conteúdo.
 *
 * O deploy é feito pela integração Git da Cloudflare, não pelo GitHub Actions. Então
 * o script primeiro espera o check run "Workers Builds…" do commit terminar: avisar
 * antes faria o Bing buscar a versão antiga.
 *
 * As URLs vêm do sitemap publicado, o mesmo que o PageSpeed mede: página nova entra
 * no aviso sem ninguém lembrar deste arquivo.
 *
 * A chave fica em public/<chave>.txt e não é segredo: o protocolo exige que ela seja
 * pública. Ela só prova que o aviso vem de quem controla o domínio.
 *
 * Uso local (sem esperar deploy): INDEXNOW_SKIP_DEPLOY_WAIT=1 node scripts/indexnow.mjs
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { sitemapUrls } from './pagespeed.mjs';

const SITE = 'https://checkfinance.com.br';
const HOST = 'checkfinance.com.br';
export const KEY = '00d079488946675105c1f68a973e8a25';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const DEPLOY_CHECK_PREFIX = 'Workers Builds';
const POLL_INTERVAL_MS = 20_000;
const DEPLOY_TIMEOUT_MS = 15 * 60_000;

/** Situação do deploy da Cloudflare a partir dos check runs do commit. */
export function deployStatus(checkRuns) {
  const run = checkRuns.find((r) => r.name?.startsWith(DEPLOY_CHECK_PREFIX));
  if (!run) return 'ausente';
  if (run.status !== 'completed') return 'pendente';
  return run.conclusion === 'success' ? 'sucesso' : 'falhou';
}

/** Corpo do aviso: só URLs deste domínio, sem repetição. */
export function buildPayload(urls) {
  const urlList = [...new Set(urls)].filter((url) => {
    try {
      return new URL(url).host === HOST;
    } catch {
      return false;
    }
  });
  return { host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList };
}

/** O que cada resposta do IndexNow quer dizer (https://www.indexnow.org/documentation). */
export function describeResponse(status) {
  if (status === 200) return 'OK: URLs recebidas.';
  if (status === 202) return 'Aceito: URLs recebidas; a chave ainda vai ser validada.';
  if (status === 400) return 'Formato inválido (400).';
  if (status === 403) return 'Chave inválida (403): o arquivo da chave não foi encontrado ou não confere.';
  if (status === 422) return 'URLs não pertencem ao host ou não batem com a chave (422).';
  if (status === 429) return 'Muitas requisições (429): o IndexNow considerou spam. Avisar menos vezes.';
  return `Resposta inesperada (${status}).`;
}

export const isSuccess = (status) => status === 200 || status === 202;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function summary(text) {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
}

/** Espera o check run da Cloudflare do commit terminar. */
async function waitForDeploy({ repo, sha, token }) {
  const deadline = Date.now() + DEPLOY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}/check-runs?per_page=100`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`API do GitHub respondeu ${res.status} ao ler os check runs`);
    const status = deployStatus((await res.json()).check_runs ?? []);
    if (status === 'sucesso' || status === 'falhou') return status;
    console.log(`Deploy da Cloudflare: ${status}. Nova consulta em ${POLL_INTERVAL_MS / 1000} s…`);
    await sleep(POLL_INTERVAL_MS);
  }
  return 'tempo esgotado';
}

export async function main() {
  const { GITHUB_REPOSITORY: repo, GITHUB_SHA: sha, GITHUB_TOKEN: token } = process.env;

  if (!process.env.INDEXNOW_SKIP_DEPLOY_WAIT) {
    if (!repo || !sha || !token) throw new Error('Faltam GITHUB_REPOSITORY, GITHUB_SHA ou GITHUB_TOKEN');
    const deploy = await waitForDeploy({ repo, sha, token });
    if (deploy !== 'sucesso') {
      // Sem deploy novo no ar, não há o que avisar. Não é erro do IndexNow.
      summary(`## IndexNow\n\nNada enviado: deploy da Cloudflare do commit ${sha.slice(0, 7)} — ${deploy}.`);
      return;
    }
  }

  const served = await fetch(`${SITE}/${KEY}.txt`, { signal: AbortSignal.timeout(30_000) });
  const servedKey = served.ok ? (await served.text()).trim() : '';
  if (servedKey !== KEY) {
    throw new Error(`${SITE}/${KEY}.txt respondeu ${served.status} sem a chave: confira public/${KEY}.txt`);
  }

  const payload = buildPayload(await sitemapUrls());
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30_000),
  });

  summary(
    [
      '## IndexNow',
      '',
      `${describeResponse(res.status)}`,
      '',
      `${payload.urlList.length} URLs enviadas:`,
      '',
      ...payload.urlList.map((url) => `- ${url}`),
      '',
      'Acompanhe em Bing Webmaster Tools → IndexNow.',
    ].join('\n')
  );

  if (!isSuccess(res.status)) process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
