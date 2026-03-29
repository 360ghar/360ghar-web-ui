import { create } from 'zustand';
import propertyService from '../services/propertyService';
import { propertyAPIService } from '../services/propertyAPIService';
import swipeService from '../services/swipeService';
import { cleanPropertyFilters, cloneDefaultPropertyFilters } from '../utils/propertyFilters';
import { extractError } from '../utils/apiError';

const usePropertyStore = create((set, get) => ({
  // State
  properties: [],
  recommendations: [],
  likedProperties: [],
  userProperties: [],
  currentProperty: null,
  propertyMedia: [],
  pagination: { page: 1, totalPages: 1, total: 0, limit: 12 },
  // Comprehensive filters matching API documentation
  filters: cloneDefaultPropertyFilters(),
  
  // Track if filters have changed since last search
  filtersChanged: false,

  isLoading: false,        // Main page-level loading (fetch properties, fetch by ID)
  isSwipeLoading: false,   // Background swipe operations (won't block page UI)
  error: null,
  
  // Actions
  // Public search using propertyAPIService (no auth)
  fetchProperties: async (overrideFilters = {}, page = null, limit = null) => {
    try {
      set({ isLoading: true, error: null });
      const state = get();
      
      // Merge current filters with any overrides
      const searchFilters = { ...state.filters, ...overrideFilters };
      
      // Use provided page/limit or defaults from filters
      const searchPage = page || searchFilters.page || 1;
      const searchLimit = limit || searchFilters.limit || 12;
      
      // Clean up null/undefined/empty values for API call
      const cleanFilters = cleanPropertyFilters(searchFilters);

      const response = await propertyAPIService.searchProperties(cleanFilters, searchPage, searchLimit);
      const payload = response.data || {};
      
      set({
        properties: payload.properties || payload.items || [],
        pagination: {
          page: payload.page || searchPage,
          totalPages: payload.total_pages || payload.totalPages || 1,
          total: payload.total || 0,
          limit: payload.limit || searchLimit,
        },
        filters: {
          ...state.filters,
          page: payload.page || searchPage,
        },
        filtersChanged: false, // Mark as applied
        isLoading: false,
      });
      
      return payload;
    } catch (error) {
      set({
        isLoading: false,
        error: extractError(error, 'Failed to fetch properties')
      });
      return { items: [], properties: [] };
    }
  },

  // Swipe actions (auth required) - use isSwipeLoading to avoid blocking page UI
  recordSwipe: async (propertyId, isLiked = true) => {
    try {
      set({ isSwipeLoading: true });
      await swipeService.recordSwipe({ property_id: propertyId, is_liked: isLiked });
      // Optimistically update liked flag on current lists
      set((state) => ({
        properties: state.properties.map((p) => (p.id === propertyId ? { ...p, is_liked: isLiked } : p)),
        currentProperty: state.currentProperty?.id === propertyId ? { ...state.currentProperty, is_liked: isLiked } : state.currentProperty,
        isSwipeLoading: false,
      }));
      return true;
    } catch (error) {
      set({ isSwipeLoading: false, error: extractError(error, 'Failed to record swipe') });
      return false;
    }
  },

  fetchLikedProperties: async (filters = {}) => {
    try {
      set({ isSwipeLoading: true });
      const params = { ...filters, is_liked: true };
      const data = await swipeService.getSwipes(params);
      const items = data?.properties || [];
      set({ likedProperties: items, isSwipeLoading: false });
      return items;
    } catch (error) {
      set({ isSwipeLoading: false, error: extractError(error, 'Failed to load liked properties') });
      return [];
    }
  },

  undoLastSwipe: async () => {
    try {
      set({ isSwipeLoading: true });
      await swipeService.undoLast();
      set({ isSwipeLoading: false });
      return true;
    } catch (error) {
      set({ isSwipeLoading: false, error: extractError(error, 'Failed to undo swipe') });
      return false;
    }
  },

  getSwipeStats: async () => {
    try {
      set({ isSwipeLoading: true });
      const data = await swipeService.stats();
      set({ isSwipeLoading: false });
      return data;
    } catch (error) {
      set({ isSwipeLoading: false, error: extractError(error, 'Failed to fetch swipe stats') });
      return null;
    }
  },
  
  // Apply current filters and fetch properties
  applyFilters: async () => {
    const state = get();
    return await state.fetchProperties();
  },

  // Home recommendations
  fetchRecommendations: async (limit = 6) => {
    try {
      set({ isLoading: true, error: null });
      const response = await propertyAPIService.getRecommendations(limit);
      const list = response.data || [];
      set({ recommendations: Array.isArray(list) ? list : (list.items || []), isLoading: false });
      return list;
    } catch (error) {
      set({ isLoading: false, error: extractError(error, 'Failed to fetch recommendations') });
      return [];
    }
  },
  
  getUserProperties: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await propertyService.getUserProperties();
      set({
        userProperties: data,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({
        isLoading: false,
        error: extractError(error, 'Failed to fetch your properties')
      });
      return [];
    }
  },
  
  // Public property details (no auth required)
  fetchPropertyById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await propertyAPIService.getPropertyById(id);
      const property = response.data;
      // Images are included in the property response; no additional media fetch required
      const media = Array.isArray(property?.images) ? property.images : [];
      
      set({
        currentProperty: property,
        propertyMedia: media,
        isLoading: false,
      });
      return property;
    } catch (error) {
      set({
        isLoading: false,
        error: extractError(error, 'Failed to fetch property details')
      });
      return null;
    }
  },
  
  createProperty: async (propertyData) => {
    try {
      set({ isLoading: true, error: null });
      const newProperty = await propertyService.createProperty(propertyData);
      set(state => ({
        userProperties: [...state.userProperties, newProperty],
        isLoading: false,
      }));
      return newProperty;
    } catch (error) {
      set({
        isLoading: false,
        error: extractError(error, 'Failed to create property')
      });
      return null;
    }
  },
  
  updateProperty: async (id, propertyData) => {
    try {
      set({ isLoading: true, error: null });
      const updatedProperty = await propertyService.updateProperty(id, propertyData);
      
      // Update in both properties and userProperties arrays
      set(state => ({
        userProperties: state.userProperties.map(prop => 
          prop.id === id ? updatedProperty : prop
        ),
        properties: state.properties.map(prop => 
          prop.id === id ? updatedProperty : prop
        ),
        currentProperty: state.currentProperty?.id === id ? updatedProperty : state.currentProperty,
        isLoading: false,
      }));
      
      return updatedProperty;
    } catch (error) {
      set({
        isLoading: false,
        error: extractError(error, 'Failed to update property')
      });
      return null;
    }
  },
  
  deleteProperty: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await propertyService.deleteProperty(id);
      
      // Remove from both properties and userProperties arrays
      set(state => ({
        userProperties: state.userProperties.filter(prop => prop.id !== id),
        properties: state.properties.filter(prop => prop.id !== id),
        currentProperty: state.currentProperty?.id === id ? null : state.currentProperty,
        isLoading: false,
      }));
      
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: extractError(error, 'Failed to delete property')
      });
      return false;
    }
  },
  
  setFilters: (newFilters) => {
    set(state => ({
      filters: {
        ...state.filters,
        ...newFilters
      },
      filtersChanged: true
    }));
  },
  
  // Update individual filter
  updateFilter: (key, value) => {
    set(state => ({
      filters: {
        ...state.filters,
        [key]: value
      },
      filtersChanged: true
    }));
  },
  
  // Clear all filters
  clearFilters: () => {
    set({
      filters: cloneDefaultPropertyFilters(),
      filtersChanged: true
    });
  },
  
  // Mark filters as applied (called after successful fetch)
  markFiltersApplied: () => {
    set({ filtersChanged: false });
  },
  
  // Get active filters count for UI badge
  getActiveFiltersCount: () => {
    const state = get();
    const filters = state.filters;
    let count = 0;
    
    // Count non-empty filters
    if (filters.q) count++;
    if (filters.property_type?.length > 0) count++;
    if (filters.purpose) count++;
    if (filters.price_min !== null) count++;
    if (filters.price_max !== null) count++;
    if (filters.bedrooms_min !== null) count++;
    if (filters.bedrooms_max !== null) count++;
    if (filters.bathrooms_min !== null) count++;
    if (filters.bathrooms_max !== null) count++;
    if (filters.area_min !== null) count++;
    if (filters.area_max !== null) count++;
    if (filters.city) count++;
    if (filters.locality) count++;
    if (filters.pincode) count++;
    if (filters.amenities?.length > 0) count++;
    if (filters.features?.length > 0) count++;
    if (filters.parking_spaces_min !== null) count++;
    if (filters.floor_number_min !== null) count++;
    if (filters.floor_number_max !== null) count++;
    if (filters.age_max !== null) count++;
    if (filters.check_in) count++;
    if (filters.check_out) count++;
    if (filters.guests !== null) count++;
    if (filters.gender_preference) count++;
    if (filters.sharing_type) count++;
    
    return count;
  },
  
  clearCurrentProperty: () => {
    set({
      currentProperty: null,
      propertyMedia: [],
    });
  },
  
  clearError: () => set({ error: null }),
}));

export { usePropertyStore };
