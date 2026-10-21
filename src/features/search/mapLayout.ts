/**
 * Geometry for the paper map (PaperMap.tsx). Pure functions, so they are
 * unit-tested: group homes by locality, project real coordinates onto the box
 * with one scale for both axes, and merge tags that would overlap.
 */
import type { ListingItem } from './listingItem';

export type MapGroup = {
  name: string;
  homes: ListingItem[];
  lat: number;
  lng: number;
  min: number;
};
type Box = { top: number; right: number; bottom: number; left: number };
/** `x`, `y`: where the tag's notch tip sits after clamping; `ax`: the x it points at. */
type MapTag = { x: number; y: number; w: number; ax: number; groups: MapGroup[] };

const KM_PER_DEG_LAT = 110.57;
/** Smallest area the map shows, so one home is not blown up to fill the box. */
const MIN_SPAN_KM = 1.6;
export const TAG_H = 46;

/** Homes with a location, grouped by locality (then sub-locality, then city). */
export function groupHomes(items: ListingItem[], priceOf: (p: ListingItem) => number): MapGroup[] {
  const by = new Map<string, ListingItem[]>();
  for (const p of items) {
    if (typeof p.latitude !== 'number' || typeof p.longitude !== 'number' || (!p.latitude && !p.longitude)) continue;
    const name = (p.locality || p.sub_locality || p.city || '').trim() || '–';
    by.set(name, [...(by.get(name) ?? []), p]);
  }
  return [...by].map(([name, homes]) => ({
    name,
    homes,
    lat: homes.reduce((a, p) => a + p.latitude!, 0) / homes.length,
    lng: homes.reduce((a, p) => a + p.longitude!, 0) / homes.length,
    min: Math.min(...homes.map(priceOf)),
  }));
}

/** Tag width in px for a set of groups (the caller knows the label text). */
type TagWidth = (groups: MapGroup[]) => number;
/** Rough width of a two-line tag: bold 13 px name, 12 px meta, 10 px padding each side. */
export const estimateTagWidth = (name: string, meta: string) => Math.ceil(Math.max(name.length * 7.8, meta.length * 6.9) + 24);
const defaultWidth: TagWidth = (gs) => estimateTagWidth(`${gs[0]!.name}${gs.length > 1 ? ` +${gs.length - 1}` : ''}`, 'NN homes · from ₹0.00 Cr');

/** `extra`: more [lat, lng] points the box must hold (landmarks); `at` projects any point the same way. */
export function layoutMap(groups: MapGroup[], w: number, h: number, pad: Box, tagWidth: TagWidth = defaultWidth, extra: (readonly [number, number])[] = []) {
  const homes = groups.flatMap((g) => g.homes.map((p) => [p.latitude!, p.longitude!] as const));
  const pts = [...homes, ...extra];
  if (!homes.length || w <= 0 || h <= 0) return { blocks: [], tags: [] as MapTag[], pxPerKm: 0, at: (): [number, number] => [0, 0] };
  const lats = pts.map((p) => p[0]);
  const lngs = pts.map((p) => p[1]);
  const lat0 = (Math.min(...lats) + Math.max(...lats)) / 2;
  const kx = 111.32 * Math.cos((lat0 * Math.PI) / 180);
  const X = (lng: number) => (lng - Math.min(...lngs)) * kx;
  const Y = (lat: number) => (Math.max(...lats) - lat) * KM_PER_DEG_LAT;
  const spanX = Math.max(X(Math.max(...lngs)), MIN_SPAN_KM);
  const spanY = Math.max(Y(Math.min(...lats)), MIN_SPAN_KM);
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const s = Math.max(0, Math.min(innerW / spanX, innerH / spanY));
  // Centre the homes in the box on both axes.
  const ox = pad.left + (innerW - (X(Math.max(...lngs)) || 0) * s) / 2;
  const oy = pad.top + (innerH - (Y(Math.min(...lats)) || 0) * s) / 2;
  const at = (lat: number, lng: number): [number, number] => [ox + X(lng) * s, oy + Y(lat) * s];

  const blocks = groups.map((g) => {
    const dots = g.homes.map((p) => at(p.latitude!, p.longitude!));
    const xs = dots.map((d) => d[0]);
    const ys = dots.map((d) => d[1]);
    // Each home is drawn as a small square (about 10 px from its centre), so pad the box by that.
    const bw = Math.max(...xs) - Math.min(...xs) + 20;
    const bh = Math.max(...ys) - Math.min(...ys) + 20;
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    return {
      group: g,
      dots,
      rect: { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh },
    };
  });

  // Biggest localities claim their spot first; a neighbour that would overlap joins it.
  const tags: MapTag[] = [];
  for (const b of [...blocks].sort((a, c) => c.group.homes.length - a.group.homes.length)) {
    const tw = tagWidth([b.group]);
    const ax = b.rect.x + b.rect.w / 2;
    const x = clamp(ax, tw / 2 + 6, w - tw / 2 - 6);
    const y = clamp(b.rect.y - 4, TAG_H + 8, h - 8);
    const hit = tags.find((c) => Math.abs(c.x - x) < (c.w + tw) / 2 + 6 && Math.abs(c.y - y) < TAG_H + 4);
    if (hit) {
      hit.groups.push(b.group);
      hit.w = tagWidth(hit.groups);
      hit.x = clamp(hit.x, hit.w / 2 + 6, w - hit.w / 2 - 6);
    } else tags.push({ x, y, w: tw, ax, groups: [b.group] });
  }
  return { blocks, tags, pxPerKm: s, at };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

/** A round scale-bar length (0.5, 1, 2, 5, 10 or 20 km) no wider than `maxPx`. */
export function niceScale(pxPerKm: number, maxPx: number): { km: number; px: number } | null {
  if (!pxPerKm) return null;
  const fits = [0.5, 1, 2, 5, 10, 20].filter((km) => km * pxPerKm <= maxPx);
  const km = fits.at(-1) ?? 0.5;
  return { km, px: Math.round(km * pxPerKm) };
}
