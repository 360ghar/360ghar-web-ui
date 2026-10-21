/**
 * Auth state shared by every island (Zustand module singleton).
 *
 * `initAuth()` runs once per page, on first use. It loads the session,
 * registers the token provider with the API client, then loads the backend
 * profile and the auth stage.
 */
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { api, call, setAuthProvider } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { AuthGateState, SelfUser } from '@/lib/api/types';
import { identify, resetAnalytics } from '@/lib/analytics';
import { clearSavedLists } from '@/lib/infinite';
import { PROFILE_NAME_KEY, peekStoredUser, supabase } from './supabase';

export type Profile = SelfUser;
/** `GET /api/v1/users/me/auth-state`: generated from the backend `AuthGateState`. */
export type AuthStage = AuthGateState;

type AuthState = {
  status: 'unknown' | 'anon' | 'authed';
  session: Session | null;
  profile: Profile | null;
  stage: AuthStage | null;
  /** Backend unreachable while signed in: the UI keeps the session but shows a notice. */
  profileError: ApiError | null;
};

export const useAuthStore = create<AuthState>(() => ({
  status: 'unknown',
  session: null,
  profile: null,
  stage: null,
  profileError: null,
}));

let started: Promise<void> | null = null;

/** Keeps the backend profile name for the header, so header and account show the same name. */
function rememberName(uid: string | undefined, name: string | null | undefined) {
  try {
    if (uid && name) localStorage.setItem(PROFILE_NAME_KEY, JSON.stringify({ uid, name }));
    else if (!uid) localStorage.removeItem(PROFILE_NAME_KEY);
  } catch {
    // Storage blocked: the header falls back to the sign-up name.
  }
}

async function loadProfile() {
  try {
    const [profile, stage] = await Promise.all([
      call(api.GET('/api/v1/users/profile')),
      call(api.GET('/api/v1/users/me/auth-state', { params: { query: { app: 'ghar' } } })).catch(() => null),
    ]);
    useAuthStore.setState({ profile, stage, profileError: null });
    rememberName(useAuthStore.getState().session?.user.id, profile.full_name);
    identify(String(profile.id), { email: profile.email ?? undefined, name: profile.full_name ?? undefined });
  } catch (error) {
    useAuthStore.setState({ profileError: error instanceof ApiError ? error : null });
  }
}

export function initAuth(): Promise<void> {
  // Nothing stored: the visitor is signed out and the 55 KB SDK is not needed.
  // Not cached, so the next call (for example after sign-in) checks again.
  if (!started && !peekStoredUser()) {
    useAuthStore.setState({ status: 'anon' });
    return Promise.resolve();
  }
  started ??= (async () => {
    const sb = await supabase();
    if (!sb) {
      useAuthStore.setState({ status: 'anon' });
      return;
    }
    setAuthProvider({
      token: async () => (await sb.auth.getSession()).data.session?.access_token ?? null,
      refresh: async () => {
        const { data } = await sb.auth.refreshSession();
        if (!data.session) {
          clearStoredAccountData();
          useAuthStore.setState({ status: 'anon', session: null, profile: null, stage: null });
          return null;
        }
        return data.session.access_token;
      },
    });
    const { data } = await sb.auth.getSession();
    useAuthStore.setState({ status: data.session ? 'authed' : 'anon', session: data.session });
    if (data.session) await loadProfile();

    sb.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        useAuthStore.setState({ session });
        return;
      }
      if (event === 'SIGNED_OUT' || !session) {
        clearStoredAccountData();
        rememberName(undefined, null);
        useAuthStore.setState({ status: 'anon', session: null, profile: null, stage: null });
        resetAnalytics();
        return;
      }
      // Another account signed in on this page: nothing the last one saved stays.
      const previous = useAuthStore.getState().session?.user.id;
      if (previous && previous !== session.user.id) clearStoredAccountData();
      useAuthStore.setState({ status: 'authed', session });
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') void loadProfile();
    });
  })();
  return started;
}

/** Reloads profile and stage, e.g. after profile completion. */
export const refreshProfile = () => loadProfile();

/**
 * Browser copies of account data are dropped when the session ends or the account changes:
 * the chat (key owned by features/chat/store.ts), the unsent listing draft with the name and
 * phone typed into it (key owned by features/post-property/PostProperty.tsx) and the lists saved for Back.
 */
function clearStoredAccountData() {
  try {
    localStorage.removeItem('360ghar:chat-v2');
    sessionStorage.removeItem('360ghar:post-draft');
  } catch {
    // Storage blocked: nothing was stored.
  }
  clearSavedLists();
}

export async function signOut() {
  const sb = await supabase();
  await sb?.auth.signOut();
  clearStoredAccountData();
  rememberName(undefined, null);
  useAuthStore.setState({ status: 'anon', session: null, profile: null, stage: null });
  resetAnalytics();
}
