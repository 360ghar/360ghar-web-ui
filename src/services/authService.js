import api, { publicApi } from './api';
import { ensureSupabaseClient } from './supabaseClient';
import { setLastAuthMethod, AUTH_METHODS } from './lastAuthMethod';

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

    // Record the last-used method (best-effort, never blocks login).
    const method = isEmailIdentifier(identifier)
      ? AUTH_METHODS.EMAIL_PASSWORD
      : AUTH_METHODS.PHONE_PASSWORD;
    authService.afterAuthSuccess(method, identifier);

    const response = await api.get('/users/profile/');
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: response.data,
    };
  },

  // ---- Google OAuth (redirect flow) --------------------------------------
  // Kicks off the Supabase Google OAuth redirect. Supabase redirects to Google,
  // then back to `${origin}/auth/callback?code=...` which AuthCallbackPage
  // exchanges for a session. No client-side Google client id needed here.
  // Override the callback origin via VITE_AUTH_REDIRECT_URL for Docker /
  // reverse-proxy setups that need a specific callback URL.
  signInWithGoogle: async (next) => {
    const client = await ensureSupabaseClient();
    const base = import.meta.env.VITE_AUTH_REDIRECT_URL ?? window.location.origin;
    const callbackUrl = new URL('/auth/callback', base);
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
      throw new Error(error.message || 'Google sign-in failed');
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

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/users/profile/');
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
