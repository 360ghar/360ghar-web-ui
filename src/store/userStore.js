import { create } from 'zustand';
import { userService } from '../services/userService';
import { extractError } from '../utils/apiError';

const useUserStore = create((set, get) => ({
  profile: null,
  preferences: null,
  isProfileLoading: false,
  isUpdateLoading: false,
  isPreferencesLoading: false,
  isLocationLoading: false,
  error: null,

  getProfile: async () => {
    try {
      set({ isProfileLoading: true, error: null });
      const data = await userService.getProfile();
      set({ profile: data, preferences: data?.preferences || null, isProfileLoading: false });
      return data;
    } catch (err) {
      set({ isProfileLoading: false, error: extractError(err, 'Failed to load profile') });
      return null;
    }
  },

  updateProfile: async (profileData) => {
    try {
      set({ isUpdateLoading: true, error: null });
      const data = await userService.updateProfile(profileData);
      set({ profile: data, preferences: data?.preferences || get().preferences, isUpdateLoading: false });
      return data;
    } catch (err) {
      set({ isUpdateLoading: false, error: extractError(err, 'Failed to update profile') });
      return null;
    }
  },

  updatePreferences: async (prefs) => {
    try {
      set({ isPreferencesLoading: true, error: null });
      await userService.updatePreferences(prefs);
      // Refresh profile to get normalized preferences
      const data = await userService.getProfile();
      set({ profile: data, preferences: data?.preferences || prefs, isPreferencesLoading: false });
      return true;
    } catch (err) {
      set({ isPreferencesLoading: false, error: extractError(err, 'Failed to update preferences') });
      return false;
    }
  },

  updateLocation: async ({ latitude, longitude }) => {
    try {
      set({ isLocationLoading: true, error: null });
      await userService.updateLocation({ latitude, longitude });
      set({ isLocationLoading: false });
      return true;
    } catch (err) {
      set({ isLocationLoading: false, error: extractError(err, 'Failed to update location') });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export { useUserStore };
