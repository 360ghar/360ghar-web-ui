import api from './api';

/**
 * Payment service — wraps the /payments/* endpoints (Razorpay-backed bookings
 * and stored payment methods). All endpoints require a Supabase bearer token,
 * so this module uses the authenticated `api` instance.
 *
 * Contract (expected backend):
 *   POST   /payments/razorpay/order       -> { order_id, amount, currency, key, booking_id }
 *   POST   /payments/razorpay/verify      -> MessageResponse
 *   GET    /payments/methods              -> [PaymentMethodOut]
 *   POST   /payments/methods              -> PaymentMethodOut
 *   PUT    /payments/methods/{id}         -> PaymentMethodOut
 *   DELETE /payments/methods/{id}         -> MessageResponse
 */
export const paymentService = {
  /**
   * Create a Razorpay order for an existing booking. The frontend uses the
   * returned `order_id` + `key` to open the Razorpay checkout widget.
   * @param {string} bookingId
   * @returns {Promise<{ order_id: string, amount: number, currency: string, key: string, booking_id: string }>}
   */
  createOrder: async (bookingId) => {
    const response = await api.post('/payments/razorpay/order', { booking_id: bookingId });
    return response.data;
  },

  /**
   * Verify a Razorpay payment after the checkout widget completes.
   * @param {{ booking_id: string, razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  verifyPayment: async ({ booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const response = await api.post('/payments/razorpay/verify', {
      booking_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return response.data;
  },

  /**
   * List the caller's saved payment methods (cards / UPI / netbanking tokens).
   * @returns {Promise<Array<{ id: string, type: string, last4?: string, brand?: string, expiry_month?: number, expiry_year?: number, is_default?: boolean }>>}
   */
  listMethods: async () => {
    const response = await api.get('/payments/methods');
    return response.data;
  },

  /**
   * Persist a new payment method for the caller (e.g. after tokenising a card).
   * @param {{ type: string, last4?: string, brand?: string, expiry_month?: number, expiry_year?: number, is_default?: boolean }} data
   * @returns {Promise<object>}
   */
  addMethod: async ({ type, last4, brand, expiry_month, expiry_year, is_default }) => {
    const response = await api.post('/payments/methods', {
      type,
      last4,
      brand,
      expiry_month,
      expiry_year,
      is_default,
    });
    return response.data;
  },

  /**
   * Update an existing payment method (e.g. mark as default, refresh expiry).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  updateMethod: async (id, payload) => {
    const response = await api.put(`/payments/methods/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a saved payment method.
   * @param {string} id
   * @returns {Promise<{ message: string }>}
   */
  removeMethod: async (id) => {
    const response = await api.delete(`/payments/methods/${id}`);
    return response.data;
  },
};

export default paymentService;
