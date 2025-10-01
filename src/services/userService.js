import api from './api';

export const userService = {
  // Current user profile
  getProfile: async () => {
    const response = await api.get('/users/profile/');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile/', profileData);
    return response.data;
  },
  updatePreferences: async (preferences) => {
    const response = await api.put('/users/preferences/', preferences);
    return response.data;
  },
  updateLocation: async (location) => {
    const response = await api.put('/users/location/', location);
    return response.data;
  },

  // Agents
  getAssignedAgent: async () => {
    const response = await api.get('/agents/assigned/');
    return response.data;
  },

  // Admin (placeholders/backward compatibility)
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
};

export default userService; 