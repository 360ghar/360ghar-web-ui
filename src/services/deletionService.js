import { api, publicApi } from './api';

/**
 * Account deletion / data-erasure service.
 *
 * Two flows are exposed:
 *
 *   1. Logged-in user clicks "Delete my account" — we POST `/auth/delete-account`
 *      (authenticated, returns 204) and let the auth store tear down the local
 *      session. Replaces the older `/account/delete-request/` flow for users
 *      who can prove their identity via the Supabase session.
 *
 *   2. Anonymous / unverified user submits the GDPR request form — kept on
 *      `/account/delete-request/` so we still collect a contact email and
 *      reason for the data-protection team to action.
 *
 * Contract:
 *   POST   /auth/delete-account              -> 204 No Content (auth)
 *   POST   /account/delete-request/          -> create request (auth, best-effort)
 *          body: { email, deletion_type, reason, message }
 *          resp: { id, status, created_at }
 *   GET    /account/delete-request/{id}/status/      -> poll status (public)
 *   POST   /account/delete-request/{id}/cancel/      -> cancel pending request (auth)
 *
 * TODO(BACKEND): confirm the exact FastAPI route names and response shapes with
 * the backend team. If a route does not yet exist, the calls below will 404
 * and the calling UI will surface a clear error to the user instead of silently
 * succeeding via a third party.
 */

export const deletionService = {
  /**
   * Immediate account deletion for an authenticated user.
   * Backend returns 204 No Content on success.
   * @returns {Promise<void>}
   */
  deleteAccountImmediate: async () => {
    await api.post('/auth/delete-account');
  },

  /**
   * Submit a new account-deletion / data-erasure request.
   * Uses the authenticated `api` instance so the backend can associate the
   * request with the logged-in user when available. Anonymous submissions
   * (GDPR right) still work because email is the primary key.
   * @param {{ email: string, deletion_type: string, reason: string, message?: string }} data
   * @returns {Promise<{ id: string, status: string, created_at: string }>}
   */
  submitDeletionRequest: async (data) => {
    const response = await api.post('/account/delete-request/', data);
    return response.data;
  },

  /**
   * Get the status of an existing deletion request (public, keyed by id).
   * @param {string} requestId
   */
  getDeletionRequestStatus: async (requestId) => {
    const response = await publicApi.get(`/account/delete-request/${requestId}/status/`);
    return response.data;
  },

  /**
   * Cancel a pending deletion request (within the grace period).
   * @param {string} requestId
   */
  cancelDeletionRequest: async (requestId) => {
    const response = await api.post(`/account/delete-request/${requestId}/cancel/`);
    return response.data;
  },
};

export default deletionService;
