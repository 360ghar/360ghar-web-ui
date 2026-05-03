/**
 * Centralized internal link generation for pSEO pages.
 * Produces contextually relevant links between Landing, FacetLanding,
 * LocalityTemplate, and CityHub pages.
 */
import localitiesIndex from '../data/localities-index.json';
import priceContextData from '../data/priceContext.json';

const CITY_SLUG_MAP = {
  gurgaon: 'gurgaon',
  gurugram: 'gurgaon',
  delhi: 'delhi',
  noida: 'noida',
  faridabad: 'faridabad',
  ghaziabad: 'ghaziabad',
};

const INTENTS = [
  { key: 'buy', label: 'Buy', displayLabel: 'Sale' },
  { key: 'rent', label: 'Rent', displayLabel: 'Rent' },
  { key: 'pg', label: 'PG', displayLabel: 'PG' },
];

const LANDING_TYPES = [
  { key: 'flats', label: 'Flats', canonicalType: 'apartment' },
  { key: 'independent-house', label: 'Independent House', canonicalType: 'house' },
  { key: 'builder-floor', label: 'Builder Floor', canonicalType: 'builder_floor' },
  { key: 'villa', label: 'Villa', canonicalType: 'villa' },
  { key: 'plots', label: 'Plots', canonicalType: 'plot' },
];

const BHK_FACETS = ['1-bhk', '2-bhk', '3-bhk', '4-bhk', '5-bhk'];

const BUDGET_FACETS_BUY = ['under-50-lakhs', 'under-80-lakhs', 'under-1-crore'];
const BUDGET_FACETS_RENT = ['under-10k', 'under-15k', 'under-20k'];

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

export const normalizeCitySlug = (city) => {
  const key = String(city || '').trim().toLowerCase();
  return CITY_SLUG_MAP[key] || key;
};

/**
 * Get all landing page links for a given city.
 * Used by CityHub to build the hub-spoke structure.
 */
export const getCityLandingLinks = (citySlug) => {
  const canonical = normalizeCitySlug(citySlug);
  const links = [];

  for (const intent of INTENTS) {
    for (const t of LANDING_TYPES) {
      if (intent.key === 'pg' && t.key !== 'flats') continue;
      links.push({
        to: `/${canonical}/${intent.key}/${t.key}`,
        label: `${t.label} for ${intent.displayLabel} in ${pretty(canonical)}`,
        intent: intent.key,
        type: t.key,
      });
    }
  }

  return links;
};

/**
 * Get BHK facet links for a city + intent + type.
 */
export const getBhkFacetLinks = (citySlug, intent, typeSlug, excludeBhk) => {
  const canonical = normalizeCitySlug(citySlug);
  return BHK_FACETS
    .filter((b) => b !== excludeBhk)
    .map((b) => ({
      to: `/${canonical}/${intent}/${typeSlug}/${b}`,
      label: `${b.replace('-bhk', ' BHK').toUpperCase()} ${pretty(typeSlug)} in ${pretty(canonical)}`,
    }));
};

/**
 * Get budget facet links for a city + intent + type.
 */
export const getBudgetFacetLinks = (citySlug, intent, typeSlug, excludeBudget) => {
  const canonical = normalizeCitySlug(citySlug);
  const budgets = intent === 'rent' ? BUDGET_FACETS_RENT : BUDGET_FACETS_BUY;
  const labels = {
    'under-10k': 'Under 10K',
    'under-15k': 'Under 15K',
    'under-20k': 'Under 20K',
    'under-50-lakhs': 'Under 50 Lakhs',
    'under-80-lakhs': 'Under 80 Lakhs',
    'under-1-crore': 'Under 1 Crore',
  };
  return budgets
    .filter((b) => b !== excludeBudget)
    .map((b) => ({
      to: `/${canonical}/${intent}/${typeSlug}/budget/${b}`,
      label: `${pretty(typeSlug)} ${labels[b] || b} in ${pretty(canonical)}`,
    }));
};

/**
 * Get top localities for a city, optionally filtered by property type relevance.
 */
export const getCityLocalities = (citySlug, { limit = 5, preferTypes = [] } = {}) => {
  const cityName = {
    gurgaon: 'Gurgaon',
    gurugram: 'Gurgaon',
    delhi: 'Delhi',
    noida: 'Noida',
    faridabad: 'Faridabad',
    ghaziabad: 'Ghaziabad',
  }[normalizeCitySlug(citySlug)];

  if (!cityName) return [];

  const typePriority = {
    sector: 0, society: 1, locality: 2, phase: 3,
    project: 4, road: 5, township: 6, village: 7,
  };

  let filtered = localitiesIndex.filter((l) => l.city === cityName);

  // If preferTypes given (e.g., 'villa' → prefer sectors/societies over projects),
  // boost entities more likely to have that type
  if (preferTypes.length > 0) {
    const residentialTypes = ['sector', 'society', 'locality', 'phase', 'township'];
    filtered = filtered.sort((a, b) => {
      const aRes = residentialTypes.includes(a.entityType) ? 0 : 1;
      const bRes = residentialTypes.includes(b.entityType) ? 0 : 1;
      return aRes - bRes || (typePriority[a.entityType] ?? 9) - (typePriority[b.entityType] ?? 9)
        || a.name.localeCompare(b.name);
    });
  } else {
    filtered = filtered.sort((a, b) =>
      (typePriority[a.entityType] ?? 9) - (typePriority[b.entityType] ?? 9)
      || a.name.localeCompare(b.name)
    );
  }

  return filtered.slice(0, limit);
};

/**
 * Get related landing page links for a specific landing page.
 * Generates intent alternates and type alternates.
 */
export const getRelatedLandingLinks = ({ citySlug, intent, typeSlug, canonicalType, limit = 4 }) => {
  const canonical = normalizeCitySlug(citySlug);
  const links = [];

  const intentAlternates = {
    buy: ['rent', 'pg'],
    rent: ['buy', 'pg'],
    pg: ['rent', 'buy'],
  };

  const typeAlternates = {
    apartment: ['builder_floor', 'house', 'villa'],
    builder_floor: ['apartment', 'house', 'villa'],
    house: ['villa', 'builder_floor', 'apartment'],
    villa: ['house', 'apartment', 'penthouse'],
    plot: ['house', 'villa', 'builder_floor'],
    studio: ['apartment', 'pg'],
    pg: ['flatmate', 'apartment', 'studio'],
    flatmate: ['pg', 'apartment', 'studio'],
    office: ['shop', 'warehouse'],
    shop: ['office', 'warehouse'],
    warehouse: ['office', 'shop'],
  };

  const routeSlugMap = {
    apartment: 'flats',
    house: 'independent-house',
    builder_floor: 'builder-floor',
    plot: 'plots',
    villa: 'villa',
    office: 'office-space',
    shop: 'shop',
    warehouse: 'warehouse',
    studio: 'studio',
    penthouse: 'penthouse',
    pg: 'flats',
    flatmate: 'flatmate',
  };

  const getSlug = (t) => routeSlugMap[t] || t.replace(/_/g, '-');

  const intentDisplayMap = { buy: 'Sale', rent: 'Rent', pg: 'PG' };

  for (const altIntent of intentAlternates[intent] || []) {
    const typeS = getSlug(canonicalType || typeSlug);
    if (altIntent === 'pg' && typeS !== 'flats') continue;
    links.push({
      to: `/${canonical}/${altIntent}/${typeS}`,
      label: `${pretty(typeS)} for ${intentDisplayMap[altIntent] || pretty(altIntent)} in ${pretty(canonical)}`,
    });
  }

  for (const altType of (typeAlternates[canonicalType] || []).slice(0, 2)) {
    links.push({
      to: `/${canonical}/${intent}/${getSlug(altType)}`,
      label: `${pretty(getSlug(altType))} for ${intentDisplayMap[intent] || pretty(intent)} in ${pretty(canonical)}`,
    });
  }

  return links.slice(0, limit);
};

/**
 * Get locality → landing cross-links for a specific locality page.
 * Returns intent-specific links like "2 BHK Flats for Sale in DLF Phase 1".
 * Uses keyword-rich anchor text for better PageRank flow.
 */
export const getLocalityLandingLinks = ({ citySlug, localityName, limit = 5 }) => {
  const canonical = normalizeCitySlug(citySlug);

  const baseLinks = [
    { to: `/${canonical}/buy/flats`, label: `verified flats for sale in ${localityName}` },
    { to: `/${canonical}/rent/flats`, label: `rental apartments in ${localityName}` },
    { to: `/${canonical}/buy/flats/2-bhk`, label: `2 BHK flats in ${localityName}` },
    { to: `/${canonical}/buy/flats/3-bhk`, label: `3 BHK apartments in ${localityName}` },
    { to: `/${canonical}/buy/villa`, label: `villas for sale in ${localityName}` },
    { to: `/${canonical}/buy/builder-floor`, label: `builder floors in ${localityName}` },
  ];

  if (canonical === 'gurgaon' || canonical === 'delhi') {
    baseLinks.push({ to: `/${canonical}/pg/flats`, label: `PG accommodation in ${localityName}` });
  }

  return baseLinks.slice(0, limit);
};

/**
 * Get price range for a city × intent × property type.
 */
export const getPriceRange = (citySlug, intent, canonicalType) => {
  const city = priceContextData[normalizeCitySlug(citySlug)];
  if (!city) return null;
  const intentPrices = city[intent];
  if (!intentPrices) return null;
  return intentPrices[canonicalType] || intentPrices.default || null;
};

/**
 * Get comparison pages links for a city hub.
 */
export const getComparisonLinks = () => [
  { to: '/vs/nobroker', label: '360Ghar vs NoBroker' },
  { to: '/vs/magicbricks', label: '360Ghar vs MagicBricks' },
  { to: '/vs/99acres', label: '360Ghar vs 99acres' },
  { to: '/vs/housing', label: '360Ghar vs Housing.com' },
];

/**
 * Get tool links for a city hub.
 */
export const getToolLinks = () => [
  { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fa-calculator' },
  { to: '/circle-rates', label: 'Circle Rates', icon: 'fa-indian-rupee-sign' },
  { to: '/stamp-duty-calculator', label: 'Stamp Duty Calculator', icon: 'fa-file-invoice' },
  { to: '/property-document-checklist', label: 'Document Checklist', icon: 'fa-list-check' },
  { to: '/vastu-checker', label: 'Vastu Checker', icon: 'fa-compass' },
];

export { INTENTS, LANDING_TYPES, BHK_FACETS, BUDGET_FACETS_BUY, BUDGET_FACETS_RENT };
