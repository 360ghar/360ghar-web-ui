import { shouldShortCircuitDataFetch } from '../utils/prerender';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const IS_TEST_MODE = import.meta.env.MODE === 'test' || import.meta.env.VITEST === 'true';

// CRITICAL FIX (audit 5.1): previously this module threw at import time when
// env vars were missing, crashing the entire app before any error boundary
// could catch it. Now we only warn at import and defer the throw to the first
// actual use (inside getClientLazy), which runs within the React tree where
// error boundaries can recover gracefully.
if (!IS_TEST_MODE && (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY)) {
  console.warn(
    '[supabaseClient] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Auth and authenticated API calls will fail until these are set.'
  );
}

// Lazy-loaded singleton — the @supabase/supabase-js SDK (~152KB) is only downloaded
// when first needed (login, session check, etc.) instead of on every page load.
let _supabase = null;
let _initPromise = null;

// In-memory cache of the current access token. The axios request interceptor reads
// this synchronously so an authenticated request does NOT each call
// client.auth.getSession(). getSession acquires supabase-js's internal navigator.locks
// mutex; a burst of them right after login races the SDK's own post-sign-in lock work
// and trips "AbortError: signal is aborted without reason" (supabase-js #2111/#41968).
// The cache is the hot path — populated from auth events (onAuthStateChange,
// post-signInWithPassword) and re-populated on cold start; getSession stays the
// fallback only when the cache is empty.
let _cachedAccessToken = null;

export function setCachedAccessToken(token) {
  _cachedAccessToken = token || null;
}

export function getCachedAccessToken() {
  return _cachedAccessToken;
}

// Prerender stub — see src/utils/prerender.js for the gating logic. Returning
// a no-op client during prerender keeps the @supabase/supabase-js chunk out of
// the network path entirely; `authStore.initializeAuth` already short-circuits,
// but this is the belt-and-suspenders for any future caller.
const createPrerenderStubClient = () => {
  const noopUnsubscribe = { unsubscribe: () => undefined };
  const stub = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      refreshSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => noopUnsubscribe,
      signInWithPassword: async () => ({ data: { session: null, user: null }, error: new Error('Supabase disabled during prerender') }),
      signUp: async () => ({ data: { session: null, user: null }, error: new Error('Supabase disabled during prerender') }),
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: async () => ({ data: { session: null }, error: new Error('Supabase disabled during prerender') }),
    },
  };
  return stub;
};

async function getClientLazy() {
  if (_supabase) return _supabase;
  if (_initPromise) return _initPromise;

  if (shouldShortCircuitDataFetch()) {
    _supabase = createPrerenderStubClient();
    return _supabase;
  }

  _initPromise = import('@supabase/supabase-js').then(async ({ createClient, processLock }) => {
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Google OAuth redirects to /auth/callback?code=... and AuthCallbackPage
        // calls exchangeCodeForSession() explicitly. Keeping this true caused a
        // double-exchange race (SDK auto-exchange + manual exchange competing for
        // the single-use PKCE code). All other auth flows use typed OTP codes,
        // not redirects, so disabling auto-detection is safe and deterministic.
        detectSessionInUrl: false,
        // ROOT-CAUSE FIX for "AbortError: signal is aborted without reason":
        // the default navigatorLock wraps the auth object in a navigator.locks
        // mutex whose AbortController fires under the initial onAuthStateChange
        // emission + post-login request burst, surfacing a reason-less
        // AbortError (supabase-js #2111/#41968). processLock is an in-memory,
        // promise-based lock with no navigator.locks/AbortController, so the
        // abort never happens. Trade-off: no cross-tab refresh coordination,
        // which is fine for this single-tab SPA (autoRefreshToken still works).
        lock: processLock,
      },
    });
    // Wait for the client's internal initialization (_initialize →
    // _recoverAndRefresh → _handleVisibilityChange → _startAutoRefresh) to
    // complete before handing the client to callers. createClient() triggers
    // _initialize() asynchronously, which acquires the process lock for
    // session recovery (potentially slow network call). If we return the
    // client immediately, concurrent callers that also need the lock
    // (onAuthStateChange, getSession) pile up behind _initialize() and
    // produce cascading "Lock acquisition timed out" warnings — the 0ms
    // ones from _autoRefreshTokenTick and the 10s ones from queued callers.
    //
    // getSession() awaits `initializePromise` internally, so it won't
    // resolve until _initialize() releases the lock. After this call the
    // client is fully warmed up and subsequent lock acquisitions are fast.
    try {
      await client.auth.getSession();
    } catch {
      // Non-fatal: the client is still usable even if the initial session
      // fetch fails (e.g. network error during _recoverAndRefresh). The
      // important thing is that _initialize() has run and the lock is free.
    }
    _supabase = client;
    return _supabase;
  });
  return _initPromise;
}

export async function ensureSupabaseClient() {
  const client = await getClientLazy();
  if (!client) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  return client;
}

export async function getSupabaseSession() {
  const client = await getClientLazy();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session || null;
}

export async function getSupabaseAccessToken() {
  const session = await getSupabaseSession();
  const token = session?.access_token || null;
  // Populate the cache so subsequent requests read it synchronously instead of
  // re-acquiring the auth lock via getSession().
  _cachedAccessToken = token;
  return token;
}

export async function refreshSupabaseSession() {
  const client = await getClientLazy();
  if (!client) return null;
  const { data, error } = await client.auth.refreshSession();
  if (error || !data.session) return null;
  return data.session;
}

export async function onSupabaseAuthStateChange(callback) {
  const client = await getClientLazy();
  if (!client) return { unsubscribe: () => undefined };
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange(callback);
  return {
    unsubscribe: () => subscription.unsubscribe(),
  };
}
