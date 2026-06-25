import { Helmet } from 'react-helmet-async';
import { siteMetadata, absoluteUrl } from '../seo/siteMetadata';
import { useLocation } from 'react-router-dom';
import useLocaleStore from '../store/localeStore';
import { localizePath, stripLocalePrefix } from '../i18n/I18nLink';

const toArray = (maybeArray) => (Array.isArray(maybeArray) ? maybeArray : [maybeArray].filter(Boolean));
const inferLocaleFromPath = (path) => (path === '/hi' || path.startsWith('/hi/') ? 'hi' : 'en');
const localizeSeoPath = (pathOrUrl, locale) => localizePath(pathOrUrl, locale);

/**
 * Build hreflang alternates for the current page.
 * English: bare path, Hindi: /hi/ prefixed, x-default: bare path.
 * Extracts the origin dynamically from the passed canonicalUrl to support
 * deployments behind a CDN with a different external origin.
 */
const buildHreflangs = (canonicalUrl) => {
  // Parse using the hardcoded origin as base; if canonicalUrl is already absolute
  // (which absoluteUrl() guarantees), the origin from canonicalUrl wins.
  const parsed = new URL(canonicalUrl, siteMetadata.siteUrl);
  const origin = parsed.origin === 'null' ? siteMetadata.siteUrl : parsed.origin;
  const { pathname, search, hash } = parsed;
  const barePath = stripLocalePrefix(`${pathname}${search}${hash}`);
  const enUrl = `${origin}${barePath}`;
  const hiUrl = `${origin}${localizePath(barePath, 'hi')}`;
  return [
    { hrefLang: 'en', href: enUrl },
    { hrefLang: 'hi', href: hiUrl },
    { hrefLang: 'x-default', href: enUrl },
  ];
};

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
  video,
}) => {
  const location = useLocation();
  const storeLocale = useLocaleStore((s) => s.locale);
  const rawPath = (location.pathname || '').replace(/\/+$/, '') || '/';
  const pathLocale = inferLocaleFromPath(rawPath);
  // Prefer store locale when explicitly set; fall back to path inference to handle
  // the initial render before LocaleGate's useLayoutEffect fires in concurrent mode.
  const locale = pathLocale === 'hi' ? 'hi' : (storeLocale === 'hi' ? 'hi' : 'en');
  const localizedPath = localizeSeoPath(rawPath, locale);
  const computedUrl = absoluteUrl(localizeSeoPath(url || localizedPath, locale));
  // Canonical must be DETERMINISTIC from the URL path, never from the store
  // locale. The store value can flip between renders (initial render before
  // LocaleGate's useLayoutEffect fires in concurrent mode), which makes the
  // canonical href oscillate between /…/ and /hi/…/ and look like duplicate
  // pages to crawlers. We therefore derive the canonical's locale from
  // `pathLocale` (computed above from rawPath) so it is stable across renders.
  // The explicit `canonical` prop override still wins when passed.
  const canonicalUrl = absoluteUrl(localizeSeoPath((canonical || localizedPath).replace(/\/+$/, '') || '/', pathLocale));

  const metaTitle = title || siteMetadata.defaultTitle;
  const metaDesc = description || siteMetadata.defaultDescription;
  const metaKeywords = keywords;
  const ogImage = absoluteUrl(image || siteMetadata.defaultOgImage);

  // Auto-generate hreflang alternates based on current URL
  const alternates = hreflangs || buildHreflangs(canonicalUrl);

  const ldBlocks = toArray(structuredData);
  const isArticle = type === 'article';

  return (
    <Helmet defer={false}>
      <html lang={locale} />
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
      <meta property="og:locale" content={locale === 'hi' ? 'hi_IN' : 'en_IN'} />
      <meta property="og:locale:alternate" content={locale === 'hi' ? 'en_IN' : 'hi_IN'} />
      <meta property="og:url" content={computedUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteMetadata.siteName} />

      {/* OG Video (for VR tour / video pages) */}
      {video && <meta property="og:video" content={video} />}
      {video && <meta property="og:video:type" content="text/html" />}
      {video && <meta property="og:video:width" content="1280" />}
      {video && <meta property="og:video:height" content="720" />}

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

      {/* Twitter Player (for VR tour / video pages) */}
      {video && <meta name="twitter:player" content={video} />}
      {video && <meta name="twitter:player:width" content="1280" />}
      {video && <meta name="twitter:player:height" content="720" />}

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
