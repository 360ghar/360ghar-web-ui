/**
 * Twin redirects for scraped locality names (owner decision 2026-09-29).
 * A scraped row is named "projects in X" (or "projects in X gurgaon"). When the same city has a real
 * (not thin) row named X, every URL that reaches the scraped row 301s to that row. Pure functions: rows
 * and the thin predicate come in as arguments. `slugOf` and `resolve` copy `localitySlug` and
 * `resolveLocality` in src/features/localities/data.ts; the vitest file checks the map against the originals.
 */
export const citySlug = (city) => {
  const c = String(city || '').trim().toLowerCase();
  return c === 'gurugram' ? 'gurgaon' : c.replace(/\s+/g, '-');
};
export const fullSlug = (r) => `${r.slug}-${citySlug(r.city)}`;

const ROMAN = { i: '1', ii: '2', iii: '3', iv: '4', v: '5', vi: '6' };

/** "projects in dlf phase iv gurgaon" -> "dlf phase 4 gurgaon". Roman numerals count only after "phase". */
export function baseName(name) {
  return String(name)
    .toLowerCase()
    .replace(/^projects in /, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\bphase (i|ii|iii|iv|v|vi)\b/g, (_, r) => `phase ${ROMAN[r]}`);
}

/** Names to try, in order: the name as it is, then without a trailing city word ("... gurgaon"). */
export function nameKeys(row) {
  const base = baseName(row.name);
  const city = citySlug(row.city).replace(/-/g, ' ');
  const cut = base.replace(new RegExp(`\\s(${city}|gurugram)$`), '');
  return cut === base || !cut ? [base] : [base, cut];
}

const slugify = (s) => s.replace(/ /g, '-');

/** The real twin of a scraped row, or null. Several twins: slug equal to the name, same entity type, shorter slug, slug order. */
export function findTwin(row, rows, isThin) {
  const keys = nameKeys(row);
  const city = citySlug(row.city);
  for (const key of keys) {
    const found = rows.filter((r) => !isThin(r) && citySlug(r.city) === city && baseName(r.name) === key);
    if (!found.length) continue;
    found.sort((a, b) => Number(b.slug === slugify(key)) - Number(a.slug === slugify(key)) || Number(b.entityType === row.entityType) - Number(a.entityType === row.entityType) || a.slug.length - b.slug.length || (a.slug < b.slug ? -1 : 1));
    return { twin: found[0], candidates: found.length };
  }
  return null;
}

/** The URL slugs the page accepts for each row (`resolveLocality`): "{slug}-{city}", the bare slug, and "{slug}-gurgaon". */
export function makeResolver(rows) {
  const byFull = new Map();
  const byBare = new Map();
  for (const r of rows) {
    byFull.set(fullSlug(r), r);
    if (!byBare.has(r.slug)) byBare.set(r.slug, r);
  }
  const resolve = (s) => byFull.get(s) ?? byBare.get(s) ?? byBare.get(s.endsWith('-gurgaon') ? s.slice(0, -'-gurgaon'.length) : s) ?? null;
  const accepted = new Set();
  for (const r of rows) for (const s of [fullSlug(r), r.slug, `${r.slug}-gurgaon`]) accepted.add(s);
  return { resolve, accepted };
}

/**
 * Builds the map { url slug: twin's full slug }. One key for every URL slug that reaches a scraped row with a twin,
 * so a redirect is one hop whichever old form of the URL was requested.
 */
export function buildRedirects(rows, isThin, isScraped) {
  const { resolve, accepted } = makeResolver(rows);
  const twins = new Map();
  let ambiguous = 0;
  const withoutTwin = [];
  for (const r of rows.filter(isScraped)) {
    const t = findTwin(r, rows, isThin);
    if (t) {
      twins.set(r, t.twin);
      if (t.candidates > 1) ambiguous += 1;
    } else withoutTwin.push(r);
  }
  const map = {};
  for (const s of [...accepted].sort()) {
    const row = resolve(s);
    const twin = row && twins.get(row);
    if (twin) map[s] = fullSlug(twin);
  }
  return { map, scraped: twins.size + withoutTwin.length, withTwin: twins.size, withoutTwin, ambiguous, pairs: [...twins].map(([a, b]) => [fullSlug(a), fullSlug(b)]) };
}

/** Problems that must block a write. An empty list means the map is safe. */
export function checkRedirects(map, rows, isThin) {
  const { resolve } = makeResolver(rows);
  const listed = new Set(rows.filter((r) => !isThin(r)).map(fullSlug));
  const problems = [];
  for (const [from, to] of Object.entries(map)) {
    if (from === to) problems.push(`${from}: redirects to itself`);
    if (!listed.has(to)) problems.push(`${from}: target ${to} is missing or thin`);
    if (Object.hasOwn(map, to)) problems.push(`${from}: chain, ${to} is redirected too`);
    const src = resolve(from);
    if (!src) problems.push(`${from}: does not resolve to a row`);
    else if (!isThin(src)) problems.push(`${from}: source row is not thin`);
    if (from !== from.toLowerCase()) problems.push(`${from}: key is not lower case`);
  }
  return problems;
}
