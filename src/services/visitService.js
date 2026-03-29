import api from './api';

export const visitService = {
  schedule: async ({ property_id, scheduled_date, special_requirements }) => {
    const response = await api.post('/visits/', { property_id, scheduled_date, special_requirements });
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/visits/');
    return response.data;
  },
  getUpcoming: async () => {
    const response = await api.get('/visits/upcoming');
    return response.data;
  },
  getPast: async () => {
    const response = await api.get('/visits/past');
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

