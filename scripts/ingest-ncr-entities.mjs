#!/usr/bin/env node
/**
 * Multi-city entity ingestion for Delhi NCR.
 * Extends the Gurgaon-only ingest-gurgaon-entities.mjs to cover
 * Delhi, Noida, Faridabad, and Ghaziabad.
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const cwd = process.cwd();
const reportsDir = path.join(cwd, 'scripts', 'reports');
const rawFile = path.join(reportsDir, 'entity-raw-ncr.json');
const localitiesPath = path.join(cwd, 'src', 'data', 'localities.json');

const isPlaceholderName = (name) => /^povp\s+[0-9a-z]+$/i.test(String(name || '').trim());

const cleanupSlugToken = (token) => token
  .replace(/\.(html|php|aspx?)$/g, '')
  .replace(/-npxid-r\d+$/g, '')
  .replace(/-gurgaon$|-gurugram$/g, '')
  .replace(/-delhi$|-noida$|-faridabad$|-ghaziabad$/g, '')
  .replace(/-/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const decodeNameFromUrl = (url, source = {}) => {
  const decoded = decodeURIComponent(url).toLowerCase();
  const chunks = decoded.split('/').filter(Boolean);
  const last = chunks[chunks.length - 1] || '';

  if (source.source === 'commonfloor' && /^povp-[0-9a-z]+$/i.test(last)) {
    const prev = chunks[chunks.length - 2] || '';
    return cleanupSlugToken(prev);
  }

  return cleanupSlugToken(last);
};

const CITY_PATTERNS = [
  { city: 'Gurgaon', regex: /gurgaon|gurugram/i },
  { city: 'Delhi', regex: /delhi|new-delhi|new_delhi/i },
  { city: 'Noida', regex: /noida|greater-noida|greater_noida/i },
  { city: 'Faridabad', regex: /faridabad/i },
  { city: 'Ghaziabad', regex: /ghaziabad|indirapuram|vaishali|kaushambi/i },
];

function detectCity(url) {
  for (const { city, regex } of CITY_PATTERNS) {
    if (regex.test(url)) return city;
  }
  return null;
}

const SOURCE_URLS = [
  // Gurgaon sources (from existing script)
  { source: 'magicbricks', url: 'https://www.magicbricks.com/residential_projects.xml.gz', type: 'project' },
  { source: 'squareyards', url: 'https://www.squareyards.com/sitemap-projects-location.xml', type: 'project' },
  { source: 'squareyards', url: 'https://www.squareyards.com/sitemap-projects-sublocation.xml', type: 'locality' },
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/sale_gurgaon_nb_building_new.xml.gz', type: 'society' },
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/new-projects-gurgaon.xml.gz', type: 'project' },
  { source: 'commonfloor', url: 'https://www.commonfloor.com/sitemap/Gurgaon_project_sitemap_1.xml', type: 'project' },
  // Delhi sources
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/sale_delhi_nb_building_new.xml.gz', type: 'society' },
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/new-projects-delhi.xml.gz', type: 'project' },
  { source: 'commonfloor', url: 'https://www.commonfloor.com/sitemap/Delhi_project_sitemap_1.xml', type: 'project' },
  // Noida sources
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/sale_noida_nb_building_new.xml.gz', type: 'society' },
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/new-projects-noida.xml.gz', type: 'project' },
  { source: 'commonfloor', url: 'https://www.commonfloor.com/sitemap/Noida_project_sitemap_1.xml', type: 'project' },
  // Faridabad sources
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/sale_faridabad_nb_building_new.xml.gz', type: 'society' },
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/new-projects-faridabad.xml.gz', type: 'project' },
  // Ghaziabad sources
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/sale_ghaziabad_nb_building_new.xml.gz', type: 'society' },
  { source: 'nobroker', url: 'https://www.nobroker.in/sitemap/new-projects-ghaziabad.xml.gz', type: 'project' },
  { source: 'commonfloor', url: 'https://www.commonfloor.com/sitemap/Ghaziabad_project_sitemap_1.xml', type: 'project' },
];

const extractLoc = (xmlText) => {
  const out = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xmlText))) out.push(m[1]);
  return out;
};

async function fetchSource(source) {
  try {
    const response = await fetch(source.url, {
      headers: { 'user-agent': '360ghar-entity-ingestor/1.0' },
    });
    if (!response.ok) return [];
    const text = await response.text();
    return extractLoc(text)
      .map((loc) => {
        const city = detectCity(loc);
        if (!city) return null;
        return {
          name: decodeNameFromUrl(loc, source),
          city,
          entityType: source.type,
          sourceCoverage: [source.source],
          sourceUrls: [loc],
          confidence: 0.7,
        };
      })
      .filter((r) => r && r.name.length > 2 && !isPlaceholderName(r.name));
  } catch (err) {
    console.error(`Failed to fetch ${source.source} from ${source.url}: ${err.message}`);
    return [];
  }
}

function fromExistingJson() {
  if (!fs.existsSync(localitiesPath)) return [];
  const items = JSON.parse(fs.readFileSync(localitiesPath, 'utf8'));
  return items
    .filter((item) => !isPlaceholderName(item?.name))
    .map((item) => ({
      name: item.name,
      city: item.city || 'Gurgaon',
      entityType: String(item.entityType || item.type || 'locality').toLowerCase(),
      aliases: item.aliases || [],
      parentLocality: item.parentLocality || '',
      sourceCoverage: ['legacy-localities-json'],
      sourceUrls: [],
      confidence: 0.6,
      lastVerifiedAt: new Date().toISOString().slice(0, 10),
    }));
}

async function main() {
  fs.mkdirSync(reportsDir, { recursive: true });
  const raw = [...fromExistingJson()];

  for (const source of SOURCE_URLS) {
    const rows = await fetchSource(source);
    raw.push(...rows);
    console.log(`  ${source.source} (${source.url.slice(0, 60)}...): +${rows.length} entities`);
  }

  fs.writeFileSync(rawFile, JSON.stringify(raw, null, 2));

  const cityCounts = {};
  for (const r of raw) {
    cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
  }

  console.log(`\nWrote raw NCR entities: ${raw.length} -> ${rawFile}`);
  console.log('By city:', cityCounts);
}

const entryFile = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entryFile) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
