import api from './api';

// Simplified Agent Management Service
export const agentService = {
  // Get assigned agent for current user
  getAssignedAgent: async () => {
    const response = await api.get('/agents/assigned/');
    return response.data;
  },
};

