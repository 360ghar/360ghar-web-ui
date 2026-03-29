import { create } from 'zustand';
import { visitService } from '../services/visitService';
import { extractError } from '../utils/apiError';

const useVisitStore = create((set) => ({
  visits: [],
  upcomingVisits: [],
  pastVisits: [],
  isLoading: false,
  error: null,

  scheduleVisit: async ({ property_id, scheduled_date, special_requirements }) => {
    try {
      set({ isLoading: true, error: null });
      const data = await visitService.schedule({ property_id, scheduled_date, special_requirements });
      set((state) => ({ visits: [data, ...state.visits], isLoading: false }));
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to schedule visit') });
      return null;
    }
  },

  getVisits: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await visitService.getAll();
      set({ visits: data?.visits || [], isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to fetch visits') });
      return { visits: [] };
    }
  },

  getUpcomingVisits: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await visitService.getUpcoming();
      set({ upcomingVisits: data?.visits || [], isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to fetch upcoming visits') });
      return { visits: [] };
    }
  },

  getPastVisits: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await visitService.getPast();
      set({ pastVisits: data?.visits || [], isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to fetch past visits') });
      return { visits: [] };
    }
  },

  getVisitDetails: async (visitId) => {
    try {
      set({ isLoading: true, error: null });
      const data = await visitService.getById(visitId);
      set({ isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to fetch visit details') });
      return null;
    }
  },

  updateVisit: async (visitId, update) => {
    try {
      set({ isLoading: true, error: null });
      const data = await visitService.update(visitId, update);
      set((state) => ({
        visits: state.visits.map((v) => (v.id === visitId ? data : v)),
        upcomingVisits: state.upcomingVisits.map((v) => (v.id === visitId ? data : v)),
        pastVisits: state.pastVisits.map((v) => (v.id === visitId ? data : v)),
        isLoading: false,
      }));
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to update visit') });
      return null;
    }
  },

  rescheduleVisit: async (visitId, data) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await visitService.reschedule(visitId, data);
      set((state) => ({
        visits: state.visits.map((v) => (v.id === visitId ? updated : v)),
        upcomingVisits: state.upcomingVisits.map((v) => (v.id === visitId ? updated : v)),
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to reschedule visit') });
      return null;
    }
  },

  cancelVisit: async (visitId, reason) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await visitService.cancel(visitId, { reason });
      set((state) => ({
        visits: state.visits.map((v) => (v.id === visitId ? updated : v)),
        upcomingVisits: state.upcomingVisits.filter((v) => v.id !== visitId),
        pastVisits: [updated, ...state.pastVisits],
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to cancel visit') });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

export { useVisitStore };
