#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const inputPath = path.join(cwd, 'src', 'data', 'localities.json');
const outputPath = path.join(cwd, 'src', 'data', 'localities-index.json');
const crossrefPath = path.join(cwd, 'src', 'data', 'locality-landing-crossref.json');

const CITY_SLUG_MAP = {
  gurgaon: 'gurgaon',
  gurugram: 'gurgaon',
  delhi: 'delhi',
  noida: 'noida',
  faridabad: 'faridabad',
  ghaziabad: 'ghaziabad',
};

const INTENTS = ['buy', 'rent', 'pg'];
const LANDING_TYPES = ['flats', 'independent-house', 'builder-floor', 'villa', 'plots'];
const BHK_FACETS = ['1-bhk', '2-bhk', '3-bhk'];

function normalizeCitySlug(city) {
  const key = String(city || '').trim().toLowerCase();
  return CITY_SLUG_MAP[key] || null;
}

function buildLocalitiesIndex(localities) {
  return localities
    .map((item) => ({
      slug: item.slug,
      name: item.name,
      city: item.city || 'Gurugram',
      entityType: item.entityType || item.type || 'Locality',
      type: item.type || item.entityType || 'Locality',
      lastVerifiedAt: item.lastVerifiedAt || null,
    }))
    .filter((item) => item.slug && item.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildLocalityLandingCrossref(localities) {
  return localities
    .map((item) => {
      const citySlug = normalizeCitySlug(item.city);
      if (!citySlug) return null;

      const landingPaths = [];
      for (const intent of INTENTS) {
        for (const type of LANDING_TYPES) {
          // Skip irrelevant combos: PG only makes sense for flats
          if (intent === 'pg' && type !== 'flats') continue;
          landingPaths.push(`/${citySlug}/${intent}/${type}`);
        }
      }

      // Add BHK facet paths for flats
      for (const intent of ['buy', 'rent']) {
        for (const bhk of BHK_FACETS) {
          landingPaths.push(`/${citySlug}/${intent}/flats/${bhk}`);
        }
      }

      return {
        slug: item.slug,
        name: item.name,
        citySlug,
        landingPaths,
      };
    })
    .filter(Boolean);
}

function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing localities source file: ${inputPath}`);
  }

  const localities = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const indexData = buildLocalitiesIndex(localities);
  const crossrefData = buildLocalityLandingCrossref(localities);

  fs.writeFileSync(outputPath, `${JSON.stringify(indexData, null, 2)}\n`, 'utf8');
  console.log(`Wrote localities index: ${outputPath} (${indexData.length} entries)`);

  fs.writeFileSync(crossrefPath, `${JSON.stringify(crossrefData, null, 2)}\n`, 'utf8');
  console.log(`Wrote locality-landing crossref: ${crossrefPath} (${crossrefData.length} entries)`);
}

main();
