import { createAxiosInstance } from './http';

// Create a separate axios instance for public property endpoints (no auth required)
const publicApi = createAxiosInstance({ withAuth: false });

// Simple error handling for public endpoints - no auth redirects
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // For public endpoints, just return the error without auth handling
    return Promise.reject(error);
  }
);

// Map frontend filters to backend query params for GET /properties/
function buildSearchParams(filters = {}, page = 1, limit = 12) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  const isNonEmpty = (v) => v !== undefined && v !== null && v !== '';

  // Location-based Search
  if (isNonEmpty(filters.latitude) || isNonEmpty(filters.lat)) params.set('lat', String(filters.latitude || filters.lat));
  if (isNonEmpty(filters.longitude) || isNonEmpty(filters.lng)) params.set('lng', String(filters.longitude || filters.lng));
  if (isNonEmpty(filters.radius_km) || isNonEmpty(filters.radius)) params.set('radius', String(filters.radius_km || filters.radius));

  // Text Search
  if (isNonEmpty(filters.q) || isNonEmpty(filters.searchKeyword)) params.set('q', String(filters.q || filters.searchKeyword));

  // Property Filters
  if (isNonEmpty(filters.purpose)) params.set('purpose', String(filters.purpose));

  // Property types - handle both array and single value
  const types = filters.property_type || filters.property_types;
  if (Array.isArray(types)) {
    types.forEach((t) => params.append('property_type', t));
  } else if (isNonEmpty(types)) {
    params.append('property_type', String(types));
  }

  // Price Filters
  if (isNonEmpty(filters.min_price) || isNonEmpty(filters.price_min)) params.set('price_min', String(filters.min_price || filters.price_min));
  if (isNonEmpty(filters.max_price) || isNonEmpty(filters.price_max)) params.set('price_max', String(filters.max_price || filters.price_max));

  // Room Filters
  if (isNonEmpty(filters.bedrooms_min)) params.set('bedrooms_min', String(filters.bedrooms_min));
  else if (isNonEmpty(filters.bedrooms)) params.set('bedrooms_min', String(filters.bedrooms));
  if (isNonEmpty(filters.bedrooms_max)) params.set('bedrooms_max', String(filters.bedrooms_max));

  if (isNonEmpty(filters.bathrooms_min)) params.set('bathrooms_min', String(filters.bathrooms_min));
  else if (isNonEmpty(filters.bathrooms)) params.set('bathrooms_min', String(filters.bathrooms));
  if (isNonEmpty(filters.bathrooms_max)) params.set('bathrooms_max', String(filters.bathrooms_max));

  // Area Filters
  if (isNonEmpty(filters.min_area) || isNonEmpty(filters.area_min)) params.set('area_min', String(filters.min_area || filters.area_min));
  if (isNonEmpty(filters.max_area) || isNonEmpty(filters.area_max)) params.set('area_max', String(filters.max_area || filters.area_max));

  // Location Filters
  if (isNonEmpty(filters.city)) params.set('city', String(filters.city));
  if (isNonEmpty(filters.locality)) params.set('locality', String(filters.locality));
  if (isNonEmpty(filters.zip_code) || isNonEmpty(filters.pincode)) params.set('pincode', String(filters.zip_code || filters.pincode));

  // Additional Filters
  if (Array.isArray(filters.amenities)) {
    filters.amenities.forEach((a) => params.append('amenities', a));
  } else if (isNonEmpty(filters.amenities)) {
    params.append('amenities', String(filters.amenities));
  }

  if (Array.isArray(filters.features)) {
    filters.features.forEach((f) => params.append('features', f));
  } else if (isNonEmpty(filters.features)) {
    params.append('features', String(filters.features));
  }

  if (isNonEmpty(filters.parking_spaces_min)) params.set('parking_spaces_min', String(filters.parking_spaces_min));
  if (isNonEmpty(filters.floor_number_min)) params.set('floor_number_min', String(filters.floor_number_min));
  if (isNonEmpty(filters.floor_number_max)) params.set('floor_number_max', String(filters.floor_number_max));
  if (isNonEmpty(filters.age_max)) params.set('age_max', String(filters.age_max));

  // Short Stay Filters
  if (isNonEmpty(filters.check_in)) params.set('check_in', String(filters.check_in));
  if (isNonEmpty(filters.check_out)) params.set('check_out', String(filters.check_out));
  if (isNonEmpty(filters.guests)) params.set('guests', String(filters.guests));

  // Sorting & Pagination
  if (isNonEmpty(filters.sort_by)) params.set('sort_by', String(filters.sort_by));

  return params;
}

/**
 * Searches for properties based on filters, location, and pagination.
 * Corresponds to: GET /properties/
 * NO AUTHENTICATION REQUIRED
 */
const searchProperties = (filters = {}, page = 1, limit = 12) => {
  const params = buildSearchParams(filters, page, limit);
  return publicApi.get(`/properties/?${params.toString()}`);
};

/**
 * Fetches the details for a single property by its ID.
 * Corresponds to: GET /properties/{property_id}
 * NO AUTHENTICATION REQUIRED
 * @param {number} propertyId - The ID of the property.
 * @returns {Promise<object>} The property data.
 */
const getPropertyById = (propertyId) => {
  return publicApi.get(`/properties/${propertyId}`);
};

/**
 * Fetches recommended properties for the homepage.
 * Corresponds to: GET /properties/recommendations
 * NO AUTHENTICATION REQUIRED
 * @param {number} limit - The maximum number of recommendations to fetch.
 * @returns {Promise<array>} A list of recommended properties.
 */
const getRecommendations = (limit = 6) => {
  return publicApi.get(`/properties/recommendations/?limit=${limit}`);
};

export const propertyAPIService = {
  searchProperties,
  getPropertyById,
  getRecommendations,
};
