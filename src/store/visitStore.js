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
  isVisitsLoading: false,
  isUpcomingLoading: false,
  isPastLoading: false,
  isScheduleLoading: false,
  // Shared in-flight guard for the MUTATION actions (updateVisit,
  // rescheduleVisit, cancelVisit) — prevents concurrent mutations. NOTE:
  // getVisitDetails is a read and deliberately does NOT use this guard;
  // gating it here made an in-flight detail fetch silently block (no-op)
  // Cancel/Reschedule. UI that wants per-action gating can read isLoading.
  isMutating: false,
  isLoading: false,
  error: null,

  scheduleVisit: async ({ property_id, scheduled_date, special_requirements }) => {
    if (get().isScheduleLoading) return;
    try {
      set({ isScheduleLoading: true, error: null });
      const data = await visitService.schedule({ property_id, scheduled_date, special_requirements });
      set((state) => ({ visits: [data, ...state.visits], isScheduleLoading: false }));
      return data;
    } catch (err) {
      set({ isScheduleLoading: false, error: extractError(err, 'Failed to schedule visit') });
      return null;
    }
  },

  getVisits: async () => {
    try {
      set({ isVisitsLoading: true, error: null });
      const data = await visitService.getAll();
      const items = Array.isArray(data?.items) ? data.items : [];
      set({
        visits: items,
        visitsNextCursor: data?.next_cursor ?? null,
        visitsHasMore: Boolean(data?.has_more),
        isVisitsLoading: false,
      });
      return data;
    } catch (err) {
      set({ isVisitsLoading: false, error: extractError(err, 'Failed to fetch visits') });
      return { items: [] };
    }
  },

  getUpcomingVisits: async () => {
    try {
      set({ isUpcomingLoading: true, error: null });
      const data = await visitService.getUpcoming();
      const items = Array.isArray(data?.items) ? data.items : [];
      set({
        upcomingVisits: items,
        upcomingNextCursor: data?.next_cursor ?? null,
        upcomingHasMore: Boolean(data?.has_more),
        isUpcomingLoading: false,
      });
      return data;
    } catch (err) {
      set({ isUpcomingLoading: false, error: extractError(err, 'Failed to fetch upcoming visits') });
      return { items: [] };
    }
  },

  getPastVisits: async () => {
    try {
      set({ isPastLoading: true, error: null });
      const data = await visitService.getPast();
      const items = Array.isArray(data?.items) ? data.items : [];
      set({
        pastVisits: items,
        pastNextCursor: data?.next_cursor ?? null,
        pastHasMore: Boolean(data?.has_more),
        isPastLoading: false,
      });
      return data;
    } catch (err) {
      set({ isPastLoading: false, error: extractError(err, 'Failed to fetch past visits') });
      return { items: [] };
    }
  },

  /**
   * Append the next page of all visits to `visits` using the backend cursor.
   * @param {{ cursor?: string|null, limit?: number }} [opts]
   */
  loadMoreVisits: async ({ cursor, limit } = {}) => {
    // Same-action in-flight guard as scheduleVisit (line 25). Without it, a
    // double-click on "Load More" fires two parallel getAll calls against
    // the same cursor and appends both responses, duplicating the page.
    if (get().isVisitsLoading) return { items: [] };
    try {
      set({ isVisitsLoading: true, error: null });
      const data = await visitService.getAll({
        cursor: cursor !== undefined ? cursor : get().visitsNextCursor ?? undefined,
        limit,
      });
      const items = Array.isArray(data?.items) ? data.items : [];
      set((state) => ({
        visits: [...state.visits, ...items],
        visitsNextCursor: data?.next_cursor ?? null,
        visitsHasMore: Boolean(data?.has_more),
        isVisitsLoading: false,
      }));
      return data;
    } catch (err) {
      set({ isVisitsLoading: false, error: extractError(err, 'Failed to load more visits') });
      return { items: [] };
    }
  },

  /**
   * Append the next page of upcoming visits to `upcomingVisits`.
   * @param {{ cursor?: string|null, limit?: number }} [opts]
   */
  loadMoreUpcoming: async ({ cursor, limit } = {}) => {
    if (get().isUpcomingLoading) return { items: [] };
    try {
      set({ isUpcomingLoading: true, error: null });
      const data = await visitService.getUpcoming({
        cursor: cursor !== undefined ? cursor : get().upcomingNextCursor ?? undefined,
        limit,
      });
      const items = Array.isArray(data?.items) ? data.items : [];
      set((state) => ({
        upcomingVisits: [...state.upcomingVisits, ...items],
        upcomingNextCursor: data?.next_cursor ?? null,
        upcomingHasMore: Boolean(data?.has_more),
        isUpcomingLoading: false,
      }));
      return data;
    } catch (err) {
      set({ isUpcomingLoading: false, error: extractError(err, 'Failed to load more upcoming visits') });
      return { items: [] };
    }
  },

  /**
   * Append the next page of past visits to `pastVisits`.
   * @param {{ cursor?: string|null, limit?: number }} [opts]
   */
  loadMorePast: async ({ cursor, limit } = {}) => {
    if (get().isPastLoading) return { items: [] };
    try {
      set({ isPastLoading: true, error: null });
      const data = await visitService.getPast({
        cursor: cursor !== undefined ? cursor : get().pastNextCursor ?? undefined,
        limit,
      });
      const items = Array.isArray(data?.items) ? data.items : [];
      set((state) => ({
        pastVisits: [...state.pastVisits, ...items],
        pastNextCursor: data?.next_cursor ?? null,
        pastHasMore: Boolean(data?.has_more),
        isPastLoading: false,
      }));
      return data;
    } catch (err) {
      set({ isPastLoading: false, error: extractError(err, 'Failed to load more past visits') });
      return { items: [] };
    }
  },

  // Read-only: intentionally NOT gated by isMutating (see note above) so
  // opening a visit's detail view never blocks Cancel/Reschedule.
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
    if (get().isMutating) return null;
    try {
      set({ isMutating: true, isLoading: true, error: null });
      const data = await visitService.update(visitId, update);
      set((state) => ({
        visits: state.visits.map((v) => (v.id === visitId ? data : v)),
        upcomingVisits: state.upcomingVisits.map((v) => (v.id === visitId ? data : v)),
        pastVisits: state.pastVisits.map((v) => (v.id === visitId ? data : v)),
        isLoading: false,
        isMutating: false,
      }));
      return data;
    } catch (err) {
      set({ isLoading: false, isMutating: false, error: extractError(err, 'Failed to update visit') });
      return null;
    }
  },

  rescheduleVisit: async (visitId, data) => {
    if (get().isMutating) return null;
    try {
      set({ isMutating: true, isLoading: true, error: null });
      const updated = await visitService.reschedule(visitId, data);
      set((state) => {
        // If the reschedule moved the visit into the upcoming bucket
        // (new scheduled_date is in the future), drop it from pastVisits so
        // the past list doesn't carry a stale entry. Otherwise, replace the
        // past entry in place.
        const movedToUpcoming = state.upcomingVisits.some((v) => v.id === visitId);
        return {
          visits: state.visits.map((v) => (v.id === visitId ? updated : v)),
          upcomingVisits: state.upcomingVisits.map((v) => (v.id === visitId ? updated : v)),
          pastVisits: movedToUpcoming
            ? state.pastVisits.filter((v) => v.id !== visitId)
            : state.pastVisits.map((v) => (v.id === visitId ? updated : v)),
          isLoading: false,
          isMutating: false,
        };
      });
      return updated;
    } catch (err) {
      set({ isLoading: false, isMutating: false, error: extractError(err, 'Failed to reschedule visit') });
      return null;
    }
  },

  cancelVisit: async (visitId, reason) => {
    if (get().isMutating) return null;
    try {
      set({ isMutating: true, isLoading: true, error: null });
      const updated = await visitService.cancel(visitId, { reason });
      set((state) => ({
        visits: state.visits.map((v) => (v.id === visitId ? updated : v)),
        upcomingVisits: state.upcomingVisits.filter((v) => v.id !== visitId),
        // Dedupe pastVisits by id: a visit may already be present in pastVisits
        // (e.g. loaded via getPast and also via getAll) and an unconditional
        // prepend would create a duplicate row. Replace in place if it
        // exists, otherwise prepend.
        pastVisits: state.pastVisits.some((v) => v.id === updated.id)
          ? state.pastVisits.map((v) => (v.id === updated.id ? updated : v))
          : [updated, ...state.pastVisits],
        isLoading: false,
        isMutating: false,
      }));
      return updated;
    } catch (err) {
      set({ isLoading: false, isMutating: false, error: extractError(err, 'Failed to cancel visit') });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

export { useVisitStore };
