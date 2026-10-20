import { z } from 'zod';
import { EMAIL_RE } from '@/lib/phone';

/** Sent as `source` and `form_type`, so these mails are told apart from the contact form (same Formspree form). */
export const ENQUIRY_SOURCE = 'home-enquiry';

export type EnquiryErrors = { name: string; email: string; emailInvalid: string; address: string; notesLong: string; consent: string };

/** The owner enquiry form of the home page. `website` is the honeypot: people never see it. */
export function enquirySchema(e: EnquiryErrors) {
  return z.object({
    full_name: z.string().trim().min(1, e.name),
    email: z.string().trim().min(1, e.email).regex(EMAIL_RE, e.emailInvalid),
    address: z.string().trim().min(1, e.address),
    message: z.string().trim().max(2000, e.notesLong),
    consent: z.literal(true, { message: e.consent }),
    website: z.string(),
  });
}

export type EnquiryValues = z.infer<ReturnType<typeof enquirySchema>>;

/** A bot fills the hidden field. Its form is shown as sent, and nothing is posted. */
export const isSpam = (v: Pick<EnquiryValues, 'website'>) => v.website.trim() !== '';

/** The Formspree body: the fields of the old form plus the source. The honeypot and the checkbox flag are not sent as they are. */
export function enquiryPayload(v: EnquiryValues): Record<string, string> {
  return {
    source: ENQUIRY_SOURCE,
    form_type: ENQUIRY_SOURCE,
    _subject: `Owner enquiry: ${v.address}`,
    full_name: v.full_name,
    email: v.email,
    address: v.address,
    message: v.message,
    terms_agreement: 'yes',
  };
}
