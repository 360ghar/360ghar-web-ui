import { api, publicApi } from './api';

/**
 * Account deletion / data-erasure request service.
 *
 * CRITICAL FIX (audit 1.3): previously the AccountDeletionRequest page posted
 * to Formspree (a third-party form backend), bypassing our own backend and
 * authentication. This service centralises the deletion-request contract.
 *
 * Contract (expected backend):
 *   POST   /account/delete-request/                 -> create request
 *          body: { email, deletion_type, reason, message }
 *          resp: { id, status, created_at }
 *   GET    /account/delete-request/{id}/status/      -> poll status
 *   POST   /account/delete-request/{id}/cancel/      -> cancel pending request
 *
 * TODO(BACKEND): confirm the exact FastAPI route names and response shapes with
 * the backend team. If the route does not yet exist, the calls below will 404
 * and the calling UI will surface a clear error to the user instead of silently
 * succeeding via a third party.
 */

const BASE = '/account/delete-request';

export const deletionService = {
  /**
   * Submit a new account-deletion / data-erasure request.
   * Uses the authenticated `api` instance so the backend can associate the
   * request with the logged-in user when available. Anonymous submissions
   * (GDPR right) still work because email is the primary key.
   * @param {{ email: string, deletion_type: string, reason: string, message?: string }} data
   * @returns {Promise<{ id: string, status: string, created_at: string }>}
   */
  submitDeletionRequest: async (data) => {
    const response = await api.post(`${BASE}/`, data);
    return response.data;
  },

  /**
   * Get the status of an existing deletion request (public, keyed by id).
   * @param {string} requestId
   */
  getDeletionRequestStatus: async (requestId) => {
    const response = await publicApi.get(`${BASE}/${requestId}/status/`);
    return response.data;
  },

  /**
   * Cancel a pending deletion request (within the grace period).
   * @param {string} requestId
   */
  cancelDeletionRequest: async (requestId) => {
    const response = await api.post(`${BASE}/${requestId}/cancel/`);
    return response.data;
  },
};

export default deletionService;
