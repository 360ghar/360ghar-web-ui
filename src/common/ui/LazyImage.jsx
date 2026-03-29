import { forwardRef, useMemo, useState } from 'react';

/**
 * Centralized <img> wrapper that defaults to native lazy loading while
 * letting critical assets opt into eager loading via the `priority` flag.
 * Supports responsive images via srcSet and sizes props.
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
      // Responsive image props
      srcSet,
      sizes,
      // CLS prevention props
      width,
      height,
      style,
      ...rest
    },
    ref
  ) => {
    const resolvedLoading = priority ? 'eager' : loading ?? 'lazy';
    const resolvedDecoding = priority ? 'auto' : decoding;
    const resolvedFetchPriority = priority ? 'high' : fetchPriority;

    const normalizedSrc = useMemo(() => normalizeSrc(rest.src), [rest.src]);
    const normalizedFallbackSrc = useMemo(() => normalizeSrc(fallbackSrc), [fallbackSrc]);

    const [currentSrc, setCurrentSrc] = useState(normalizedSrc || normalizedFallbackSrc || '');
    const [didFallback, setDidFallback] = useState(false);

    const resolvedReferrerPolicy = useMemo(() => {
      if (referrerPolicy) return referrerPolicy;
      // Many third-party image CDNs break/deny hotlinking when a Referer is present.
      return currentSrc.startsWith('http') ? 'no-referrer' : undefined;
    }, [referrerPolicy, currentSrc]);

    // Compute aspect ratio style for CLS prevention
    const computedStyle = useMemo(() => {
      if (width && height) {
        return {
          aspectRatio: `${width} / ${height}`,
          ...style,
        };
      }
      return style;
    }, [width, height, style]);

    const handleError = (event) => {
      if (!didFallback && normalizedFallbackSrc && currentSrc !== normalizedFallbackSrc) {
        setDidFallback(true);
        setCurrentSrc(normalizedFallbackSrc);
      }
      if (typeof onError === 'function') onError(event);
    };

    const fetchPriorityProps = resolvedFetchPriority
      ? { fetchpriority: resolvedFetchPriority }
      : {};

    return (
      <img
        ref={ref}
        loading={resolvedLoading}
        decoding={resolvedDecoding}
        referrerPolicy={resolvedReferrerPolicy}
        onError={handleError}
        srcSet={srcSet}
        sizes={sizes}
        width={width}
        height={height}
        style={computedStyle}
        {...fetchPriorityProps}
        {...rest}
        src={currentSrc}
      />
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
