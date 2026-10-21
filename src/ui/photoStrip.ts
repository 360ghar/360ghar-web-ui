/**
 * Previous and next buttons of every listing-card photo strip on the page
 * (PropertyCardView), by event delegation: one listener, whatever renders the
 * cards (Astro or an island). The strip itself scrolls natively (touch,
 * trackpad, keyboard); this only steps it one photo and keeps the count and
 * button names in step.
 *
 * Photos 2 to 4 of a strip wait (no `src`; `data-src` holds only the photo's
 * address, which keeps the HTML short) so they do not take bandwidth from the
 * main photo. A strip gets them, and `data-ready`, on the
 * first touch, hover or focus, and all strips get them after the page loads.
 * Until then CSS shows photo 1 only (no count, no buttons, no empty boxes).
 *
 * A strip inside an island that has not hydrated yet is left alone until it
 * has: React must find the attributes it rendered on the server, or it logs a
 * hydration mismatch. On a slow phone the load event can come first.
 *
 * Page.astro loads it once per page; the card also calls it when it runs in
 * the browser (client-only islands). The guard makes the second call a no-op.
 */

import { imageUrl, srcSet } from '@/lib/format';

/** Widths of a strip photo's srcset (the card's first photo uses the same). */
export const STRIP_WIDTHS = [320, 480, 640, 960];

/** Runs `fn` at an idle moment (at most 2 s later). */
const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(() => fn(), { timeout: 2000 }) : setTimeout(fn, 200));

/** Runs `fn` once, after the load event and an idle moment. */
export function afterLoad(fn: () => void) {
  if (document.readyState === 'complete') idle(fn);
  else addEventListener('load', () => idle(fn), { once: true });
}

export function startPhotoStrips() {
  const w = window as Window & { __pcs?: number };
  if (w.__pcs) return;
  w.__pcs = 1;
  const waiting = new Set<Element>();
  const watched = new WeakSet<Element>();
  // astro-island keeps `ssr` until it hydrates. React hydrates in a transition,
  // over several tasks after the attribute goes, so wait for an idle moment too.
  const afterHydration = (island: Element, strip: Element) => {
    waiting.add(strip);
    if (watched.has(island)) return;
    watched.add(island);
    const mo = new MutationObserver(() => {
      if (island.hasAttribute('ssr')) return;
      mo.disconnect();
      idle(() => {
        for (const s of waiting) if (!s.closest('astro-island[ssr]')) ready(s);
      });
    });
    mo.observe(island, { attributes: true, attributeFilter: ['ssr'] });
  };
  const ready = (strip: Element) => {
    if (strip.hasAttribute('data-ready')) return;
    const island = strip.closest('astro-island[ssr]');
    if (island) return afterHydration(island, strip);
    waiting.delete(strip);
    for (const img of strip.querySelectorAll<HTMLImageElement>('img[data-src]')) {
      const url = img.dataset.src ?? '';
      const set = srcSet(url, STRIP_WIDTHS);
      if (set) img.srcset = set;
      img.src = imageUrl(url, 640) ?? url;
    }
    strip.setAttribute('data-ready', '');
  };
  const readyAll = () => document.querySelectorAll('.pcard-strip:not([data-ready])').forEach(ready);
  const onUse = (e: Event) => {
    const strip = e.target instanceof Element ? e.target.closest('.pcard-strip') : null;
    if (strip) ready(strip);
  };
  // pointerover is the bubbling form of pointerenter.
  for (const type of ['pointerover', 'focusin', 'touchstart']) document.addEventListener(type, onUse, { capture: true, passive: true });
  // After the load, cards an island draws later (saved homes, more results) are ready at once.
  afterLoad(() => {
    readyAll();
    new MutationObserver(readyAll).observe(document.body, { childList: true, subtree: true });
  });
  const sync = (strip: HTMLElement) => {
    const wrap = strip.parentElement;
    if (!wrap) return;
    const n = strip.children.length;
    const i = Math.round(strip.scrollLeft / (strip.clientWidth || 1));
    for (const b of wrap.querySelectorAll<HTMLElement>('[data-pcs]')) {
      const j = i + (b.dataset.pcs === 'next' ? 1 : -1);
      b.hidden = j < 0 || j >= n;
      b.setAttribute('aria-label', (b.dataset.label ?? '').replace('{i}', String(j + 1)).replace('{n}', String(n)));
    }
    const count = wrap.querySelector('[data-pcs-count]');
    if (count) count.textContent = `${i + 1} / ${n}`;
  };
  document.addEventListener(
    'scroll',
    (e) => {
      if (e.target instanceof HTMLElement && e.target.classList.contains('pcard-strip')) sync(e.target);
    },
    true,
  );
  document.addEventListener('click', (e) => {
    const b = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-pcs]') : null;
    const strip = b?.parentElement?.querySelector<HTMLElement>('.pcard-strip');
    if (!b || !strip) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    strip.scrollBy({ left: (b.dataset.pcs === 'next' ? 1 : -1) * strip.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  });
}
