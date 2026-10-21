/**
 * Saved designs, kept in this browser only (localStorage "designGallery",
 * the old key). At most 20; when storage is full the oldest go first.
 */

export type Design = {
  id: number;
  imageUrl: string;
  prompt: string;
  settings: { mode: string; designType: string; room: string; style: string };
  createdAt: string;
};

export const KEY = 'designGallery';
export const MAX = 20;

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);

/** Keeps only records that satisfy `Design`; the old site's shape (generationMode, roomType) is migrated. */
function normalize(raw: unknown): Design | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  if (typeof d.imageUrl !== 'string' || typeof d.id !== 'number') return null;
  const s = (d.settings && typeof d.settings === 'object' ? d.settings : {}) as Record<string, unknown>;
  const mode = str(s.mode) || (s.generationMode === 'image-to-image' ? 'image' : 'text');
  return {
    id: d.id,
    imageUrl: d.imageUrl,
    prompt: str(d.prompt),
    settings: { mode, designType: str(s.designType, 'interior'), room: str(s.room) || str(s.roomType), style: str(s.style) },
    createdAt: str(d.createdAt),
  };
}

export function loadGallery(store: Store): Design[] {
  try {
    const list = JSON.parse(store.getItem(KEY) ?? '[]') as unknown;
    return Array.isArray(list) ? list.map(normalize).filter((d): d is Design => d !== null) : [];
  } catch {
    return [];
  }
}

/** Writes the list, dropping the oldest items until it fits. Returns what was kept. */
export function writeGallery(store: Store, list: Design[]): Design[] {
  let keep = list.slice(0, MAX);
  while (keep.length) {
    try {
      store.setItem(KEY, JSON.stringify(keep));
      return keep;
    } catch {
      keep = keep.slice(0, -1);
    }
  }
  store.removeItem(KEY);
  return [];
}

/** Adds a design at the top. Returns the new list (it may not contain the design if it is too big to store). */
export function addDesign(store: Store, design: Design): Design[] {
  return writeGallery(store, [design, ...loadGallery(store).filter((d) => d.id !== design.id)]);
}

export function removeDesign(store: Store, id: number): Design[] {
  return writeGallery(store, loadGallery(store).filter((d) => d.id !== id));
}
