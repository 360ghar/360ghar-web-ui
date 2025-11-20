import React from 'react';
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
}) => {
  const location = useLocation();
  const path = `${location.pathname || ''}${location.search || ''}`;
  const computedUrl = absoluteUrl(url || path);
  const canonicalUrl = absoluteUrl(canonical || path);

  const metaTitle = title || siteMetadata.defaultTitle;
  const metaDesc = description || siteMetadata.defaultDescription;
  const metaKeywords = keywords || siteMetadata.defaultKeywords;
  const ogImage = absoluteUrl(image || siteMetadata.defaultOgImage);

  // Only include hreflang values that actually exist.
  // Default to en-in and x-default; callers can pass more.
  const alternates = hreflangs || [
    { hrefLang: 'en-in', href: canonicalUrl },
    { hrefLang: 'x-default', href: canonicalUrl },
  ];

  const ldBlocks = toArray(structuredData);

  return (
    <Helmet>
      {/* Primary */}
      <title>{metaTitle}</title>
      {metaDesc && <meta name="description" content={metaDesc} />}
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Additional SEO meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en-IN" />
      <meta name="geo.region" content="IN-HR" />
      <meta name="geo.placename" content="Gurugram" />
      <meta name="geo.position" content="28.4595;77.0266" />
      <meta name="ICBM" content="28.4595, 77.0266" />
      <meta name="author" content="360Ghar" />
      <meta name="publisher" content="360Ghar" />
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

      {/* Open Graph */}
      <meta property="og:title" content={metaTitle} />
      {metaDesc && <meta property="og:description" content={metaDesc} />} 
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={computedUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteMetadata.siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content={siteMetadata.twitterCard} />
      <meta name="twitter:title" content={metaTitle} />
      {metaDesc && <meta name="twitter:description" content={metaDesc} />} 
      <meta name="twitter:image" content={ogImage} />

      {/* Alternate languages */}
      {alternates.map((alt) => (
        <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
      ))}

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
