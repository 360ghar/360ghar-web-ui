import { layerFilterId, type Shadow } from './defs';
import { makeTools, type Layer } from './shapes';

/** An own drop shadow, for a layer no shared filter matches. */
export type ArtFilter = { id: string; dx: number; dy: number; blur: number; color: string };

/** One layer's paths in draw order. `filter` is a shared or own filter id, or null for no shadow. */
export type ArtGroup = { id: string; fill: string; filter: string | null; cut: string[]; solid: string[] };

export type ArtModel = {
  bg: string | null;
  /** The hand-cut edge path (not compacted; the renderer does that), or null for a straight rectangle. */
  edge: string | null;
  edgeId: string;
  filters: ArtFilter[];
  groups: ArtGroup[];
};

/**
 * What a paper art draws, as data: its background, its hand-cut edge, the own filters it needs and each layer's paths.
 * PaperArt.astro and PaperArt.tsx render this, so the two cannot disagree on which filter a layer uses.
 */
export function paperArtModel({
  layers,
  width,
  height,
  bg = 'var(--color-kesar-100)',
  cutEdge,
  shadow = [2, 3, 1.1],
  ownFilters = false,
  uid,
}: {
  layers: Layer[];
  width: number;
  height: number;
  bg?: string | null;
  cutEdge?: string;
  shadow?: Shadow;
  ownFilters?: boolean;
  uid: string;
}): ArtModel {
  const [dx, dy, blur] = shadow;
  const edge = cutEdge ? makeTools(`edge-${cutEdge}`, 0.9).rect(1.2, 1.2, width - 2.4, height - 2.4) : null;
  const filterOf = (l: Layer) => layerFilterId(l, shadow, uid, ownFilters);
  const filters = layers.filter((l) => filterOf(l) === `${uid}-${l.id}`).map((l) => ({ id: `${uid}-${l.id}`, dx, dy, blur, color: l.shadow }));
  const groups = layers.map((l) => ({ id: l.id, fill: l.fill, filter: filterOf(l), cut: l.cut, solid: l.solid }));
  return { bg, edge, edgeId: `${uid}-edge`, filters, groups };
}
