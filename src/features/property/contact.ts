/**
 * Who a visitor talks to about a listing. The owner's own number is never
 * shown: the listing's agent answers, else the 360 Ghar team (company number).
 * `agent` is on the detail response only. (`owner_contact` is already the agent's
 * or the company number for a visitor, and the owner's own number for the owner,
 * so it is not read here.)
 */
import type { PropertyDetail } from '@/lib/api/types';
import { COMPANY_PHONE } from '@/lib/company';
import type { Locale } from '@/lib/i18n/locale';
import { tenDigits, toE164 } from '@/lib/phone';

export type Contact = { name: string | null; phone: string; avatar: string | null };

/** "+91XXXXXXXXXX" from a 10-digit, 0-prefixed or 91-prefixed number; null when it is not one. */
export function normalizePhone(value: string | null | undefined): string | null {
  const d = tenDigits(value);
  return d ? toE164(d) : null;
}

/** "+91 98765 43210" for display. */
export const phoneLabel = (e164: string) => e164.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2');

export function listingContact(p: Pick<PropertyDetail, 'agent'>): Contact {
  const phone = normalizePhone(p.agent?.contact_number);
  return phone ? { name: p.agent?.name ?? null, phone, avatar: p.agent?.avatar_url ?? null } : { name: null, phone: COMPANY_PHONE, avatar: null };
}

const WA_TEXT = {
  en: (title: string, url: string) => `Hi, I saw "${title}" on 360Ghar and want to know more. ${url}`,
  hi: (title: string, url: string) => `नमस्ते, मैंने 360Ghar पर "${title}" देखा और और जानकारी चाहता/चाहती हूँ। ${url}`,
};

/** WhatsApp chat link with a first message that names the home. */
export function waLink(phone: string, title: string, url: string, locale: Locale): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(WA_TEXT[locale](title, url))}`;
}
