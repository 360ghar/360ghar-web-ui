/**
 * Project discovery without a map library.
 *
 * No map package is a dependency of this project, so the points are drawn as a
 * positioned overlay: each project sits at its filed latitude and longitude,
 * scaled into the current view box with plain CSS percentages.
 *
 * The server sends the points for the window the page loaded with. Zooming moves
 * the box, and any box that is not that window is fetched from
 * `GET /data-hub/map/projects`, so a zoomed view shows the projects that are
 * really inside it rather than only the ones the first response happened to
 * carry. The box is snapped to a grid before it becomes a query key, so two
 * clicks that land in the same cell share one response, and the points already
 * on screen stay there while the next box loads.
 *
 * The overlay is a real list of links, so it is keyboard reachable and reads in
 * order. Projects without coordinates cannot be placed and are listed under the
 * overlay instead of being dropped.
 */
import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { QueryProvider } from '@/lib/query';
import { Icon } from '@/ui/icons/Icon';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { mapProjects } from './api';
import { text, toneOf } from './text';
import type { MapBounds, ProjectMapPoint } from './types';

export type MapDiscoveryProps = {
  locale: Locale;
  points: ProjectMapPoint[];
  /** The view the server fetched. Without it the box comes from the points themselves. */
  bounds?: MapBounds | null;
};

const ZOOM_STEP = 0.6;
/** The API is asked once per grid cell, not once per click: 0.01 deg is about 1 km. */
const GRID = 0.01;
/** The smallest and the largest box the buttons can reach, in degrees. */
const MIN_SPAN = 0.01;
const MAX_SPAN = 2;

function boxOf(points: ProjectMapPoint[]): MapBounds | null {
  const placed = points.filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number');
  if (placed.length === 0) return null;
  const lats = placed.map((p) => p.latitude as number);
  const lngs = placed.map((p) => p.longitude as number);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  // A single point, or a row of them on one axis, needs a box with area.
  const padLat = Math.max((maxLat - minLat) * 0.08, 0.002);
  const padLng = Math.max((maxLng - minLng) * 0.08, 0.002);
  return { min_lat: minLat - padLat, max_lat: maxLat + padLat, min_lng: minLng - padLng, max_lng: maxLng + padLng };
}

function shrink(b: MapBounds, factor: number): MapBounds {
  const lat = (b.min_lat + b.max_lat) / 2;
  const lng = (b.min_lng + b.max_lng) / 2;
  const halfLat = ((b.max_lat - b.min_lat) / 2) * factor;
  const halfLng = ((b.max_lng - b.min_lng) / 2) * factor;
  return { min_lat: lat - halfLat, max_lat: lat + halfLat, min_lng: lng - halfLng, max_lng: lng + halfLng };
}

/** The box grown out to the grid, so the fetched window always covers the view. */
function snapOut(b: MapBounds): MapBounds {
  const edge = (v: number, up: boolean) => Number(((up ? Math.ceil(v / GRID) : Math.floor(v / GRID)) * GRID).toFixed(6));
  return { min_lat: edge(b.min_lat, false), max_lat: edge(b.max_lat, true), min_lng: edge(b.min_lng, false), max_lng: edge(b.max_lng, true) };
}

/** A zoomed box stays between MIN_SPAN and MAX_SPAN, centred where it was. */
function fit(b: MapBounds): MapBounds {
  const midLat = (b.min_lat + b.max_lat) / 2;
  const midLng = (b.min_lng + b.max_lng) / 2;
  const lat = Math.min(Math.max(b.max_lat - b.min_lat, MIN_SPAN), MAX_SPAN);
  const lng = Math.min(Math.max(b.max_lng - b.min_lng, MIN_SPAN), MAX_SPAN);
  return { min_lat: midLat - lat / 2, max_lat: midLat + lat / 2, min_lng: midLng - lng / 2, max_lng: midLng + lng / 2 };
}

function Overlay({ locale, points, bounds }: MapDiscoveryProps & { bounds: MapBounds }) {
  const t = text(locale);
  const [view, setView] = useState<MapBounds>(bounds);
  // `bounds` is the window the server already sent points for: only a moved box asks the API.
  const [moved, setMoved] = useState(false);
  const box = snapOut(view);

  const query = useQuery({
    queryKey: ['projects', 'map', box.min_lat, box.max_lat, box.min_lng, box.max_lng],
    queryFn: () => mapProjects(box),
    enabled: moved,
    // The box on screen stays drawn while the next one loads.
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: false,
  });

  const shown = moved ? query.data ?? points : points;
  const placed = shown.filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number');
  // A point with no coordinates is inside no box, so the list under the overlay
  // stays the one the page was built with.
  const unplaced = points.filter((p) => typeof p.latitude !== 'number' || typeof p.longitude !== 'number');

  const inside = placed.filter((p) => (p.latitude as number) >= view.min_lat && (p.latitude as number) <= view.max_lat && (p.longitude as number) >= view.min_lng && (p.longitude as number) <= view.max_lng);

  const spanLat = view.max_lat - view.min_lat || 1;
  const spanLng = view.max_lng - view.min_lng || 1;
  // North is up: the top of the box is the highest latitude.
  const top = (lat: number) => ((view.max_lat - lat) / spanLat) * 100;
  const left = (lng: number) => ((lng - view.min_lng) / spanLng) * 100;

  const zoom = (factor: number) => {
    setView((v) => fit(shrink(v, factor)));
    setMoved(true);
  };

  return (
    <>
      <div className="pj-map-tools">
        <button type="button" className="btn" onClick={() => zoom(ZOOM_STEP)} aria-label={t.mapZoomIn}>
          <Icon name="plus" size={18} />
          <span>{t.mapZoomIn}</span>
        </button>
        <button type="button" className="btn" onClick={() => zoom(1 / ZOOM_STEP)} aria-label={t.mapZoomOut}>
          <Icon name="minus" size={18} />
          <span>{t.mapZoomOut}</span>
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setView(bounds);
            setMoved(false);
          }}
          aria-label={t.mapReset}
        >
          <Icon name="locate" size={18} />
          <span>{t.mapReset}</span>
        </button>
        <p className="dh-meta" aria-live="polite">
          {t.mapLead(inside.length)}
        </p>
      </div>

      <div className="pj-map" role="group" aria-label={t.mapList} aria-busy={query.isFetching || undefined}>
        <ul className="pj-map-points">
          {inside.map((p) => (
            <li
              key={p.slug}
              className={`pj-map-point ${toneOf(p.stage)}`}
              style={{ left: `${left(p.longitude as number)}%`, top: `${top(p.latitude as number)}%` }}
            >
              <a href={localizePath(`/project/${p.slug}`, locale)}>
                <span className="pj-map-dot" aria-hidden="true" />
                <span className="pj-map-name">{p.project_name}</span>
              </a>
            </li>
          ))}
        </ul>
        {inside.length === 0 ? <p className="pj-map-none">{t.mapEmpty}</p> : null}
      </div>

      {/* A failed box leaves the previous points on screen; say why they may be old. */}
      {moved && query.isError ? (
        <p className="dh-meta mt-3" role="status">
          {t.down.body}
        </p>
      ) : null}

      <p className="dh-meta mt-3">{t.mapNote}</p>

      {unplaced.length > 0 ? (
        <section className="dh-section" aria-labelledby="pj-map-unplaced">
          <h2 id="pj-map-unplaced" className="dh-h2">
            {t.mapUnlocated}
          </h2>
          <p className="dh-meta mt-2">{t.mapNoCoords(unplaced.length)}</p>
          <ul className="sheet dh-rows mt-4">
            {unplaced.map((p) => (
              <li key={p.slug}>
                <div className="dh-row-head">
                  <h3 className="dh-row-title">
                    <a href={localizePath(`/project/${p.slug}`, locale)}>{p.project_name}</a>
                  </h3>
                </div>
                {p.developer_name ? <p className="dh-row-sub">{p.developer_name}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

/** A crash hides the overlay; the page around it keeps working. */
export function MapDiscovery(props: MapDiscoveryProps) {
  const box = props.bounds ?? boxOf(props.points ?? []);
  if (!box) {
    return (
      <p className="dh-meta">{text(props.locale).mapEmpty}</p>
    );
  }
  return (
    <QueryProvider>
      <IslandBoundary locale={props.locale} fallback={null}>
        <Overlay {...props} bounds={box} />
      </IslandBoundary>
    </QueryProvider>
  );
}

export default MapDiscovery;
