import React from 'react';
import { Head } from 'vite-react-ssg';
import { DEFAULT_OG_IMAGE, SITE_LOCALE, SITE_NAME, absoluteUrl } from '../../config/site';
import type { JsonLdNode } from './jsonLd';

interface SeoProps {
  title: string;
  description: string;
  /** Caminho da rota, como em `tools.data.ts`. Vira canonical e og:url absolutos. */
  path: string;
  /** Caminho da imagem do cartão social; o padrão do site cobre a maioria dos casos. */
  ogImage?: string;
  /** Nós Schema.org da página. Saem num único `@graph`. */
  jsonLd?: JsonLdNode[];
  /** Páginas que não devem entrar no índice, como o 404. */
  noIndex?: boolean;
}

/**
 * Metadados de uma rota.
 *
 * Usa o `<Head>` do `vite-react-ssg` e não as tags nativas do React 19: sob
 * `renderToString` — que é como a Fase 6 pré-renderiza — o React 19 deixa
 * `<title>` e `<meta>` no corpo do documento em vez de içar para o `<head>`.
 *
 * O `<Head>` aceita apenas elementos simples como filhos: componente ou fragmento
 * no meio é descartado sem aviso.
 */
export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  jsonLd,
  noIndex = false,
}) => {
  const url = absoluteUrl(path);
  const image = absoluteUrl(ogImage);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {/* Canonical numa página noindex é contraditório: diz "esta é a versão oficial"
          de algo que se pede para não indexar. */}
      {!noIndex && <link rel="canonical" href={url} />}
      <meta
        name="robots"
        content={noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}
      />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={SITE_LOCALE} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && jsonLd.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonLd })}
        </script>
      )}
    </Head>
  );
};
