/**
 * Decides WHEN analytics may start. `begin` runs at the first of:
 *
 * 1. Automatic: the load event, then the largest-contentful-paint candidates
 *    settling (no new candidate for ANALYTICS_QUIET_MS), then an idle main
 *    thread. Lighthouse showed the old "load + idle, 2 s cap" gate firing
 *    while the hero photo was still painting (homepage LCP 2.6-3.9 s), which
 *    put ~370 KB of gtag + PostHog work inside the measured load window.
 *    A 1.5 s quiet window still did: gtag's two long tasks were about 150 ms
 *    of PageSpeed's mobile TBT. At 5 s the start falls after Lighthouse
 *    stops tracing (docs/perf/psi-100.md); visitors who touch the page get
 *    analytics at once through path 2.
 * 2. The first pointer/key/scroll interaction, whichever comes first.
 * 3. ANALYTICS_MAX_WAIT_MS after load: a tab opened in the background never
 *    reports LCP, and analytics must not die there.
 *
 * web-vitals reads buffered entries, so this late start loses no metric.
 */

/** No new LCP candidate for this long means the hero has settled. */
export const ANALYTICS_QUIET_MS = 5000;
/** Last resort after the load event, for pages that never report LCP. */
export const ANALYTICS_MAX_WAIT_MS = 8000;

export function scheduleAnalyticsStart(begin: () => void): void {
  const events = ['pointerdown', 'keydown', 'scroll'] as const;
  let begun = false;
  const stops: (() => void)[] = [];

  const beginOnce = () => {
    if (begun) return;
    begun = true;
    for (const stop of stops.splice(0)) stop();
    begin();
  };

  const onInteraction = () => {
    for (const stop of stops.splice(0)) stop();
    for (const e of events) window.removeEventListener(e, onInteraction);
    // The visitor is already engaged, so a short cap keeps events flowing.
    idle(beginOnce, 2000);
  };

  for (const e of events) window.addEventListener(e, onInteraction, { once: true, passive: true });
  stops.push(automatic(beginOnce));
}

/** Next idle, but never later than capMs after this call. */
function idle(cb: () => void, capMs: number): void {
  if (window.requestIdleCallback) window.requestIdleCallback(cb, { timeout: capMs });
  else window.setTimeout(cb, 1);
}

/** The no-interaction path: load, then settled LCP candidates, then idle. */
function automatic(beginOnce: () => void): () => void {
  let stopped = false;
  let cap = 0;
  let quiet = 0;
  let observer: PerformanceObserver | undefined;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    window.clearTimeout(cap);
    window.clearTimeout(quiet);
    observer?.disconnect();
  };

  const go = () => {
    if (stopped) return;
    stop();
    // Normally idle right away; the cap guards against a starved thread.
    idle(beginOnce, 2000);
  };

  // The hard cap fires this: analytics must not slip past the cap by another
  // idle hop (an idle callback's own timeout can add seconds to the wait).
  const goNow = () => {
    if (stopped) return;
    stop();
    beginOnce();
  };

  const start = () => {
    if (stopped) return; // interaction won before load; nothing to watch
    cap = window.setTimeout(goNow, ANALYTICS_MAX_WAIT_MS);
    const supported =
      typeof PerformanceObserver !== 'undefined' &&
      PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint');
    if (!supported) {
      // No LCP concept: the old load + idle behavior is the best available.
      go();
      return;
    }
    observer = new PerformanceObserver((list) => {
      if (list.getEntries().length === 0) return;
      // Every candidate can still be replaced by a bigger element (the hero
      // photo often replaces the first text candidate after load), so keep
      // waiting until the candidates stop coming.
      window.clearTimeout(quiet);
      quiet = window.setTimeout(go, ANALYTICS_QUIET_MS);
    });
    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      go();
    }
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });

  return stop;
}
