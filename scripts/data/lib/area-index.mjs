/**
 * The browser-sized area index for the search boxes. The source is the
 * server-only src/data/localities.json (3,215 entries); this keeps the clean
 * Gurugram places a person can search for and drops scraped and seed-invented
 * rows (see src/features/localities/thin.ts).
 */

export const AREA_INDEX_VERSION = 1;
export const AREA_CITY = 'Gurgaon';
export const AREA_TYPES = ['sector', 'locality', 'society', 'township', 'phase', 'road', 'village'];

/** Shown before anyone types. A name missing from the source is skipped. */
export const POPULAR_AREAS = ['Sector 56', 'DLF Phase 1', 'Golf Course Road', 'Sohna Road', 'Sector 54', 'Sushant Lok 1'];

export const MAX_AREA_ALIASES = 3;

const keyOf = (name) => String(name).trim().toLowerCase();

/**
 * Builds the file. `isThin` and `display` come from src/features/localities/thin.ts,
 * so the Node script and the website share one predicate and one spelling.
 *
 * @param {Array<{ name: string, city: string, entityType: string, aliases?: string[] }>} rows
 * @param {{ isThin?: (name: string) => boolean, display?: (name: string) => string }} [options]
 */
export function buildAreaIndex(rows, { isThin = () => false, display = (name) => name } = {}) {
  const areas = [];
  const seen = new Set();
  for (const row of rows) {
    if (row.city !== AREA_CITY || !AREA_TYPES.includes(row.entityType)) continue;
    const raw = String(row.name ?? '').trim();
    if (!raw || isThin(raw)) continue;
    const name = display(raw);
    const key = keyOf(name);
    if (seen.has(key)) continue;
    seen.add(key);
    const area = { n: name, t: row.entityType };
    const aliases = [];
    for (const alias of row.aliases ?? []) {
      const value = display(String(alias ?? '').trim());
      if (!value || keyOf(value) === key || aliases.some((a) => keyOf(a) === keyOf(value))) continue;
      aliases.push(value);
      if (aliases.length === MAX_AREA_ALIASES) break;
    }
    if (aliases.length) area.a = aliases;
    areas.push(area);
  }
  // `en` keeps the file byte-identical across machines, whatever the shell locale is.
  areas.sort((a, b) => a.n.localeCompare(b.n, 'en', { numeric: true }));
  const byName = new Map(areas.map((a) => [keyOf(a.n), a]));
  const popular = POPULAR_AREAS.map((name) => byName.get(keyOf(name))?.n).filter(Boolean);
  return { v: AREA_INDEX_VERSION, popular, areas };
}
