import { create } from 'zustand';
import api from '../services/api';
import { authService } from '../services/authService';
import { deletionService } from '../services/deletionService';
import { getSupabaseAccessToken, onSupabaseAuthStateChange, setCachedAccessToken } from '../services/supabaseClient';
import { fetchAuthStage } from '../utils/authStage';
import * as posthogService from '../services/posthogService';
import { isPrerendering } from '../utils/prerender';
import { SKIP_AUTH_RETRY } from '../services/http';
import { readStoredUser, writeStoredUser, clearStoredUser } from '../utils/userStorage';

// Cross-module event used by services that need to signal "the cached session
// is dead" without importing the auth store (which would create a circular
// dependency). http.js's 401 handler dispatches this after clearing
// localStorage so the auth store can flip isAuthenticated to false on the
// next tick.
const AUTH_CLEARED_EVENT = '360ghar:auth-cleared';

// Request config passed to the profile + auth-stage fetches right after a
// fresh sign-in. The access token is brand new, so a 401 means "no backend
// profile row yet" — not "token expired". Skipping the 401 → refresh → retry
// cycle (which would refresh, retry, and 401 again) avoids doubling the
// latency and, across the several concurrent post-login fetches, the long
// apparent hang users saw on the login spinner.
const FRESH_SIGNIN_REQUEST_CONFIG = {
  [SKIP_AUTH_RETRY]: true,
  timeout: 10000,
};

let initializationInProgress = false;
let authSubscriptionPromise = null;
let profileSyncPromise = null;
let profileSyncToken = null;

function clearAuthState(set) {
  clearStoredUser();
  setCachedAccessToken(null);
  set({
    user: null,
    token: null,
    isAuthenticated: false,
    isInitializing: false,
    authStage: null,
  });
}

async function syncUserProfile(token, set, requestConfig) {
  if (profileSyncPromise && profileSyncToken === token) {
    return profileSyncPromise;
  }

  profileSyncToken = token;
  profileSyncPromise = (async () => {
    try {
      const userProfile = await authService.getCurrentUser(requestConfig);
      writeStoredUser(userProfile);

      // Fetch auth gate state from the backend (single source of truth).
      const authStage = await fetchAuthStage(api, requestConfig);

      set({
        user: userProfile,
        token,
        isAuthenticated: true,
        isInitializing: false,
        authStage,
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
    } catch (err) {
      // A 401/404 on the FIRST profile fetch means the user is authenticated at
      // Supabase but has no backend profile row yet (fresh phone-auth signup,
      // or a row that hasn't been provisioned). Keep the session and route the
      // authenticated user to profile completion (ProfileCompletionRouteGuard
      // sends authStage === 'profile_completion' to /profile-completion, where
      // the row is created) instead of erroring out or logging out.
      const status = err?.response?.status;
      if (status === 401 || status === 404) {
        set({
          token,
          isAuthenticated: true,
          isInitializing: false,
          authStage: 'profile_completion',
          error: null,
        });
        return null;
      }

      // CRITICAL FIX (audit 1.1): Do NOT call logout()/clearAuthState() on a
      // transient profile-fetch failure. A TOKEN_REFRESHED event racing with
      // sync, or a temporary backend hiccup, would otherwise log the user out
      // mid-session. Only clear auth state on an explicit SIGNED_OUT event
      // (handled in handleAuthStateChange). Keep the Supabase session intact;
      // surface the error and let the user retry.
      set({
        isInitializing: false,
        error:
          (err && (err.response?.data?.detail || err.message)) ||
          'Failed to load profile. Please retry.',
      });
      return null;
    } finally {
      if (profileSyncToken === token) {
        profileSyncPromise = null;
      }
    }
  })();

  return profileSyncPromise;
}

async function handleAuthStateChange(event, session, set, _get) {
  if (event === 'SIGNED_OUT' || !session) {
    posthogService.resetUser();
    clearAuthState(set);
    authSubscriptionPromise = null;
    return;
  }

  // Populate the in-memory token cache from the session the SDK just handed us
  // (covers INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED). Authenticated axios
  // requests then read the token synchronously instead of each calling
  // client.auth.getSession(), which acquires the auth lock and — under the
  // post-login request burst — trips "AbortError: signal is aborted without reason".
  setCachedAccessToken(session.access_token);

  if (event === 'INITIAL_SESSION' && initializationInProgress) {
    return;
  }

  // A token rotation is not a profile change — only persist the new token.
  // Profile changes arrive as USER_UPDATED; the initial load is handled by
  // INITIAL_SESSION/SIGNED_IN (and initializeAuth's explicit sync).
  //
  // Previously this re-ran syncUserProfile whenever `user` was null. For a
  // user whose /users/profile/ 401s, that turned every token refresh into
  // another failed fetch into another refresh (the Supabase SDK calls
  // /auth/v1/user on each refresh) — an infinite loop. Never refetch here.
  if (event === 'TOKEN_REFRESHED') {
    set({ token: session.access_token, isAuthenticated: true });
    return;
  }

  set({
    token: session.access_token,
    isAuthenticated: true,
  });

  // SIGNED_IN delivers a brand-new token, so the profile/auth-stage fetches can
  // skip the 401 → refresh → retry cycle (see FRESH_SIGNIN_REQUEST_CONFIG).
  await syncUserProfile(session.access_token, set, FRESH_SIGNIN_REQUEST_CONFIG);
}

async function ensureAuthSubscription(set, get) {
  if (authSubscriptionPromise) {
    return authSubscriptionPromise;
  }

  authSubscriptionPromise = onSupabaseAuthStateChange((event, session) =>
    handleAuthStateChange(event, session, set, get)
  ).catch((error) => {
    authSubscriptionPromise = null;
    // A lock-contention abort from supabase-js (see lock: processLock note in
    // supabaseClient.js) is benign noise here — it must not become an unhandled
    // rejection. Re-throw anything else so real subscription failures surface.
    if (error?.name === 'AbortError') return undefined;
    throw error;
  });

  return authSubscriptionPromise;
}

// Cross-module signal from services (specifically http.js's 401 handler) that
// the cached session is dead. Services cannot import the auth store without a
// circular dep, so they dispatch a window event after clearing localStorage;
// this listener (installed once at store creation) flips isAuthenticated to
// false and clears the in-memory token so route guards stop rendering
// protected children and a subsequent navigate-to-/login lands on a real
// logged-out state. Installed only on the client (typeof window) because
// prerender / SSR has no window.
// Module-scoped (NOT window-scoped) handler reference. A `window.__…` flag
// survives vi.resetModules() / HMR module reloads, so a freshly-created store
// would skip wiring its listener and auth-cleared events would update a
// discarded store's `set`. A module-scoped ref resets with the module, so the
// current store always rebinds.
let authClearedHandler = null;
function installAuthClearedListener(set) {
  if (typeof window === 'undefined') return;
  // Drop any handler this module instance previously installed before
  // rebinding to the current store's `set` (defensive against double install).
  if (authClearedHandler) {
    window.removeEventListener(AUTH_CLEARED_EVENT, authClearedHandler);
  }
  authClearedHandler = () => {
    posthogService.resetUser();
    setCachedAccessToken(null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: false,
      authStage: null,
    });
  };
  window.addEventListener(AUTH_CLEARED_EVENT, authClearedHandler);
}

const useAuthStore = create((set, get) => {
  installAuthClearedListener(set);
  return {
  user: readStoredUser(),
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
  authStage: null, // 'identifier_verification' | 'password_setup' | 'profile_completion' | 'app_onboarding' | 'active'

  initializeAuth: async () => {
    // During prerender, skip all Supabase network calls — no session exists
    if (isPrerendering()) {
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
    } catch (error) {
      // Defensive: a reason-less AbortError from supabase-js lock contention
      // must not bubble as an unhandled rejection during init (mirrors the
      // hot-path mitigation in http.js). Anything else is a real init failure.
      if (error?.name !== 'AbortError') throw error;
    } finally {
      initializationInProgress = false;
    }
  },

  login: async (emailOrPhone, password) => {
    try {
      set({ isLoading: true, error: null });
      const data = await authService.login(emailOrPhone, password);

      if (data.access_token) {
        // authService.login no longer fetches the backend profile — that
        // happens exactly once via syncUserProfile, which is deduped with the
        // SIGNED_IN event's call (same token). syncUserProfile writes the user
        // into the store and, for a 401/404 response, sets authStage to
        // 'profile_completion' (fresh signup with no profile row yet).
        const profile = await syncUserProfile(
          data.access_token,
          set,
          FRESH_SIGNIN_REQUEST_CONFIG
        );

        if (!profile) {
          // syncUserProfile returns null for TWO different reasons — do NOT
          // conflate them:
          //   1. 401/404 → no backend profile row yet. It already set authStage
          //      to 'profile_completion' (and error:null). Keep the session and
          //      let the route guard send the user there.
          //   2. transient 5xx/network failure → it set `error` and left
          //      authStage untouched. The user most likely DOES have a profile;
          //      forcing 'profile_completion' here would wrongly drop an
          //      existing user onto the signup-completion screen. Surface the
          //      error and bail so they can retry instead.
          if (get().error) {
            set({ isLoading: false, isInitializing: false });
            return false;
          }
        }

        set({
          token: data.access_token,
          user: profile || null,
          isAuthenticated: true,
          isLoading: false,
          isInitializing: false,
        });

        return true;
      }

      set({ isLoading: false, isInitializing: false, error: 'Failed to login' });
      return false;
    } catch (error) {
      // AUDIT FIX (1.4): ensure consistent auth state on login failure.
      // authService.login() may have already established a Supabase session
      // (signInWithPassword succeeded) before getCurrentUser/profile fetch
      // threw. That leaves a valid Supabase session while the app considers
      // the user unauthenticated (token set in Supabase, no profile here) —
      // a partial state. Sign out the dangling session so state is consistent.
      try {
        await authService.logout();
      } catch {
        // Best-effort cleanup; the Supabase session may not exist.
      }
      clearAuthState(set);
      set({
        isLoading: false,
        isInitializing: false,
        error: error.response?.data?.detail?.message || error.response?.data?.detail || error.message || 'Failed to login'
      });
      return false;
    }
  },

  // Sync the auth store from the current Supabase session after an external
  // auth event (e.g. the Google OAuth callback exchanged a code for a session).
  // Ensures the auth subscription is wired, then fetches the profile.
  syncAfterExternalAuth: async () => {
    try {
      set({ isInitializing: true, error: null });
      await ensureAuthSubscription(set, get);

      const token = await getSupabaseAccessToken();
      if (!token) {
        clearAuthState(set);
        return false;
      }

      set({ token, isAuthenticated: true });
      // The OAuth code exchange just produced a fresh token, so the profile /
      // auth-stage fetches can skip the 401 → refresh → retry cycle.
      const profile = await syncUserProfile(token, set, FRESH_SIGNIN_REQUEST_CONFIG);
      return Boolean(profile);
    } catch (error) {
      set({
        isInitializing: false,
        error: error.message || 'Failed to complete sign-in',
      });
      return false;
    }
  },

  logout: async (options = {}) => {
    // Backward-compatible signature: `logout()` (or `logout(undefined)`) only
    // tears down the local session. Pass `{ deleteAccount: true }` to also
    // ask the backend to permanently delete the account BEFORE clearing the
    // Supabase session — this matches the new /auth/delete-account flow.
    posthogService.resetUser();
    if (options && options.deleteAccount === true) {
      try {
        await deletionService.deleteAccountImmediate();
      } catch (err) {
        // Best-effort: still proceed with local logout so the user is not
        // stranded on a page that requires authentication.
        console.error('[authStore] deleteAccountImmediate failed:', err);
      }
    }
    // Clear local auth state even if the network sign-out rejects or hangs.
    // Otherwise the cached user survives in localStorage and the next app load
    // rehydrates a "logged-in" UI whose every authenticated request 401s.
    try {
      await authService.logout();
    } finally {
      clearAuthState(set);
    }
  },

  /**
   * Mirror the last-used auth method on the backend (fire-and-forget).
   * Wraps `authService.recordLastMethod` so stores/components can call it
   * without importing the service directly.
   * @param {string} method
   */
  recordLastMethod: async (method) => {
    await authService.recordLastMethod(method);
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

  retryProfileFetch: async () => {
    const { token } = get();
    if (!token) return;
    set({ error: null, isLoading: true });
    try {
      await syncUserProfile(token, set);
    } finally {
      set({ isLoading: false });
    }
  },
  };
});

export { useAuthStore };
export default useAuthStore;
