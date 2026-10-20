/**
 * Listing card. Pure markup: no hooks, so Astro can render it on the server
 * with zero JS, and islands can reuse it. The favourite and compare buttons
 * are separate islands placed by the parent (`favourite` and `compare` slots).
 *
 * Order of facts, as buyers scan them: price (and price per sq ft for sale),
 * type, place (locality first), size and furnishing, then the photos.
 */
import type { ReactNode } from 'react';
import type { Property, PropertyImage } from '@/lib/api/types';
import { areaSqft, homeKind, imageUrl, listingPrice, rupees, srcSet } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { FACT_ICONS } from '@/ui/icons/amenities';
import { Icon } from '@/ui/icons/Icon';
import { startPhotoStrips, STRIP_WIDTHS } from '@/ui/photoStrip';
import { isPlaceholderPrice, PRICE_ON_REQUEST } from '@/features/search/prices';
import { perSqft } from './facts';
import { CARD_SIZES, galleryPhotos } from './photos';

export type CardProperty = Pick<
  Property,
  | 'id'
  | 'title'
  | 'property_type'
  | 'purpose'
  | 'base_price'
  | 'monthly_rent'
  | 'daily_rate'
  | 'bedrooms'
  | 'bathrooms'
  | 'area_sqft'
  | 'locality'
  | 'sub_locality'
  | 'city'
  | 'main_image_url'
  | 'virtual_tour_url'
  | 'distance_km'
> &
  Partial<Pick<Property, 'price_per_sqft' | 'furnishing_level'>> & {
    /** The API's photos, or only the strip's (search results page 1, see features/search/listingItem). */
    images?: CardImage[] | null;
    /** How many photos the home has, when `images` holds only the strip's. */
    photo_count?: number;
  };

type CardImage = Pick<PropertyImage, 'image_url' | 'image_category' | 'display_order'>;

type Props = {
  property: CardProperty;
  locale?: Locale;
  /** Load the image eagerly with high priority (first row of a list). */
  priority?: boolean;
  favourite?: ReactNode;
  /** Compare toggle, shown in the card foot (search results). */
  compare?: ReactNode;
  layout?: 'grid' | 'list';
  /** Shown instead of the price when there is none yet (post-property preview). */
  pricePlaceholder?: string;
  /**
   * The swipeable photo strip (grid view). Set false inside a sideways-scrolling
   * rail, where a swipe on the photo must move the rail, not the photos.
   */
  strip?: boolean;
};

const T = {
  en: {
    tour: '360° tour',
    baths: (n: number) => `${n} ${n === 1 ? 'bath' : 'baths'}`,
    away: 'km away',
    noPhoto: 'Photo coming soon',
    photos: (n: number) => `${n} ${n === 1 ? 'photo' : 'photos'}`,
    sqft: '/sq ft',
    photosOf: (h: string) => `Photos: ${h}`,
    next: 'Next photo, {i} of {n}',
    prev: 'Previous photo, {i} of {n}',
    furnished: 'Furnished',
    semi_furnished: 'Semi-furnished',
    unfurnished: 'Unfurnished',
  },
  hi: {
    tour: '360° टूर',
    baths: (n: number) => `${n} बाथरूम`,
    away: 'किमी दूर',
    noPhoto: 'फ़ोटो जल्द आएगी',
    photos: (n: number) => `${n} फ़ोटो`,
    sqft: '/वर्ग फ़ुट',
    photosOf: (h: string) => `फ़ोटो: ${h}`,
    next: 'अगली फ़ोटो, {n} में से {i}',
    prev: 'पिछली फ़ोटो, {n} में से {i}',
    furnished: 'फ़र्निश्ड',
    semi_furnished: 'सेमी-फ़र्निश्ड',
    unfurnished: 'अनफ़र्निश्ड',
  },
};

/** Locality first: "Palam Vihar, Block C" says more than "Block C, Gurugram". */
export function cardPlace(p: Pick<Property, 'locality' | 'sub_locality' | 'city'>): string {
  const loc = p.locality?.trim() ?? '';
  const sub = (p.sub_locality ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x && x.toLowerCase() !== loc.toLowerCase())
    .join(', ');
  return [loc, sub].filter(Boolean).join(', ') || (p.city ?? '');
}

const ROOMS = ['hall', 'room', 'kitchen', 'balcony', 'exterior'];

/**
 * Photos for the card strip: the main photo, then up to 3 rooms, one per kind
 * first (hall, room, kitchen, balcony, exterior). Bathrooms and entrances are
 * left out: 69 of 100 covers already show a door (backend-gaps D15).
 */
export function cardPhotos(p: Pick<Property, 'main_image_url'> & { images?: CardImage[] | null }): string[] {
  const main = p.main_image_url;
  const pool = (p.images ?? [])
    .filter((i) => i.image_url && i.image_url !== main && !/kuula\.co/.test(i.image_url) && ROOMS.includes(i.image_category ?? ''))
    .sort((a, b) => ROOMS.indexOf(a.image_category!) - ROOMS.indexOf(b.image_category!) || (a.display_order ?? 99) - (b.display_order ?? 99));
  const firsts = ROOMS.map((c) => pool.find((i) => i.image_category === c)).filter((i): i is CardImage => Boolean(i));
  const rest = pool.filter((i) => !firsts.includes(i));
  const urls = [...new Set([...firsts, ...rest].map((i) => i.image_url))].slice(0, 3);
  return main ? [main, ...urls] : urls;
}

// The strip buttons run from one shared module (Page.astro loads it once per
// page). Cards drawn by a client-only island (account saved homes) start it
// here too; the module's guard stops a second run.
if (typeof document !== 'undefined') startPhotoStrips();

const LIST_GRID = 'grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-4 @2xl:grid-cols-[19.75rem_minmax(0,1fr)]';

export function PropertyCardView({ property: p, locale = 'en', priority = false, favourite, compare, layout = 'grid', pricePlaceholder, strip: swipe = true }: Props) {
  const t = T[locale];
  const price = listingPrice(p, locale);
  const heading = homeKind(p, locale);
  const area = areaSqft(p.area_sqft, locale);
  const href = localizePath(`/property/${p.id}`, locale);
  const list = layout === 'list';
  const photoCount = p.photo_count ?? (p.images ? galleryPhotos(p).length : 0);
  // From the price shown, so the two numbers always agree (the API field is stale on some homes).
  const rate = perSqft(p);
  const furnishing = p.furnishing_level ? t[p.furnishing_level] : null;
  const strip = cardPhotos(p);
  // List view on a wide row: the main photo plus two more, so a home is judged at a glance.
  const extra = list ? strip.slice(1, 3) : [];
  // Grid view: a strip of up to 4 photos to swipe through.
  const slides = !list && swipe && strip.length > 1 ? strip : [];

  return (
    // Grid cards fill their row, and the foot (photos, compare) sits at the bottom,
    // so the feet of cards side by side line up whatever the facts above them.
    <article className={`group relative h-full ${list ? '@container' : ''}`}>
      <div className={list ? LIST_GRID : 'grid h-full grid-rows-[auto_1fr] gap-3'}>
        <div className={list && extra.length === 2 ? '@2xl:grid @2xl:grid-cols-[13rem_6.5rem] @2xl:gap-1' : undefined}>
          <div className={`group/photo relative overflow-hidden rounded-[var(--radius-lg)] bg-mist-100 aspect-[4/3] ${slides.length ? 'z-[1]' : ''}`}>
            {slides.length ? (
              <>
                {/* The strip sits above the card link; each photo links to the home too (hidden from the tab order).
                    Until the strip is ready (data-ready), only photo 1 shows: no count, no buttons, no empty boxes. */}
                <div
                  className="pcard-strip peer flex h-full [&:not([data-ready])>:not(:first-child)]:hidden snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-kesar-700 [&::-webkit-scrollbar]:hidden"
                  role="group"
                  aria-label={t.photosOf(heading)}
                  // A scrollable strip must take keyboard focus, so arrow keys can scroll it (WCAG 2.1.1).
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                  tabIndex={0}
                >
                  {slides.map((url, i) => (
                    <a key={url} href={href} tabIndex={-1} aria-hidden="true" className="block h-full w-full flex-none snap-start">
                      <img
                        // Photos 2 to 4 wait for the strip (photoStrip.ts): they must not slow the main photo.
                        // They carry only the photo's address; the strip writes src and srcset from it.
                        {...(i === 0 ? { src: imageUrl(url, 640), srcSet: srcSet(url, STRIP_WIDTHS) } : { 'data-src': url })}
                        sizes={CARD_SIZES}
                        alt=""
                        width={640}
                        height={480}
                        loading={i === 0 && priority ? 'eager' : 'lazy'}
                        fetchPriority={i === 0 && priority ? 'high' : i === 0 ? 'auto' : 'low'}
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
                {(['prev', 'next'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    data-pcs={d}
                    data-label={t[d]}
                    hidden={d === 'prev'}
                    aria-label={t[d].replace('{i}', d === 'next' ? '2' : '0').replace('{n}', String(slides.length))}
                    className={`pcard-nav peer-[:not([data-ready])]:hidden absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-paper/95 text-ink-950 opacity-0 shadow-[0_1px_1px_rgb(20_45_38/0.08),0_2px_6px_-2px_rgb(20_45_38/0.18)] transition-[opacity,background-color] duration-150 hover:bg-paper focus-visible:opacity-100 group-hover/photo:opacity-100 pointer-fine:grid motion-reduce:transition-none ${d === 'prev' ? 'left-2' : 'right-2'}`}
                  >
                    <Icon name={d === 'prev' ? 'chevron-left' : 'chevron-right'} size={20} />
                  </button>
                ))}
                <span
                  data-pcs-count
                  aria-hidden="true"
                  className="absolute bottom-2 left-2 z-10 rounded-lg peer-[:not([data-ready])]:hidden bg-paper/95 px-2 py-0.5 text-xs font-semibold text-ink-950 tabular shadow-[0_1px_1px_rgb(20_45_38/0.08),0_2px_6px_-2px_rgb(20_45_38/0.18)]"
                >
                  1 / {slides.length}
                </span>
              </>
            ) : p.main_image_url ? (
              <img
                src={imageUrl(p.main_image_url, 640)}
                srcSet={srcSet(p.main_image_url, [320, 480, 640, 960])}
                sizes={list ? '(min-width: 640px) 13rem, 8.5rem' : CARD_SIZES}
                alt=""
                width={640}
                height={480}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                className="h-full w-full object-cover transition-[scale] duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-kesar-700">
                <Icon name="camera" size={28} />
                <span className="sr-only">{t.noPhoto}</span>
              </div>
            )}
            {favourite ? <div className="absolute right-2 top-2 z-10">{favourite}</div> : null}
          </div>
          {extra.length === 2 ? (
            <div className="hidden @2xl:grid @2xl:grid-rows-2 @2xl:gap-1" aria-hidden="true">
              {extra.map((x) => (
                <img key={x} src={imageUrl(x, 240)} alt="" width={240} height={180} loading="lazy" decoding="async" className="h-full w-full rounded-[var(--radius-md)] bg-mist-100 object-cover" />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          {/* Two cases, never both: no price yet (post-property preview, price 0) and a stand-in ₹10 Cr price. */}
          {(pricePlaceholder && !p.base_price) || isPlaceholderPrice(p) ? (
            // Same box as the price line, so the card keeps its height.
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className={`font-display text-xl font-bold leading-tight ${p.base_price ? 'text-ink-950' : 'text-ink-600'}`}>{p.base_price ? PRICE_ON_REQUEST[locale] : pricePlaceholder}</span>
            </p>
          ) : (
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular">
              <span className="font-display text-xl font-bold leading-tight text-ink-950">
                {price.amount}
                {price.period ? <span className="ml-0.5 font-sans text-sm font-semibold text-ink-600">{price.period}</span> : null}
              </span>
              {rate ? (
                <span className="text-sm text-ink-600">
                  {rupees(rate, locale)}
                  {t.sqft}
                </span>
              ) : null}
            </p>
          )}
          <h3 className="font-sans text-base font-semibold leading-snug text-ink-950">
            <a
              href={href}
              className="inline-block min-h-6 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-kesar-700 focus-visible:after:rounded-[var(--radius-lg)]"
            >
              {heading}
              <span className="sr-only">. {p.title}</span>
            </a>
          </h3>
          <p className="flex min-w-0 items-center gap-1 text-sm text-ink-800">
            <Icon name="pin" size={14} className="text-kesar-700" />
            <span className="min-w-0 truncate">{cardPlace(p)}</span>
            {typeof p.distance_km === 'number' ? (
              <span className="shrink-0 text-ink-600">
                · {p.distance_km.toFixed(1)} {t.away}
              </span>
            ) : null}
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-600">
            {area ? (
              <li className="flex items-center gap-1">
                <Icon name={FACT_ICONS.area} size={15} />
                {area}
              </li>
            ) : null}
            {p.bathrooms ? (
              <li className="flex items-center gap-1">
                <Icon name={FACT_ICONS.bathrooms} size={15} />
                {t.baths(p.bathrooms)}
              </li>
            ) : null}
            {furnishing ? (
              <li className="flex items-center gap-1">
                <Icon name={FACT_ICONS.furnishing} size={15} />
                {furnishing}
              </li>
            ) : null}
          </ul>
          {photoCount > 1 || p.virtual_tour_url || compare ? (
            <div className="mt-auto flex min-h-11 flex-wrap items-center gap-x-3 pt-0.5 text-sm">
              {p.virtual_tour_url ? (
                <span className="flex items-center gap-1 font-semibold text-kesar-700">
                  <Icon name={FACT_ICONS.tour} size={16} />
                  {t.tour}
                </span>
              ) : null}
              {photoCount > 1 ? (
                <span className="flex items-center gap-1 text-ink-600">
                  <Icon name="camera" size={15} />
                  {t.photos(photoCount)}
                </span>
              ) : null}
              {compare ? <div className="relative z-[1] ml-auto">{compare}</div> : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Skeleton with the same boxes as the card, so nothing jumps when data lands. */
export function PropertyCardSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'list' }) {
  const list = layout === 'list';
  return (
    <div aria-hidden="true" className={list ? '@container' : undefined}>
      <div className={list ? LIST_GRID : 'grid gap-3'}>
        <div className={list ? '@2xl:grid @2xl:grid-cols-[13rem_6.5rem] @2xl:gap-1' : undefined}>
          <span className="skeleton aspect-[4/3]" />
          {list ? (
            <span className="hidden @2xl:grid @2xl:grid-rows-2 @2xl:gap-1">
              <span className="skeleton" />
              <span className="skeleton" />
            </span>
          ) : null}
        </div>
        <div className="grid content-start gap-1">
          <span className="skeleton h-7 w-40" />
          <span className="skeleton h-6 w-44" />
          <span className="skeleton h-5 w-52" />
          <span className="skeleton h-5 w-48" />
          <span className="skeleton mt-0.5 h-11 w-full max-w-60" />
        </div>
      </div>
    </div>
  );
}
