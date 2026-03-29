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
];

export const seedLandingPrerenderRoutes = [
  '/gurgaon/buy/flats',
  '/gurgaon/rent/flats',
  '/gurgaon/pg/flats',
  '/delhi/buy/flats',
  '/noida/rent/flats',
];

/**
 * Determine whether a facet landing page should be indexed.
 * Currently: index BHK facets (1-3 BHK) for approved cities in buy/rent intent.
 * Budget and amenity facets remain noindex until content is enriched.
 */
export function isIndexableFacetLanding({ citySlug, intent, bhk, budget, amenity }) {
  if (!isIndexableCitySlug(citySlug)) return false;
  if (budget || amenity) return false;
  if (!['buy', 'rent'].includes(intent)) return false;
  if (!bhk) return false;
  return ['1-bhk', '2-bhk', '3-bhk'].includes(bhk);
}

export function normalizeCitySlug(citySlug = '') {
  const normalized = String(citySlug).trim().toLowerCase();
  return normalized === 'gurugram' ? 'gurgaon' : normalized;
}

export function isIndexableCitySlug(citySlug = '') {
  return approvedIndexableCitySlugs.includes(normalizeCitySlug(citySlug));
}
