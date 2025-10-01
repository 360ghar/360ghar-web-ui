import { create } from 'zustand';
import { agentService } from '../services';

const extractError = (err, fallback = 'Request failed') => {
  const d = err?.response?.data?.detail ?? err?.message;
  if (!d) return fallback;
  if (Array.isArray(d)) return d.map((x) => x?.msg || x?.message || x).join(', ');
  if (typeof d === 'object') return d.msg || d.message || JSON.stringify(d);
  return String(d);
};

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

export default useAgentStore;