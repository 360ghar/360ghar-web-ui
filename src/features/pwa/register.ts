/**
 * Browser side of the offline support: registers /sw.js (production only, after
 * the page has loaded) and keeps the offline notice in step with the network.
 * The worker itself is public/sw.js; read its header before changing either.
 */

/** Set to false together with KILL_SWITCH in public/sw.js, so new page loads stop registering the worker. */
export const ENABLE_SW = true;

export function registerServiceWorker(env = { prod: import.meta.env.PROD }, nav: Navigator = navigator, doc: Document = document, win: Window = window) {
  if (!env.prod || !ENABLE_SW || !('serviceWorker' in nav)) return;
  const go = () => {
    // updateViaCache none: the browser checks /sw.js on the network, never its HTTP cache.
    nav.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
      // Blocked (private mode, storage off): the site works the same without it.
    });
  };
  if (doc.readyState === 'complete') go();
  else win.addEventListener('load', go, { once: true });
}

type Events = Pick<Window, 'addEventListener' | 'removeEventListener'>;

/**
 * Shows `note` only while the browser reports it is offline. `announce` is a
 * live region that always exists, so a screen reader hears the change. The
 * note is fixed on screen and out of layout: nothing moves. Returns a stop function.
 */
export function watchOffline(note: HTMLElement, announce: HTMLElement, text: string, nav: Pick<Navigator, 'onLine'> = navigator, win: Events = window) {
  const show = (offline: boolean) => {
    note.hidden = !offline;
    announce.textContent = offline ? text : '';
  };
  const off = () => show(true);
  const on = () => show(false);
  show(nav.onLine === false);
  win.addEventListener('offline', off);
  win.addEventListener('online', on);
  return () => {
    win.removeEventListener('offline', off);
    win.removeEventListener('online', on);
  };
}
