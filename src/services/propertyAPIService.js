import { publicApi } from './api';
import { buildPropertySearchParams } from '../utils/propertyFilters';

/**
 * Searches for properties based on filters, location, and pagination.
 * Corresponds to: GET /properties/
 * NO AUTHENTICATION REQUIRED
 */
const searchProperties = (filters = {}, page = 1, limit = 12) => {
  const params = buildPropertySearchParams(filters, page, limit);
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
