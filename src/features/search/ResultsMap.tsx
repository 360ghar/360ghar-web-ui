/// <reference types="google.maps" />
/**
 * Map for the results island. Loaded only in map view (React.lazy), so other
 * views never download Google Maps. Each home is a price tag drawn as a real
 * button (OverlayView), so tags work with the keyboard and screen readers.
 */
import { useEffect, useRef, useState } from 'react';
import type { ListingItem } from './listingItem';
import { askPrice, compactPrice } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { importLibrary } from '@/lib/maps';
import { ForgetLocation, LocationNotice } from '@/features/location/LocationNotice';
import { FALLBACK_CENTER } from '@/features/location/logic';
import { useLocationMemory, useLocationStore } from '@/features/location/store';
import { Icon } from '@/ui/icons/Icon';
import type { Filters } from './filters';
import PaperMap from './PaperMap';
import { isPlaceholderPrice, PRICE_ON_REQUEST } from './prices';

type Props = {
  items: ListingItem[];
  locale: Locale;
  selected: number | null;
  onSelect: (id: number) => void;
  center: { lat: number; lng: number; radiusKm: number } | null;
  onRadius: (km: number) => void;
  /** `approximate` is true when the browser gave no location and the fallback centre is used. */
  onNearMe: (lat: number, lng: number, approximate?: boolean) => void;
  /** For the paper map, which loads its own homes when Google Maps fails. */
  filters: Filters;
  onLocality: (name: string) => void;
};

const T = {
  en: { map: 'Map', satellite: 'Satellite', nearMe: 'Near me', radius: 'Search radius', noCoords: 'None of these homes has a map location.', locating: 'Finding you…', home: (price: string, title: string) => `${price}, ${title}` },
  hi: { map: 'मैप', satellite: 'सैटेलाइट', nearMe: 'मेरे पास', radius: 'खोज का दायरा', noCoords: 'इनमें से किसी घर की मैप लोकेशन नहीं है।', locating: 'आपकी लोकेशन ढूँढ रहे हैं…', home: (price: string, title: string) => `${price}, ${title}` },
};

const RADII = [2, 5, 10, 20, 50];

const price = (p: ListingItem, locale: Locale) =>
  isPlaceholderPrice(p) ? PRICE_ON_REQUEST[locale] : compactPrice(askPrice(p), locale);

function makeTagClass() {
  return class Tag extends google.maps.OverlayView {
    el: HTMLButtonElement;
    pos: google.maps.LatLng;
    constructor(pos: google.maps.LatLng, text: string, label: string, onClick: () => void) {
      super();
      this.pos = pos;
      this.el = document.createElement('button');
      this.el.type = 'button';
      this.el.className = 'map-tag';
      this.el.textContent = text;
      this.el.setAttribute('aria-label', label);
      this.el.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
      });
    }
    override onAdd() {
      this.getPanes()!.overlayMouseTarget.append(this.el);
    }
    override draw() {
      const pt = this.getProjection().fromLatLngToDivPixel(this.pos);
      if (pt) this.el.style.transform = `translate(${Math.round(pt.x)}px, ${Math.round(pt.y)}px) translate(-50%, -100%)`;
    }
    override onRemove() {
      this.el.remove();
    }
  };
}

export default function ResultsMap({ items, locale, selected, onSelect, center, onRadius, onNearMe, filters, onLocality }: Props) {
  const t = T[locale];
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const tags = useRef(new Map<number, InstanceType<ReturnType<typeof makeTagClass>>>());
  const circle = useRef<google.maps.Circle | null>(null);
  const Tag = useRef<ReturnType<typeof makeTagClass> | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [type, setType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const locating = useLocationStore((s) => (s.status === 'busy' ? 'busy' : 'idle'));
  useLocationMemory();

  // Create the map once. A bad or expired key does not reject the loader:
  // Google calls gm_authFailure and paints its own error box instead.
  useEffect(() => {
    let alive = true;
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => alive && setFailed(true);
    importLibrary<google.maps.MapsLibrary>('maps')
      .then((lib) => {
        if (!alive || !box.current) return;
        map.current = new lib.Map(box.current, {
          center: FALLBACK_CENTER,
          zoom: 11,
          clickableIcons: false,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
        });
        Tag.current = makeTagClass();
        setReady(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    map.current?.setMapTypeId(type);
  }, [type, ready]);

  // Price tags for the homes with a location; fit the view to them.
  const ids = items.map((p) => p.id).join(',');
  useEffect(() => {
    const m = map.current;
    const TagClass = Tag.current;
    if (!ready || !m || !TagClass) return;
    for (const tag of tags.current.values()) tag.setMap(null);
    tags.current.clear();
    const bounds = new google.maps.LatLngBounds();
    for (const p of items) {
      if (!p.latitude || !p.longitude) continue;
      const pos = new google.maps.LatLng(p.latitude, p.longitude);
      const tag = new TagClass(pos, price(p, locale), t.home(price(p, locale), p.title), () => onSelect(p.id));
      tag.setMap(m);
      tags.current.set(p.id, tag);
      bounds.extend(pos);
    }
    if (center) bounds.union(new google.maps.Circle({ center, radius: center.radiusKm * 1000 }).getBounds()!);
    if (!bounds.isEmpty()) m.fitBounds(bounds, 48);
    // onSelect and t change identity each render; the tags only need the ids.
  }, [ready, ids, center?.lat, center?.lng, center?.radiusKm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Radius circle around the searched place.
  useEffect(() => {
    if (!ready || !map.current) return;
    circle.current?.setMap(null);
    circle.current = center
      ? new google.maps.Circle({ map: map.current, center, radius: center.radiusKm * 1000, strokeColor: '#b34700', strokeOpacity: 0.7, strokeWeight: 2, fillColor: '#ff6b00', fillOpacity: 0.06, clickable: false })
      : null;
  }, [ready, center?.lat, center?.lng, center?.radiusKm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Selected tag stands out and comes into view.
  useEffect(() => {
    for (const [id, tag] of tags.current) tag.el.toggleAttribute('data-on', id === selected);
    const tag = selected ? tags.current.get(selected) : null;
    if (tag && map.current && !map.current.getBounds()?.contains(tag.pos)) map.current.panTo(tag.pos);
  }, [selected, ready, ids]);

  // A saved fresh fix is used at once. If the browser cannot give one, the search
  // moves to central Gurugram (as v1 did): map, filters and results agree, the
  // place label says "approximate", and the notice explains why.
  const nearMe = async () => {
    const fix = await useLocationStore.getState().locate();
    if (fix) onNearMe(fix.lat, fix.lng);
    else onNearMe(FALLBACK_CENTER.lat, FALLBACK_CENTER.lng, true);
  };

  const withCoords = items.filter((p) => p.latitude && p.longitude).length;

  const radius = center ? (
    <label className="results-sort">
      <span className="visually-hidden">{t.radius}</span>
      <select className="select" value={center.radiusKm} onChange={(e) => onRadius(Number(e.target.value))}>
        {[...new Set([...RADII, center.radiusKm])]
          .sort((a, b) => a - b)
          .map((r) => (
            <option key={r} value={r}>
              {r} km
            </option>
          ))}
      </select>
    </label>
  ) : null;
  const near = (
    <>
      <button type="button" className="btn btn-quiet" onClick={() => void nearMe()} disabled={locating === 'busy'}>
        <Icon name="locate" size={18} />
        {locating === 'busy' ? t.locating : t.nearMe}
      </button>
      <ForgetLocation locale={locale} />
    </>
  );
  const denied = <LocationNotice locale={locale} className="results-map-note" />;

  // No Google map (no key, expired key, blocked script): draw the homes on paper instead.
  if (failed)
    return (
      <div className="results-map is-paper">
        <PaperMap
          filters={filters}
          items={items}
          locale={locale}
          onLocality={onLocality}
          tools={
            <>
              {radius}
              {near}
            </>
          }
        />
        {denied}
      </div>
    );

  return (
    <div className="results-map">
      <div ref={box} className="results-map-canvas" role="region" aria-label={t.map} />
      {ready && items.length > 0 && withCoords === 0 ? (
        <p className="results-map-note" role="status">
          {t.noCoords}
        </p>
      ) : null}
      <div className="results-map-tools">
        <div className="results-view" role="group" aria-label={`${t.map} / ${t.satellite}`}>
          <button type="button" className="btn btn-quiet" aria-pressed={type === 'roadmap'} onClick={() => setType('roadmap')}>
            {t.map}
          </button>
          <button type="button" className="btn btn-quiet" aria-pressed={type === 'hybrid'} onClick={() => setType('hybrid')}>
            {t.satellite}
          </button>
        </div>
        {radius}
        {near}
      </div>
      {denied}
    </div>
  );
}
