import { getT } from '@/i18n';
import type { Locale } from '@/lib/i18n/locale';
import type { ReferralStrings } from './ReferralForm';

/** Property types of the old form (PROPERTY_TYPE_OPTIONS), labelled from `properties:taxonomy`. */
const TYPES = ['house', 'apartment', 'builder_floor', 'room', 'villa', 'plot', 'condo', 'penthouse', 'studio', 'loft', 'pg', 'flatmate', 'office', 'shop', 'warehouse'];
const RELATIONSHIPS = ['self', 'friend', 'family', 'neighbor', 'colleague', 'acquaintance', 'agent', 'other'];

const TEXT = {
  en: {
    you: 'Your details',
    property: 'Property details',
    relationship: 'Relationship to the owner',
    pick: 'Select',
    rel: ['Self (I am the owner)', 'Friend', 'Family member', 'Neighbour', 'Colleague', 'Acquaintance', 'Real estate agent', 'Other'],
    ownerName: 'Owner name',
    ownerPhone: 'Owner mobile number',
    address: 'Full property address',
    addressHint: 'House or flat number, building, street, sector or locality, city',
    type: 'Property type',
    intent: 'Rent or sale',
    intents: ['Rent', 'Sale'],
    price: 'Expected price or rent (₹)',
    notes: 'Notes',
    notesHint: 'BHK, amenities or anything else we should know',
    optional: '(optional)',
    consent: 'I confirm that the owner agreed to share their details with 360Ghar for this referral.',
    terms: 'I agree to the',
    termsLink: 'referral terms and conditions',
    submit: 'Submit referral',
    sentTitle: 'Referral sent',
    sentBody: 'Thank you. Our team will check the property and contact the owner.',
    again: 'Refer another property',
    err: {
      relationship: 'Select your relationship to the owner.',
      ownerName: 'Enter the owner name.',
      ownerPhone: 'Enter the owner mobile number (10 digits, starts with 6 to 9).',
      address: 'Enter the property address.',
      type: 'Select the property type.',
      intent: 'Select rent or sale.',
      consent: 'Confirm that the owner agreed.',
      terms: 'Accept the referral terms to continue.',
      price: 'Enter the amount in digits only.',
    },
  },
  hi: {
    you: 'आपकी जानकारी',
    property: 'प्रॉपर्टी की जानकारी',
    relationship: 'मालिक से आपका रिश्ता',
    pick: 'चुनें',
    rel: ['स्वयं (मैं मालिक हूँ)', 'दोस्त', 'परिवार का सदस्य', 'पड़ोसी', 'सहकर्मी', 'परिचित', 'रियल एस्टेट एजेंट', 'अन्य'],
    ownerName: 'मालिक का नाम',
    ownerPhone: 'मालिक का मोबाइल नंबर',
    address: 'प्रॉपर्टी का पूरा पता',
    addressHint: 'मकान या फ़्लैट नंबर, बिल्डिंग, गली, सेक्टर या इलाका, शहर',
    type: 'प्रॉपर्टी का प्रकार',
    intent: 'किराया या बिक्री',
    intents: ['किराया', 'बिक्री'],
    price: 'अपेक्षित कीमत या किराया (₹)',
    notes: 'नोट्स',
    notesHint: 'BHK, सुविधाएँ या कोई और जानकारी',
    optional: '(वैकल्पिक)',
    consent: 'मैं पुष्टि करता/करती हूँ कि मालिक ने इस रेफ़रल के लिए अपनी जानकारी 360Ghar को देने की सहमति दी है।',
    terms: 'मैं इनसे सहमत हूँ:',
    termsLink: 'रेफ़रल के नियम और शर्तें',
    submit: 'रेफ़रल भेजें',
    sentTitle: 'रेफ़रल भेज दिया गया',
    sentBody: 'धन्यवाद। हमारी टीम प्रॉपर्टी की जाँच करके मालिक से संपर्क करेगी।',
    again: 'एक और प्रॉपर्टी रेफ़र करें',
    err: {
      relationship: 'मालिक से अपना रिश्ता चुनें।',
      ownerName: 'मालिक का नाम लिखें।',
      ownerPhone: 'मालिक का मोबाइल नंबर लिखें (10 अंक, 6 से 9 से शुरू)।',
      address: 'प्रॉपर्टी का पता लिखें।',
      type: 'प्रॉपर्टी का प्रकार चुनें।',
      intent: 'किराया या बिक्री चुनें।',
      consent: 'पुष्टि करें कि मालिक सहमत है।',
      terms: 'आगे बढ़ने के लिए रेफ़रल की शर्तें स्वीकार करें।',
      price: 'रकम सिर्फ़ अंकों में लिखें।',
    },
  },
};

export function referralStrings(locale: Locale): ReferralStrings {
  const t = getT(locale);
  const x = TEXT[locale];
  return {
    ...x,
    name: t('forms:name.labelYourName'),
    phone: t('forms:phone.label'),
    phoneHint: t('forms:phone.helper'),
    email: t('forms:email.labelYourEmail'),
    relationships: RELATIONSHIPS.map((v, i) => [v, x.rel[i]!]),
    types: TYPES.map((v) => [v, t(`properties:taxonomy.propertyType.${v}`)]),
    intents: [
      ['rent', x.intents[0]!],
      ['sale', x.intents[1]!],
    ],
    err: { ...x.err, name: t('forms:name.required'), phone: t('forms:phone.invalid'), email: t('forms:email.invalidFormat') },
  };
}
