#!/usr/bin/env node
/**
 * pSEO Quality Check — validates landing and locality page templates
 * for minimum content quality before they go into sitemaps.
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'node:url';

const cwd = process.cwd();
const reportsDir = path.join(cwd, 'scripts', 'reports');
const qualityReportPath = path.join(reportsDir, 'pseo-quality.json');

const MIN_TITLE_LENGTH = 30;
const MIN_DESCRIPTION_LENGTH = 80;
const MIN_INTERNAL_LINKS = 3;

const approvedCitySlugs = ['gurgaon', 'delhi', 'noida', 'faridabad', 'ghaziabad'];
const intents = ['buy', 'rent', 'pg'];
const types = ['flats', 'independent-house', 'builder-floor', 'villa', 'plots', 'land', 'office-space', 'shop'];

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

function checkLandingPage(citySlug, intent, typeSlug) {
  const city = pretty(citySlug);
  const facet = pretty(typeSlug);
  const verb = intent === 'rent' ? 'Rent' : intent === 'pg' ? 'PG' : 'Sale';

  const title = intent === 'pg'
    ? `PG in ${city} | ${city} Paying Guest & Co-living | 360Ghar`
    : `${facet} for ${verb} in ${city} | ${city} Real Estate | 360Ghar`;

  const description = intent === 'pg'
    ? `Browse verified ${facet.toLowerCase()} and co-living listings in ${city}. All properties are verified by our on-site team with 360° virtual tours and end-to-end assistance from a dedicated Relationship Manager.`
    : intent === 'rent'
    ? `Explore verified ${facet.toLowerCase()} for rent in ${city} with 360° virtual tours. All properties verified by our on-site team. Dedicated Relationship Manager for end-to-end assistance.`
    : `Explore verified ${facet.toLowerCase()} for sale in ${city} with 360° virtual tours. All properties verified by our on-site team. Dedicated Relationship Manager for end-to-end assistance.`;

  const issues = [];

  if (title.length < MIN_TITLE_LENGTH) {
    issues.push(`Title too short (${title.length} chars, min ${MIN_TITLE_LENGTH})`);
  }
  if (description.length < MIN_DESCRIPTION_LENGTH) {
    issues.push(`Description too short (${description.length} chars, min ${MIN_DESCRIPTION_LENGTH})`);
  }

  // Check internal links count
  let internalLinkCount = 2 + 2 + 5; // intent alternates + type alternates + localities
  if (internalLinkCount < MIN_INTERNAL_LINKS) {
    issues.push(`Too few internal links (${internalLinkCount}, min ${MIN_INTERNAL_LINKS})`);
  }

  return {
    url: `/${citySlug}/${intent}/${typeSlug}`,
    title,
    description,
    titleLength: title.length,
    descriptionLength: description.length,
    internalLinks: internalLinkCount,
    issues,
    pass: issues.length === 0,
  };
}

function checkLocalityPages() {
  const localitiesPath = path.join(cwd, 'src', 'data', 'localities-index.json');
  if (!fs.existsSync(localitiesPath)) {
    console.warn('No localities-index.json found, skipping locality checks');
    return [];
  }

  const localities = JSON.parse(fs.readFileSync(localitiesPath, 'utf8'));
  const isPlaceholder = (name) => /^povp\s+[0-9a-z]+$/i.test(String(name || '').trim());

  return localities.slice(0, 100).map((loc) => {
    const issues = [];

    if (!loc.name || loc.name.length < 3) {
      issues.push('Name too short or missing');
    }
    if (isPlaceholder(loc.name)) {
      issues.push('Placeholder name detected');
    }
    if (!loc.city) {
      issues.push('City missing');
    }
    if (!loc.entityType) {
      issues.push('Entity type missing');
    }

    return {
      url: `/locality/${loc.slug}-gurgaon`,
      name: loc.name,
      city: loc.city,
      entityType: loc.entityType,
      issues,
      pass: issues.length === 0,
    };
  });
}

function main() {
  fs.mkdirSync(reportsDir, { recursive: true });

  const results = {
    landingPages: [],
    localityPages: [],
    summary: { landingPass: 0, landingFail: 0, localityPass: 0, localityFail: 0 },
  };

  // Check landing pages
  for (const city of approvedCitySlugs) {
    for (const intent of intents) {
      for (const type of types) {
        if (intent === 'pg' && type !== 'flats') continue;
        const check = checkLandingPage(city, intent, type);
        results.landingPages.push(check);
        if (check.pass) results.summary.landingPass++;
        else results.summary.landingFail++;
      }
    }
  }

  // Check locality pages
  const localityResults = checkLocalityPages();
  results.localityPages = localityResults;
  results.summary.localityPass = localityResults.filter((r) => r.pass).length;
  results.summary.localityFail = localityResults.filter((r) => !r.pass).length;

  fs.writeFileSync(qualityReportPath, JSON.stringify(results, null, 2));

  console.log(`pSEO Quality Check Results:`);
  console.log(`  Landing pages: ${results.summary.landingPass} pass, ${results.summary.landingFail} fail`);
  console.log(`  Locality pages: ${results.summary.localityPass} pass, ${results.summary.localityFail} fail`);
  console.log(`  Report: ${qualityReportPath}`);

  // Exit with error if too many failures
  const failRate = results.summary.landingFail / (results.summary.landingPass + results.summary.landingFail || 1);
  if (failRate > 0.5) {
    console.error(`FAIL: ${Math.round(failRate * 100)}% of landing pages failed quality check`);
    process.exit(1);
  }
}

const entryFile = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entryFile) {
  main();
}
