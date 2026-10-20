#!/usr/bin/env node
/**
 * Price ranges per city, intent and property type, from live listings.
 * Port of the old build-price-context.mjs, which wrote priceContext-generated.json
 * for a person to merge by hand. This one does the same: it never writes to
 * src/data (the ranges there are curated and the price pages cite them).
 *
 *   node scripts/data/build-price-context.mjs [--live | --fixture <listings.json>] [--out <dir>]
 *        [--max-pages 3] [--min-samples 4] [--api-base https://api.360ghar.com]
 *
 * Default is offline: it copies the curated file unchanged. `--live` does GET
 * /api/v1/properties (cursor pages of 100, at most `--max-pages` per city and
 * intent). A range is where most prices sit (25th to 75th percentile) and only
 * replaces the curated one when at least `--min-samples` priced listings exist
 * for that type. The stand-in price of exactly 10 Cr (see src/features/search/prices.ts)
 * is left out. Rents are written with "/month" and short stays are never used.
 * Writes priceContext-generated.json and price-context-report.json (samples per
 * cell and every changed range) to the out dir.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fetchPaginatedCollectionCached } from './lib/paginatedApi.mjs';
import { outDir, parseArgs, readJson, srcData, writeJson } from './lib/cli.mjs';
import { checkPriceContext } from './lib/schema.mjs';

const CITIES = { gurgaon: 'Gurgaon', delhi: 'Delhi', noida: 'Noida', faridabad: 'Faridabad', ghaziabad: 'Ghaziabad' };
const INTENTS = ['buy', 'rent'];
/** Types the landing and price pages read. Others (for example "flatmate") are skipped. */
const TYPES = ['apartment', 'villa', 'builder_floor', 'house', 'plot', 'penthouse', 'studio', 'office', 'shop'];
const PLACEHOLDER_PRICE = 1e8;
const PLACEHOLDER_RATE = 40_000;

/** Percentile with linear interpolation (same as src/features/search/prices.ts). */
export function percentile(xs, q) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const i = ((s.length - 1) * q) / 100;
  const lo = Math.floor(i);
  return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (i - lo);
}

/** Where most prices sit: 25th to 75th percentile, or min to max for fewer than 4 prices. */
export function robustRange(xs) {
  if (!xs.length) return null;
  if (xs.length < 4) return [Math.min(...xs), Math.max(...xs)];
  return [percentile(xs, 25), percentile(xs, 75)];
}

export const isPlaceholderPrice = (p) => p.purpose === 'buy' && p.base_price === PLACEHOLDER_PRICE && Boolean(p.area_sqft) && p.base_price / p.area_sqft > PLACEHOLDER_RATE;

/** Price a buyer or tenant pays, as on the cards: the field of the purpose. base_price is not a rent, so a rent with no monthly_rent has no price (null). */
export const askPrice = (p) => (p.purpose === 'rent' ? (p.monthly_rent ?? null) : p.base_price);

const trim = (n, digits) => String(Number(n.toFixed(digits)));

function money(v, rent) {
  if (v >= 1e7) return { n: trim(v / 1e7, 2), unit: 'crore' };
  if (v >= 1e5) return { n: trim(v / 1e5, rent ? 2 : 0), unit: 'lakh' };
  return { n: Math.round(v / (v >= 10_000 ? 1000 : 500)) * (v >= 10_000 ? 1000 : 500), unit: '' };
}

/**
 * "85 lakhs - 3.5 crore", "1.5 - 6 crore", "15,000 - 85,000/month": the format
 * of src/data/priceContext.json, which `parseRange` in charts.ts reads.
 */
export function formatRange([lo, hi], rent) {
  const a = money(lo, rent);
  const b = money(hi, rent);
  const plural = (m) => (m.unit === 'lakh' && !rent ? 'lakhs' : m.unit);
  const num = (m) => (typeof m.n === 'number' ? m.n.toLocaleString('en-IN') : m.n);
  const left = a.unit && a.unit === b.unit ? num(a) : `${num(a)}${a.unit ? ` ${plural(a)}` : ''}`;
  const text = `${left} - ${num(b)}${b.unit ? ` ${plural(b)}` : ''}`;
  return rent ? `${text}/month` : text;
}

/** Ranges by property type from a list of listings (already limited to one city and intent). */
export function rangesFromListings(items, intent, minSamples = 4) {
  const byType = new Map();
  for (const p of items) {
    if (p.purpose !== intent || isPlaceholderPrice(p)) continue;
    const price = askPrice(p);
    if (!(price > 0) || !TYPES.includes(p.property_type)) continue;
    (byType.get(p.property_type) ?? byType.set(p.property_type, []).get(p.property_type)).push(price);
  }
  const ranges = {};
  const samples = {};
  for (const [type, prices] of byType) {
    samples[type] = prices.length;
    if (prices.length >= minSamples) ranges[type] = formatRange(robustRange(prices), intent === 'rent');
  }
  return { ranges, samples };
}

/** Curated values fill gaps; API ranges replace them; "default" and "pg" stay curated. */
export function mergePriceContext(overrides, listingsByCityIntent, minSamples = 4) {
  const generated = {};
  const report = { cells: {}, changed: [] };
  for (const city of Object.keys(CITIES)) {
    generated[city] = {};
    for (const intent of INTENTS) {
      const manual = overrides[city]?.[intent] ?? {};
      const items = listingsByCityIntent?.[`${city}/${intent}`];
      const { ranges, samples } = items ? rangesFromListings(items, intent, minSamples) : { ranges: {}, samples: {} };
      const merged = { ...manual };
      for (const [type, range] of Object.entries(ranges)) {
        if (manual[type] !== range) report.changed.push({ city, intent, type, was: manual[type] ?? null, now: range, samples: samples[type] });
        merged[type] = range;
      }
      generated[city][intent] = merged;
      report.cells[`${city}/${intent}`] = { listings: items?.length ?? null, samples };
    }
    if (overrides[city]?.pg) generated[city].pg = overrides[city].pg;
  }
  return { generated, report };
}

async function main() {
  const args = parseArgs();
  const overrides = readJson(srcData('priceContext.json'));
  const minSamples = Number(args['min-samples']) || 4;
  const maxPages = Number(args['max-pages']) || 3;
  const baseUrl = `${String(args['api-base'] || process.env.API_ORIGIN || process.env.VITE_API_SERVER || 'https://api.360ghar.com').replace(/\/$/, '')}/api/v1`;

  let listings = null;
  if (args.fixture) {
    const fx = readJson(path.resolve(String(args.fixture)));
    listings = {};
    for (const city of Object.keys(CITIES)) for (const intent of INTENTS) listings[`${city}/${intent}`] = fx.filter((p) => p.purpose === intent && String(p.city ?? '').toLowerCase().includes(city === 'gurgaon' ? 'gur' : city.slice(0, 4)));
  } else if (args.live) {
    listings = {};
    for (const [city, name] of Object.entries(CITIES)) {
      for (const intent of INTENTS) {
        // Sequential: 10 small GET calls at most `maxPages` pages each.
        listings[`${city}/${intent}`] = await fetchPaginatedCollectionCached({ baseUrl, path: '/properties', query: { city: name, purpose: intent }, maxPages });
        console.log(`${city}/${intent}: ${listings[`${city}/${intent}`].length} listings`);
      }
    }
  }

  const { generated, report } = mergePriceContext(overrides, listings, minSamples);
  const problems = checkPriceContext(generated);
  const out = outDir(args);
  writeJson(path.join(out, 'priceContext-generated.json'), generated);
  writeJson(path.join(out, 'price-context-report.json'), report);
  console.log(`Wrote priceContext-generated.json and price-context-report.json -> ${out}`);
  console.log(`Changed ranges vs src/data/priceContext.json: ${report.changed.length}${listings ? '' : ' (offline: nothing fetched)'}`);
  for (const c of report.changed.slice(0, 20)) console.log(`  ${c.city}/${c.intent}/${c.type}: ${c.was ?? '(none)'} -> ${c.now} (${c.samples} listings)`);
  console.log(problems.length ? `Shape problems:\n  ${problems.join('\n  ')}` : 'Shape check: ok. Review the report, then merge by hand into src/data/priceContext.json.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
