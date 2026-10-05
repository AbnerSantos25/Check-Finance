# Divulgação fora do site (SEO Fase 4)

O Google pesa duas coisas que o código do site não resolve: **links de outros sites** apontando para o CheckFinance e **pessoas buscando a marca**. Este guia mostra como conseguir os dois sem arriscar penalidade. Para medir, use as regras de [`docs/seo.md`](seo.md).

**Princípio:** cada link precisa existir porque ajuda alguém, e não porque ajuda o ranking. O Google identifica e ignora (ou pune) link comprado, troca de links em massa e comentário com link solto.

## 1. Primeira semana: a base

| Tarefa | Por quê | Como |
| --- | --- | --- |
| **Bing Webmaster Tools** | Os resultados do Bing também aparecem em outros buscadores e assistentes, como o DuckDuckGo e o Copilot. Leva 5 minutos. | bing.com/webmasters → entrar com a conta Google → **Importar do Google Search Console**. O sitemap vem junto. |
| **Link no site da ABS Tecnologia** | É o primeiro link de um site real, e o mais fácil de conseguir. O site já declara a ABS como empresa responsável (`parentOrganization` no JSON-LD). | Na página de projetos ou portfólio da abstecnologiadev.com.br, adicione um card com o texto **"CheckFinance: calculadoras financeiras gratuitas"** e link para `https://checkfinance.com.br/`. Evite usar só "clique aqui" como texto do link. |
| **Seu LinkedIn pessoal** | Perfil de quem fez o site dá credibilidade e um link. | Em **Projetos**, adicione o CheckFinance com uma descrição de duas linhas e o link. |

## 2. Perfis oficiais da marca

Crie nesta ordem: o primeiro é onde o público de finanças pessoais está; o segundo dá credibilidade.

1. **Instagram** `@checkfinance` (ou o mais próximo disponível).
2. **Página do LinkedIn** "CheckFinance".

Use o mesmo padrão em todos:

- **Nome:** CheckFinance
- **Bio:** Calculadoras financeiras gratuitas: juros compostos, financiamento, alugar ou comprar, independência financeira e porcentagem. Sem cadastro.
- **Link:** `https://checkfinance.com.br/?utm_source=instagram&utm_medium=social&utm_campaign=perfil`. Troque `instagram` por `linkedin` no outro. As UTMs fazem o GA4 mostrar de onde veio cada visita.
- **Foto:** `public/icon-512.png`, o mesmo logo do resultado do Google.

**Depois de criar cada perfil**, adicione o endereço dele ao JSON-LD. Isso ajuda o Google a ligar a marca aos perfis:

1. Abra `index.html` e encontre o nó `"@type": "Organization"`.
2. Depois de `"parentOrganization"`, adicione `"sameAs": ["https://www.instagram.com/checkfinance/"]` e acrescente os outros perfis na mesma lista.
3. Só entram perfis que já existem e têm link para o site.

### O que postar

O botão **Compartilhar** de cada calculadora gera um link que abre a simulação preenchida. É o melhor material para post: a pessoa vê a conta e pode mudar os números.

- **Carrossel:** "Aumento de 10% e depois desconto de 10%: volta ao preço original?". Mostre a conta (R$ 2.000 → R$ 2.200 → R$ 1.980) e termine com o link da calculadora de porcentagem. Em out/2026 essa pergunta estava em alta no Google Trends.
- **Carrossel:** "1% ao mês não é 12% ao ano". A conta está no bloco "Como calcular juros compostos: exemplo" da calculadora.
- **Post:** "Alugar ou comprar: o que muda com a valorização do imóvel", com um link compartilhado da simulação.

Uma ou duas postagens por semana bastam. Consistência vale mais que volume.

## 3. Comunidades: responder quem pergunta

Onde as pessoas fazem exatamente as perguntas que as calculadoras respondem:

- Reddit: **r/investimentos** e **r/financaspessoais**.
- **Quora em português**: perguntas como "como calcular juros compostos", "vale a pena alugar ou comprar".
- Grupos de finanças pessoais no Facebook e no Telegram.

**Antes de tudo, leia as regras de cada subreddit ou grupo.** Muitos proíbem link para site próprio. No Facebook e no Telegram, peça permissão ao administrador antes de divulgar.

**Regras para não ser tratado como spam** (o Reddit remove e bane):

1. Participe antes de linkar. Comente e ajude sem link por uma ou duas semanas.
2. **A resposta tem que funcionar sem o link.** Explique a conta no próprio texto; o link é o complemento para quem quiser simular com os próprios números.
3. **Diga que o site é seu**, por exemplo: "fiz uma calculadora gratuita que faz essa conta". Esconder isso é o que mais gera banimento.
4. No máximo um link por resposta, e só quando a calculadora resolver exatamente a pergunta.
5. Não cole a mesma resposta em vários lugares.

### Modelos de resposta

Adapte ao caso. Não copie igual.

> **"Quanto rende R$ 500 por mês em 10 anos?"**
> Depende da taxa, mas dá para estimar. A 1% ao mês (≈ 12,68% ao ano), R$ 500 por mês viram cerca de R$ 115 mil em 10 anos, dos quais R$ 60 mil são aportes e o resto é juros. Isso ainda antes de IR e inflação, que pesam bastante no prazo longo. Fiz uma calculadora gratuita que já desconta os dois, se quiser testar com os seus números: https://checkfinance.com.br/calculadora-juros-compostos

> **"Se o preço sobe 10% e depois cai 10%, volta ao mesmo valor?"**
> Não. O desconto incide sobre o valor já aumentado. R$ 2.000 + 10% = R$ 2.200; menos 10% de R$ 2.200 = R$ 1.980. Sobra uma queda de 1%. Para voltar exatamente, o aumento teria que ser de cerca de 11,11%. Tenho uma calculadora de porcentagem que mostra a conta etapa por etapa: https://checkfinance.com.br/calculadora-porcentagem

> **"Vale mais a pena alugar ou financiar?"**
> A comparação justa é: quem aluga investe a entrada e a diferença entre a parcela e o aluguel. O resultado depende muito da valorização do imóvel e do rendimento do investimento. Montei um simulador que compara os dois patrimônios em valores de hoje e mostra a valorização mínima para comprar compensar: https://checkfinance.com.br/alugar-ou-comprar-imovel

Antes de responder, confira os números do primeiro modelo na calculadora: eles mudam com a taxa usada.

## 4. Blogs e criadores de finanças (a partir do 2º mês)

Blogueiros e criadores de conteúdo sobre finanças pessoais citam ferramentas úteis. Um link desses vale mais do que dezenas de perfis.

1. Liste de 10 a 20 blogs ou newsletters brasileiros de finanças pessoais que já tenham artigos sobre juros compostos, financiamento ou aluguel.
2. Procure artigos que ensinam a conta, mas não têm uma calculadora.
3. Escreva um e-mail curto e pessoal, como no modelo abaixo.

> Oi, [nome]. Li seu texto sobre [tema] e gostei de [ponto específico]. Fiz uma calculadora gratuita, sem cadastro e sem anúncios invasivos, que faz exatamente essa conta (com IR e inflação): [link da ferramenta]. Se achar útil para os seus leitores, fique à vontade para citar. Se encontrar algum erro ou tiver uma sugestão, me avise. Obrigado!

Mande poucos e personalizados, nunca em massa. Responda sempre quem responder.

## 5. O que não fazer

- **Comprar links** ou pacotes de "backlinks". O Google penaliza.
- **Trocar links em massa** ("eu linko você, você me linka").
- **Comentar com link** em blogs e fóruns só para deixar o link.
- **Citar concorrentes no site** (nomes de outras calculadoras). A diferenciação vem das funções: inflação, IR e dados do Banco Central.
- **Criar perfis falsos** para recomendar o site.

## 6. Como medir

| O quê | Onde |
| --- | --- |
| Sites com link para o CheckFinance | Search Console → **Links** → "Principais sites de vinculação". Leva semanas para aparecer. |
| Buscas pela marca | Search Console → Desempenho → filtro *Consulta contém* `checkfinance`. Mais buscas pela marca indicam que a divulgação está funcionando. |
| Visitas vindas dos perfis e das comunidades | GA4 → Aquisição de tráfego, por Origem/mídia da sessão. Os perfis aparecem como `instagram / social` (pelas UTMs); Reddit e Quora aparecem como `reddit.com / referral` etc. Quem vem pelos apps (Reddit, Instagram sem UTM, WhatsApp) costuma chegar sem referenciador e cai em `(direct) / (none)`, então o número é um piso. |

Revise junto com a leitura mensal de [`docs/seo.md`](seo.md).
