import { create } from 'zustand';
import { userService } from '../services/userService';

// Normalize API error messages
const extractError = (err, fallback = 'Request failed') => {
  const detail = err?.response?.data?.detail ?? err?.message;
  if (!detail) return fallback;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg || d?.message || d).join(', ');
  if (typeof detail === 'object') return detail.msg || detail.message || JSON.stringify(detail);
  return String(detail);
};

const useUserStore = create((set, get) => ({
  profile: null,
  preferences: null,
  assignedAgent: null,
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

  getAssignedAgent: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await userService.getAssignedAgent();
      set({ assignedAgent: data, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Failed to fetch assigned agent') });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useUserStore;
