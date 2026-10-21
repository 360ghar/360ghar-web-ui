import { api, call } from '@/lib/api/client';
import { ApiError, networkError } from '@/lib/api/errors';
import { collectPages } from '@/lib/api/pages';
import type { components } from '@/lib/api/schema';

type Faq = components['schemas']['FAQResponse'];

/** Active FAQs in display order, as { q, a } for the page and the FAQPage JSON-LD. */
export function toFaqItems(items: Faq[]): { q: string; a: string }[] {
  return items
    .filter((f) => f.is_active && f.question.trim() && f.answer.trim())
    .sort((a, b) => a.display_order - b.display_order || a.id - b.id)
    .map((f) => ({ q: f.question.trim(), a: f.answer.trim() }));
}

/** GET /faqs/public at build time. Never throws. */
export async function loadFaqs() {
  try {
    const rows = await collectPages((cursor) => call(api.GET('/api/v1/faqs/public', { params: { query: { limit: 100, ...(cursor ? { cursor } : {}) } } })));
    return { items: toFaqItems(rows), error: null as ApiError | null };
  } catch (e) {
    const error = e instanceof ApiError ? e : networkError(e);
    console.warn('[faq] /faqs/public failed:', error.message);
    return { items: [], error };
  }
}
