/**
 * Lazy Supabase client. The SDK loads only when an island needs auth.
 * Options match the old site, so the stored session (default storage key)
 * still works and signed-in users stay signed in after the switch.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

let client: Promise<SupabaseClient | null> | null = null;

export function supabase(): Promise<SupabaseClient | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  client ??= import('@supabase/supabase-js').then(({ createClient }) => {
    const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
    const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined;
    if (!url || !key) {
      console.warn('[auth] PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.');
      return null;
    }
    return createClient(url, key, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        // /auth/callback exchanges the code itself (avoids a double exchange).
        detectSessionInUrl: false,
      },
    });
  });
  return client;
}

/** Last profile name from the backend, per user (written by the auth store). */
export const PROFILE_NAME_KEY = '360ghar:profile-name';

/**
 * Reads the stored session without loading the SDK. Used by the header to
 * show "Sign in" or the user's name with no extra JavaScript. The name comes
 * from the backend profile when the auth store has seen it (the account page
 * shows that name too), else from the Supabase sign-up metadata.
 */
export function peekStoredUser(): { name: string | null; email: string | null } | null {
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (!k || !/^sb-.+-auth-token$/.test(k)) continue;
      const raw = JSON.parse(localStorage.getItem(k) ?? 'null') as {
        refresh_token?: string;
        user?: { id?: string; email?: string; user_metadata?: { full_name?: string; name?: string } };
      } | null;
      if (!raw?.refresh_token) return null;
      const meta = raw.user?.user_metadata;
      const saved = JSON.parse(localStorage.getItem(PROFILE_NAME_KEY) ?? 'null') as { uid?: string; name?: string } | null;
      const profileName = saved?.uid && saved.uid === raw.user?.id ? saved.name : null;
      return { name: profileName || meta?.full_name || meta?.name || null, email: raw.user?.email ?? null };
    }
  } catch {
    return null;
  }
  return null;
}
