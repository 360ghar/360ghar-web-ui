import { normalizePropertySearchFilters } from '../utils/propertyTaxonomy';

export const DEFAULT_PROPERTY_FILTERS = {
  q: '',
  property_type: [],
  purpose: '',
  price_min: null,
  price_max: null,
  bedrooms_min: null,
  bedrooms_max: null,
  bathrooms_min: null,
  bathrooms_max: null,
  area_min: null,
  area_max: null,
  city: '',
  locality: '',
  pincode: '',
  lat: null,
  lng: null,
  radius: 20,
  amenities: [],
  features: [],
  parking_spaces_min: null,
  floor_number_min: null,
  floor_number_max: null,
  age_max: null,
  check_in: '',
  check_out: '',
  guests: null,
  gender_preference: '',
  sharing_type: '',
  sort_by: 'newest',
  limit: 12,
};

export const PROPERTY_FILTER_NUMBER_KEYS = new Set([
  'price_min',
  'price_max',
  'bedrooms_min',
  'bedrooms_max',
  'bathrooms_min',
  'bathrooms_max',
  'area_min',
  'area_max',
  'lat',
  'lng',
  'radius',
  'parking_spaces_min',
  'floor_number_min',
  'floor_number_max',
  'age_max',
  'guests',
  'bhk',
  'limit',
]);

export const cloneDefaultPropertyFilters = () => ({
  ...DEFAULT_PROPERTY_FILTERS,
  property_type: [...DEFAULT_PROPERTY_FILTERS.property_type],
  amenities: [...DEFAULT_PROPERTY_FILTERS.amenities],
  features: [...DEFAULT_PROPERTY_FILTERS.features],
});

export const cleanPropertyFilters = (filters = {}) => {
  const normalizedFilters = normalizePropertySearchFilters(filters);
  const cleaned = {};

  Object.entries(normalizedFilters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    if (Array.isArray(value)) {
      if (value.length > 0) cleaned[key] = value;
      return;
    }
    cleaned[key] = value;
  });

  return cleaned;
};

export const buildPropertySearchParams = (filters = {}, cursor = null, limit = 12) => {
  const params = new URLSearchParams();
  params.set('limit', String(limit));

  // Cursor tokens are opaque base64 strings returned by a prior `next_cursor`.
  // Omit on the first page (cursor is null/undefined/empty).
  if (cursor) {
    params.set('cursor', String(cursor));
  }

  const cleaned = cleanPropertyFilters(filters);
  const appendArray = (key, values) => values.forEach((value) => params.append(key, String(value)));
  const setIfPresent = (key, value) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  };

  setIfPresent('lat', cleaned.latitude ?? cleaned.lat);
  setIfPresent('lng', cleaned.longitude ?? cleaned.lng);
  setIfPresent('radius', cleaned.radius_km ?? cleaned.radius);
  setIfPresent('q', cleaned.searchKeyword ?? cleaned.q);
  setIfPresent('purpose', cleaned.purpose);

  const propertyTypes = cleaned.property_type ?? cleaned.property_types;
  if (Array.isArray(propertyTypes)) appendArray('property_type', propertyTypes);
  else setIfPresent('property_type', propertyTypes);

  setIfPresent('price_min', cleaned.min_price ?? cleaned.price_min);
  setIfPresent('price_max', cleaned.max_price ?? cleaned.price_max);
  setIfPresent('bedrooms_min', cleaned.bedrooms_min ?? cleaned.bedrooms);
  setIfPresent('bedrooms_max', cleaned.bedrooms_max);
  setIfPresent('bathrooms_min', cleaned.bathrooms_min ?? cleaned.bathrooms);
  setIfPresent('bathrooms_max', cleaned.bathrooms_max);
  setIfPresent('area_min', cleaned.min_area ?? cleaned.area_min);
  setIfPresent('area_max', cleaned.max_area ?? cleaned.area_max);
  setIfPresent('city', cleaned.city);
  setIfPresent('locality', cleaned.locality);
  setIfPresent('pincode', cleaned.zip_code ?? cleaned.pincode);

  if (Array.isArray(cleaned.amenities)) appendArray('amenities', cleaned.amenities);
  else setIfPresent('amenities', cleaned.amenities);

  if (Array.isArray(cleaned.features)) appendArray('features', cleaned.features);
  else setIfPresent('features', cleaned.features);

  setIfPresent('parking_spaces_min', cleaned.parking_spaces_min);
  setIfPresent('floor_number_min', cleaned.floor_number_min);
  setIfPresent('floor_number_max', cleaned.floor_number_max);
  setIfPresent('age_max', cleaned.age_max);
  setIfPresent('check_in', cleaned.check_in);
  setIfPresent('check_out', cleaned.check_out);
  setIfPresent('guests', cleaned.guests);
  setIfPresent('gender_preference', cleaned.gender_preference);
  setIfPresent('sharing_type', cleaned.sharing_type);
  setIfPresent('sort_by', cleaned.sort_by);

  return params;
};

export const parsePropertySearchParams = (searchParams) => {
  const parsed = {};
  const arrayKeys = new Set(['property_type', 'amenities', 'features']);

  for (const [key, value] of searchParams.entries()) {
    // Cursor pagination: `page`/`offset` are legacy params from the old
    // page-based contract and are intentionally ignored. The new contract
    // uses an opaque `cursor` token that is not a filter and is managed in
    // component state, so we never parse it into the filter object.
    if (key === 'page' || key === 'offset' || key === 'cursor') {
      continue;
    }

    if (arrayKeys.has(key)) {
      parsed[key] = searchParams.getAll(key);
      continue;
    }

    if (PROPERTY_FILTER_NUMBER_KEYS.has(key)) {
      const numericValue = Number(value);
      if (!Number.isNaN(numericValue)) parsed[key] = numericValue;
      continue;
    }

    parsed[key] = value;
  }

  return cleanPropertyFilters(parsed);
};

export const buildPropertySearchQuery = (filters = {}) =>
  buildPropertySearchParams(
    filters,
    null,
    filters.limit ?? DEFAULT_PROPERTY_FILTERS.limit
  ).toString();
