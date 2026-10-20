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

export function loadGallery(store: Store): Design[] {
  try {
    const list = JSON.parse(store.getItem(KEY) ?? '[]') as unknown;
    return Array.isArray(list) ? (list as Design[]).filter((d) => d && typeof d.imageUrl === 'string') : [];
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
