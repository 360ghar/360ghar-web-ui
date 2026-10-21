import { z } from 'zod';

/** Sent as `source` and `form_type`, so review mails are told apart from the contact form (same Formspree form). */
export const REVIEW_SOURCE = 'review';

export const ROLES = ['buyer', 'seller', 'tenant', 'landlord'] as const;
export type Role = (typeof ROLES)[number];

/** The old form's rule (ReviewCapture.jsx): at least 20 characters. */
export const MIN_TEXT = 20;
export const MAX_TEXT = 2000;

export type ReviewErrors = { rating: string; textShort: string; textLong: string; nameLong: string };

/** `website` is the honeypot: people never see it. */
export function reviewSchema(e: ReviewErrors) {
  return z.object({
    rating: z.enum(['1', '2', '3', '4', '5'], { message: e.rating }),
    text: z.string().trim().min(MIN_TEXT, e.textShort).max(MAX_TEXT, e.textLong),
    name: z.string().trim().max(80, e.nameLong),
    role: z.union([z.enum(ROLES), z.literal('')]),
    website: z.string(),
  });
}

export type ReviewValues = z.infer<ReturnType<typeof reviewSchema>>;

export const isSpam = (v: Pick<ReviewValues, 'website'>) => v.website.trim() !== '';

/**
 * The Formspree body: the fields of the old `POST /api/reviews` (rating, text,
 * name, role, propertyId, platform) plus the source. No name means "Anonymous", as before.
 */
export function reviewPayload(v: ReviewValues, propertyId?: number | null): Record<string, string> {
  return {
    source: REVIEW_SOURCE,
    form_type: REVIEW_SOURCE,
    _subject: `Review: ${v.rating} of 5${v.role ? ` from a ${v.role}` : ''}`,
    rating: v.rating,
    text: v.text,
    name: v.name || 'Anonymous',
    role: v.role,
    platform: 'web',
    ...(propertyId ? { property_id: String(propertyId) } : {}),
  };
}
