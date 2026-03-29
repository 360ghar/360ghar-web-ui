import { Helmet } from 'react-helmet-async';
import { siteMetadata, absoluteUrl } from '../seo/siteMetadata';
import { useLocation } from 'react-router-dom';

const toArray = (maybeArray) => (Array.isArray(maybeArray) ? maybeArray : [maybeArray].filter(Boolean));

const SEO = ({
  title,
  description,
  keywords,
  canonical,
  image,
  type = 'website',
  url,
  hreflangs,
  structuredData, // object or array of objects
  noindex = false,
  prevUrl,
  nextUrl,
  articlePublishedTime,
  articleModifiedTime,
  articleTags,
  articleSection,
}) => {
  const location = useLocation();
  const path = location.pathname || '';
  const computedUrl = absoluteUrl(url || path);
  const canonicalUrl = absoluteUrl(canonical || path);

  const metaTitle = title || siteMetadata.defaultTitle;
  const metaDesc = description || siteMetadata.defaultDescription;
  const metaKeywords = keywords;
  const ogImage = absoluteUrl(image || siteMetadata.defaultOgImage);

  // Default to en-in and x-default; callers can pass more.
  const alternates = hreflangs || [
    { hrefLang: 'en-in', href: canonicalUrl },
    { hrefLang: 'x-default', href: canonicalUrl },
  ];

  const ldBlocks = toArray(structuredData);
  const isArticle = type === 'article';

  return (
    <Helmet>
      {/* Primary */}
      <title>{metaTitle}</title>
      {metaDesc && <meta name="description" content={metaDesc} />}
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <link rel="canonical" href={canonicalUrl} />
      {prevUrl && <link rel="prev" href={absoluteUrl(prevUrl)} />}
      {nextUrl && <link rel="next" href={absoluteUrl(nextUrl)} />}

      <meta name="theme-color" content="#ff6b00" />
      <meta
        name="robots"
        content={
          noindex
            ? 'noindex,nofollow'
            : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
        }
      />
      <meta
        name="googlebot"
        content={noindex ? 'noindex,nofollow' : 'index, follow'}
      />

      {/* Alternate languages */}
      {alternates.map((alt) => (
        <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
      ))}

      {/* Open Graph */}
      <meta property="og:title" content={metaTitle} />
      {metaDesc && <meta property="og:description" content={metaDesc} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${siteMetadata.siteName} preview image`} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:url" content={computedUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteMetadata.siteName} />

      {/* OG Article extensions (only when type === 'article') */}
      {isArticle && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {isArticle && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {isArticle && articleSection && (
        <meta property="article:section" content={articleSection} />
      )}
      {isArticle && articleTags?.length > 0 && articleTags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content={siteMetadata.twitterCard} />
      <meta name="twitter:title" content={metaTitle} />
      {metaDesc && <meta name="twitter:description" content={metaDesc} />}
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${siteMetadata.siteName} preview image`} />
      <meta name="twitter:url" content={computedUrl} />
      <meta name="twitter:site" content="@360ghar" />
      <meta name="twitter:creator" content="@360ghar" />

      {/* Structured Data */}
      {ldBlocks.map((ld, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify({ '@context': 'https://schema.org', ...ld })}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
