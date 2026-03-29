import { create } from 'zustand';
import { userService } from '../services/userService';
import { extractError } from '../utils/apiError';

const useUserStore = create((set, get) => ({
  profile: null,
  preferences: null,
  isLoading: false,
  error: null,

  getProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await userService.getProfile();
      set({ profile: data, preferences: data?.preferences || null, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to load profile') });
      return null;
    }
  },

  updateProfile: async (profileData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await userService.updateProfile(profileData);
      set({ profile: data, preferences: data?.preferences || get().preferences, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to update profile') });
      return null;
    }
  },

  updatePreferences: async (prefs) => {
    try {
      set({ isLoading: true, error: null });
      await userService.updatePreferences(prefs);
      // Refresh profile to get normalized preferences
      const data = await userService.getProfile();
      set({ profile: data, preferences: data?.preferences || prefs, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to update preferences') });
      return false;
    }
  },

  updateLocation: async ({ latitude, longitude }) => {
    try {
      set({ isLoading: true, error: null });
      await userService.updateLocation({ latitude, longitude });
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to update location') });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export { useUserStore };
