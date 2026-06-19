import { shouldShortCircuitDataFetch } from '../utils/prerender';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
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

  _initPromise = import('@supabase/supabase-js').then(({ createClient }) => {
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
    _supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Google OAuth redirects to /auth/callback?code=... and AuthCallbackPage
        // calls exchangeCodeForSession() explicitly. Keeping this true caused a
        // double-exchange race (SDK auto-exchange + manual exchange competing for
        // the single-use PKCE code). All other auth flows use typed OTP codes,
        // not redirects, so disabling auto-detection is safe and deterministic.
        detectSessionInUrl: false,
      },
    });
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
  return session?.access_token || null;
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
