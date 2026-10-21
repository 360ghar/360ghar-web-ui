import { COMPANY_EMAIL } from '@/lib/company';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import type { EnquiryErrors } from './schema';

/** Copy of the home owner enquiry. Labels come from the old `home:message.*` strings; sentences without a limited-time claim. */
export type EnquiryStrings = {
  title: string;
  lead: string;
  help: string;
  helpEmail: string;
  name: string;
  emailLabel: string;
  address: string;
  addressHint: string;
  notes: string;
  optional: string;
  agreePre: string;
  terms: string;
  and: string;
  privacy: string;
  agreePost: string;
  newTab: string;
  submit: string;
  sentTitle: string;
  sentBody: string;
  again: string;
  err: EnquiryErrors;
  termsHref: string;
  privacyHref: string;
};

const TEXT = {
  en: {
    title: 'Free owner onboarding and photography',
    lead: 'We come to your door, photograph the home, check the details and the location, and publish your listing. No upfront listing fee.',
    help: 'Owners, need help?',
    name: 'Full name',
    emailLabel: 'Email',
    address: 'Property address or area',
    addressHint: 'For example: DLF Phase 3, Gurugram',
    notes: 'Notes',
    optional: '(optional)',
    agreePre: 'I agree to the',
    terms: 'Terms of Service',
    and: 'and',
    privacy: 'Privacy Policy',
    agreePost: '.',
    newTab: '(opens in a new tab)',
    submit: 'Request free onboarding',
    sentTitle: 'Request sent',
    sentBody: 'Thank you. We have received your request.',
    again: 'Send another request',
    err: {
      name: 'Enter your name.',
      email: 'Enter your email address.',
      emailInvalid: 'Enter an email address like name@example.com.',
      address: 'Enter the property address or area.',
      notesLong: 'Keep the notes under 2000 characters.',
      consent: 'Tick the box to continue.',
    },
  },
  hi: {
    title: 'मुफ़्त मालिक ऑनबोर्डिंग और फ़ोटोग्राफ़ी',
    lead: 'हम आपके दरवाज़े पर आते हैं, घर की फ़ोटो लेते हैं, जानकारी और जगह जाँचते हैं और आपकी लिस्टिंग पब्लिश करते हैं। कोई अग्रिम लिस्टिंग शुल्क नहीं।',
    help: 'मालिक, मदद चाहिए?',
    name: 'पूरा नाम',
    emailLabel: 'ईमेल',
    address: 'प्रॉपर्टी का पता या इलाका',
    addressHint: 'उदाहरण: DLF फेज़ 3, गुरुग्राम',
    notes: 'नोट्स',
    optional: '(वैकल्पिक)',
    agreePre: 'मैं',
    terms: 'सेवा की शर्तों',
    and: 'और',
    privacy: 'गोपनीयता नीति',
    agreePost: ' से सहमत हूँ।',
    newTab: '(नए टैब में खुलता है)',
    submit: 'मुफ़्त ऑनबोर्डिंग का अनुरोध करें',
    sentTitle: 'अनुरोध भेज दिया गया',
    sentBody: 'धन्यवाद। हमें आपका अनुरोध मिल गया है।',
    again: 'एक और अनुरोध भेजें',
    err: {
      name: 'अपना नाम लिखें।',
      email: 'अपना ईमेल पता लिखें।',
      emailInvalid: 'name@example.com जैसा ईमेल पता लिखें।',
      address: 'प्रॉपर्टी का पता या इलाका लिखें।',
      notesLong: 'नोट्स 2000 अक्षरों से कम रखें।',
      consent: 'आगे बढ़ने के लिए बॉक्स पर टिक करें।',
    },
  },
} as const;

export function enquiryStrings(locale: Locale): EnquiryStrings {
  const s = TEXT[locale];
  return {
    ...s,
    helpEmail: COMPANY_EMAIL,
    err: { ...s.err },
    termsHref: localizePath('/policies/terms-of-service', locale),
    privacyHref: localizePath('/policies/privacy-policy', locale),
  };
}
