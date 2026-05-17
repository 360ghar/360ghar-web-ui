import { create } from 'zustand';
import { authService } from '../services/authService';
import { getSupabaseAccessToken, onSupabaseAuthStateChange } from '../services/supabaseClient';
import * as posthogService from '../services/posthogService';

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

let initializationInProgress = false;
let authSubscriptionPromise = null;
let profileSyncPromise = null;
let profileSyncToken = null;

function writeStoredUser(user) {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch {
    // Ignore storage quota/private mode failures.
  }
}

function clearStoredUser() {
  try {
    localStorage.removeItem('user');
  } catch {
    // Ignore storage failures during cleanup.
  }
}

function clearAuthState(set) {
  clearStoredUser();
  set({
    user: null,
    token: null,
    isAuthenticated: false,
    isInitializing: false,
  });
}

async function syncUserProfile(token, set) {
  if (profileSyncPromise && profileSyncToken === token) {
    return profileSyncPromise;
  }

  profileSyncToken = token;
  profileSyncPromise = (async () => {
    try {
      const userProfile = await authService.getCurrentUser();
      writeStoredUser(userProfile);
      set({
        user: userProfile,
        token,
        isAuthenticated: true,
        isInitializing: false,
      });
      // Identify user in PostHog for session replay and event attribution
      if (userProfile?.id) {
        posthogService.identifyUser(userProfile.id, {
          email: userProfile.email,
          name: userProfile.name || userProfile.full_name,
          phone: userProfile.phone,
        });
      }
      return userProfile;
    } catch {
      await authService.logout();
      clearAuthState(set);
      return null;
    } finally {
      if (profileSyncToken === token) {
        profileSyncPromise = null;
      }
    }
  })();

  return profileSyncPromise;
}

async function handleAuthStateChange(event, session, set, get) {
  if (event === 'SIGNED_OUT' || !session) {
    posthogService.resetUser();
    clearAuthState(set);
    return;
  }

  if (event === 'INITIAL_SESSION' && initializationInProgress) {
    return;
  }

  set({
    token: session.access_token,
    isAuthenticated: true,
  });

  if (event === 'TOKEN_REFRESHED' && get().user) {
    return;
  }

  await syncUserProfile(session.access_token, set);
}

async function ensureAuthSubscription(set, get) {
  if (authSubscriptionPromise) {
    return authSubscriptionPromise;
  }

  authSubscriptionPromise = onSupabaseAuthStateChange((event, session) =>
    handleAuthStateChange(event, session, set, get)
  ).catch((error) => {
    authSubscriptionPromise = null;
    throw error;
  });

  return authSubscriptionPromise;
}

const useAuthStore = create((set, get) => ({
  user: readStoredUser(),
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  initializeAuth: async () => {
    // During prerender, skip all Supabase network calls — no session exists
    if (typeof window !== 'undefined' && window.__PRERENDER_INJECTED?.isPrerendering) {
      set({ isInitializing: false });
      return;
    }

    if (initializationInProgress) return;
    initializationInProgress = true;
    try {
      set({ isInitializing: true, error: null });
      await ensureAuthSubscription(set, get);

      const token = await getSupabaseAccessToken();
      if (!token) {
        clearAuthState(set);
        return;
      }

      const cachedUser = readStoredUser();
      if (cachedUser) {
        set({
          user: cachedUser,
          token,
          isAuthenticated: true,
        });
      }

      await syncUserProfile(token, set);
    } finally {
      initializationInProgress = false;
    }
  },

  login: async (emailOrPhone, password) => {
    try {
      set({ isLoading: true, error: null });
      const data = await authService.login(emailOrPhone, password);

      if (data.access_token) {
        const userProfile = data.user || (await authService.getCurrentUser());
        if (userProfile) {
          writeStoredUser(userProfile);
          // Identify user in PostHog
          if (userProfile.id) {
            posthogService.identifyUser(userProfile.id, {
              email: userProfile.email,
              name: userProfile.name || userProfile.full_name,
              phone: userProfile.phone,
            });
          }
        }

        set({
          token: data.access_token,
          user: userProfile,
          isAuthenticated: true,
          isLoading: false,
          isInitializing: false,
        });

        return true;
      }

      set({ isLoading: false, isInitializing: false, error: 'Failed to login' });
      return false;
    } catch (error) {
      set({
        isLoading: false,
        isInitializing: false,
        error: error.response?.data?.detail?.message || error.response?.data?.detail || error.message || 'Failed to login'
      });
      return false;
    }
  },

  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const result = await authService.register(userData);

      if (result.access_token) {
        const userProfile = result.user || (await authService.getCurrentUser());
        if (userProfile) {
          writeStoredUser(userProfile);
          // Identify user in PostHog
          if (userProfile.id) {
            posthogService.identifyUser(userProfile.id, {
              email: userProfile.email,
              name: userProfile.name || userProfile.full_name,
              phone: userProfile.phone,
            });
          }
        }

        set({
          token: result.access_token,
          user: userProfile,
          isAuthenticated: true,
          isLoading: false,
          isInitializing: false,
        });
        return true;
      }

      set({ isLoading: false, isInitializing: false });
      const identifier = userData.phone || userData.email;
      if (!identifier) return false;
      return get().login(identifier, userData.password);
    } catch (error) {
      set({
        isLoading: false,
        isInitializing: false,
        error: error.response?.data?.detail?.message || error.response?.data?.detail || error.message || 'Registration failed'
      });
      return false;
    }
  },

  logout: async () => {
    posthogService.resetUser();
    await authService.logout();
    clearAuthState(set);
  },

  updateProfile: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const updatedUser = await authService.updateCurrentUser(userData);
      writeStoredUser(updatedUser);
      set({
        user: updatedUser,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to update profile'
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export { useAuthStore };
export default useAuthStore;
