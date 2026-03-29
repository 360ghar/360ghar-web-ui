/**
 * Extract a human-readable error message from an Axios error.
 *
 * Handles FastAPI/Pydantic v2 error formats:
 *  - { detail: string }
 *  - { detail: [{ msg: "..."}, ...] }
 *  - { detail: { msg: "..." } }
 *  - Plain Error with .message
 */
export const extractError = (err, fallback = 'Something went wrong') => {
  try {
    const detail = err?.response?.data?.detail ?? err?.message ?? err?.toString?.();
    if (Array.isArray(detail)) {
      const msgs = detail.map((d) => d?.msg || d?.message || (typeof d === 'string' ? d : JSON.stringify(d)));
      return msgs.filter(Boolean).join(', ') || fallback;
    }
    if (detail && typeof detail === 'object') {
      if (detail?.msg || detail?.message) return detail.msg || detail.message;
      return JSON.stringify(detail);
    }
    if (typeof detail === 'string') return detail;
    return fallback;
  } catch {
    return fallback;
  }
};
