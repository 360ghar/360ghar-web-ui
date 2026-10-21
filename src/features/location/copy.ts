import type { Locale } from '@/lib/i18n/locale';
import { byLocale } from '@/lib/i18n/locale';
import type { FailReason } from './logic';

type Copy = {
  reason: Record<FailReason, string>;
  how: string;
  dismiss: string;
  forget: string;
  forgotten: string;
  /** Place label when the centre is the fallback. Says so, so it is never shown as "Near me". */
  approxPlace: string;
};

const en: Copy = {
  reason: {
    denied: 'Location is off for this site. We use central Gurugram instead, so distances are approximate.',
    timeout: 'We could not find your location in time. We use central Gurugram instead, so distances are approximate.',
    unavailable: 'Your location is not available right now. We use central Gurugram instead, so distances are approximate.',
    unsupported: 'This browser cannot share a location. We use central Gurugram instead, so distances are approximate.',
  },
  how: 'To change it, type a place. Or allow location in your browser settings and tap Near me again.',
  dismiss: 'Close this notice',
  forget: 'Forget saved location',
  forgotten: 'Saved location removed.',
  approxPlace: 'Central Gurugram (approximate)',
};

const hi: Copy = {
  reason: {
    denied: 'इस साइट के लिए लोकेशन बंद है। हम मध्य गुरुग्राम इस्तेमाल कर रहे हैं, इसलिए दूरी अंदाज़न है।',
    timeout: 'हम समय पर आपकी लोकेशन नहीं ढूँढ पाए। हम मध्य गुरुग्राम इस्तेमाल कर रहे हैं, इसलिए दूरी अंदाज़न है।',
    unavailable: 'आपकी लोकेशन अभी उपलब्ध नहीं है। हम मध्य गुरुग्राम इस्तेमाल कर रहे हैं, इसलिए दूरी अंदाज़न है।',
    unsupported: 'यह ब्राउज़र लोकेशन नहीं दे सकता। हम मध्य गुरुग्राम इस्तेमाल कर रहे हैं, इसलिए दूरी अंदाज़न है।',
  },
  how: 'बदलने के लिए जगह का नाम लिखें। या ब्राउज़र सेटिंग में लोकेशन की अनुमति दें और फिर "मेरे पास" दबाएँ।',
  dismiss: 'यह सूचना बंद करें',
  forget: 'सेव की गई लोकेशन हटाएँ',
  forgotten: 'सेव की गई लोकेशन हट गई।',
  approxPlace: 'मध्य गुरुग्राम (अंदाज़न)',
};

export const locationCopy = (locale: Locale): Copy => byLocale(locale, { en, hi });
