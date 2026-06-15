import { forwardRef, useMemo, useState } from 'react';

/**
 * Centralized image component with progressive enhancement:
 *
 *  1. Format negotiation via <picture> (when avifSrc / webpSrc are supplied):
 *       <source type="image/avif"> → <source type="image/webp"> → <img> (.png/.jpg)
 *     Browsers pick the first type they understand, so AVIF-capable clients get
 *     ~30-50% smaller payloads than WebP, and old clients still get the PNG.
 *
 *  2. Responsive `srcset` per format (pass avifSrcSet / webpSrcSet / srcSet).
 *
 *  3. Optional blur-up placeholder (LQIP). Supply a tiny `lqip` (e.g. a 20px
 *     blurred WebP data-URL or a low-res path) and it is shown as a CSS
 *     background until the real image's `onLoad` fires, then cross-faded.
 *
 *  4. CLS prevention via aspect-ratio when width/height are given.
 *
 *  5. Native lazy-loading by default; `priority` opts into eager + high fetch
 *     priority for above-the-fold / LCP images.
 *
 * Backward compatible: when no avif/webp sources are passed it renders exactly
 * as a plain <img> (the historical behaviour), so existing call sites keep
 * working while they are migrated.
 */
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

const normalizeSrc = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  const src = raw.trim();
  if (!src) return '';

  const lowered = src.toLowerCase();
  if (lowered === 'null' || lowered === 'undefined' || lowered === 'none') return '';

  if (src.startsWith('//')) return `https:${src}`;

  if (src.startsWith('http://')) {
    try {
      const parsed = new URL(src);
      if (!LOCAL_HOSTNAMES.has(parsed.hostname)) {
        parsed.protocol = 'https:';
        return parsed.toString();
      }
    } catch {
      // ignore URL parsing issues
    }
  }

  return src;
};

const LazyImageBase = forwardRef(
  (
    {
      priority = false,
      loading,
      decoding = 'async',
      fetchPriority,
      fallbackSrc,
      referrerPolicy,
      onError,
      // Next-gen format sources (optional). When omitted, renders a plain <img>.
      avifSrc,
      avifSrcSet,
      webpSrc,
      webpSrcSet,
      // Responsive image props (applied to the fallback <img> srcset)
      srcSet,
      sizes,
      // LQIP blur-up placeholder (data URL or path). Optional.
      lqip,
      // CLS prevention props
      width,
      height,
      style,
      className,
      alt = '360Ghar property image',
      ...rest
    },
    ref
  ) => {
    const resolvedLoading = priority ? 'eager' : loading ?? 'lazy';
    const resolvedDecoding = priority ? 'auto' : decoding;
    const resolvedFetchPriority = priority ? 'high' : fetchPriority;

    const normalizedSrc = useMemo(() => normalizeSrc(rest.src), [rest.src]);
    const normalizedFallbackSrc = useMemo(() => normalizeSrc(fallbackSrc), [fallbackSrc]);
    const normalizedAvif = useMemo(() => normalizeSrc(avifSrc), [avifSrc]);
    const normalizedWebp = useMemo(() => normalizeSrc(webpSrc), [webpSrc]);

    const [currentSrc, setCurrentSrc] = useState(normalizedSrc || normalizedFallbackSrc || '');
    const [didFallback, setDidFallback] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Reset the loaded flag when the source changes (e.g. fallback swap).
    // Derived during render rather than useEffect to satisfy react-hooks/set-state-in-effect.
    const [prevSrc, setPrevSrc] = useState(currentSrc);
    if (prevSrc !== currentSrc) {
      setPrevSrc(currentSrc);
      setLoaded(false);
    }

    const resolvedReferrerPolicy = useMemo(() => {
      if (referrerPolicy) return referrerPolicy;
      // Many third-party image CDNs break/deny hotlinking when a Referer is present.
      return currentSrc.startsWith('http') ? 'no-referrer' : undefined;
    }, [referrerPolicy, currentSrc]);

    const computedStyle = useMemo(() => {
      // Blur-up: until the real image loads, show the LQIP as a blurred
      // background filling the box. Once loaded, cross-fade by dropping the
      // background and revealing the <img>.
      const base = {
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
        ...style,
      };
      if (lqip && !loaded) {
        return {
          backgroundImage: `url(${lqip})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // Slight blur hides the placeholder's low resolution.
          filter: 'blur(8px)',
          transform: 'scale(1.04)', // hide blur edge bleed
          transition: 'opacity 0.3s ease',
          ...base,
        };
      }
      return base;
    }, [width, height, style, lqip, loaded]);

    const handleError = (event) => {
      if (!didFallback && normalizedFallbackSrc && currentSrc !== normalizedFallbackSrc) {
        setDidFallback(true);
        setCurrentSrc(normalizedFallbackSrc);
      }
      if (typeof onError === 'function') onError(event);
    };

    const handleLoad = (event) => {
      setLoaded(true);
      if (typeof rest.onLoad === 'function') rest.onLoad(event);
    };

    const fetchPriorityProps = resolvedFetchPriority
      ? { fetchpriority: resolvedFetchPriority }
      : {};

    // Wrapper class for blur-up + picture support
    const wrapperClass = useMemo(() => {
      const base = className || '';
      return lqip ? `${base} lazy-image--lqip`.trim() : base;
    }, [className, lqip]);

    const hasPicture = Boolean(normalizedAvif || normalizedWebp || avifSrcSet || webpSrcSet);
    const imgEl = (
      <img
        ref={ref}
        loading={resolvedLoading}
        decoding={resolvedDecoding}
        referrerPolicy={resolvedReferrerPolicy}
        onError={handleError}
        onLoad={handleLoad}
        srcSet={srcSet}
        sizes={sizes}
        width={width}
        height={height}
        style={computedStyle}
        className={wrapperClass}
        alt={alt}
        {...fetchPriorityProps}
        {...rest}
        src={currentSrc}
      />
    );

    if (!hasPicture) return imgEl;

    return (
      <picture>
        {normalizedAvif && (
          <source
            type="image/avif"
            srcSet={avifSrcSet || undefined}
            sizes={sizes}
            src={normalizedAvif}
          />
        )}
        {normalizedWebp && (
          <source
            type="image/webp"
            srcSet={webpSrcSet || undefined}
            sizes={sizes}
            src={normalizedWebp}
          />
        )}
        {imgEl}
      </picture>
    );
  }
);

LazyImageBase.displayName = 'LazyImageBase';

const LazyImage = forwardRef((props, ref) => {
  const normalizedSrc = normalizeSrc(props.src);
  const normalizedFallbackSrc = normalizeSrc(props.fallbackSrc);
  const imageKey = `${normalizedSrc}::${normalizedFallbackSrc}`;

  return <LazyImageBase key={imageKey} ref={ref} {...props} />;
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
