/**
 * Shared SEO keyword generation utilities for Landing and FacetLanding pages.
 */

const BRAND_KEYWORDS = ['verified properties', '360 virtual tours', 'AI property search', 'on-site verified'];

const INTENT_DISPLAY = { buy: 'sale', rent: 'rent', pg: 'pg' };

/**
 * Returns property type synonyms for a given facet string.
 * @param {string} lcFacet - Lowercased facet/property type string
 * @returns {string[]}
 */
export const getTypeSynonyms = (lcFacet) => {
  if (lcFacet.includes('apartment') || lcFacet.includes('flat')) return ['flats', 'apartments', 'society flats'];
  if (lcFacet.includes('independent')) return ['independent house', 'independent floor', 'house', 'kothi'];
  if (lcFacet.includes('builder')) return ['builder floor', 'independent floor'];
  if (lcFacet.includes('villa')) return ['villa', 'bungalow'];
  if (lcFacet.includes('plot')) return ['plots', 'residential plots', 'residential land'];
  if (lcFacet.includes('land')) return ['land', 'residential land', 'commercial land'];
  if (lcFacet.includes('office')) return ['office space', 'commercial office', 'coworking', 'co-working'];
  if (lcFacet.includes('shop')) return ['shop', 'retail shop', 'showroom'];
  return [lcFacet];
};

/**
 * Returns intent synonyms for buy/rent/pg.
 * @param {string} intent
 * @returns {string[]}
 */
export const getIntentSynonyms = (intent) => {
  if (intent === 'buy') return ['buy', 'purchase', 'for sale', 'resale', 'new launch', 'under construction', 'ready to move'];
  if (intent === 'rent') return ['rent', 'on rent', 'for rent', 'lease', 'rental', 'without brokerage', 'no broker', 'owner'];
  return ['pg', 'paying guest', 'co-living', 'hostel', 'boys pg', 'girls pg'];
};

/**
 * Generates SEO keywords for a base landing page (city + intent + property type).
 * @param {object} params
 * @param {string} params.facet - Human-readable property type (e.g. "Flats")
 * @param {string} params.city - City name (e.g. "Gurugram")
 * @param {string} params.validIntent - Normalized intent: 'buy' | 'rent' | 'pg'
 * @returns {string} Comma-separated keyword string
 */
export const buildLandingKeywords = ({ facet, city, validIntent }) => {
  const lcFacet = facet.toLowerCase();
  const isRes = ['flats', 'apartments', 'independent house', 'builder floor', 'villa'].some((k) => lcFacet.includes(k));
  const typeSyn = getTypeSynonyms(lcFacet);
  const intentSyn = getIntentSynonyms(validIntent);

  const basePhrases = [
    `${facet} for ${INTENT_DISPLAY[validIntent] || validIntent} in ${city}`,
    `${facet} ${INTENT_DISPLAY[validIntent] || validIntent} ${city}`,
    `${facet} in ${city}`,
    ...typeSyn.flatMap((t) => intentSyn.map((i) => `${t} ${i} ${city}`)),
    isRes ? `1 BHK ${facet} ${validIntent} in ${city}` : null,
    isRes ? `2 BHK ${facet} ${validIntent} in ${city}` : null,
    isRes ? `3 BHK ${facet} ${validIntent} in ${city}` : null,
    validIntent === 'rent' && isRes ? `furnished ${facet} for rent in ${city}` : null,
    validIntent === 'rent' && isRes ? `semi furnished ${facet} for rent in ${city}` : null,
    validIntent === 'buy' && isRes ? `ready to move ${facet} for sale in ${city}` : null,
    `near metro ${city}`,
    `pet friendly ${facet} ${validIntent} in ${city}`,
  ].filter(Boolean);

  return [...Array.from(new Set(basePhrases)), ...BRAND_KEYWORDS].join(', ');
};

/**
 * Generates SEO keywords for a faceted landing page (adds BHK/budget/amenity context).
 * @param {object} params
 * @param {string} params.facetText - Human-readable property type
 * @param {string} params.validCity - City name
 * @param {string} params.validIntent - 'buy' | 'rent' | 'pg'
 * @param {boolean} params.isBhk
 * @param {string} params.bhkText - e.g. "3 BHK"
 * @param {boolean} params.isBudget
 * @param {string} params.budgetText - e.g. "under 50 lakh"
 * @param {boolean} params.isAmenity
 * @param {string} params.amenity - raw amenity slug
 * @param {Function} params.pretty - prettifier for amenity slug
 * @returns {string} Comma-separated keyword string
 */
export const buildFacetKeywords = ({ facetText, validCity, validIntent, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity, pretty }) => {
  const lcFacet = facetText.toLowerCase();
  const tSyn = getTypeSynonyms(lcFacet);
  const iSyn = getIntentSynonyms(validIntent);
  const bhkSyn = isBhk ? [bhkText, bhkText.toLowerCase()] : [];
  const budgetSyn = isBudget ? [budgetText, budgetText.replace('under', 'below')] : [];

  const base = [
    `${facetText} for ${INTENT_DISPLAY[validIntent] || validIntent} in ${validCity}`,
    ...tSyn.flatMap((t) => iSyn.map((i) => `${t} ${i} ${validCity}`)),
    ...bhkSyn.map((b) => `${b} ${lcFacet} ${INTENT_DISPLAY[validIntent] || validIntent} in ${validCity}`),
    ...budgetSyn.map((b) => `${lcFacet} ${INTENT_DISPLAY[validIntent] || validIntent} ${b} in ${validCity}`),
    isAmenity ? `${pretty(amenity)} ${lcFacet} ${INTENT_DISPLAY[validIntent] || validIntent} in ${validCity}` : null,
    'near metro', 'pet friendly', 'ready to move', 'no broker',
    ...BRAND_KEYWORDS,
  ];

  return Array.from(new Set(base.filter(Boolean))).join(', ');
};
