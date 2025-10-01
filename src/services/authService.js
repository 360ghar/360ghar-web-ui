import api from './api';

export const authService = {
  // Login user and get token (API expects phone + password)
  login: async (phone, password) => {
    const payload = {
      phone, // API expects phone number in format: +919876543210
      password,
    };
    const response = await api.post('/auth/login/', payload);
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/users/profile/');
    return response.data;
  },

  // Update current user profile
  updateCurrentUser: async (userData) => {
    const response = await api.put('/users/profile/', userData);
    return response.data;
  },

  // Logout - clear localStorage
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService; 