/**
 * Paper map: shown in map view when Google Maps cannot load (no key, expired
 * key, blocked script). It plots the matching homes from their real latitude
 * and longitude, one hand-cut paper block per locality, with a real scale bar.
 * Nothing on it is invented: no roads, no landmarks, only the homes.
 *
 * - Nearby localities that would overlap merge into one tag; pressing it zooms in.
 * - Pressing a single locality filters the list to it (the `locality` filter).
 */
import { useQuery } from '@tanstack/react-query';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { api, call } from '@/lib/api/client';
import type { ListingPage } from '@/features/search/listingItem';
import type { Property } from '@/lib/api/types';
import type { ListingItem } from './listingItem';
import { askPrice, compactPrice } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { makeTools } from '@/lib/paper/shapes';
import { Icon } from '@/ui/icons/Icon';
import { toApiQuery, toSearchParams, type Filters } from './filters';
import { isPlaceholderPrice, PRICE_ON_REQUEST } from './prices';
import { estimateTagWidth, groupHomes, layoutMap, niceScale, TAG_H, type MapGroup } from './mapLayout';

const T = {
  en: {
    region: 'Paper map of the homes',
    note: 'The street map is not available right now. This paper map shows where the homes are.',
    loading: 'Adding the rest of the homes…',
    all: 'All areas',
    homes: (n: number) => `${n} ${n === 1 ? 'home' : 'homes'}`,
    from: 'from',
    show: (name: string, n: number, price: string | null) => `${name}: ${n} ${n === 1 ? 'home' : 'homes'}${price ? `, from ${price}` : ''}. Show them in the list`,
    zoom: (names: string[], n: number) => `${names.join(', ')}: ${n} homes. Zoom in`,
    more: (n: number) => `+${n}`,
    none: 'None of these homes has a map location.',
  },
  hi: {
    region: 'घरों का पेपर मैप',
    note: 'स्ट्रीट मैप अभी उपलब्ध नहीं है। यह पेपर मैप दिखाता है कि घर कहाँ हैं।',
    loading: 'बाकी घर जोड़ रहे हैं…',
    all: 'सभी इलाके',
    homes: (n: number) => `${n} घर`,
    from: 'से',
    show: (name: string, n: number, price: string | null) => `${name}: ${n} घर${price ? `, ${price} से` : ''}। लिस्ट में दिखाएँ`,
    zoom: (names: string[], n: number) => `${names.join(', ')}: ${n} घर। ज़ूम करें`,
    more: (n: number) => `+${n}`,
    none: 'इनमें से किसी घर की मैप लोकेशन नहीं है।',
  },
};

type Props = {
  filters: Filters;
  /** Homes already in the list: the map starts with them while it loads the rest. */
  items: ListingItem[];
  locale: Locale;
  onLocality: (name: string) => void;
  /** Extra controls (Near me, radius) from the map view. */
  tools?: React.ReactNode;
};

/** The two lines of a tag. The lowest price shows only when every home has the same purpose. */
function tagText(groups: MapGroup[], locale: Locale) {
  const t = T[locale];
  const homes = groups.flatMap((g) => g.homes);
  const name = `${groups[0]!.name}${groups.length > 1 ? ` ${t.more(groups.length - 1)}` : ''}`;
  const purposes = new Set(homes.map((p) => p.purpose));
  // A stand-in price (₹10 Cr) never leads a tag; with only stand-ins, the tag says "price on request".
  const priced = homes.filter((p) => !isPlaceholderPrice(p));
  const price = purposes.size === 1 && priced.length ? `${compactPrice(Math.min(...priced.map(askPrice)), locale)}${PERIOD[locale][homes[0]!.purpose] ?? ''}` : null;
  const onRequest = !priced.length ? PRICE_ON_REQUEST[locale].toLowerCase() : null;
  const meta = price
    ? locale === 'hi'
      ? `${t.homes(homes.length)} · ${price} ${t.from}`
      : `${t.homes(homes.length)} · ${t.from} ${price}`
    : onRequest
      ? `${t.homes(homes.length)} · ${onRequest}`
      : t.homes(homes.length);
  return { name, meta, price, n: homes.length };
}

const PERIOD: Record<Locale, Partial<Record<Property['purpose'], string>>> = {
  en: { rent: '/mo', short_stay: '/night' },
  hi: { rent: '/माह', short_stay: '/रात' },
};

export default function PaperMap({ filters, items, locale, onLocality, tools }: Props) {
  const t = T[locale];
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const key = toSearchParams(filters).toString();
  // Zoomed-in areas belong to one search; a new search starts from the whole area.
  const [zoom, setZoom] = useState<{ key: string; names: string[] } | null>(null);
  const focus = zoom?.key === key ? zoom.names : null;
  const setFocus = (names: string[] | null) => setZoom(names ? { key, names } : null);

  // Up to 100 homes for the map (the list shows 12 per page).
  const q = useQuery({
    queryKey: ['properties-map', key],
    queryFn: (): Promise<ListingPage> =>
      call(
        api.GET('/api/v1/properties', {
          params: { query: toApiQuery(filters, { limit: 100 }) },
        }),
      ),
    // Never an empty sheet: the previous search's homes, or else the homes in the list.
    placeholderData: (prev) => prev ?? { items, next_cursor: null, has_more: false, limit: items.length, total: null },
    staleTime: 60_000,
  });

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e!.contentRect;
      setSize((s) => (s && Math.abs(s.w - r.width) < 1 && Math.abs(s.h - r.height) < 1 ? s : { w: Math.round(r.width), h: Math.round(r.height) }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const groups = useMemo(() => groupHomes(q.data?.items ?? [], askPrice), [q.data]);
  const shown = focus ? groups.filter((g) => focus.includes(g.name)) : groups;
  const layout = useMemo(
    () =>
      size
        ? layoutMap(shown, size.w, size.h, { top: TAG_H + 16, right: 28, bottom: 72, left: 28 }, (gs) => {
            const x = tagText(gs, locale);
            return estimateTagWidth(x.name, x.meta);
          })
        : null,
    [shown, size, locale],
  );
  const scale = layout ? niceScale(layout.pxPerKm, size!.w * 0.22) : null;

  return (
    <div className="pmap" role="region" aria-label={t.region} aria-busy={q.isFetching || undefined}>
      <div ref={box} className="pmap-sheet">
        {layout && size ? (
          <svg className="pmap-art" viewBox={`0 0 ${size.w} ${size.h}`} width={size.w} height={size.h} aria-hidden="true" focusable="false">
            <defs>
              <filter id="pmap-lift" x="-10%" y="-10%" width="130%" height="140%">
                <feDropShadow dx="1.5" dy="2.5" stdDeviation="1" floodColor="rgb(181 70 0 / 0.35)" />
              </filter>
            </defs>
            {layout.blocks.map((b) => (
              <Block key={b.group.name} b={b} />
            ))}
            {scale ? (
              <>
                <ScaleBar x={20} y={size.h - 24} px={scale.px} label={`${scale.km} km`} />
                <North x={size.w - 28} y={size.h - 34} />
              </>
            ) : null}
          </svg>
        ) : null}
        {layout
          ? layout.tags.map((c) => {
              const names = c.groups.map((g) => g.name);
              const x = tagText(c.groups, locale);
              const merged = c.groups.length > 1;
              const on = filters.locality !== undefined && !merged && names[0] === filters.locality;
              return (
                <button
                  key={names.join('|')}
                  type="button"
                  className="pmap-tag"
                  data-on={on || undefined}
                  style={
                    {
                      transform: `translate(${Math.round(c.x)}px, ${Math.round(c.y)}px) translate(-50%, -100%)`,
                      // A tag pushed in from the edge keeps its notch over its homes.
                      '--notch': `${Math.round(Math.max(-c.w / 2 + 12, Math.min(c.w / 2 - 12, c.ax - c.x)))}px`,
                    } as React.CSSProperties
                  }
                  aria-label={merged ? t.zoom(names, x.n) : t.show(names[0]!, x.n, x.price)}
                  onClick={() => (merged ? setFocus(names) : onLocality(names[0]!))}
                >
                  <span className="pmap-tag-name">
                    {c.groups[0]!.name}
                    {merged ? <span className="pmap-tag-more"> {t.more(c.groups.length - 1)}</span> : null}
                  </span>
                  <span className="pmap-tag-meta tabular">{x.meta}</span>
                </button>
              );
            })
          : null}
        {q.isSuccess && groups.length === 0 && (q.data?.items.length ?? 0) > 0 ? (
          <p className="pmap-note" role="status">
            {t.none}
          </p>
        ) : null}
      </div>
      <div className="pmap-foot">
        <p className="pmap-caption" role="status">
          {t.note}
          {q.isPlaceholderData && q.isFetching ? ` ${t.loading}` : ''}
        </p>
        <div className="pmap-tools">
          {focus ? (
            <button type="button" className="btn btn-quiet" onClick={() => setFocus(null)}>
              <Icon name="arrow-left" size={18} />
              {t.all}
            </button>
          ) : null}
          {tools}
        </div>
      </div>
    </div>
  );
}

/**
 * One locality: each home is a small square of card stock with a hole punched
 * in it, turned a little by hand. Close homes overlap into a block; zoomed in,
 * they spread out, and no square is ever larger than a thumbnail.
 */
function Block({ b }: { b: ReturnType<typeof layoutMap>['blocks'][number] }) {
  const chips = useMemo(() => {
    const tl = makeTools(`pmap-${b.group.name}`, 0.8);
    return b.dots.map(([x, y]) => {
      const r = 7 + tl.rand() * 1.5;
      const a = (tl.rand() - 0.5) * 0.7;
      const corner = (k: number): [number, number] => [x + r * Math.SQRT2 * Math.cos(a + Math.PI / 4 + (k * Math.PI) / 2), y + r * Math.SQRT2 * Math.sin(a + Math.PI / 4 + (k * Math.PI) / 2)];
      return tl.path([corner(0), corner(1), corner(2), corner(3)]) + tl.oct(x, y, 2.2);
    });
  }, [b]);
  // One path per home, so overlapping squares stack instead of cancelling out.
  return (
    <g className="pmap-block" filter="url(#pmap-lift)">
      {chips.map((d, i) => (
        <path key={i} d={d} fillRule="evenodd" />
      ))}
    </g>
  );
}

function ScaleBar({ x, y, px, label }: { x: number; y: number; px: number; label: string }) {
  return (
    <g className="pmap-scale">
      <path d={`M${x} ${y - 5}V${y}H${x + px}V${y - 5}`} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x={x + px + 8} y={y} dominantBaseline="central">
        {label}
      </text>
    </g>
  );
}

function North({ x, y }: { x: number; y: number }) {
  return (
    <g className="pmap-north" transform={`translate(${x} ${y})`}>
      <path d="M0 -12L6 7L0 3L-6 7Z" />
      <text x="0" y="17" textAnchor="middle" dominantBaseline="central">
        N
      </text>
    </g>
  );
}

export type { MapGroup };
