import { useEffect, useRef, useState } from 'react';

const shouldRenderImmediately = () => {
  if (typeof window === 'undefined') return true;

  const prerenderSnapshot = Boolean(window.__PRERENDER_INJECTED?.isPrerendering);
  const prerenderedDocument =
    typeof document !== 'undefined' &&
    document.documentElement?.dataset?.prerendered === 'true';
  const supportsIntersectionObserver =
    'IntersectionObserver' in window &&
    typeof window.IntersectionObserver === 'function';

  return prerenderSnapshot || prerenderedDocument || !supportsIntersectionObserver;
};

/**
 * Defers rendering children until the section is near the viewport.
 * Uses IntersectionObserver with a 200px rootMargin so the section
 * starts loading slightly before the user reaches it while scrolling.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Content to render when visible
 * @param {string} [props.rootMargin='200px'] - Distance before viewport to start loading
 * @param {string} [props.minHeight='0px'] - Min-height of placeholder to prevent CLS
 */
const LazySection = ({ children, rootMargin = '200px', minHeight = '0px' }) => {
  const [isVisible, setIsVisible] = useState(shouldRenderImmediately);
  const ref = useRef(null);

  useEffect(() => {
    if (isVisible) return; // Already visible (IO not supported), nothing to observe

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  if (isVisible) return children;

  return <div ref={ref} style={{ minHeight }} aria-hidden="true" />;
};

export default LazySection;
