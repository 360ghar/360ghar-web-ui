#!/usr/bin/env node
/**
 * Step 1 of the locality pipeline: collect raw entity names.
 * Port of the old ingest-gurgaon-entities.mjs and ingest-ncr-entities.mjs (one
 * script now; `--cities` picks the cities).
 *
 * Sources are public sitemaps of other property sites (GET only). Every name
 * comes from a URL slug in a sitemap, plus the rows already in
 * src/data/localities.json (the "seed"). Nothing is written to src/data.
 *
 * Modes (default is offline: the seed only, no network):
 *   --live               GET the source sitemaps, one at a time, `--delay` ms apart (default 1500).
 *   --fixtures <dir>     Read sitemap files from a folder instead (named like the URL's last part, for example Gurgaon_project_sitemap_1.xml).
 *   --sources a,b        Only these sources (squareyards, commonfloor by default; magicbricks and nobroker are off, see SOURCE_URLS).
 *   --max-bytes N        Read at most N bytes of each sitemap (default 8 MB). A cut-off .gz still gives its first rows.
 *   --cities a,b|all     Default: gurgaon.
 *   --seed <file>|none   Default: src/data/localities.json.
 *   --out <dir>          Default: a temp folder (or DATA_OUT). Writes entity-raw.json.
 *   --no-cache           Skip the 12 h response cache (node_modules/.cache/360ghar-data).
 *
 * Changes from the old scripts: .xml.gz files are gunzipped (the old script read
 * them as text, so magicbricks and nobroker gave 0 rows); squareyards names lose
 * the "projects in" prefix; search-result URLs are dropped.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { cacheKey, readCache, writeCache } from './lib/paginatedApi.mjs';
import { outDir, parseArgs, readJson, srcData, writeJson } from './lib/cli.mjs';

/**
 * `city` is set for sources that cover one city; the others cover all of them.
 * `off` marks sources that give search-result URLs today ("flats-for-sale-in-x-gurgaon-prjtl"),
 * not project pages: their names are not entities, so they only run when named in `--sources`.
 */
export const SOURCE_URLS = [
  { source: 'magicbricks', url: 'https://www.magicbricks.com/residential_projects.xml.gz', type: 'project', off: true },
  { source: 'squareyards', url: 'https://www.squareyards.com/sitemap-projects-location.xml', type: 'project' },
  { source: 'squareyards', url: 'https://www.squareyards.com/sitemap-projects-sublocation.xml', type: 'locality' },
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/sale_gurgaon_nb_building_new.xml.gz', type: 'society', city: 'Gurgaon', off: true },
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/new-projects-gurgaon.xml.gz', type: 'project', city: 'Gurgaon', off: true },
  { source: 'commonfloor', url: 'https://www.commonfloor.com/sitemap/Gurgaon_project_sitemap_1.xml', type: 'project', city: 'Gurgaon' },
  ...['Delhi', 'Noida', 'Faridabad', 'Ghaziabad'].flatMap((city) => {
    const c = city.toLowerCase();
    return [
      { source: 'nobroker', url: `https://www.nobroker.in/sitemap/sale_${c}_nb_building_new.xml.gz`, type: 'society', city, off: true },
      { source: 'nobroker', url: `https://www.nobroker.in/sitemap/new-projects-${c}.xml.gz`, type: 'project', city, off: true },
      // The old NCR script had no Faridabad sitemap on commonfloor.
      ...(city === 'Faridabad' ? [] : [{ source: 'commonfloor', url: `https://www.commonfloor.com/sitemap/${city}_project_sitemap_1.xml`, type: 'project', city }]),
    ];
  }),
];

const CITY_PATTERNS = [
  { city: 'Gurgaon', regex: /gurgaon|gurugram/i },
  { city: 'Delhi', regex: /delhi|new-delhi|new_delhi/i },
  { city: 'Noida', regex: /noida|greater-noida|greater_noida/i },
  { city: 'Faridabad', regex: /faridabad/i },
  { city: 'Ghaziabad', regex: /ghaziabad|indirapuram|vaishali|kaushambi/i },
];

export function detectCity(url) {
  for (const { city, regex } of CITY_PATTERNS) if (regex.test(url)) return city;
  return null;
}

export const extractLoc = (xmlText) => [...String(xmlText).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

export const isPlaceholderName = (name) => /^povp\s+[0-9a-z]+$/i.test(String(name || '').trim());

const cleanupSlugToken = (token) =>
  token
    .replace(/\.(html|php|aspx?)$/g, '')
    .replace(/-npxid-r\d+$/g, '')
    .replace(/-(gurgaon|gurugram|delhi|noida|faridabad|ghaziabad)$/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Project name from a listing URL. Commonfloor "povp-xxxx" URLs keep the name in the folder before. */
export const decodeNameFromUrl = (url, source = {}) => {
  let decoded;
  try {
    decoded = decodeURIComponent(url).toLowerCase();
  } catch {
    decoded = String(url).toLowerCase();
  }
  const chunks = decoded.split('/').filter(Boolean);
  const last = chunks[chunks.length - 1] || '';
  if (source.source === 'commonfloor' && /^povp-[0-9a-z]+$/i.test(last)) return cleanupSlugToken(chunks[chunks.length - 2] || '');
  const name = cleanupSlugToken(last);
  // Squareyards pages are "projects-in-{area}-{city}". The old script kept the "projects in" part in the name (462 places in localities.json start with it).
  return source.source === 'squareyards' ? name.replace(/^projects in /, '') : name;
};

/** Names cut from search-result URLs ("2bhk flats for sale in x", "villas projects sector 57 in gurgaon nprid") are not places. */
export const isSearchResultName = (name) => /\b(for sale|for rent|new projects?|projects? in|villas projects|nprid|prjtl)\b|^\d+\s?bhk\b/i.test(String(name || ''));

/** Turns sitemap text into raw entity rows for the wanted cities. */
export function rowsFromSitemap(xmlText, source, cities) {
  return extractLoc(xmlText)
    .map((loc) => {
      const city = detectCity(loc);
      if (!city || !cities.includes(city)) return null;
      return { name: decodeNameFromUrl(loc, source), city, entityType: source.type, sourceCoverage: [source.source], sourceUrls: [loc], confidence: 0.7 };
    })
    .filter((r) => r && r.name.length > 2 && !isPlaceholderName(r.name) && !isSearchResultName(r.name));
}

/** Text of a sitemap body. Gunzips when the bytes start with the gzip header; a cut-off .gz still yields its first part. */
export function sitemapText(buf) {
  const b = Buffer.from(buf);
  if (b[0] === 0x1f && b[1] === 0x8b) return zlib.gunzipSync(b, { finishFlush: zlib.constants.Z_SYNC_FLUSH }).toString('utf8');
  return b.toString('utf8');
}

/** File name of a source inside a fixtures folder: the last part of the URL without ".gz". */
export const fixtureName = (source) => path.basename(new URL(source.url).pathname).replace(/\.gz$/, '');

async function readCapped(response, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    chunks.push(chunk);
    size += chunk.length;
    if (size >= maxBytes) break;
  }
  return Buffer.concat(chunks).subarray(0, maxBytes);
}

async function loadSource(source, opts) {
  if (opts.fixtures) {
    const file = path.join(opts.fixtures, fixtureName(source));
    return fs.existsSync(file) ? sitemapText(fs.readFileSync(file)) : null;
  }
  const key = cacheKey('sitemap', source.url, opts.maxBytes);
  if (opts.cache) {
    const hit = await readCache(key, 24 * 60 * 60 * 1000);
    if (hit) return hit.text;
  }
  const response = await opts.fetchImpl(source.url, { method: 'GET', headers: { 'user-agent': '360ghar-entity-ingestor/1.0' }, signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = sitemapText(await readCapped(response, opts.maxBytes));
  if (opts.cache) await writeCache(key, { text });
  return text;
}

/** Rows already in localities.json. Their own verification date is kept. */
export function seedRows(items) {
  return items
    .filter((item) => !isPlaceholderName(item?.name))
    .map((item) => ({
      name: item.name,
      city: item.city || 'Gurgaon',
      entityType: String(item.entityType || item.type || 'locality').toLowerCase(),
      aliases: item.aliases || [],
      parentLocality: item.parentLocality || '',
      geo: item.geo || null,
      sourceCoverage: ['legacy-localities-json'],
      sourceUrls: [],
      confidence: 0.6,
      ...(item.lastVerifiedAt ? { lastVerifiedAt: item.lastVerifiedAt } : {}),
    }));
}

/** Collects raw rows. `log` gets one line per source. */
export async function ingest({ cities = ['Gurgaon'], sources = null, seed = [], live = false, fixtures = null, maxBytes = 8 * 1024 * 1024, delayMs = 1500, cache = true, fetchImpl = fetch, log = () => {} } = {}) {
  const raw = [...seedRows(seed)];
  log(`seed: ${raw.length} rows`);
  if (!live && !fixtures) return raw;
  const wanted = SOURCE_URLS.filter((s) => (sources ? sources.includes(s.source) : !s.off) && (!s.city || cities.includes(s.city)));
  for (const source of wanted) {
    try {
      const text = await loadSource(source, { fixtures, maxBytes, cache, fetchImpl });
      if (text === null) {
        log(`${source.source} ${fixtureName(source)}: no fixture file, skipped`);
        continue;
      }
      const rows = rowsFromSitemap(text, source, cities);
      raw.push(...rows);
      log(`${source.source} ${fixtureName(source)}: +${rows.length}`);
    } catch (err) {
      log(`${source.source} ${fixtureName(source)}: failed (${err.message}), skipped`);
    }
    if (live && !fixtures) await new Promise((r) => setTimeout(r, delayMs));
  }
  return raw;
}

async function main() {
  const args = parseArgs();
  const all = ['Gurgaon', 'Delhi', 'Noida', 'Faridabad', 'Ghaziabad'];
  const cities = !args.cities ? ['Gurgaon'] : args.cities === 'all' ? all : String(args.cities).split(',').map((c) => all.find((a) => a.toLowerCase() === c.trim().toLowerCase())).filter(Boolean);
  const seedPath = args.seed === 'none' ? null : String(args.seed || srcData('localities.json'));
  const seed = seedPath && fs.existsSync(seedPath) ? readJson(seedPath) : [];
  const raw = await ingest({
    cities,
    sources: args.sources ? String(args.sources).split(',') : null,
    seed,
    live: Boolean(args.live),
    fixtures: args.fixtures ? path.resolve(String(args.fixtures)) : null,
    maxBytes: Number(args['max-bytes']) || 8 * 1024 * 1024,
    delayMs: Number(args.delay) || 1500,
    cache: !args['no-cache'],
    log: (l) => console.log(l),
  });
  const file = path.join(outDir(args), 'entity-raw.json');
  writeJson(file, raw);
  console.log(`Wrote ${raw.length} raw rows -> ${file}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
