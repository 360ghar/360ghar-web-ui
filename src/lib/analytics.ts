/**
 * PostHog and gtag, loaded when the browser is idle. Same events as the old
 * site: $pageview, web_vitals, identify, reset. Autocapture stays off.
 */
type PostHog = typeof import('posthog-js').default;

let ph: Promise<PostHog | null> | null = null;
const pending: ((p: PostHog) => void)[] = [];

function load(): Promise<PostHog | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const key = import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined;
  if (!key || !import.meta.env.PROD) return Promise.resolve(null);
  ph ??= import('posthog-js').then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: (import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
      persistence: 'localStorage+cookie',
      session_recording: { maskAllInputs: true, maskTextSelector: '.ph-mask', blockSelector: '.ph-no-capture' },
    });
    posthog.capture('$pageview');
    for (const fn of pending.splice(0)) fn(posthog);
    return posthog;
  });
  return ph;
}

function withPh(fn: (p: PostHog) => void) {
  if (!ph) {
    pending.push(fn);
    return;
  }
  void ph.then((p) => p && fn(p));
}

/**
 * Starts when the browser is idle after the load event, or at the first
 * interaction. About 370 KB of analytics code then never competes with the
 * first paint or the main photo. web-vitals reads buffered entries, so late
 * loading loses no metric.
 */
export function startAnalytics() {
  let done = false;
  const events = ['pointerdown', 'keydown', 'scroll'] as const;
  const go = () => {
    if (done) return;
    done = true;
    for (const e of events) window.removeEventListener(e, go);
    // Idle, but never later than 2 s after load.
    if (window.requestIdleCallback) window.requestIdleCallback(begin, { timeout: 2000 });
    else window.setTimeout(begin, 1);
  };
  for (const e of events) window.addEventListener(e, go, { once: true, passive: true });
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}

function begin() {
  void load();
  const ga = import.meta.env.PUBLIC_GA_ID as string | undefined;
  if (ga && import.meta.env.PROD) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
    document.head.append(s);
    const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      // gtag reads the arguments object.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', ga);
  }
  void import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    const send = (m: { name: string; value: number; id: string; rating: string }) => {
      withPh((p) => p.capture('web_vitals', { metric_name: m.name, value: m.value, metric_id: m.id, rating: m.rating }));
    };
    onCLS(send);
    onINP(send);
    onLCP(send);
    onFCP(send);
    onTTFB(send);
  });
}

export function identify(id: string, props: Record<string, string | undefined>) {
  withPh((p) => p.identify(id, props));
}

export function resetAnalytics() {
  withPh((p) => p.reset());
}

export function track(event: string, props?: Record<string, unknown>) {
  withPh((p) => p.capture(event, props));
}
