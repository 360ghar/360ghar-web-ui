import { create } from 'zustand';
import api from '../services/api';
import { authService } from '../services/authService';
import { deletionService } from '../services/deletionService';
import { getSupabaseAccessToken, onSupabaseAuthStateChange, setCachedAccessToken } from '../services/supabaseClient';
import { fetchAuthStage } from '../utils/authStage';
import * as posthogService from '../services/posthogService';
import { isPrerendering } from '../utils/prerender';
import { SKIP_AUTH_RETRY } from '../services/http';

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

// AUDIT FIX (1.imp6): Cache TTL for the locally-cached user profile. The cache
// is only used to render the UI instantly on init; a fresh profile is always
// fetched via syncUserProfile. To avoid showing very stale data (e.g. a user
// who just registered on another device), entries older than this TTL are
// ignored and the store waits for the fresh fetch instead.
const USER_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const USER_CACHE_KEY = 'user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Support both legacy (bare user object) and timestamped ({ user, ts })
    // cache entries. Expired entries are treated as a miss.
    if (parsed && typeof parsed === 'object' && 'user' in parsed && 'ts' in parsed) {
      if (Date.now() - parsed.ts > USER_CACHE_TTL_MS) return null;
      return parsed.user || null;
    }
    return parsed || null;
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
    // AUDIT FIX (1.imp6): store the user alongside a timestamp so the cache
    // can expire (see readStoredUser / USER_CACHE_TTL_MS).
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify({ user, ts: Date.now() }));
  } catch {
    // Ignore storage quota/private mode failures.
  }
}

function clearStoredUser() {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    // Ignore storage failures during cleanup.
  }
}

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

const useAuthStore = create((set, get) => ({
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
        // data.user is null when Supabase auth succeeded but no backend
        // profile row exists yet (authService.login swallows the 401/404). Do
        // NOT fall back to getCurrentUser() — that would re-issue the same
        // failing request. Route the authenticated user to profile completion
        // so they can create their row.
        const userProfile = data.user || null;
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

        // syncUserProfile is deduped with the SIGNED_IN event's call (same
        // token), so this awaits the single in-flight profile + auth-stage sync
        // instead of issuing a separate serial fetchAuthStage request. The
        // fresh-sign-in request config skips the 401 → refresh → retry cycle
        // (the token is brand new; a 401 means "no profile row", not "expired").
        await syncUserProfile(data.access_token, set, FRESH_SIGNIN_REQUEST_CONFIG);

        // No backend profile yet → force profile completion regardless of what
        // the gate endpoint returned (it may itself 401 for an unprovisioned
        // user and default to 'active'). syncUserProfile already set
        // authStage, but override it here using the authoritative data.user.
        if (!userProfile) {
          set({ authStage: 'profile_completion' });
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
    await authService.logout();
    clearAuthState(set);
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
}));

export { useAuthStore };
export default useAuthStore;
