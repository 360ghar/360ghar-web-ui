import type { Locale } from '@/lib/i18n/locale';
import type { ReviewErrors } from './schema';

export type ReviewStrings = {
  title: string;
  lead: string;
  note: string;
  google: string;
  rating: string;
  labels: [string, string, string, string, string];
  role: string;
  rolePick: string;
  roles: [string, string][];
  name: string;
  optional: string;
  text: string;
  textHint: string;
  submit: string;
  sentTitle: string;
  sentBody: string;
  again: string;
  err: ReviewErrors;
};

/** Labels and the four roles come from the old ReviewCapture.jsx; the honest note about where a review goes is new. */
const TEXT: Record<Locale, ReviewStrings> = {
  en: {
    title: 'How was your experience with 360Ghar?',
    lead: 'Tell us how it went.',
    note: 'A review sent here goes to our team by email. We do not post it on this page. Public reviews are on Google.',
    google: 'Read reviews on Google',
    rating: 'Your rating',
    labels: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'],
    role: 'You used 360Ghar as a',
    rolePick: 'Select',
    roles: [
      ['buyer', 'Buyer'],
      ['seller', 'Seller'],
      ['tenant', 'Tenant'],
      ['landlord', 'Landlord'],
    ],
    name: 'Your name',
    optional: '(optional)',
    text: 'Your review',
    textHint: 'At least 20 characters.',
    submit: 'Send review',
    sentTitle: 'Review sent',
    sentBody: 'Thank you. Your feedback helps us improve.',
    again: 'Send another review',
    err: {
      rating: 'Choose a rating from 1 to 5 stars.',
      textShort: 'Write at least 20 characters.',
      textLong: 'Keep the review under 2000 characters.',
      nameLong: 'Keep the name under 80 characters.',
    },
  },
  hi: {
    title: '360Ghar के साथ आपका अनुभव कैसा रहा?',
    lead: 'हमें बताइए कैसा रहा।',
    note: 'यहाँ भेजा गया रिव्यू ईमेल से हमारी टीम तक जाता है। हम उसे इस पेज पर नहीं दिखाते। सार्वजनिक रिव्यू Google पर हैं।',
    google: 'Google पर रिव्यू पढ़ें',
    rating: 'आपकी रेटिंग',
    labels: ['खराब', 'ठीक', 'अच्छा', 'बहुत अच्छा', 'बेहतरीन'],
    role: 'आपने 360Ghar का उपयोग किया',
    rolePick: 'चुनें',
    roles: [
      ['buyer', 'खरीदार के रूप में'],
      ['seller', 'विक्रेता के रूप में'],
      ['tenant', 'किरायेदार के रूप में'],
      ['landlord', 'मकान मालिक के रूप में'],
    ],
    name: 'आपका नाम',
    optional: '(वैकल्पिक)',
    text: 'आपका रिव्यू',
    textHint: 'कम से कम 20 अक्षर।',
    submit: 'रिव्यू भेजें',
    sentTitle: 'रिव्यू भेज दिया गया',
    sentBody: 'धन्यवाद। आपकी राय से हमें बेहतर होने में मदद मिलती है।',
    again: 'एक और रिव्यू भेजें',
    err: {
      rating: '1 से 5 स्टार में रेटिंग चुनें।',
      textShort: 'कम से कम 20 अक्षर लिखें।',
      textLong: 'रिव्यू 2000 अक्षरों से कम रखें।',
      nameLong: 'नाम 80 अक्षरों से कम रखें।',
    },
  },
};

export const reviewStrings = (locale: Locale): ReviewStrings => TEXT[locale];

/** The public reviews page of the Google Business profile (the link the home page already used). */
export const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?q=360Ghar+Reviews#lrd=0x390d172407f3e11f:0x1c1fef0917d13d5e,3,,,,';
