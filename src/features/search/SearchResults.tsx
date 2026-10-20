/**
 * Listing results island. The server renders page 1 with the same markup, so
 * hydration shows no change. Then:
 * - filters live in the URL (replaceState, no reload);
 * - more pages load on scroll with useInfiniteQuery, with a "Load more" button;
 * - on Back, loaded pages and the scroll position come back (sessionStorage);
 * - filters are a sidebar from 1024 px and a bottom sheet below it;
 * - a map view (lazy, Google Maps) shows the same results as price tags.
 */
import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import FavouriteButton from '@/features/favourites/FavouriteButton';
import { PropertyCardSkeleton, PropertyCardView } from '@/features/property/PropertyCardView';
import { api, call } from '@/lib/api/client';
import { formatNum } from '@/lib/format';
import { useBackRestore, useCursorQuery, useSentinel } from '@/lib/infinite';
import { describeError } from '@/lib/api/errors';
import type { ListingPage } from '@/features/search/listingItem';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { QueryProvider } from '@/lib/query';
import { Icon } from '@/ui/icons/Icon';
import { Delayed } from '@/ui/react/Delayed';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { Sheet } from '@/ui/react/Sheet';
import { copyText } from '@/ui/react/share';
import { toast, Toaster } from '@/ui/react/Toaster';
import { StateBlock } from '@/ui/states/StateBlock';
import { locationCopy } from '@/features/location/copy';
import { COMPARE_MAX, compareHref, toggleCompare, useCompareStore } from './compare';
import { FilterForm, PURPOSE_LABEL } from './FilterForm';
import type { AmenityOption } from './listingItem';
import { activeCount, emptyFilters, parseFilters, toApiQuery, toSearchParams, withNearMe, type Filters } from './filters';
import { PlacesInput } from './PlacesInput';
import './search.css';

const ResultsMap = lazy(() => import('./ResultsMap'));
type View = 'grid' | 'list' | 'map';

const PAGE = 12;
/** One object, so `locked` keeps its identity between renders. */
const NO_LOCKS: Partial<Record<keyof Filters, true>> = {};

const T = {
  en: {
    homes: (n: number) => `${formatNum(n, 'en')} ${n === 1 ? 'home' : 'homes'}`,
    homesMany: 'Homes',
    filters: 'Filters',
    sort: 'Sort',
    sorts: { newest: 'Newest first', price_low: 'Price: low to high', price_high: 'Price: high to low', popular: 'Most viewed', distance: 'Nearest first', relevance: 'Best match' },
    grid: 'Grid view',
    list: 'List view',
    mapView: 'Map view',
    nearMe: 'Near me',
    clear: 'Clear all',
    remove: 'Remove filter',
    loadMore: 'Load more homes',
    loading: 'Loading more homes…',
    end: 'You have seen every home that matches.',
    show: (n: number | null) => (n === null ? 'Show homes' : n === 0 ? 'No homes match' : `Show ${formatNum(n, 'en')} homes`),
    reset: 'Reset',
    emptyTitle: 'No homes match these filters',
    emptyBody: 'Try a bigger budget, a wider area or fewer filters.',
    browseAll: 'Browse all homes',
    share: 'Copy link to this search',
    copied: 'Link copied',
    save: 'Save search',
    saved: 'Search saved on this device',
    compare: 'Compare',
    compareFull: `You can compare up to ${COMPARE_MAX} homes`,
    compareNow: (n: number) => `Compare ${n} homes`,
    compareClear: 'Clear',
    search: 'Search an area',
    searchLabel: 'Where',
    updating: 'Updating results',
    radius: (km: number) => `Within ${km} km`,
    near: (p: string) => `near ${p}`,
    inPlace: (p: string) => `in ${p}`,
    scope: { buy: 'for sale', rent: 'for rent', short_stay: 'for short stays' },
    quick: 'Quick filters',
    mapShort: 'Map',
    bhk: (n: string) => `${n} BHK`,
  },
  hi: {
    homes: (n: number) => `${formatNum(n, 'hi')} घर`,
    homesMany: 'घर',
    filters: 'फ़िल्टर',
    sort: 'क्रम',
    sorts: { newest: 'नए पहले', price_low: 'कीमत: कम से ज़्यादा', price_high: 'कीमत: ज़्यादा से कम', popular: 'सबसे ज़्यादा देखे गए', distance: 'सबसे पास पहले', relevance: 'सबसे सही' },
    grid: 'ग्रिड व्यू',
    list: 'लिस्ट व्यू',
    mapView: 'मैप व्यू',
    nearMe: 'मेरे पास',
    clear: 'सब हटाएँ',
    remove: 'फ़िल्टर हटाएँ',
    loadMore: 'और घर दिखाएँ',
    loading: 'और घर लोड हो रहे हैं…',
    end: 'आपने सभी मिलते-जुलते घर देख लिए।',
    show: (n: number | null) => (n === null ? 'घर दिखाएँ' : n === 0 ? 'कोई घर नहीं मिला' : `${formatNum(n, 'hi')} घर दिखाएँ`),
    reset: 'रीसेट',
    emptyTitle: 'इन फ़िल्टर से कोई घर नहीं मिला',
    emptyBody: 'बजट बढ़ाएँ, बड़ा एरिया चुनें या कुछ फ़िल्टर हटाएँ।',
    browseAll: 'सभी घर देखें',
    share: 'इस खोज का लिंक कॉपी करें',
    copied: 'लिंक कॉपी हो गया',
    save: 'खोज सेव करें',
    saved: 'खोज इस डिवाइस पर सेव हो गई',
    compare: 'तुलना',
    compareFull: `आप ${COMPARE_MAX} घरों तक की तुलना कर सकते हैं`,
    compareNow: (n: number) => `${n} घरों की तुलना करें`,
    compareClear: 'हटाएँ',
    search: 'इलाका खोजें',
    searchLabel: 'कहाँ',
    updating: 'नतीजे अपडेट हो रहे हैं',
    radius: (km: number) => `${km} किमी के अंदर`,
    near: (p: string) => `${p} के पास`,
    inPlace: (p: string) => `${p} में`,
    scope: { buy: 'बिक्री के लिए', rent: 'किराये के लिए', short_stay: 'कम समय के लिए' },
    quick: 'जल्दी फ़िल्टर',
    mapShort: 'मैप',
    bhk: (n: string) => `${n} BHK`,
  },
};

type SearchResultsProps = {
  locale: Locale;
  initialFilters: Filters;
  /** Page 1, cut to what the island reads (toListingItem): it is written into the HTML. */
  initialPage: ListingPage | null;
  initialError?: string | null;
  amenities: AmenityOption[];
  /** Page path the URL is kept on. Landing pages pass their own path. */
  basePath?: string;
  /** Facets fixed by a landing page. Changing them moves to /properties. */
  locked?: Partial<Record<keyof Filters, true>>;
  /** /map-location opens in map view. */
  initialView?: View;
  /** Landing pages: what to show when the page itself has no homes (no user filters). */
  empty?: { title: string; body: string; links: { href: string; label: string; count: number }[] };
};

type Page = ListingPage;

// Full API rows fit `ListingItem` (it is a subset of them), so no cast is needed.
function fetchPage(filters: Filters, cursor: string | null): Promise<Page> {
  return call(api.GET('/api/v1/properties', { params: { query: toApiQuery(filters, { limit: PAGE, cursor, total: !cursor }) } }));
}


function Results(props: SearchResultsProps) {
  const { locale, initialFilters, initialPage, amenities, basePath = '/properties', locked = NO_LOCKS, initialView = 'grid', empty } = props;
  const t = T[locale];
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [draft, setDraft] = useState<Filters>(initialFilters);
  const [sheet, setSheet] = useState(false);
  const [view, setView] = useState<View>(initialView);
  const [selected, setSelected] = useState<number | null>(null);
  const key = toSearchParams(filters).toString();
  const isInitial = key === toSearchParams(initialFilters).toString();

  const query = useCursorQuery({
    key: ['properties', key],
    fetch: (cursor) => fetchPage(filters, cursor),
    initialPage: isInitial ? initialPage : null,
    keepPrevious: true,
    staleTime: 60_000,
  });

  // Back from a detail page: loaded pages, scroll position and view come back.
  useBackRestore(['properties', key], query.data, { value: view, restore: (v) => setView(v as View) });

  // Keep the URL in sync with the filters.
  const firstUrlSync = useRef(true);
  useEffect(() => {
    if (firstUrlSync.current) {
      firstUrlSync.current = false;
      return;
    }
    const lockedChanged = Object.keys(locked).some(
      (k) => JSON.stringify(filters[k as keyof Filters]) !== JSON.stringify(initialFilters[k as keyof Filters]),
    );
    const path = lockedChanged ? localizePath('/properties', locale) : localizePath(basePath, locale);
    const qs = lockedChanged ? key : toSearchParams(stripLocked(filters, initialFilters, locked)).toString();
    const url = qs ? `${path}?${qs}` : path;
    if (lockedChanged) window.location.assign(url);
    else history.replaceState(history.state, '', url);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const sentinel = useSentinel(query);
  // The typed text applies 450 ms after the last key.
  const textTimer = useRef<number | undefined>(undefined);

  // Live count for the sheet's "Show N homes" button.
  const draftKey = toSearchParams(draft).toString();
  const count = useQuery({
    queryKey: ['properties-count', draftKey],
    queryFn: async () => {
      const d = await call(api.GET('/api/v1/properties', { params: { query: toApiQuery(draft, { limit: 1, total: true }) } }));
      return d.total;
    },
    enabled: sheet && draftKey !== key,
    staleTime: 60_000,
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total ?? null;
  // Facets fixed by the page (landing pages) are part of the page, not user filters.
  const n = activeCount(stripLocked(filters, initialFilters, locked));
  const compare = useCompareStore();

  const chips = useMemo(
    () => buildChips(filters, locale, amenities).filter((c) => !locked[c.field] || JSON.stringify(filters[c.field]) !== JSON.stringify(initialFilters[c.field])),
    [filters, locale, amenities, locked, initialFilters],
  );

  const copyLink = async () => {
    if (await copyText(window.location.href)) toast(t.copied, 'success');
    else toast(window.location.href);
  };

  const saveSearch = () => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('360ghar:saved-searches') ?? '[]');
      // Only well-formed entries stay: a damaged list starts again.
      const list = Array.isArray(saved) ? saved.filter((x): x is { url: string; at: number } => typeof x?.url === 'string' && typeof x?.at === 'number') : [];
      const url = window.location.pathname + window.location.search;
      const next = [{ url, at: Date.now() }, ...list.filter((x) => x.url !== url)].slice(0, 10);
      localStorage.setItem('360ghar:saved-searches', JSON.stringify(next));
      toast(t.saved, 'success');
    } catch {
      toast(t.saved);
    }
  };

  return (
    <div className="results">
      <aside className="results-side" aria-label={t.filters}>
        <FilterForm value={filters} onChange={setFilters} amenities={amenities} locale={locale} locked={locked} />
        {n ? (
          <button type="button" className="btn btn-quiet mt-4 -ml-3" onClick={() => setFilters({ ...emptyFilters(), ...pickLocked(filters, locked) })}>
            {t.clear}
          </button>
        ) : null}
      </aside>

      <div className="results-main">
        <div className="results-bar">
          <PlacesInput
            name="q"
            label={t.searchLabel}
            placeholder={t.search}
            defaultValue={filters.place ?? filters.q ?? ''}
            className="results-where"
            onPlace={(p) => {
              if (p) setFilters({ ...filters, q: undefined, lat: p.lat, lng: p.lng, radius: filters.radius ?? 10, place: p.name, sort_by: 'distance' });
            }}
            onText={(text) => {
              window.clearTimeout(textTimer.current);
              textTimer.current = window.setTimeout(() => {
                const next = { ...filters, q: text.trim() || undefined };
                if (!text.trim()) {
                  delete next.lat;
                  delete next.lng;
                  delete next.radius;
                  delete next.place;
                }
                setFilters(next);
              }, 450);
            }}
          />
          <button
            type="button"
            className="btn results-filter-btn"
            onClick={() => {
              setDraft(filters);
              setSheet(true);
            }}
          >
            <Icon name="filter" size={18} />
            {t.filters}
            {n ? <span className="results-badge">{n}</span> : null}
          </button>
        </div>

        {/* Not on a landing page with no homes: no quick filter can find one there. */}
        {(!locked.purpose || !locked.bedrooms_min) && !(empty && n === 0 && total === 0) ? (
          <div className="results-quick" role="group" aria-label={t.quick}>
            {!locked.purpose
              ? (['buy', 'rent', 'short_stay'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="toggle"
                    aria-pressed={filters.purpose === p}
                    onClick={() => setFilters({ ...filters, purpose: filters.purpose === p ? undefined : p, price_min: undefined, price_max: undefined })}
                  >
                    {{ buy: locale === 'hi' ? 'खरीदें' : 'Buy', rent: locale === 'hi' ? 'किराया' : 'Rent', short_stay: locale === 'hi' ? 'कम समय' : 'Short stay' }[p]}
                  </button>
                ))
              : null}
            {!locked.bedrooms_min
              ? ([1, 2, 3, 4] as const).map((b) => {
                  const on = filters.bedrooms_min === b && filters.bedrooms_max === (b === 4 ? undefined : b);
                  return (
                    <button
                      key={b}
                      type="button"
                      className="toggle"
                      aria-pressed={on}
                      onClick={() => setFilters({ ...filters, bedrooms_min: on ? undefined : b, bedrooms_max: on || b === 4 ? undefined : b })}
                    >
                      {t.bhk(b === 4 ? '4+' : String(b))}
                    </button>
                  );
                })
              : null}
          </div>
        ) : null}

        <div className="results-meta">
          <p className="results-count" aria-live="polite">
            <strong>{total !== null ? t.homes(total) : t.homesMany}</strong>
            {filters.purpose ? <span> {t.scope[filters.purpose]}</span> : null}
            {filters.place ? <span> {t.near(filters.place)}</span> : filters.locality ? <span> {t.inPlace(filters.locality)}</span> : null}
            {query.isFetching && !query.isFetchingNextPage ? <span className="visually-hidden">{t.updating}</span> : null}
          </p>
          {/* Phones: the map toggle sits on the count row with a word, so the sort select keeps its width. */}
          <button type="button" className="btn btn-quiet results-map-phone" aria-pressed={view === 'map'} aria-label={t.mapView} onClick={() => setView(view === 'map' ? 'grid' : 'map')}>
            <Icon name="map" size={18} />
            <span aria-hidden="true">{t.mapShort}</span>
          </button>
          <div className="results-tools">
            <label className="results-sort">
              <span className="visually-hidden">{t.sort}</span>
              <Icon name="sort" size={18} />
              <select
                className="select"
                value={filters.sort_by ?? (filters.lat !== undefined ? 'distance' : 'newest')}
                onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as Filters['sort_by'] })}
              >
                {(Object.keys(t.sorts) as (keyof typeof t.sorts)[])
                  .filter((s) => s !== 'distance' || filters.lat !== undefined)
                  .filter((s) => s !== 'relevance' || filters.q)
                  .map((s) => (
                    <option key={s} value={s}>
                      {t.sorts[s]}
                    </option>
                  ))}
              </select>
            </label>
            <div className="results-view" role="group" aria-label={`${t.grid} / ${t.list} / ${t.mapView}`}>
              <button type="button" className="btn btn-quiet btn-icon" aria-pressed={view === 'grid'} aria-label={t.grid} onClick={() => setView('grid')}>
                <Icon name="grid" />
              </button>
              <button type="button" className="btn btn-quiet btn-icon" aria-pressed={view === 'list'} aria-label={t.list} onClick={() => setView('list')}>
                <Icon name="list" />
              </button>
              <button type="button" className="btn btn-quiet btn-icon results-view-map" aria-pressed={view === 'map'} aria-label={t.mapView} onClick={() => setView(view === 'map' ? 'grid' : 'map')}>
                <Icon name="map" />
              </button>
            </div>
            <button type="button" className="btn btn-quiet btn-icon" aria-label={t.share} onClick={() => void copyLink()}>
              <Icon name="share" />
            </button>
            <button type="button" className="btn btn-quiet btn-icon" aria-label={t.save} onClick={saveSearch}>
              <Icon name="star" />
            </button>
          </div>
        </div>

        {chips.length ? (
          <ul className="results-chips">
            {chips.map((c) => (
              <li key={c.id}>
                <button type="button" className="toggle results-chip" disabled={locked[c.field]} aria-label={`${t.remove}: ${c.label}`} onClick={() => setFilters(c.remove(filters))}>
                  {c.label}
                  {!locked[c.field] ? <Icon name="close" size={14} /> : null}
                </button>
              </li>
            ))}
            {n > 1 ? (
              <li>
                <button type="button" className="btn btn-quiet" onClick={() => setFilters({ ...emptyFilters(), ...pickLocked(filters, locked) })}>
                  {t.clear}
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className={`results-body ${query.isPlaceholderData ? 'is-stale' : ''} ${view === 'map' ? 'is-map' : ''}`} aria-busy={query.isFetching || undefined}>
          {view === 'map' ? (
            <Suspense fallback={<div className="results-map skeleton" aria-hidden="true" />}>
              <ResultsMap
                items={items}
                locale={locale}
                selected={selected}
                onSelect={(id) => {
                  setSelected(id);
                  document.getElementById(`result-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
                center={filters.lat !== undefined && filters.lng !== undefined ? { lat: filters.lat, lng: filters.lng, radiusKm: filters.radius ?? 10 } : null}
                onRadius={(radius) => setFilters({ ...filters, radius })}
                onNearMe={(lat, lng, approximate) => setFilters(withNearMe(filters, { lat, lng }, approximate ? locationCopy(locale).approxPlace : t.nearMe, approximate))}
                filters={filters}
                onLocality={(locality) => setFilters({ ...filters, locality })}
              />
            </Suspense>
          ) : null}
          {query.isError && !items.length ? (
            <StateBlock
              scene={describeError(query.error, locale).kind === 'network' ? 'offline' : 'error'}
              title={describeError(query.error, locale).title}
              body={describeError(query.error, locale).body}
              action={{ label: locale === 'hi' ? 'दोबारा कोशिश करें' : 'Try again', onClick: () => void query.refetch() }}
            />
          ) : query.isPending ? (
            <Delayed>
              <ul className={`results-grid skeleton-gate is-${view === 'map' ? 'list' : view}`}>
                {Array.from({ length: 6 }, (_, i) => (
                  <li key={i}>
                    <PropertyCardSkeleton layout={view === 'map' ? 'list' : view} />
                  </li>
                ))}
              </ul>
            </Delayed>
          ) : items.length === 0 && empty && n === 0 ? (
            <LandingEmpty empty={empty} />
          ) : items.length === 0 ? (
            <StateBlock
              scene="empty"
              title={t.emptyTitle}
              body={t.emptyBody}
              action={n ? { label: t.clear, onClick: () => setFilters({ ...emptyFilters(), ...pickLocked(filters, locked) }) } : { label: t.browseAll, href: localizePath('/properties', locale) }}
              secondary={n ? { label: t.browseAll, href: localizePath('/properties', locale) } : undefined}
            />
          ) : (
            <ul className={`results-grid is-${view === 'map' ? 'list' : view}`}>
              {items.map((p, i) => (
                <li key={p.id} id={`result-${p.id}`} className="results-item" data-selected={(view === 'map' && selected === p.id) || undefined}>
                  <PropertyCardView
                    property={p}
                    locale={locale}
                    layout={view === 'map' ? 'list' : view}
                    priority={i < 2}
                    favourite={<FavouriteButton propertyId={p.id} locale={locale} initial={Boolean(p.liked)} />}
                    compare={
                      <button
                        type="button"
                        className="pcard-compare"
                        aria-pressed={compare.ids.includes(p.id)}
                        aria-label={`${t.compare}: ${p.title}`}
                        onClick={() => toggleCompare(compare, p.id, { full: t.compareFull })}
                      >
                        <Icon name={compare.ids.includes(p.id) ? 'check' : 'compare'} size={16} />
                        {t.compare}
                      </button>
                    }
                  />
                </li>
              ))}
            </ul>
          )}

          <div ref={sentinel} aria-hidden="true" />
          {query.hasNextPage ? (
            <div className="results-more">
              <button type="button" className="btn" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage}>
                {query.isFetchingNextPage ? t.loading : t.loadMore}
              </button>
            </div>
          ) : items.length > PAGE ? (
            <p className="results-end">{t.end}</p>
          ) : null}
          {query.isError && items.length ? (
            <p className="field-error justify-center" role="alert">
              <Icon name="alert" size={16} />
              {describeError(query.error, locale).title}
            </p>
          ) : null}
        </div>
      </div>

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title={t.filters}
        closeLabel={locale === 'hi' ? 'बंद करें' : 'Close'}
        footer={
          <>
            <button type="button" className="btn btn-quiet" onClick={() => setDraft({ ...emptyFilters(), ...pickLocked(filters, locked) })}>
              {t.reset}
            </button>
            <button
              type="button"
              className="btn btn-primary grow"
              onClick={() => {
                setFilters(draft);
                setSheet(false);
              }}
            >
              {t.show(draftKey === key ? total : (count.data ?? null))}
            </button>
          </>
        }
      >
        <FilterForm value={draft} onChange={setDraft} amenities={amenities} locale={locale} locked={locked} />
      </Sheet>

      {compare.ids.length ? (
        <div className="compare-tray" role="region" aria-label={t.compare}>
          <span className="font-semibold">{t.compareNow(compare.ids.length)}</span>
          <button type="button" className="btn btn-quiet" onClick={compare.clear}>
            {t.compareClear}
          </button>
          <a className="btn btn-primary" href={compareHref(compare.ids, locale)} aria-disabled={compare.ids.length < 2}>
            {t.compare}
            <Icon name="arrow-up-right" size={16} className="arrow" />
          </a>
        </div>
      ) : null}
      <Toaster />
    </div>
  );
}

/** A landing page with no homes: say so, then point to pages that do have homes. */
function LandingEmpty({ empty }: { empty: NonNullable<SearchResultsProps['empty']> }) {
  const [first, ...rest] = empty.links;
  return (
    <div className="results-empty">
      <StateBlock scene="empty" title={empty.title} body={empty.body} action={first ? { label: `${first.label} · ${formatNum(first.count, 'en')}`, href: first.href } : undefined} />
      {rest.length ? (
        <ul className="results-empty-links">
          {rest.map((l) => (
            <li key={l.href}>
              <a href={l.href}>
                <span className="results-empty-n tabular">{formatNum(l.count, 'en')}</span>
                <span className="results-empty-label">{l.label}</span>
                <Icon name="arrow-up-right" size={18} className="arrow" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type Chip = { id: string; label: string; field: keyof Filters; remove: (f: Filters) => Filters };

function buildChips(f: Filters, locale: Locale, amenities: AmenityOption[]): Chip[] {
  const hi = locale === 'hi';
  const out: Chip[] = [];
  const drop = (field: keyof Filters, ...more: (keyof Filters)[]) => (x: Filters) => {
    const n = { ...x };
    for (const k of [field, ...more]) {
      if (Array.isArray(n[k])) (n[k] as unknown) = [];
      else delete n[k];
    }
    return n;
  };
  if (f.purpose) out.push({ id: 'purpose', field: 'purpose', label: PURPOSE_LABEL[locale][f.purpose], remove: drop('purpose') });
  for (const pt of f.property_type)
    out.push({ id: `pt-${pt}`, field: 'property_type', label: pt.replace('_', ' '), remove: (x) => ({ ...x, property_type: x.property_type.filter((y) => y !== pt) }) });
  if (f.bedrooms_min !== undefined)
    out.push({ id: 'bhk', field: 'bedrooms_min', label: `${f.bedrooms_min}${f.bedrooms_max === undefined ? '+' : f.bedrooms_max !== f.bedrooms_min ? `-${f.bedrooms_max}` : ''} BHK`, remove: drop('bedrooms_min', 'bedrooms_max') });
  if (f.price_min !== undefined || f.price_max !== undefined) {
    const fmt = (v: number) => (v >= 1e7 ? `${+(v / 1e7).toFixed(2)} Cr` : v >= 1e5 ? `${+(v / 1e5).toFixed(1)} L` : formatNum(v, 'en'));
    const label = f.price_min !== undefined && f.price_max !== undefined ? `₹${fmt(f.price_min)} – ₹${fmt(f.price_max)}` : f.price_max !== undefined ? `≤ ₹${fmt(f.price_max)}` : `≥ ₹${fmt(f.price_min!)}`;
    out.push({ id: 'price', field: 'price_max', label, remove: drop('price_min', 'price_max') });
  }
  if (f.lat !== undefined && f.place) out.push({ id: 'place', field: 'lat', label: `${f.place} · ${f.radius ?? 10} km`, remove: drop('lat', 'lng', 'radius', 'place', 'sort_by') });
  if (f.q) out.push({ id: 'q', field: 'q', label: `“${f.q}”`, remove: drop('q') });
  if (f.locality) out.push({ id: 'locality', field: 'locality', label: f.locality, remove: drop('locality') });
  if (f.city) out.push({ id: 'city', field: 'city', label: f.city, remove: drop('city') });
  for (const fu of f.furnishing) out.push({ id: `fu-${fu}`, field: 'furnishing', label: fu.replace('_', '-'), remove: (x) => ({ ...x, furnishing: x.furnishing.filter((y) => y !== fu) }) });
  for (const a of f.amenities) {
    const name = amenities.find((x) => x.title.toLowerCase() === a.toLowerCase())?.title ?? a;
    out.push({ id: `am-${a}`, field: 'amenities', label: name, remove: (x) => ({ ...x, amenities: x.amenities.filter((y) => y !== a) }) });
  }
  if (f.bathrooms_min !== undefined) out.push({ id: 'baths', field: 'bathrooms_min', label: `${f.bathrooms_min}+ ${hi ? 'बाथरूम' : 'baths'}`, remove: drop('bathrooms_min', 'bathrooms_max') });
  if (f.has_lift) out.push({ id: 'lift', field: 'has_lift', label: hi ? 'लिफ़्ट' : 'Lift', remove: drop('has_lift') });
  return out;
}

function pickLocked(f: Filters, locked: Partial<Record<keyof Filters, true>>): Partial<Filters> {
  const out: Partial<Filters> = {};
  for (const k of Object.keys(locked) as (keyof Filters)[]) (out as Record<string, unknown>)[k] = f[k];
  return out;
}

/** Landing URLs carry their facets in the path, so the query string drops them. */
function stripLocked(f: Filters, initial: Filters, locked: Partial<Record<keyof Filters, true>>): Filters {
  const out = { ...f };
  for (const k of Object.keys(locked) as (keyof Filters)[]) {
    if (JSON.stringify(f[k]) === JSON.stringify(initial[k])) {
      if (Array.isArray(out[k])) (out[k] as unknown) = [];
      else delete out[k];
    }
  }
  return out;
}

export default function SearchResults(props: SearchResultsProps) {
  return (
    <QueryProvider>
      <IslandBoundary locale={props.locale}>
        <Results {...props} />
      </IslandBoundary>
    </QueryProvider>
  );
}

export { parseFilters };
