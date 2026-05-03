#!/usr/bin/env node
/**
 * Build price context data from the API.
 * Fetches average prices per city × intent × property type
 * and merges with manual overrides from src/data/priceContext.json.
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'node:url';

const cwd = process.cwd();
const apiBase = `${process.env.VITE_API_SERVER || 'https://api.360ghar.com'}/api/v1`;
const overridesPath = path.join(cwd, 'src', 'data', 'priceContext.json');
const outputPath = path.join(cwd, 'src', 'data', 'priceContext-generated.json');

const CITIES = ['gurgaon', 'delhi', 'noida', 'faridabad', 'ghaziabad'];
const INTENTS = ['buy', 'rent'];

function formatRange(prices) {
  if (!prices.length) return null;
  const sorted = prices.sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (min >= 10000000) {
    return `${(min / 10000000).toFixed(1).replace(/\.0$/, '')} - ${(max / 10000000).toFixed(1).replace(/\.0$/, '')} crore`;
  }
  if (min >= 100000) {
    return `${Math.round(min / 100000)} - ${Math.round(max / 100000)} lakh`;
  }
  return `${min.toLocaleString('en-IN')} - ${max.toLocaleString('en-IN')}/month`;
}

async function fetchPricesForCity(city, intent) {
  try {
    const params = new URLSearchParams({
      city: city === 'gurgaon' ? 'Gurgaon' : city.charAt(0).toUpperCase() + city.slice(1),
      purpose: intent,
      limit: '100',
    });
    const url = `${apiBase}/properties/?${params}`;
    const resp = await fetch(url, {
      headers: { 'user-agent': '360ghar-price-builder/1.0' },
      signal: AbortSignal.timeout(30000),
    });
    if (!resp.ok) return {};
    const data = await resp.json();
    const items = data.results || data.items || data.properties || [];
    const byType = {};
    for (const item of items) {
      const ptype = item.property_type || item.type || 'unknown';
      if (!byType[ptype]) byType[ptype] = [];
      if (item.price && item.price > 0) byType[ptype].push(item.price);
    }
    const result = {};
    for (const [ptype, prices] of Object.entries(byType)) {
      const range = formatRange(prices);
      if (range) result[ptype] = range;
    }
    return result;
  } catch (err) {
    console.warn(`Failed to fetch ${city}/${intent}: ${err.message}`);
    return {};
  }
}

async function main() {
  const overrides = fs.existsSync(overridesPath)
    ? JSON.parse(fs.readFileSync(overridesPath, 'utf8'))
    : {};
  const generated = {};

  for (const city of CITIES) {
    generated[city] = {};
    for (const intent of INTENTS) {
      const apiPrices = await fetchPricesForCity(city, intent);
      const manualPrices = overrides[city]?.[intent] || {};

      // Merge: API values override manual defaults, but manual values fill gaps
      const merged = { ...manualPrices };
      for (const [ptype, range] of Object.entries(apiPrices)) {
        // Only use API data if we got a meaningful result
        if (range && ptype !== 'default') {
          merged[ptype] = range;
        }
      }
      generated[city][intent] = merged;
    }

    // Carry over PG data from overrides (API doesn't differentiate PG well)
    if (overrides[city]?.pg) {
      generated[city].pg = overrides[city].pg;
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(generated, null, 2));
  console.log(`Wrote generated price context: ${outputPath}`);
  console.log('Tip: Review and merge any useful API data into src/data/priceContext.json');
}

const entryFile = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entryFile) {
  main().catch(console.error);
}
