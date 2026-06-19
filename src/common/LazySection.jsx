import { useEffect, useRef, useState } from 'react';
import { isPrerendering } from '../utils/prerender';
import './LazySection.css';

const shouldRenderImmediately = () => {
  if (typeof window === 'undefined') return true;

  const prerenderSnapshot = isPrerendering();
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
 * @param {boolean} [props.animate=true] - Enable smooth fade-in animation
 */
const LazySection = ({ children, rootMargin = '200px', minHeight = '0px', animate = true }) => {
  const [isVisible, setIsVisible] = useState(shouldRenderImmediately);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (isVisible) return;

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

  useEffect(() => {
    if (isVisible && animate && !hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, animate, hasAnimated]);

  if (!isVisible) {
    return <div ref={ref} style={{ minHeight }} aria-hidden="true" />;
  }

  if (animate && !hasAnimated) {
    return (
      <div
        className="lazy-section lazy-section--animating"
        style={{ minHeight }}
        role="region"
        aria-label="Content loading"
      >
        {children}
      </div>
    );
  }

  return <div className="lazy-section" role="region">{children}</div>;
};

export default LazySection;
