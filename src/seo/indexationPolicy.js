export const approvedIndexableCitySlugs = [
  'gurgaon',
  'delhi',
  'noida',
  'faridabad',
  'ghaziabad',
];

export const indexableStaticRoutes = [
  '/',
  '/properties',
  '/about-us',
  '/contact',
  '/faq',
  '/project',
  '/blog',
  '/policies',
  '/refer-and-earn',
  '/gurugram-real-estate-guide',
  '/property-investment-gurugram',
  '/for-ai',
  '/ai-agent',
  '/localities',
  '/emi-calculator',
  '/area-converter',
  '/area-calculator',
  '/loan-eligibility-calculator',
  '/capital-gains-tax-calculator',
  '/property-document-checklist',
  '/design-blueprint',
  '/vastu-checker',
  '/ai-design-studio',
  '/circle-rates',
  '/stamp-duty-calculator',
  '/rera-projects',
  '/bank-auctions',
  '/auction-sources',
  '/verify-ownership',
  '/zone-checker',
  '/regulatory-updates',
  '/builder-reputation',
  '/vs/nobroker',
  '/vs/magicbricks',
  '/vs/99acres',
  '/vs/housing',
  '/vs/commonfloor',
  '/vs/proptiger',
  '/vs/squareyards',
  '/vs/nestaway',
  '/vs/zolo',
  '/vs/stanza-living',
  '/truth/nobroker-listings',
  '/truth/magicbricks-spam',
  '/truth/99acres-fake',
  '/truth/nestaway-collapse',
  '/truth/zolo-issues',
  '/careers',
  '/celebrity-homes',
  '/nri-property-guide',
  '/list-property-free',
  '/glossary',
  '/check-fake-listing',
  '/near/cyber-city',
  '/near/udyog-vihar',
  '/near/golf-course-road-corporate',
  '/near/millennium-city-centre',
  '/near/medanta',
  '/price-index/gurgaon',
  '/price-index/delhi',
  '/price-index/noida',
];

export const noindexPrerenderRoutes = [
  '/login',
  '/register',
  '/account',
  '/delete-account',
  '/post-property',
  '/add-new-listing',
  '/mcp/login',
  '/map-location',
  '/property-sidebar',
];

export const seedLocalityPrerenderRoutes = [
  '/locality/dlf-phase-1-gurgaon',
  '/locality/golf-course-road-gurgaon',
  '/locality/sushant-lok-1-gurgaon',
  '/locality/sohna-road-gurgaon',
  '/locality/sector-49-gurgaon',
  '/locality/sector-56-gurgaon',
  '/locality/palam-vihar-gurgaon',
  '/locality/mg-road-gurgaon',
  '/locality/sector-43-gurgaon',
  // Society + intent pages (top 5)
  '/locality/dlf-phase-1-gurgaon/buy',
  '/locality/dlf-phase-1-gurgaon/rent',
  '/locality/golf-course-road-gurgaon/buy',
  '/locality/sushant-lok-1-gurgaon/buy',
  '/locality/sohna-road-gurgaon/buy',
];

export const seedLandingPrerenderRoutes = [
  // City hubs
  '/gurgaon',
  '/delhi',
  '/noida',
  '/faridabad',
  '/ghaziabad',
  // Top landing pages
  '/gurgaon/buy/flats',
  '/gurgaon/rent/flats',
  '/gurgaon/pg/flats',
  '/gurgaon/buy/villa',
  '/gurgaon/buy/builder-floor',
  '/gurgaon/buy/plots',
  '/gurgaon/buy/flats/2-bhk',
  '/gurgaon/buy/flats/3-bhk',
  '/gurgaon/rent/flats/1-bhk',
  '/delhi/buy/flats',
  '/delhi/rent/flats',
  '/delhi/buy/flats/2-bhk',
  '/noida/buy/flats',
  '/noida/rent/flats',
  '/faridabad/buy/flats',
  '/ghaziabad/buy/flats',
];

/**
 * Determine whether a facet landing page should be indexed.
 * Index BHK facets (1-3 BHK) for approved cities in buy/rent intent.
 * Index select budget facets for approved cities where content is enriched.
 * Amenity facets remain noindex until content is enriched.
 */
export function isIndexableFacetLanding({ citySlug, intent, bhk, budget, amenity }) {
  if (!isIndexableCitySlug(citySlug)) return false;
  if (amenity) return false;
  if (!['buy', 'rent'].includes(intent)) return false;

  // BHK facets: 1-3 BHK are indexable
  if (bhk) {
    return ['1-bhk', '2-bhk', '3-bhk'].includes(bhk);
  }

  // Budget facets: index for approved city+intent+type combos with enrichment
  if (budget) {
    return indexableBudgetFacets.some(
      (f) => f.city === citySlug && f.intent === intent && f.budget === budget
    );
  }

  return false;
}

/** Budget facets that have been enriched with content and are safe to index. */
export const indexableBudgetFacets = [
  { city: 'gurgaon', intent: 'buy', budget: 'under-50-lakhs' },
  { city: 'gurgaon', intent: 'buy', budget: 'under-80-lakhs' },
  { city: 'gurgaon', intent: 'buy', budget: 'under-1-crore' },
  { city: 'gurgaon', intent: 'rent', budget: 'under-20k' },
];

export function normalizeCitySlug(citySlug = '') {
  const normalized = String(citySlug).trim().toLowerCase();
  return normalized === 'gurugram' ? 'gurgaon' : normalized;
}

export function isIndexableCitySlug(citySlug = '') {
  return approvedIndexableCitySlugs.includes(normalizeCitySlug(citySlug));
}
