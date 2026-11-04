/**
 * PostHog and gtag, started past the largest contentful paint once the
 * browser is idle (see ./scheduler). Events: $pageview (also on history
 * changes), $pageleave, autocapture (clicks, form submits), web_vitals,
 * input_changed, file_selected, identify, reset.
 *
 * Coverage: requests go through the same-origin proxy (./proxy) so blockers
 * do not drop them, and a visitor who leaves before the late start still
 * counts through a one-event beacon (see `beaconPageview`).
 */
import { scheduleAnalyticsStart } from './scheduler';
import { PH_PROXY, PH_UI_HOST } from './proxy';

type PostHog = typeof import('posthog-js').default;

const KEY = import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined;
const ENABLED = typeof window !== 'undefined' && !!KEY && import.meta.env.PROD;
/** Anonymous id for the beacon, handed to the SDK as its bootstrap id so both agree. */
const ANON_KEY = 'gh_ph_anon';
const SECRET_AUTOCOMPLETE = /^(one-time-code|cc-)/;

let ph: Promise<PostHog | null> | null = null;
let beaconSent = false;
/** Session id of the beacon's view; the SDK continues it when it starts later in the same tab. */
let beaconSession: string | undefined;
const pending: ((p: PostHog) => void)[] = [];

function load(): Promise<PostHog | null> {
  if (!ENABLED) return Promise.resolve(null);
  ph ??= import('posthog-js').then(({ default: posthog }) => {
    posthog.init(KEY!, {
      api_host: PH_PROXY,
      ui_host: PH_UI_HOST,
      // Astro redirects '/x/' to '/x' (trailingSlash: 'never') before the proxy
      // runs, and a redirect drops POST bodies. The proxy puts the slash back.
      rewriteRequestPath: (url) => {
        if (url.pathname.startsWith(`${PH_PROXY}/`)) url.pathname = url.pathname.replace(/\/+$/, '');
        return url;
      },
      bootstrap: { distinctID: anonId(), ...(beaconSession ? { sessionID: beaconSession } : {}) },
      person_profiles: 'always',
      autocapture: true,
      // The beacon already counted this view: skip the SDK's initial one.
      capture_pageview: beaconSent ? false : 'history_change',
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true },
        // Same rule as `sensitive` below: one-time codes and card fields stay hidden in replays.
        maskInputFn: (text, el) => (el instanceof HTMLInputElement && SECRET_AUTOCOMPLETE.test(el.autocomplete) ? '*'.repeat(text.length) : text),
        maskTextSelector: '.ph-mask',
        blockSelector: '.ph-no-capture',
      },
    });
    for (const fn of pending.splice(0)) fn(posthog);
    return posthog;
  });
  return ph;
}

function withPh(fn: (p: PostHog) => void) {
  if (!ENABLED) return;
  if (!ph) {
    pending.push(fn);
    return;
  }
  void ph.then((p) => p && fn(p));
}

/**
 * UUIDv7 (time-ordered), the id format PostHog uses for people and sessions.
 * Built by hand: crypto.randomUUID is v4 and is missing on Safari before 15.4.
 */
function uuidv7(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  let t = Date.now();
  for (let i = 5; i >= 0; i--, t = Math.floor(t / 256)) b[i] = t % 256;
  b[6] = (b[6]! & 0x0f) | 0x70;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** The SDK's persisted id when it has one, else ours (created once, kept for later visits). */
function anonId(): string {
  try {
    const s = window.localStorage;
    const saved = JSON.parse(s.getItem(`ph_${KEY}_posthog`) ?? 'null') as { distinct_id?: string } | null;
    if (saved?.distinct_id) return saved.distinct_id;
    let id = s.getItem(ANON_KEY);
    if (!id) {
      id = uuidv7();
      s.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    // Storage blocked or full: an id for this page only. Analytics must still start.
    return (anonFallback ??= uuidv7());
  }
}
let anonFallback: string | undefined;

/** Headless browsers and crawlers. The SDK drops them itself; the beacon must too. */
const BOT_UA = /bot|crawl|spider|slurp|lighthouse|headless|pagespeed|preview|phantom|puppeteer|playwright/i;

/** utm_* and click ids from the URL, as the SDK sends them, so beacon views keep their campaign. */
function campaign(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of new URLSearchParams(location.search)) if (/^(utm_\w+|gclid|fbclid|msclkid)$/.test(k)) out[k] = v;
  return out;
}

/**
 * The SDK starts late (up to 10 s after load) to keep it out of the first
 * paint. A visitor who leaves or hides the tab before that would never
 * count, so one $pageview goes out as a beacon at that moment instead.
 */
function beaconPageview() {
  if (ph || beaconSent || navigator.webdriver || BOT_UA.test(navigator.userAgent) || !navigator.sendBeacon) return;
  beaconSent = true;
  beaconSession = uuidv7();
  const ua = navigator.userAgent;
  const body = JSON.stringify({
    api_key: KEY,
    event: '$pageview',
    distinct_id: anonId(),
    timestamp: new Date().toISOString(),
    properties: {
      $current_url: location.href,
      $host: location.host,
      $pathname: location.pathname,
      $referrer: document.referrer || '$direct',
      $referring_domain: document.referrer ? new URL(document.referrer).host : '$direct',
      $session_id: beaconSession,
      $raw_user_agent: ua,
      $device_type: /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? 'Tablet' : /Mobi|iPhone|Android/i.test(ua) ? 'Mobile' : 'Desktop',
      ...campaign(),
      $screen_width: screen.width,
      $screen_height: screen.height,
      $viewport_width: innerWidth,
      $lib: 'beacon',
    },
  });
  navigator.sendBeacon(`${PH_PROXY}/i/v0/e`, new Blob([body], { type: 'application/json' }));
}

/**
 * Starts when the LCP candidates settle and the browser is idle, or at the
 * first interaction (see ./scheduler). About 370 KB of analytics code then
 * never competes with the first paint or the main photo. web-vitals reads
 * buffered entries, so late loading loses no metric. The listeners below are
 * cheap and run from the start; their events queue until the SDK is ready.
 */
export function startAnalytics() {
  if (ENABLED) {
    addEventListener('pagehide', beaconPageview);
    document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && beaconPageview());
    document.addEventListener('change', onChange, true);
    // Bubble phase: a drop zone has called preventDefault by then. A file
    // dropped anywhere else is not an upload (the browser just opens it).
    document.addEventListener('drop', onDrop);
  }
  scheduleAnalyticsStart(begin);
}

/** Passwords, one-time codes and card fields never leave the page. */
function sensitive(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
  return (el instanceof HTMLInputElement && el.type === 'password') || SECRET_AUTOCOMPLETE.test(el.autocomplete) || !!el.closest('.ph-no-capture');
}

function field(el: Element) {
  const label = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent?.trim() : undefined;
  return {
    field_name: el.getAttribute('name') ?? undefined,
    field_id: el.id || undefined,
    field_label: (label ?? el.getAttribute('aria-label') ?? el.closest('label')?.textContent?.trim())?.slice(0, 120),
    form_id: el.closest('form')?.id || undefined,
    $pathname: location.pathname,
  };
}

/** Committed values of every form field (the change event: on blur or pick, not per key). */
function onChange(e: Event) {
  const el = e.target;
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) || sensitive(el)) return;
  if (el instanceof HTMLInputElement && el.type === 'file') {
    for (const f of el.files ?? []) void trackFile(f, { ...field(el), via: 'picker' });
    return;
  }
  const value = el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio') ? (el.checked ? el.value : '') : el.value;
  track('input_changed', { ...field(el), field_type: el instanceof HTMLInputElement ? el.type : el.tagName.toLowerCase(), value: value.slice(0, 1000) });
}

function onDrop(e: DragEvent) {
  if (!e.defaultPrevented) return;
  for (const f of e.dataTransfer?.files ?? []) void trackFile(f, { via: 'drop', $pathname: location.pathname });
}

/** File details, plus a small JPEG preview of images so the upload can be seen in PostHog. */
async function trackFile(f: File, props: Record<string, unknown>) {
  let thumbnail: string | undefined;
  if (f.type.startsWith('image/')) {
    try {
      const img = await createImageBitmap(f);
      const scale = Math.min(1, 320 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
      img.close();
      thumbnail = c.toDataURL('image/jpeg', 0.7);
    } catch {
      // Formats the browser cannot decode (HEIC on most) go without a preview.
    }
  }
  track('file_selected', { ...props, file_name: f.name, file_type: f.type, file_size: f.size, thumbnail });
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
  void import('web-vitals')
    .then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      const send = (m: { name: string; value: number; id: string; rating: string }) => {
        withPh((p) => p.capture('web_vitals', { metric_name: m.name, value: m.value, metric_id: m.id, rating: m.rating }));
      };
      onCLS(send);
      onINP(send);
      onLCP(send);
      onFCP(send);
      onTTFB(send);
    })
    // Analytics must never surface as a page error: the import can fail when
    // the tab went offline before this late start (the module is fetched then).
    .catch(() => {});
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
