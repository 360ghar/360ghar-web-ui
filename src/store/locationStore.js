import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Get stored location from localStorage or use default
const getStoredLocation = () => {
  try {
    const stored = localStorage.getItem('user-location');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if the stored location is recent (within 24 hours)
      const storedTime = parsed.timestamp || 0;
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (now - storedTime < maxAge) {
        return {
          lat: parsed.location.lat,
          lng: parsed.location.lng,
          name: parsed.location.name
        };
      }
    }
  } catch (error) {
    console.error('Error reading stored location:', error);
  }

  return { lat: null, lng: null, name: 'Search any location...' };
};

// Store location in localStorage
const storeLocation = (location) => {
  try {
    localStorage.setItem('user-location', JSON.stringify({
      location,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error storing location:', error);
  }
};

export const useLocationStore = create(
  persist(
    (set, get) => ({
      location: getStoredLocation(),
      isLocating: true,
      error: null,

      // Initialize location on first load
      initializeLocation: () => {
        const state = get();
        if (state.location.lat && state.location.lng) {
          // We have a stored location, use it
          set({ isLocating: false });
          return;
        }

        // Try to get browser location
        get().fetchBrowserLocation();
      },

      // Action to get user's location via browser geolocation
      fetchBrowserLocation: () => {
        set({ isLocating: true, error: null });

        if (!navigator.geolocation) {
          // Fallback to a default location if geolocation is not supported
          const fallbackLocation = { lat: 28.4595, lng: 77.0266, name: 'Gurgaon, India' };
          set({
            location: fallbackLocation,
            isLocating: false,
            error: "Geolocation not supported. Showing results for Gurgaon.",
          });
          storeLocation(fallbackLocation);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              name: 'Your Current Location',
            };
            set({
              location: userLocation,
              isLocating: false,
              error: null,
            });
            storeLocation(userLocation);
          },
          (error) => {
            // Fallback to a default location (e.g., Gurgaon) if permission is denied
            let errorMessage = "Location permission denied. Showing results for Gurgaon.";

            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied. Showing results for Gurgaon.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location unavailable. Showing results for Gurgaon.";
                break;
              case error.TIMEOUT:
                errorMessage = "Location request timed out. Showing results for Gurgaon.";
                break;
              default:
                errorMessage = "Location error. Showing results for Gurgaon.";
                break;
            }

            const fallbackLocation = { lat: 28.4595, lng: 77.0266, name: 'Gurgaon, India' };
            set({
              location: fallbackLocation,
              isLocating: false,
              error: errorMessage,
            });
            storeLocation(fallbackLocation);
          },
          {
            timeout: 10000,
            enableHighAccuracy: true,
            maximumAge: 300000 // 5 minutes
          }
        );
      },

      // Action to manually set location (e.g., from Google Places)
      setLocation: (newLocation) => {
        set({
          location: newLocation,
          isLocating: false,
          error: null
        });
        storeLocation(newLocation);
      },

      // Action to clear error
      clearError: () => {
        set({ error: null });
      },

      // Action to reset to user's current location
      resetToCurrentLocation: () => {
        get().fetchBrowserLocation();
      },
    }),
    {
      name: 'location-store',
      partialize: (state) => ({
        location: state.location,
        isLocating: state.isLocating
      }),
    }
  )
);