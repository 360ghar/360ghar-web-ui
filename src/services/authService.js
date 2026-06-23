import api, { publicApi } from './api';
import { ensureSupabaseClient, setCachedAccessToken } from './supabaseClient';
import { setLastAuthMethod, AUTH_METHODS } from './lastAuthMethod';
import { SKIP_AUTH_RETRY } from './http';

// Normalize an identifier and detect whether it is an email or a phone number.
const isEmailIdentifier = (identifier) => (identifier || '').includes('@');

// Ensure a phone number is in E.164 format (default country: India +91).
const normalizePhoneForAuth = (phone) => {
  const trimmed = (phone || '').trim().replace(/\s+/g, '');
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
};

export const authService = {
  // Login user directly with Supabase Auth (email-or-phone + password)
  login: async (phoneOrEmail, password) => {
    const client = await ensureSupabaseClient();
    const identifier = (phoneOrEmail || '').trim();
    const credentials = isEmailIdentifier(identifier)
      ? { email: identifier, password }
      : { phone: normalizePhoneForAuth(identifier), password };

    const { data, error } = await client.auth.signInWithPassword(credentials);
    if (error || !data.session) {
      throw new Error(error?.message || 'Login failed');
    }

    // Populate the token cache immediately so the profile fetch below (and the
    // fire-and-forget recordLastMethod, and the SIGNED_IN-triggered sync) all
    // read the token synchronously instead of each acquiring the supabase auth
    // lock via getSession() — the root cause of the login AbortError. The
    // onAuthStateChange listener also sets this, but the fetch below can race it.
    setCachedAccessToken(data.session.access_token);

    // Record the last-used method (best-effort, never blocks login).
    const method = isEmailIdentifier(identifier)
      ? AUTH_METHODS.EMAIL_PASSWORD
      : AUTH_METHODS.PHONE_PASSWORD;
    authService.afterAuthSuccess(method, identifier);

    // Fetch the backend profile. Supabase auth just succeeded, so a 401/404
    // here means the user is authenticated but has no backend profile row yet
    // (common for fresh phone-auth signups before the profile is provisioned).
    // Return user: null so the auth store keeps the session and routes the
    // authenticated user to profile completion, instead of throwing and being
    // treated as a failed login (which previously also seeded an infinite
    // refresh↔fetch loop). Any other failure is a genuine error.
    //
    // SKIP_AUTH_RETRY + a shorter timeout: the access token is brand new, so a
    // 401 is "no profile row", not "token expired". Bypassing the 401 → refresh
    // → retry cycle (which would refresh, retry, and 401 again) avoids doubling
    // the latency and, across the several concurrent post-login fetches, the
    // long apparent hang users saw on the login spinner.
    let profile = null;
    try {
      const response = await api.get('/users/profile/', {
        [SKIP_AUTH_RETRY]: true,
        timeout: 10000,
      });
      profile = response.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status !== 401 && status !== 404) throw err;
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: profile,
    };
  },

  // ---- Google OAuth (redirect flow) --------------------------------------
  // Kicks off the Supabase Google OAuth redirect. Supabase redirects to Google,
  // then back to `${origin}/auth/callback?code=...` which AuthCallbackPage
  // exchanges for a session. No client-side Google client id needed here.
  // Override the callback origin via VITE_AUTH_REDIRECT_URL for Docker /
  // reverse-proxy setups that need a specific callback URL.
  //
  // The redirect URL MUST be allowlisted in the Supabase dashboard
  // (Authentication → URL Configuration → Redirect URLs), and the Supabase
  // project's Google callback (`https://<project-ref>.supabase.co/auth/v1/callback`)
  // MUST be an Authorized redirect URI in the Google Cloud Console OAuth client.
  // A "redirect_uri_mismatch" almost always means one of those is missing.
  signInWithGoogle: async (next) => {
    const client = await ensureSupabaseClient();
    const base = import.meta.env.VITE_AUTH_REDIRECT_URL ?? window.location.origin;
    // Canonicalize to the non-www origin so a visitor on https://www.360ghar.com
    // (which Netlify 301-redirects to non-www) still produces the allowlisted
    // callback URL instead of a www variant that Supabase rejects.
    const callbackUrl = new URL('/auth/callback', base);
    if (callbackUrl.hostname.startsWith('www.')) {
      callbackUrl.hostname = callbackUrl.hostname.slice(4);
    }
    if (next && typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')) {
      callbackUrl.searchParams.set('next', next);
    }
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });
    if (error) {
      // Surface the real Supabase/Google reason. A mismatch is usually a
      // dashboard allowlist issue, so hint at that for the user.
      const msg = error.message || 'Google sign-in failed';
      const hint = /redirect|uri|mismatch/i.test(msg)
        ? ' (Ensure the callback URL is allowlisted in Supabase and the Supabase Google callback is in Google Cloud Console.)'
        : '';
      throw new Error(msg + hint);
    }
    return data;
  },

  // Exchange the OAuth `code` (returned to /auth/callback) for a session.
  exchangeCodeForSession: async (code) => {
    const client = await ensureSupabaseClient();
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      throw new Error(error.message || 'Failed to complete sign-in');
    }
    return data;
  },

  // ---- Login state-machine -----------------------------------------------
  // PUBLIC. Given an email or phone, asks the backend whether the account
  // exists/verified/has a password and what the next step should be.
  // Returns { exists, verified, has_password, channel, next_step }.
  checkIdentifierStatus: async (identifier) => {
    const value = (identifier || '').trim();
    const { data } = await publicApi.post('/auth/identifier-status', {
      identifier: value,
    });
    return data;
  },

  // AUTH. Records the last-used auth method on the backend. Best-effort: never
  // throws into the auth flow (a failed mirror should not break login).
  recordLastMethod: async (method) => {
    try {
      await api.post('/auth/last-method', { method });
    } catch {
      // Non-fatal — local last-method storage is the source of truth for UI.
    }
  },

  // ---- Phone OTP ----------------------------------------------------------
  // `shouldCreateUser` defaults to FALSE so login & reset sends never silently
  // create an account for an unknown/mistyped number. Pass true ONLY for signup.
  sendPhoneOtp: async (phone, { shouldCreateUser = false } = {}) => {
    const client = await ensureSupabaseClient();
    const { error } = await client.auth.signInWithOtp({
      phone: normalizePhoneForAuth(phone),
      options: { shouldCreateUser },
    });
    if (error) {
      throw new Error(error.message || 'Failed to send OTP');
    }
    return { success: true };
  },

  verifyPhoneOtp: async (phone, token) => {
    const client = await ensureSupabaseClient();
    const { data, error } = await client.auth.verifyOtp({
      phone: normalizePhoneForAuth(phone),
      token: (token || '').trim(),
      type: 'sms',
    });
    if (error || !data.session) {
      throw new Error(error?.message || 'Invalid or expired code');
    }
    return data;
  },

  // ---- Email OTP (6-digit code, not magic link) ---------------------------
  // `shouldCreateUser` defaults to FALSE so login & reset sends never silently
  // create an account for an unknown/mistyped email. Pass true ONLY for signup.
  sendEmailOtp: async (email, { shouldCreateUser = false } = {}) => {
    const client = await ensureSupabaseClient();
    const { error } = await client.auth.signInWithOtp({
      email: (email || '').trim(),
      options: {
        shouldCreateUser,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      throw new Error(error.message || 'Failed to send OTP');
    }
    return { success: true };
  },

  verifyEmailOtp: async (email, token) => {
    const client = await ensureSupabaseClient();
    const { data, error } = await client.auth.verifyOtp({
      email: (email || '').trim(),
      token: (token || '').trim(),
      type: 'email',
    });
    if (error || !data.session) {
      throw new Error(error?.message || 'Invalid or expired code');
    }
    return data;
  },

  // Set a password after a passwordless (OTP) signup, while the session is live.
  setPasswordAfterSignup: async (password) => {
    const client = await ensureSupabaseClient();
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      throw new Error(error.message || 'Failed to set password');
    }
    return { success: true };
  },

  // ---- Add + verify a phone to an existing (e.g. Google) account ----------
  // Step 1: request an OTP for the new phone via updateUser({ phone }).
  startAddPhone: async (phone) => {
    const client = await ensureSupabaseClient();
    const { error } = await client.auth.updateUser({ phone: normalizePhoneForAuth(phone) });
    if (error) {
      throw new Error(error.message || 'Failed to send verification code');
    }
    return { success: true };
  },

  // Step 2: verify the code (type 'phone_change') to attach the phone.
  verifyAddPhone: async (phone, token) => {
    const client = await ensureSupabaseClient();
    const { data, error } = await client.auth.verifyOtp({
      phone: normalizePhoneForAuth(phone),
      token: (token || '').trim(),
      type: 'phone_change',
    });
    if (error) {
      throw new Error(error?.message || 'Invalid or expired code');
    }
    return data;
  },

  // Get current user profile. Accepts optional axios request config (e.g. to
  // pass SKIP_AUTH_RETRY for the fresh-sign-in path via syncUserProfile).
  getCurrentUser: async (requestConfig) => {
    const response = await api.get('/users/profile/', requestConfig);
    return response.data;
  },

  // Update current user profile
  updateCurrentUser: async (userData) => {
    const response = await api.put('/users/profile/', userData);
    return response.data;
  },

  // Logout - clear localStorage
  logout: async () => {
    const client = await ensureSupabaseClient();
    await client.auth.signOut();
    setCachedAccessToken(null);
    localStorage.removeItem('user');
  },

  // NOTE: Password reset now uses a 6-digit OTP for BOTH email and phone
  // (decision 1) — see ForgotPassword.jsx which calls sendEmailOtp/sendPhoneOtp
  // ({ shouldCreateUser: false }) then verifyEmailOtp/verifyPhoneOtp, and
  // finally resetPassword() below to set the new password on the live session.
  resetPassword: async (newPassword) => {
    const client = await ensureSupabaseClient();
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
    return { success: true };
  },

  // Change password - requires current password verification
  changePassword: async (currentPassword, newPassword) => {
    const client = await ensureSupabaseClient();

    // Get current user and their email/phone
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify current password by attempting to sign in
    // This ensures the user actually knows their current password
    const identifier = user.email || user.phone;
    if (!identifier) {
      throw new Error('User has no email or phone associated');
    }

    const credentials = isEmailIdentifier(identifier)
      ? { email: identifier, password: currentPassword }
      : { phone: identifier, password: currentPassword };

    const { error: verifyError } = await client.auth.signInWithPassword(credentials);

    if (verifyError) {
      throw new Error('Current password is incorrect');
    }

    // Current password verified, now update to new password
    const { error } = await client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message || 'Failed to change password');
    }

    return { success: true };
  },

  // ---- Shared success hook ------------------------------------------------
  // Persist the last-used method locally + mirror it to the backend.
  // Always safe to call after any successful authentication.
  afterAuthSuccess: (method, identifier) => {
    setLastAuthMethod(method, identifier);
    // Fire-and-forget the backend mirror.
    authService.recordLastMethod(method);
  },
};
