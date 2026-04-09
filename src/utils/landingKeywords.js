/**
 * Shared SEO keyword generation utilities for Landing and FacetLanding pages.
 */

// Task #1: Expanded brand keywords
const BRAND_KEYWORDS = [
  'verified properties',
  '360 virtual tours',
  'AI property search',
  'on-site verified',
  '360 degree virtual tour',
  'verified ghar',
  'real estate gurugram',
  'property in gurugram',
];

/**
 * Returns property type synonyms for a given facet string.
 * Includes Hindi/Hinglish terms to capture Indian-language search traffic.
 * @param {string} lcFacet - Lowercased facet/property type string
 * @returns {string[]}
 */
export const getTypeSynonyms = (lcFacet) => {
  // Task #2: Hindi/Hinglish terms added to each branch
  if (lcFacet.includes('apartment') || lcFacet.includes('flat'))
    return ['flats', 'apartments', 'society flats', 'ghar', 'मकान'];
  if (lcFacet.includes('independent'))
    return ['independent house', 'independent floor', 'house', 'kothi', 'घर'];
  if (lcFacet.includes('builder'))
    return ['builder floor', 'independent floor', 'floor'];
  if (lcFacet.includes('villa'))
    return ['villa', 'bungalow', 'bangla'];
  if (lcFacet.includes('plot'))
    return ['plots', 'residential plots', 'residential land', 'zameen', 'जमीन'];
  if (lcFacet.includes('land'))
    return ['land', 'residential land', 'commercial land'];
  if (lcFacet.includes('office'))
    return ['office space', 'commercial office', 'coworking', 'co-working', 'daftar space', 'office space gurgaon'];
  if (lcFacet.includes('shop'))
    return ['shop', 'retail shop', 'showroom', 'dukaan', 'retail outlet'];
  if (lcFacet.includes('warehouse'))
    return ['warehouse', 'godown', 'storage space'];
  // New: studio branch
  if (lcFacet.includes('studio'))
    return ['studio apartment', 'studio flat', '1 room flat'];
  // New: PG/paying guest branch
  if (lcFacet.includes('pg') || lcFacet.includes('paying'))
    return ['pg', 'paying guest', 'kirayedari', 'किराये का कमरा', 'hostel room'];
  return [lcFacet];
};

/**
 * Returns intent synonyms for buy/rent/pg.
 * Includes Hindi/Hinglish terms to capture Indian-language search traffic.
 * @param {string} intent
 * @returns {string[]}
 */
export const getIntentSynonyms = (intent) => {
  // Task #3: Hindi/Hinglish intent synonyms added
  if (intent === 'buy')
    return [
      'buy', 'purchase', 'for sale', 'resale', 'new launch', 'under construction', 'ready to move',
      'kharidna', 'makan kharidna', 'खरीदें', 'property kharido',
    ];
  if (intent === 'rent')
    return [
      'rent', 'on rent', 'for rent', 'lease', 'rental', 'without brokerage', 'no broker', 'owner',
      'किराये पर', 'kiraye par', 'rent par',
    ];
  return ['pg', 'paying guest', 'co-living', 'hostel', 'boys pg', 'girls pg', 'co-living gurgaon', 'working professionals pg'];
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
    `${facet} for ${validIntent} in ${city}`,
    `${facet} ${validIntent} ${city}`,
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

  // Task #4: Locality-based phrases for Gurgaon/Gurugram
  const lcCity = city.toLowerCase();
  const isGurgaon = lcCity.includes('gurgaon') || lcCity.includes('gurugram');
  const localityPhrases = isGurgaon
    ? [
        `${facet} in DLF Phase Gurgaon`,
        `${facet} in Golf Course Road Gurgaon`,
        `${facet} in Sohna Road Gurgaon`,
        `${facet} in Cyber City Gurgaon`,
        `${facet} in Sector 56 Gurgaon`,
        `gurgaon mein ${lcFacet}`,
        `${lcFacet} gurugram`,
        `${lcFacet} गुड़गाँव`,
        `${facet} for ${validIntent} in गुड़गाँव`,
      ]
    : [];

  return [...localityPhrases, ...Array.from(new Set(basePhrases)), ...BRAND_KEYWORDS].join(', ');
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

  // Task #5: Hindi BHK synonyms map
  const BHK_HINDI_MAP = { '1 BHK': '1 बीएचके', '2 BHK': '2 बीएचके', '3 BHK': '3 बीएचके' };
  const hindiBhkSyn = isBhk && BHK_HINDI_MAP[bhkText] ? [BHK_HINDI_MAP[bhkText]] : [];

  // Task #5: Hinglish BHK action phrase
  const hinglishBhkPhrase =
    isBhk
      ? validIntent === 'rent'
        ? `${bhkText} ${lcFacet} kiraye par ${validCity}`
        : `${bhkText} ${lcFacet} kharidna ${validCity}`
      : null;

  const base = [
    `${facetText} for ${validIntent} in ${validCity}`,
    ...tSyn.flatMap((t) => iSyn.map((i) => `${t} ${i} ${validCity}`)),
    ...bhkSyn.map((b) => `${b} ${lcFacet} ${validIntent} in ${validCity}`),
    ...hindiBhkSyn.map((b) => `${b} ${lcFacet} ${validIntent} in ${validCity}`),
    hinglishBhkPhrase,
    ...budgetSyn.map((b) => `${lcFacet} ${validIntent} ${b} in ${validCity}`),
    isAmenity ? `${pretty(amenity)} ${lcFacet} ${validIntent} in ${validCity}` : null,
    'near metro', 'pet friendly', 'ready to move', 'no broker',
    ...BRAND_KEYWORDS,
  ];

  return Array.from(new Set(base.filter(Boolean))).join(', ');
};
