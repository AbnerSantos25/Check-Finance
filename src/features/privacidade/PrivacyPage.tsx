import React from 'react';
import { PRIVACY_EMAIL, PRIVACY_PATH, SITE_NAME } from '../../config/site';
import { openConsentPreferences } from '../../shared/lib/consent';
import { Seo } from '../../shared/seo/Seo';

/** Ao mudar o texto, atualize a data: ela é o registro da versão em vigor. */
const LAST_UPDATED = '3 de outubro de 2026';

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section aria-labelledby={id} className="pt-8">
    <h2 id={id} className="text-lg font-bold text-white mb-3">
      {title}
    </h2>
    <div className="space-y-3 text-sm text-slate-300 leading-relaxed">{children}</div>
  </section>
);

const External: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
    {children}
  </a>
);

const Mail: React.FC = () => (
  <a href={`mailto:${PRIVACY_EMAIL}`} className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
    {PRIVACY_EMAIL}
  </a>
);

/**
 * Política de Privacidade.
 *
 * Cobre o que o Google exige do AdSense (fornecedores terceiros, cookies de anúncios,
 * links de desativação) e do Analytics (uso de cookies e link para "Como o Google usa
 * informações"), e o que a LGPD pede: controlador, finalidades, bases legais,
 * compartilhamento, retenção e direitos do titular. Ao mudar o que o site coleta
 * (index.html, analytics.ts, consent.ts), revise este texto.
 */
export const PrivacyPage: React.FC = () => (
  <article className="max-w-3xl">
    <Seo
      title={`Política de Privacidade | ${SITE_NAME}`}
      description="Como o CheckFinance trata dados pessoais e cookies: o que é coletado, para quê, com quem é compartilhado e como exercer seus direitos pela LGPD."
      path={PRIVACY_PATH}
    />

    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Política de Privacidade</h1>
    <p className="text-xs text-slate-400 mt-2">Última atualização: {LAST_UPDATED}.</p>

    <p className="text-sm text-slate-300 leading-relaxed mt-5">
      O {SITE_NAME} é um conjunto de calculadoras financeiras gratuitas, sem cadastro e sem login. Esta política explica
      quais dados são tratados quando você usa o site, para quê, com quem são compartilhados e como exercer os seus
      direitos previstos na Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
    </p>

    <Section id="controlador" title="1. Quem é o responsável">
      <p>
        O controlador dos dados é Abner da Silva Santos, responsável pelo {SITE_NAME} (checkfinance.com.br). Para qualquer
        assunto sobre privacidade e dados pessoais, escreva para <Mail />.
      </p>
    </Section>

    <Section id="calculadoras" title="2. O que as calculadoras fazem com os seus números">
      <p>
        Nada sai do seu navegador. Os valores que você digita são calculados no próprio aparelho e não são enviados nem
        guardados em servidor. Eles só aparecem no endereço da página (a URL) para que o botão Compartilhar gere um link
        que reabra a mesma simulação; esse link só vai para quem você escolher enviar.
      </p>
      <p>
        Os indicadores econômicos (SELIC, CDI, IPCA, poupança) vêm de fontes públicas do Banco Central. Buscá-los não
        envolve nenhum dado seu.
      </p>
    </Section>

    <Section id="cookies" title="3. Cookies e tecnologias semelhantes">
      <p>Os cookies e o armazenamento local do navegador usados no site se dividem em três categorias:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong className="text-white">Necessários.</strong> Lembram o tema claro ou escuro (<code>cf-theme</code>) e a
          sua escolha sobre cookies (<code>cf-consent</code>). Ficam só no seu navegador e não são enviados a ninguém.
        </li>
        <li>
          <strong className="text-white">Análise (Google Analytics).</strong> Cookies como <code>_ga</code> medem quantas
          pessoas usam o site, quais páginas e calculadoras e quais botões (como Compartilhar e Apoiar). Usamos esses
          números para decidir o que melhorar.
        </li>
        <li>
          <strong className="text-white">Publicidade (Google AdSense).</strong> Cookies de anúncios do Google e de
          parceiros, usados para exibir e medir anúncios, inclusive personalizados.
        </li>
      </ul>
      <p>
        No Brasil, os cookies de análise e de publicidade só são usados depois que você aceita no aviso de cookies.
        Recusar não muda o funcionamento das calculadoras. Você pode mudar a escolha quando quiser em{' '}
        <button
          type="button"
          onClick={openConsentPreferences}
          className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300 cursor-pointer"
        >
          Preferências de cookies
        </button>
        , também disponível no rodapé de todas as páginas.
      </p>
    </Section>

    <Section id="analytics" title="4. Google Analytics">
      <p>
        O Google Analytics coleta, por meio de cookies, informações como páginas visitadas, tempo de uso, tipo de
        aparelho e navegador, cidade aproximada e a origem da visita. O {SITE_NAME} não envia ao Google o seu nome, e-mail
        ou os valores das simulações. Os dados de eventos ficam guardados por 14 meses.
      </p>
      <p>
        Saiba{' '}
        <External href="https://policies.google.com/privacy/partners?hl=pt-BR">
          como o Google usa as informações de sites que usam os serviços dele
        </External>
        . Além de recusar no aviso de cookies, você pode bloquear o Google Analytics em todos os sites com o{' '}
        <External href="https://tools.google.com/dlpage/gaoptout?hl=pt-BR">complemento de desativação do Google Analytics</External>.
      </p>
      <p>
        Quando os Sinais do Google estão ativos, o Google pode associar as visitas a contas Google conectadas, para
        relatórios agregados de público e entre aparelhos. Você controla isso nas{' '}
        <External href="https://adssettings.google.com">configurações de anúncios do Google</External>.
      </p>
    </Section>

    <Section id="anuncios" title="5. Anúncios (Google AdSense)">
      <p>
        Fornecedores terceiros, incluindo o Google, usam cookies para exibir anúncios com base em visitas anteriores que
        você fez a este site ou a outros sites. O uso de cookies de publicidade permite que o Google e os parceiros dele
        exibam anúncios com base nas suas visitas a este e a outros sites na internet.
      </p>
      <p>
        Você pode desativar a publicidade personalizada nas{' '}
        <External href="https://adssettings.google.com">configurações de anúncios do Google</External>, ou desativar o uso
        de cookies de fornecedores terceiros para publicidade personalizada em{' '}
        <External href="https://www.aboutads.info/choices/">www.aboutads.info</External>. Sem personalização, os anúncios
        continuam aparecendo, mas não são baseados nos seus interesses.
      </p>
    </Section>

    <Section id="infraestrutura" title="6. Hospedagem e segurança">
      <p>
        O site é entregue pela Cloudflare, que processa dados técnicos de cada acesso (como endereço IP, navegador e
        horário) para entregar as páginas e proteger o site contra ataques e abuso. Esses registros são usados apenas
        para essas finalidades.
      </p>
    </Section>

    <Section id="bases-legais" title="7. Bases legais">
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong className="text-white">Consentimento</strong> (LGPD, art. 7º, I): cookies de análise e de publicidade.
          Pode ser revogado a qualquer momento nas Preferências de cookies.
        </li>
        <li>
          <strong className="text-white">Legítimo interesse</strong> (LGPD, art. 7º, IX): cookies necessários e os
          registros técnicos de hospedagem e segurança, sem os quais o site não funciona com segurança.
        </li>
      </ul>
    </Section>

    <Section id="compartilhamento" title="8. Compartilhamento e transferência internacional">
      <p>
        Os dados descritos acima são tratados pelo Google (Analytics e AdSense) e pela Cloudflare (hospedagem), que podem
        processá-los em servidores fora do Brasil. Essas empresas adotam cláusulas contratuais e mecanismos de proteção
        reconhecidos para transferências internacionais. O {SITE_NAME} não vende dados pessoais.
      </p>
    </Section>

    <Section id="direitos" title="9. Seus direitos">
      <p>Pela LGPD (art. 18), você pode pedir, a qualquer momento:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>confirmação de que tratamos dados seus e acesso a eles;</li>
        <li>correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
        <li>informação sobre com quem os dados são compartilhados;</li>
        <li>revogação do consentimento e eliminação dos dados tratados com base nele.</li>
      </ul>
      <p>
        Como o site não tem cadastro, a maior parte dos dados fica com o Google, associada a identificadores do seu
        navegador, e não ao seu nome. O caminho mais rápido costuma ser recusar os cookies nas Preferências de cookies e
        apagar os cookies do navegador. Para os demais pedidos, escreva para <Mail />. Você também pode apresentar
        reclamação à Autoridade Nacional de Proteção de Dados (ANPD).
      </p>
    </Section>

    <Section id="alteracoes" title="10. Alterações nesta política">
      <p>
        Esta política pode ser atualizada quando o site mudar a forma de tratar dados. A data da última atualização fica
        no topo da página.
      </p>
    </Section>
  </article>
);
