import { create } from 'zustand';
import { visitService } from '../services/visitService';
import { extractError } from '../utils/apiError';

const useVisitStore = create((set, get) => ({
  visits: [],
  upcomingVisits: [],
  pastVisits: [],
  // Cursor-pagination flags for the "load more" UI. Populated by the fetch
  // actions below so list consumers can call `loadMoreVisits({ cursor })` etc.
  visitsNextCursor: null,
  upcomingNextCursor: null,
  pastNextCursor: null,
  visitsHasMore: false,
  upcomingHasMore: false,
  pastHasMore: false,
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
      const items = Array.isArray(data?.items) ? data.items : [];
      set({
        visits: items,
        visitsNextCursor: data?.next_cursor ?? null,
        visitsHasMore: Boolean(data?.has_more),
        isLoading: false,
      });
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to fetch visits') });
      return { items: [] };
    }
  },

  getUpcomingVisits: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await visitService.getUpcoming();
      const items = Array.isArray(data?.items) ? data.items : [];
      set({
        upcomingVisits: items,
        upcomingNextCursor: data?.next_cursor ?? null,
        upcomingHasMore: Boolean(data?.has_more),
        isLoading: false,
      });
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to fetch upcoming visits') });
      return { items: [] };
    }
  },

  getPastVisits: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await visitService.getPast();
      const items = Array.isArray(data?.items) ? data.items : [];
      set({
        pastVisits: items,
        pastNextCursor: data?.next_cursor ?? null,
        pastHasMore: Boolean(data?.has_more),
        isLoading: false,
      });
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to fetch past visits') });
      return { items: [] };
    }
  },

  /**
   * Append the next page of all visits to `visits` using the backend cursor.
   * @param {{ cursor?: string|null, limit?: number }} [opts]
   */
  loadMoreVisits: async ({ cursor, limit } = {}) => {
    try {
      set({ isLoading: true, error: null });
      const data = await visitService.getAll({
        cursor: cursor !== undefined ? cursor : get().visitsNextCursor ?? undefined,
        limit,
      });
      const items = Array.isArray(data?.items) ? data.items : [];
      set((state) => ({
        visits: [...state.visits, ...items],
        visitsNextCursor: data?.next_cursor ?? null,
        visitsHasMore: Boolean(data?.has_more),
        isLoading: false,
      }));
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to load more visits') });
      return { items: [] };
    }
  },

  /**
   * Append the next page of upcoming visits to `upcomingVisits`.
   * @param {{ cursor?: string|null, limit?: number }} [opts]
   */
  loadMoreUpcoming: async ({ cursor, limit } = {}) => {
    try {
      set({ isLoading: true, error: null });
      const data = await visitService.getUpcoming({
        cursor: cursor !== undefined ? cursor : get().upcomingNextCursor ?? undefined,
        limit,
      });
      const items = Array.isArray(data?.items) ? data.items : [];
      set((state) => ({
        upcomingVisits: [...state.upcomingVisits, ...items],
        upcomingNextCursor: data?.next_cursor ?? null,
        upcomingHasMore: Boolean(data?.has_more),
        isLoading: false,
      }));
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to load more upcoming visits') });
      return { items: [] };
    }
  },

  /**
   * Append the next page of past visits to `pastVisits`.
   * @param {{ cursor?: string|null, limit?: number }} [opts]
   */
  loadMorePast: async ({ cursor, limit } = {}) => {
    try {
      set({ isLoading: true, error: null });
      const data = await visitService.getPast({
        cursor: cursor !== undefined ? cursor : get().pastNextCursor ?? undefined,
        limit,
      });
      const items = Array.isArray(data?.items) ? data.items : [];
      set((state) => ({
        pastVisits: [...state.pastVisits, ...items],
        pastNextCursor: data?.next_cursor ?? null,
        pastHasMore: Boolean(data?.has_more),
        isLoading: false,
      }));
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to load more past visits') });
      return { items: [] };
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
