import api from './api';

/**
 * Property-visit service. All endpoints require auth (Supabase bearer token).
 *
 * The list endpoints (`getAll`, `getUpcoming`, `getPast`) accept an optional
 * `params` object that is forwarded to axios as the query string — the
 * backend uses cursor pagination (`?cursor=...&limit=...`) and returns an
 * envelope `{ items, next_cursor, has_more, ... }`.
 */
export const visitService = {
  schedule: async ({ property_id, scheduled_date, special_requirements }) => {
    const response = await api.post('/visits/', { property_id, scheduled_date, special_requirements });
    return response.data;
  },
  getAll: async (params = {}) => {
    const response = await api.get('/visits/', { params });
    return response.data;
  },
  getUpcoming: async (params = {}) => {
    const response = await api.get('/visits/upcoming', { params });
    return response.data;
  },
  getPast: async (params = {}) => {
    const response = await api.get('/visits/past', { params });
    return response.data;
  },
  getById: async (visitId) => {
    const response = await api.get(`/visits/${visitId}`);
    return response.data;
  },
  update: async (visitId, data) => {
    const response = await api.put(`/visits/${visitId}`, data);
    return response.data;
  },
  reschedule: async (visitId, data) => {
    const response = await api.post(`/visits/${visitId}/reschedule`, data);
    return response.data;
  },
  cancel: async (visitId, data) => {
    const response = await api.post(`/visits/${visitId}/cancel`, data);
    return response.data;
  },
};

