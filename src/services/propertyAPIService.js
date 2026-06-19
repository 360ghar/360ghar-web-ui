import { publicApi } from './api';
import { buildPropertySearchParams } from '../utils/propertyFilters';

/**
 * Searches for properties based on filters, location, and cursor pagination.
 * Corresponds to: GET /properties/
 * NO AUTHENTICATION REQUIRED
 *
 * The backend now returns a uniform cursor-paginated payload:
 *   { items: [...], next_cursor: "<base64>"|null, has_more: bool, limit: int }
 * `cursor` is an opaque base64 token returned by a prior `next_cursor`. Pass
 * null/undefined on the first page. Detect end-of-list via `has_more === false`
 * or `next_cursor === null`.
 *
 * @param {object} filters - Property filter params.
 * @param {string|null} cursor - Opaque cursor token from a prior next_cursor.
 * @param {number} limit - Page size (1-100, default 20).
 */
const searchProperties = (filters = {}, cursor = null, limit = 12) => {
  const params = buildPropertySearchParams(filters, cursor, limit);
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
