import api from './api';
import { ensureSupabaseClient } from './supabaseClient';

export const authService = {
  // Login user directly with Supabase Auth (phone-first, email optional)
  login: async (phoneOrEmail, password) => {
    const client = await ensureSupabaseClient();
    const identifier = (phoneOrEmail || '').trim();
    const credentials = identifier.includes('@')
      ? { email: identifier, password }
      : { phone: identifier, password };

    const { data, error } = await client.auth.signInWithPassword(credentials);
    if (error || !data.session) {
      throw new Error(error?.message || 'Login failed');
    }

    const response = await api.get('/users/profile/');
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: response.data,
    };
  },

  // Register new user directly with Supabase Auth
  register: async (userData) => {
    const client = await ensureSupabaseClient();
    const phone = (userData.phone || '').trim();
    const email = (userData.email || '').trim();

    const payload = {
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name || '',
          email: email || null,
        },
      },
    };

    if (phone) {
      payload.phone = phone;
    } else if (email) {
      payload.email = email;
    } else {
      throw new Error('Phone or email is required');
    }

    const { data, error } = await client.auth.signUp(payload);
    if (error) {
      throw new Error(error.message);
    }

    if (!data.session) {
      return {
        access_token: null,
        refresh_token: null,
        expires_in: null,
        token_type: null,
        user: null,
      };
    }

    const response = await api.get('/users/profile/');
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: response.data,
    };
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

  sendPasswordResetEmail: async (email) => {
    const client = await ensureSupabaseClient();
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      throw new Error(error.message || 'Failed to send reset email');
    }
    return { success: true };
  },

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

    const credentials = identifier.includes('@')
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
};
