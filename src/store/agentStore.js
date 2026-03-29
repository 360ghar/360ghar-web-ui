import { create } from 'zustand';
import { agentService } from '../services';
import { extractError } from '../utils/apiError';

const useAgentStore = create((set) => ({
  assignedAgent: null,
  isLoading: false,
  error: null,

  getAssignedAgent: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await agentService.getAssignedAgent();
      set({ assignedAgent: data, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to fetch assigned agent') });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

export { useAgentStore };