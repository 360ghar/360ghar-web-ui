/** Small strings shared by the content pages. Old translations come from getT(); these are new. */
import { COMPANY_EMAIL } from '@/lib/company';
import { formatDate } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';

const TEXT = {
  en: {
    home: 'Home',
    sending: 'Sending...',
    notSent: 'Your message was not sent.',
    network: 'We could not reach the form service. Check your connection.',
    tryAgain: `Try again, or email ${COMPANY_EMAIL}.`,
    newsletterTitle: 'New verified homes and guides, by email',
    newsletterBody: 'Listings, circle-rate changes and tenant guides for Gurugram.',
    newsletterEmail: 'Email address',
    newsletterButton: 'Subscribe',
    emailRequired: 'Enter your email address.',
    emailInvalid: 'Enter an email address like name@example.com.',
    onThisPage: 'On this page',
    faqTitle: 'Questions and answers',
    faqs: 'Frequently asked questions',
  },
  hi: {
    home: 'होम',
    sending: 'भेज रहे हैं...',
    notSent: 'आपका संदेश नहीं गया।',
    network: 'फ़ॉर्म सेवा से संपर्क नहीं हो सका। अपना इंटरनेट कनेक्शन देखें।',
    tryAgain: `दोबारा कोशिश करें, या ${COMPANY_EMAIL} पर ईमेल करें।`,
    newsletterTitle: 'नए वेरिफाइड घर और गाइड, ईमेल पर',
    newsletterBody: 'गुरुग्राम की लिस्टिंग, सर्कल रेट में बदलाव और किरायेदार गाइड।',
    newsletterEmail: 'ईमेल पता',
    newsletterButton: 'सब्सक्राइब करें',
    emailRequired: 'अपना ईमेल पता लिखें।',
    emailInvalid: 'name@example.com जैसा ईमेल पता लिखें।',
    onThisPage: 'इस पेज पर',
    faqTitle: 'सवाल और जवाब',
    faqs: 'अक्सर पूछे जाने वाले सवाल',
  },
} satisfies Record<Locale, Record<string, string>>;

type SharedText = (typeof TEXT)['en'];
export const shared = (locale: Locale): SharedText => TEXT[locale];

/** Old copy uses spaced em dashes; the new site does not. "A — b" becomes "A, b". */
export const undash = (s: string) => s.replace(/\s+[—–]\s+/g, ', ');

/** "2026-06-08" -> "8 June 2026" (Indian calendar format, IST). */
export const longDate = (iso: string, locale: Locale) =>
  formatDate(iso, locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
