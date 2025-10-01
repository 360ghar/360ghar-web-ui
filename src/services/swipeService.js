import api from './api';

// Auth-required swipe actions
export const swipeService = {
  // Record a swipe (like/dislike)
  recordSwipe: async ({ property_id, is_liked }) => {
    const response = await api.post('/swipes/', { property_id, is_liked });
    return response.data;
  },

  // Get swipe history with optional filters
  getSwipes: async (params = {}) => {
    const response = await api.get('/swipes/', { params });
    return response.data;
  },

  // Undo last swipe
  undoLast: async () => {
    const response = await api.delete('/swipes/undo/');
    return response.data;
  },

  // Toggle like status for a swipe by ID
  toggle: async (swipeId) => {
    const response = await api.put(`/swipes/${swipeId}/toggle/`);
    return response.data;
  },

  // Get swipe statistics
  stats: async () => {
    const response = await api.get('/swipes/stats/');
    return response.data;
  },
};

export default swipeService;
