/**
 * Property media. The server renders one photo track: a swipe strip with
 * captions on phones, a mosaic from 768 px (the first photo is the LCP image).
 * With JavaScript, a full-screen viewer opens for photos, the 360° tour, the
 * floor plan and video. The tour and video frames load only when opened.
 * Any element with `data-open-media="photos|plan|tour|video"` on the page
 * opens the viewer too (the floor plan section uses it).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { imageUrl, srcSet } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { FACT_ICONS } from '@/ui/icons/amenities';
import { afterLoad } from '@/ui/photoStrip';
import { GALLERY_SIZES, GALLERY_WIDTHS, PHOTO_GROUPS, type PhotoGroup } from './photos';

export type Media = {
  photos: { url: string; caption?: string | null; group?: PhotoGroup }[];
  tour?: string | null;
  plan?: string | null;
  video?: string | null;
};

type Mode = 'photos' | 'tour' | 'plan' | 'video';
type Slide = { kind: 'photo'; i: number } | { kind: 'tour' };

const T = {
  en: {
    all: (n: number) => `See all ${n} photos`,
    short: (n: number) => `${n} photos`,
    photos: 'Photos',
    tour: '360° tour',
    startTour: 'Start the 360° tour',
    plan: 'Floor plan',
    video: 'Video',
    close: 'Close',
    prev: 'Previous photo',
    next: 'Next photo',
    of: 'of',
    open: 'Open photo',
    photo: 'photo',
    noPhoto: 'The owner has not added photos yet',
    newTab: 'Open in a new tab',
    viewer: 'Media viewer',
    strip: 'Photos of this home',
    thumbs: 'All photos',
    modes: 'What to show',
    groupsLabel: 'Rooms',
    groups: { hall: 'Living and dining', room: 'Bedrooms', kitchen: 'Kitchen', bathroom: 'Bathrooms', balcony: 'Balcony', terrace: 'Terrace', entrance: 'Entrance', exterior: 'Outside', others: 'More' } as Record<PhotoGroup, string>,
  },
  hi: {
    all: (n: number) => `सभी ${n} फ़ोटो देखें`,
    short: (n: number) => `${n} फ़ोटो`,
    photos: 'फ़ोटो',
    tour: '360° टूर',
    startTour: '360° टूर शुरू करें',
    plan: 'फ़्लोर प्लान',
    video: 'वीडियो',
    close: 'बंद करें',
    prev: 'पिछली फ़ोटो',
    next: 'अगली फ़ोटो',
    of: '/',
    open: 'फ़ोटो खोलें',
    photo: 'फ़ोटो',
    noPhoto: 'मालिक ने अभी फ़ोटो नहीं जोड़ीं',
    newTab: 'नए टैब में खोलें',
    viewer: 'मीडिया व्यूअर',
    strip: 'इस घर की फ़ोटो',
    thumbs: 'सभी फ़ोटो',
    modes: 'क्या दिखाएँ',
    groupsLabel: 'कमरे',
    groups: { hall: 'लिविंग और डाइनिंग', room: 'बेडरूम', kitchen: 'रसोई', bathroom: 'बाथरूम', balcony: 'बालकनी', terrace: 'छत', entrance: 'प्रवेश', exterior: 'बाहर से', others: 'और' } as Record<PhotoGroup, string>,
  },
};

function embedFor(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export default function Gallery({ media, title, locale = 'en' }: { media: Media; title: string; locale?: Locale }) {
  const t = T[locale];
  const dlg = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>('photos');
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  // Phones: photos 3 and on wait until the first touch or the page load (see .pg-track in property.css).
  const [ready, setReady] = useState(false);
  const touch = useRef<number | null>(null);
  const photos = media.photos;
  const n = photos.length;
  const modes = useMemo(() => (['photos', 'plan', 'tour', 'video'] as const).filter((m) => (m === 'photos' ? n > 0 : Boolean(media[m]))), [n, media]);

  const open = useCallback((m: Mode, i = 0) => {
    setMode(m);
    setIndex(i);
    setIsOpen(true);
    if (!dlg.current?.open) dlg.current?.showModal();
    document.documentElement.style.overflow = 'hidden';
  }, []);
  const close = () => dlg.current?.close();
  const step = useCallback((d: number) => setIndex((i) => (i + d + n) % n), [n]);

  useEffect(() => {
    const el = dlg.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (mode !== 'photos' || n < 2) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [mode, n, step]);

  useEffect(() => afterLoad(() => setReady(true)), []);

  // Other parts of the page (the floor plan section) open the viewer by data attribute.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-open-media]');
      const m = el?.dataset.openMedia as Mode | undefined;
      if (!el || !m || !modes.includes(m)) return;
      e.preventDefault();
      open(m, Number(el.dataset.openIndex) || 0);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [modes, open]);

  // Preload the neighbours so swiping feels instant.
  useEffect(() => {
    if (!isOpen || mode !== 'photos' || n < 2) return;
    for (const d of [1, -1]) {
      const p = photos[(index + d + n) % n];
      if (p) new Image().src = imageUrl(p.url, 1600) ?? p.url;
    }
  }, [index, isOpen, mode, n, photos]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (!isOpen) return;
    dlg.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [index, isOpen]);

  // The tour poster sits second, where it is seen at once on every screen.
  const slides: Slide[] = photos.map((_, i) => ({ kind: 'photo', i }));
  if (media.tour) slides.splice(Math.min(1, slides.length), 0, { kind: 'tour' });
  // The poster uses a photo the mosaic does not show already (the mosaic shows five slides).
  const poster = photos[Math.min(4, n - 1)];

  const current = photos[index];
  // Room groups for the viewer: the first photo of each group and how many it has.
  const groups = PHOTO_GROUPS.map((g) => ({ g, first: photos.findIndex((p) => p.group === g), count: photos.filter((p) => p.group === g).length })).filter((x) => x.count > 0);
  const label = mode === 'photos' ? t.photos : mode === 'tour' ? t.tour : mode === 'plan' ? t.plan : t.video;

  return (
    <div className="pg">
      {slides.length ? (
        <ul
          className="pg-track"
          data-n={Math.min(slides.length, 5)}
          data-ready={ready || undefined}
          aria-label={t.strip}
          onTouchStart={() => setReady(true)}
          onPointerEnter={() => setReady(true)}
          onFocus={() => setReady(true)}
        >
          {slides.map((s, k) =>
            s.kind === 'tour' ? (
              <li key="tour" className="pg-slide">
                <button type="button" className="pg-shot is-tour" onClick={() => open('tour')} aria-label={t.startTour}>
                  {poster ? <img src={imageUrl(poster.url, 640)} srcSet={srcSet(poster.url, [320, 480, 640])} sizes="(min-width: 768px) 25vw, 86vw" alt="" width={640} height={365} loading="lazy" decoding="async" /> : null}
                  <span className="pg-play">
                    <Icon name={FACT_ICONS.tour} size={22} />
                    {t.tour}
                  </span>
                </button>
                <p className="pg-cap">{t.tour}</p>
              </li>
            ) : (
              <li key={photos[s.i]!.url} className="pg-slide">
                <button type="button" className="pg-shot" onClick={() => open('photos', s.i)} aria-label={`${t.open} ${s.i + 1} ${t.of} ${n}`}>
                  <img
                    src={imageUrl(photos[s.i]!.url, k === 0 ? 1024 : 640)}
                    srcSet={k === 0 ? srcSet(photos[s.i]!.url, GALLERY_WIDTHS) : srcSet(photos[s.i]!.url, [320, 480, 640])}
                    sizes={k === 0 ? GALLERY_SIZES : '(min-width: 768px) 25vw, 86vw'}
                    alt={`${title}, ${t.photo} ${s.i + 1} ${t.of} ${n}`}
                    width={k === 0 ? 1024 : 640}
                    height={k === 0 ? 584 : 365}
                    loading={k === 0 ? undefined : 'lazy'}
                    fetchPriority={k === 0 ? 'high' : undefined}
                    decoding="async"
                  />
                </button>
                {/* No room caption: the owners' captions often name the wrong room (docs/backend-gaps.md). */}
                <p className="pg-cap tabular">
                  {s.i + 1} {t.of} {n}
                </p>
              </li>
            ),
          )}
        </ul>
      ) : (
        <div className="pg-empty">
          <Icon name="camera" size={28} />
          <span>{t.noPhoto}</span>
        </div>
      )}

      {modes.length ? (
        <div className="pg-tools">
          {media.tour ? (
            <button type="button" className="btn" onClick={() => open('tour')}>
              <Icon name={FACT_ICONS.tour} size={18} />
              {t.tour}
            </button>
          ) : null}
          {n ? (
            <button type="button" className="btn" onClick={() => open('photos', 0)}>
              <Icon name="grid" size={18} />
              <span className="pg-long">{t.all(n)}</span>
              <span className="pg-short">{t.short(n)}</span>
            </button>
          ) : null}
          {media.plan ? (
            <button type="button" className="btn" onClick={() => open('plan')}>
              <Icon name={FACT_ICONS.floorPlan} size={18} />
              {t.plan}
            </button>
          ) : null}
          {media.video ? (
            <button type="button" className="btn" onClick={() => open('video')}>
              <Icon name={FACT_ICONS.video} size={18} />
              {t.video}
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Native dialog: focus trap, Esc and inert background come from the browser. */}
      <dialog
        ref={dlg}
        className="pv"
        aria-label={t.viewer}
        onClose={() => {
          document.documentElement.style.overflow = '';
          setIsOpen(false);
          setMode('photos');
        }}
      >
        <div className="pv-bar">
          {modes.length > 1 ? (
            <div className="pv-modes" role="group" aria-label={t.modes}>
              {modes.map((m) => (
                <button key={m} type="button" className="pv-mode" aria-pressed={mode === m} onClick={() => open(m, m === 'photos' ? index : 0)}>
                  <Icon name={m === 'photos' ? 'camera' : m === 'plan' ? FACT_ICONS.floorPlan : m === 'tour' ? FACT_ICONS.tour : FACT_ICONS.video} size={18} />
                  {m === 'photos' ? t.photos : m === 'plan' ? t.plan : m === 'tour' ? t.tour : t.video}
                </button>
              ))}
            </div>
          ) : (
            <span className="pv-title">{label}</span>
          )}
          {(mode === 'tour' && media.tour) || (mode === 'video' && media.video) ? (
            <a className="pv-link" href={mode === 'tour' ? media.tour! : media.video!} target="_blank" rel="noopener">
              {t.newTab}
              <Icon name="arrow-up-right" size={16} />
            </a>
          ) : null}
          <button type="button" className="btn btn-icon pv-close" onClick={close} aria-label={t.close}>
            <Icon name="close" />
          </button>
        </div>
        <div
          className="pv-stage"
          onTouchStart={(e) => (touch.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touch.current === null || mode !== 'photos') return;
            const dx = (e.changedTouches[0]?.clientX ?? 0) - touch.current;
            if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
            touch.current = null;
          }}
        >
          {isOpen && mode === 'photos' && current ? (
            <figure className="pv-figure">
              <img src={imageUrl(current.url, 1600)} alt={`${title}, ${t.photo} ${index + 1} ${t.of} ${n}`} />
              <figcaption aria-live="polite" className="tabular">
                {index + 1} {t.of} {n}
              </figcaption>
            </figure>
          ) : null}
          {isOpen && mode === 'plan' && media.plan ? (
            <figure className="pv-figure is-plan">
              <img src={imageUrl(media.plan, 1600)} alt={`${t.plan}: ${title}`} />
            </figure>
          ) : null}
          {isOpen && mode === 'tour' && media.tour ? (
            <iframe className="pv-frame" src={media.tour} title={`${t.tour}: ${title}`} allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer" allowFullScreen />
          ) : null}
          {isOpen && mode === 'video' && media.video ? (
            /\.(mp4|webm|ogg)(\?|$)/i.test(media.video) ? (
              // Owner videos have no caption files in the backend (no field for them).
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video className="pv-frame" src={media.video} controls playsInline />
            ) : (
              <iframe className="pv-frame" src={embedFor(media.video)} title={`${t.video}: ${title}`} allow="fullscreen; autoplay; encrypted-media" allowFullScreen />
            )
          ) : null}
          {mode === 'photos' && n > 1 ? (
            <>
              <button type="button" className="btn btn-icon pv-prev" onClick={() => step(-1)} aria-label={t.prev}>
                <Icon name="chevron-left" />
              </button>
              <button type="button" className="btn btn-icon pv-next" onClick={() => step(1)} aria-label={t.next}>
                <Icon name="chevron-right" />
              </button>
            </>
          ) : null}
        </div>
        {isOpen && mode === 'photos' && groups.length > 1 ? (
          <div className="pv-groups" role="group" aria-label={t.groupsLabel}>
            {groups.map(({ g, first, count }) => (
              <button key={g} type="button" className="pv-group" aria-pressed={current?.group === g} onClick={() => setIndex(first)}>
                {t.groups[g]} <span className="tabular">{count}</span>
              </button>
            ))}
          </div>
        ) : null}
        {isOpen && mode === 'photos' && n > 1 ? (
          <ol className="pv-rail" aria-label={t.thumbs}>
            {photos.map((p, i) => (
              <li key={p.url}>
                <button type="button" aria-current={i === index} aria-label={`${t.open} ${i + 1} ${t.of} ${n}`} onClick={() => setIndex(i)}>
                  <img src={imageUrl(p.url, 200)} alt="" width={96} height={56} loading="lazy" decoding="async" />
                </button>
              </li>
            ))}
          </ol>
        ) : null}
      </dialog>
    </div>
  );
}
