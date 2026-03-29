// Lightweight RUM for Core Web Vitals
// If Google Analytics (gtag) is present, send metrics; otherwise log.
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: metric.name,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        non_interaction: true,
      });
    } else if (import.meta.env.DEV) {
      // Fallback to console for visibility during development only
      console.log('[web-vitals]', metric.name, metric.value, metric);
    }
  } catch (e) {
     
    console.warn('web-vitals report error', e);
  }
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

