import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { persist } from 'zustand/middleware';
import { isPrerendering } from '../utils/prerender';

const LOCATION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const GURGAON_FALLBACK = { lat: 28.4595, lng: 77.0266, name: 'Gurgaon, India' };

export const useLocationStore = create(
  persist(
    (set, get) => ({
      location: { lat: null, lng: null, name: 'Search any location...' },
      locationTimestamp: null,
      isLocating: true,
      error: null,

      // Initialize location on first load
      initializeLocation: () => {
        // During prerender, use Gurgaon fallback immediately — no geolocation API call
        if (isPrerendering()) {
          set({ location: GURGAON_FALLBACK, locationTimestamp: Date.now(), isLocating: false });
          return;
        }

        const state = get();
        const isRecent = state.locationTimestamp && (Date.now() - state.locationTimestamp < LOCATION_MAX_AGE_MS);
        if (state.location.lat && state.location.lng && isRecent) {
          set({ isLocating: false });
          return;
        }
        get().fetchBrowserLocation();
      },

      // Get user's location via browser geolocation
      fetchBrowserLocation: () => {
        set({ isLocating: true, error: null });

        if (!navigator.geolocation) {
          set({ location: GURGAON_FALLBACK, locationTimestamp: Date.now(), isLocating: false, error: 'Geolocation not supported. Showing results for Gurgaon.' });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            set({
              location: { lat: position.coords.latitude, lng: position.coords.longitude, name: 'Your Current Location' },
              locationTimestamp: Date.now(),
              isLocating: false,
              error: null,
            });
          },
          (error) => {
            const codes = globalThis.GeolocationPositionError || { PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
            const msg =
              error.code === codes.PERMISSION_DENIED ? 'Location permission denied. Showing results for Gurgaon.'
              : error.code === codes.POSITION_UNAVAILABLE ? 'Location unavailable. Showing results for Gurgaon.'
              : error.code === codes.TIMEOUT ? 'Location request timed out. Showing results for Gurgaon.'
              : 'Location error. Showing results for Gurgaon.';

            set({ location: GURGAON_FALLBACK, locationTimestamp: Date.now(), isLocating: false, error: msg });
          },
          { timeout: 10000, enableHighAccuracy: true, maximumAge: 300000 }
        );
      },

      // Manually set location (e.g., from Google Places)
      setLocation: (newLocation) => {
        set({ location: newLocation, locationTimestamp: Date.now(), isLocating: false, error: null });
      },

      resetToCurrentLocation: () => {
        get().fetchBrowserLocation();
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'location-store',
      partialize: (state) => ({
        location: state.location,
        locationTimestamp: state.locationTimestamp,
        isLocating: state.isLocating,
      }),
    }
  )
);

/**
 * CRITICAL FIX (audit 5.7): the store already records WHY it fell back to the
 * Gurgaon default (permission denied, timeout, unsupported, etc.) in `error`,
 * but consumers had no ergonomic way to surface it. This hook returns a tuple
 * `[isFallback, reason]` so any component can show a non-blocking banner.
 *
 * CRITICAL FIX (loop bug): wrapping the selector in `useShallow` makes Zustand
 * compare the returned array element-wise instead of by reference. Without
 * this, every render produces a new `[...]` instance, which React 18's
 * `useSyncExternalStore` (used by Zustand 5) treats as a state change and
 * re-renders forever — see error #185 "Maximum update depth exceeded".
 */
export function useLocationFallback() {
  return useLocationStore(
    useShallow((s) => {
      const isFallback =
        Boolean(s.error) ||
        (s.location?.lat === GURGAON_FALLBACK.lat && s.location?.lng === GURGAON_FALLBACK.lng);
      return [isFallback, s.error];
    })
  );
}
