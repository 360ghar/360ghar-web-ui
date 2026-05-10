export const COMMERCIAL_PROPERTY_TYPES = ['office', 'shop', 'warehouse'];

export const CANONICAL_PROPERTY_TYPES = [
  'house',
  'apartment',
  'builder_floor',
  'room',
  'villa',
  'plot',
  'condo',
  'penthouse',
  'studio',
  'loft',
  'pg',
  'flatmate',
  ...COMMERCIAL_PROPERTY_TYPES,
];

export const PURPOSE_OPTIONS = [
  { value: '', label: 'All', labelKey: 'properties:taxonomy.purpose.all' },
  { value: 'buy', label: 'For Sale', labelKey: 'properties:taxonomy.purpose.buy' },
  { value: 'rent', label: 'For Rent', labelKey: 'properties:taxonomy.purpose.rent' },
  { value: 'short_stay', label: 'Short Stay', labelKey: 'properties:taxonomy.purpose.short_stay' },
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'house', label: 'House', labelKey: 'properties:taxonomy.propertyType.house' },
  { value: 'apartment', label: 'Apartment', labelKey: 'properties:taxonomy.propertyType.apartment' },
  { value: 'builder_floor', label: 'Builder Floor', labelKey: 'properties:taxonomy.propertyType.builder_floor' },
  { value: 'room', label: 'Room', labelKey: 'properties:taxonomy.propertyType.room' },
  { value: 'villa', label: 'Villa', labelKey: 'properties:taxonomy.propertyType.villa' },
  { value: 'plot', label: 'Plot / Land', labelKey: 'properties:taxonomy.propertyType.plot' },
  { value: 'condo', label: 'Condo', labelKey: 'properties:taxonomy.propertyType.condo' },
  { value: 'penthouse', label: 'Penthouse', labelKey: 'properties:taxonomy.propertyType.penthouse' },
  { value: 'studio', label: 'Studio', labelKey: 'properties:taxonomy.propertyType.studio' },
  { value: 'loft', label: 'Loft', labelKey: 'properties:taxonomy.propertyType.loft' },
  { value: 'pg', label: 'PG', labelKey: 'properties:taxonomy.propertyType.pg' },
  { value: 'flatmate', label: 'Flatmate', labelKey: 'properties:taxonomy.propertyType.flatmate' },
  { value: 'office', label: 'Office', labelKey: 'properties:taxonomy.propertyType.office' },
  { value: 'shop', label: 'Shop', labelKey: 'properties:taxonomy.propertyType.shop' },
  { value: 'warehouse', label: 'Warehouse', labelKey: 'properties:taxonomy.propertyType.warehouse' },
];

export const PROPERTY_TYPE_FILTER_OPTIONS = [
  { value: 'apartment', label: 'Apartment', labelKey: 'properties:taxonomy.propertyType.apartment' },
  { value: 'house', label: 'House', labelKey: 'properties:taxonomy.propertyType.house' },
  { value: 'builder_floor', label: 'Builder Floor', labelKey: 'properties:taxonomy.propertyType.builder_floor' },
  { value: 'room', label: 'Room', labelKey: 'properties:taxonomy.propertyType.room' },
  { value: 'villa', label: 'Villa', labelKey: 'properties:taxonomy.propertyType.villa' },
  { value: 'plot', label: 'Plot / Land', labelKey: 'properties:taxonomy.propertyType.plot' },
  { value: 'pg', label: 'PG', labelKey: 'properties:taxonomy.propertyType.pg' },
  { value: 'flatmate', label: 'Flatmate', labelKey: 'properties:taxonomy.propertyType.flatmate' },
  { value: 'commercial', label: 'Commercial', labelKey: 'properties:taxonomy.propertyType.commercial' },
];

export const GENDER_PREFERENCE_OPTIONS = [
  { value: '', label: 'Any gender', labelKey: 'properties:taxonomy.genderPreference.any' },
  { value: 'any', label: 'Open to all', labelKey: 'properties:taxonomy.genderPreference.open' },
  { value: 'male', label: 'Male only', labelKey: 'properties:taxonomy.genderPreference.male' },
  { value: 'female', label: 'Female only', labelKey: 'properties:taxonomy.genderPreference.female' },
];

export const SHARING_TYPE_OPTIONS = [
  { value: '', label: 'Any room type', labelKey: 'properties:taxonomy.sharingType.any' },
  { value: 'private_room', label: 'Private room', labelKey: 'properties:taxonomy.sharingType.private_room' },
  { value: 'shared_room', label: 'Shared room', labelKey: 'properties:taxonomy.sharingType.shared_room' },
];

const PROPERTY_TYPE_ALIASES = {
  apartment: ['apartment'],
  apartments: ['apartment'],
  'apartment flat': ['apartment'],
  'apartment/flat': ['apartment'],
  flat: ['apartment'],
  flats: ['apartment'],
  house: ['house'],
  houses: ['house'],
  'independent-house': ['house'],
  'independent house': ['house'],
  villa: ['villa'],
  plot: ['plot'],
  'plot / land': ['plot'],
  'plot land': ['plot'],
  plots: ['plot'],
  land: ['plot'],
  'residential land': ['plot'],
  'commercial land': ['plot'],
  condo: ['condo'],
  penthouse: ['penthouse'],
  studio: ['studio'],
  loft: ['loft'],
  room: ['room'],
  rooms: ['room'],
  'builder-floor': ['builder_floor'],
  'builder floor': ['builder_floor'],
  builder_floor: ['builder_floor'],
  floor: ['builder_floor'],
  pg: ['pg'],
  'paying guest': ['pg'],
  'co living': ['pg'],
  'co-living': ['pg'],
  coliving: ['pg'],
  hostel: ['pg'],
  flatmate: ['flatmate'],
  roommate: ['flatmate'],
  office: ['office'],
  'office space': ['office'],
  'office-space': ['office'],
  shop: ['shop'],
  shops: ['shop'],
  showroom: ['shop'],
  'retail shop': ['shop'],
  warehouse: ['warehouse'],
  warehouses: ['warehouse'],
  commercial: COMMERCIAL_PROPERTY_TYPES,
};

const BUDGET_ALIASES = {
  'under-10k': { price_max: 10000 },
  'under-15k': { price_max: 15000 },
  'under-20k': { price_max: 20000 },
  'under-50-lakhs': { price_max: 5000000 },
  'under-80-lakhs': { price_max: 8000000 },
  'under-1-crore': { price_max: 10000000 },
};

const normalizeToken = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
};

export const normalizePropertyTypeToken = (value) => {
  const normalized = normalizeToken(value);
  if (!normalized || normalized === 'all') return [];
  const resolved = PROPERTY_TYPE_ALIASES[normalized];
  if (resolved) return [...resolved];
  return CANONICAL_PROPERTY_TYPES.includes(normalized) ? [normalized] : [];
};

export const normalizePropertyTypes = (values = []) =>
  Array.from(
    new Set(
      toArray(values).flatMap((value) => normalizePropertyTypeToken(value))
    )
  );

export const isCommercialSelection = (propertyTypes = []) =>
  COMMERCIAL_PROPERTY_TYPES.every((type) => propertyTypes.includes(type));

export const includesPgOrFlatmateType = (propertyTypes = []) =>
  propertyTypes.some((type) => type === 'pg' || type === 'flatmate');

export const getPropertyTypeLabel = (propertyType, t) => {
  if (t) {
    const key = `properties:taxonomy.propertyType.${propertyType}`;
    const translated = t(key);
    if (translated !== key) return translated;
  }
  const labels = {
    house: 'House',
    apartment: 'Apartment',
    builder_floor: 'Builder Floor',
    room: 'Room',
    villa: 'Villa',
    plot: 'Plot / Land',
    condo: 'Condo',
    penthouse: 'Penthouse',
    studio: 'Studio',
    loft: 'Loft',
    pg: 'PG',
    flatmate: 'Flatmate',
    office: 'Office',
    shop: 'Shop',
    warehouse: 'Warehouse',
    commercial: 'Commercial',
  };
  return labels[propertyType] || String(propertyType || 'Property');
};

export const getPropertyRouteSlug = (propertyType, intent = 'buy') => {
  if (intent === 'pg') return 'flats';

  const routeSlugs = {
    apartment: 'flats',
    house: 'independent-house',
    builder_floor: 'builder-floor',
    plot: 'plots',
    office: 'office-space',
  };

  return routeSlugs[propertyType] || String(propertyType || 'flats').replace(/_/g, '-');
};

export const getListingLabel = ({ propertyType, purpose }, t) => {
  if (t) {
    if (propertyType === 'pg') return t('properties:taxonomy.listingLabel.pg');
    if (propertyType === 'flatmate') return t('properties:taxonomy.listingLabel.flatmate');
    if (purpose === 'rent') return t('properties:taxonomy.listingLabel.rent');
    if (purpose === 'buy' || purpose === 'sale') return t('properties:taxonomy.listingLabel.buy');
    if (purpose === 'short_stay') return t('properties:taxonomy.listingLabel.short_stay');
  }
  if (propertyType === 'pg') return 'PG';
  if (propertyType === 'flatmate') return 'Flatmate';
  if (purpose === 'rent') return 'For Rent';
  if (purpose === 'buy' || purpose === 'sale') return 'For Sale';
  if (purpose === 'short_stay') return 'Short Stay';
  return null;
};

export const getListingSchemaType = ({ propertyType, purpose }) => {
  if (propertyType === 'pg' || propertyType === 'flatmate' || purpose === 'rent') {
    return 'forRent';
  }
  if (purpose === 'short_stay') return 'forRent';
  return 'forSale';
};

export const getAccommodationSchemaType = (propertyType) => {
  if (propertyType === 'house' || propertyType === 'villa') {
    return 'SingleFamilyResidence';
  }

  if (
    ['apartment', 'builder_floor', 'condo', 'penthouse', 'studio', 'loft'].includes(
      propertyType
    )
  ) {
    return 'Apartment';
  }

  return 'Accommodation';
};

export const normalizePurposeToken = (value) => {
  const normalized = normalizeToken(value);
  if (!normalized || normalized === 'all') return '';
  if (normalized === 'sale') return 'buy';
  if (normalized === 'short stay') return 'short_stay';
  if (normalized === 'pg') return 'rent';
  if (['buy', 'rent', 'short_stay'].includes(normalized)) return normalized;
  return '';
};

export const normalizePropertySearchFilters = (filters = {}) => {
  const normalized = { ...filters };

  const derivedPurpose = normalizePurposeToken(normalized.intent || normalized.purpose);
  normalized.purpose = derivedPurpose || '';

  const propertyTypes = normalizePropertyTypes([
    ...toArray(normalized.property_type),
    ...toArray(normalized.property_types),
    ...toArray(normalized.type),
    ...(normalizeToken(normalized.intent) === 'pg' ? ['pg'] : []),
  ]);
  normalized.property_type = propertyTypes;

  const bhkValue = normalized.bhk;
  if (bhkValue !== undefined && bhkValue !== null && bhkValue !== '') {
    const parsedBhk = parseInt(String(bhkValue), 10);
    if (!Number.isNaN(parsedBhk) && parsedBhk > 0) {
      normalized.bedrooms_min = parsedBhk;
      normalized.bedrooms_max = parsedBhk >= 4 ? null : parsedBhk;
    }
  }

  const budgetFilter = BUDGET_ALIASES[String(normalized.budget || '').toLowerCase()];
  if (budgetFilter) {
    if (normalized.price_min === null || normalized.price_min === undefined || normalized.price_min === '') {
      normalized.price_min = budgetFilter.price_min ?? normalized.price_min;
    }
    if (normalized.price_max === null || normalized.price_max === undefined || normalized.price_max === '') {
      normalized.price_max = budgetFilter.price_max ?? normalized.price_max;
    }
  }

  if (normalized.amenity) {
    const amenities = Array.isArray(normalized.amenities) ? [...normalized.amenities] : [];
    if (!amenities.includes(normalized.amenity)) amenities.push(normalized.amenity);
    normalized.amenities = amenities;
  }

  const genderPreference = normalizeToken(normalized.gender_preference);
  normalized.gender_preference =
    genderPreference && ['any', 'male', 'female'].includes(genderPreference)
      ? genderPreference
      : '';

  const sharingType = normalizeToken(normalized.sharing_type).replace(/\s+/g, '_');
  normalized.sharing_type =
    sharingType && ['private_room', 'shared_room'].includes(sharingType)
      ? sharingType
      : '';

  delete normalized.intent;
  delete normalized.property_types;
  delete normalized.type;
  delete normalized.bhk;
  delete normalized.budget;
  delete normalized.amenity;

  return normalized;
};
