const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const IS_TEST_MODE = import.meta.env.MODE === 'test' || import.meta.env.VITEST === 'true';

if (!IS_TEST_MODE && (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY)) {
  throw new Error(
    'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
  );
}

// Lazy-loaded singleton — the @supabase/supabase-js SDK (~152KB) is only downloaded
// when first needed (login, session check, etc.) instead of on every page load.
let _supabase = null;
let _initPromise = null;

async function getClientLazy() {
  if (_supabase) return _supabase;
  if (_initPromise) return _initPromise;
  _initPromise = import('@supabase/supabase-js').then(({ createClient }) => {
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
    _supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
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
