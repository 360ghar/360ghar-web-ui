/**
 * Rent agreement and legal notice drafters: the form fields, texts and page copy, English and Hindi.
 * The clauses themselves come from the backend (POST /api/v1/ai/legal-draft, a fixed template). This file holds
 * what the page says around them, including the disclaimer that is always shown and printed.
 */
import type { Faq, HowTo } from '../seo';

export type Kind = 'rent_agreement' | 'legal_notice';
type Pair = [en: string, hi: string];

export type Field = {
  name: string;
  label: Pair;
  type: 'text' | 'area' | 'num' | 'date' | 'select';
  optional?: boolean;
  /** Optional for the schema, but not marked "(optional)": the form asks for it in some cases. */
  conditional?: boolean;
  /** `num`: whole numbers only. */
  int?: boolean;
  /** `select` with the values 'true' and 'false': sent as a boolean. */
  bool?: boolean;
  hint?: Pair;
  /** `num`: the allowed range. `text` and `area`: `min` and `max` are the length. */
  min?: number;
  max?: number;
  def?: string;
  options?: [value: string, label: Pair][];
};

export type Section = { title: Pair; fields: Field[] };

const party = (who: 'landlord' | 'tenant' | 'sender' | 'recipient', title: Pair): Section => ({
  title,
  fields: [
    { name: `${who}_name`, label: [`${title[0]} name`, `${title[1]} का नाम`], type: 'text', min: 2, max: 100 },
    { name: `${who}_address`, label: [`${title[0]} address`, `${title[1]} का पता`], type: 'area', min: 5, max: 300 },
  ],
});

// Names, limits and defaults are those of the backend's RentAgreementFields and LegalNoticeFields (POST /api/v1/ai/legal-draft).
export const SECTIONS: Record<Kind, Section[]> = {
  rent_agreement: [
    party('landlord', ['Landlord', 'मकान मालिक']),
    party('tenant', ['Tenant', 'किरायेदार']),
    {
      title: ['Home and terms', 'घर और शर्तें'],
      fields: [
        { name: 'property_address', label: ['Address of the home', 'घर का पता'], type: 'area', min: 5, max: 300 },
        { name: 'city', label: ['City', 'शहर'], type: 'text', min: 2, max: 100 },
        { name: 'state', label: ['State', 'राज्य'], type: 'text', min: 2, max: 100 },
        { name: 'monthly_rent', label: ['Monthly rent (₹)', 'मासिक किराया (₹)'], type: 'num', int: true, min: 1, max: 10_000_000 },
        { name: 'security_deposit', label: ['Security deposit (₹)', 'सिक्योरिटी डिपॉज़िट (₹)'], type: 'num', int: true, min: 0, max: 100_000_000 },
        { name: 'start_date', label: ['Start date', 'शुरू होने की तारीख'], type: 'date' },
        { name: 'duration_months', label: ['Term (months)', 'अवधि (महीने)'], type: 'num', int: true, min: 1, max: 60, def: '11', hint: ['11 months is common, to avoid registration.', 'आम तौर पर 11 महीने, ताकि रजिस्ट्रेशन न करना पड़े।'] },
        { name: 'rent_due_day', label: ['Rent due on day', 'किराया देने का दिन'], type: 'num', int: true, min: 1, max: 28, def: '5', hint: ['Day of the month, 1 to 28.', 'महीने की तारीख, 1 से 28।'] },
        { name: 'lock_in_months', label: ['Lock-in (months)', 'लॉक-इन (महीने)'], type: 'num', int: true, min: 0, max: 24, def: '0' },
        { name: 'notice_period_days', label: ['Notice period (days)', 'नोटिस अवधि (दिन)'], type: 'num', int: true, min: 7, max: 180, def: '30' },
        { name: 'annual_increase_percent', label: ['Yearly rent increase (%)', 'सालाना किराया बढ़ोतरी (%)'], type: 'num', int: true, min: 0, max: 25, def: '5' },
        {
          name: 'furnished',
          label: ['Furnishing', 'फ़र्निशिंग'],
          type: 'select',
          bool: true,
          def: 'false',
          options: [
            ['false', ['Not furnished', 'फ़र्निश्ड नहीं']],
            ['true', ['Furnished', 'फ़र्निश्ड']],
          ],
        },
        {
          name: 'maintenance_by',
          label: ['Society maintenance paid by', 'सोसाइटी मेंटेनेंस कौन देगा'],
          type: 'select',
          def: 'tenant',
          options: [
            ['tenant', ['Tenant', 'किरायेदार']],
            ['landlord', ['Landlord', 'मकान मालिक']],
          ],
        },
        { name: 'additional_terms', label: ['Other terms', 'अन्य शर्तें'], type: 'area', optional: true, max: 500, hint: ['Optional. The draft may reword it, and then shows your own words too.', 'वैकल्पिक। ड्राफ़्ट इसे दोबारा लिख सकता है, तब आपके अपने शब्द भी दिखते हैं।'] },
      ],
    },
  ],
  legal_notice: [
    {
      title: ['Reason', 'कारण'],
      fields: [
        {
          name: 'notice_type',
          label: ['What is the notice about', 'नोटिस किस बारे में है'],
          type: 'select',
          def: 'security_deposit_refund',
          options: [
            ['security_deposit_refund', ['Security deposit not returned', 'सिक्योरिटी डिपॉज़िट वापस नहीं मिला']],
            ['rent_arrears', ['Unpaid rent', 'बकाया किराया']],
            ['vacate_premises', ['Vacate the home', 'घर खाली करना']],
            ['breach_of_agreement', ['Breach of the agreement', 'समझौते का उल्लंघन']],
          ],
        },
        { name: 'property_address', label: ['Address of the home', 'घर का पता'], type: 'area', min: 5, max: 300 },
        { name: 'amount', label: ['Amount claimed (₹)', 'दावे की राशि (₹)'], type: 'num', int: true, min: 1, max: 100_000_000, optional: true, conditional: true, hint: ['Needed for unpaid rent and a deposit refund.', 'बकाया किराए और डिपॉज़िट वापसी के लिए ज़रूरी।'] },
        { name: 'agreement_date', label: ['Date of the agreement', 'समझौते की तारीख'], type: 'date', optional: true },
        { name: 'facts', label: ['What happened', 'क्या हुआ'], type: 'area', optional: true, max: 600, hint: ['Dates, amounts and what you asked for. Plain facts only. The draft may reword it, and then shows your own words too.', 'तारीख़ें, राशि और आपने क्या माँगा। सिर्फ़ सीधे तथ्य। ड्राफ़्ट इसे दोबारा लिख सकता है, तब आपके अपने शब्द भी दिखते हैं।'] },
        { name: 'compliance_days', label: ['Days to respond', 'जवाब के लिए दिन'], type: 'num', int: true, min: 7, max: 90, def: '15' },
      ],
    },
    party('sender', ['Sender (you)', 'भेजने वाला (आप)']),
    party('recipient', ['Recipient', 'पाने वाला']),
  ],
};

export const UI = {
  en: {
    generate: 'Draft the document',
    working: 'Drafting',
    again: 'Edit and draft again',
    print: 'Print or save as PDF',
    optional: '(optional)',
    required: 'Fill in this field.',
    tooShort: (n: number) => `Enter at least ${n} characters.`,
    original: 'Your own words, as you wrote them',
    number: 'Enter a number in the allowed range.',
    date: 'Choose a date.',
    preview: 'Your draft',
    empty: 'Fill in the form and press the button. The draft shows here.',
    private: 'What you type is sent to our server once, to fill the clauses.',
    fix: 'Fill in the fields marked in red first.',
    rate: 'You have made 5 drafts in the last hour. Try again later.',
    signIn: 'Drafting is not available right now. Try again in a few minutes.',
    failed: 'We could not draft this now. Try again in a minute.',
    disclaimerTitle: 'This is a draft, not legal advice',
    disclaimer:
      'It is made from standard clauses and the details you entered. It is not a registered or stamped document. Have a lawyer read it, and print it on stamp paper of the right value for your state before anyone signs.',
  },
  hi: {
    generate: 'दस्तावेज़ का ड्राफ़्ट बनाएँ',
    working: 'ड्राफ़्ट बन रहा है',
    again: 'बदलकर फिर ड्राफ़्ट बनाएँ',
    print: 'प्रिंट करें या PDF सेव करें',
    optional: '(वैकल्पिक)',
    required: 'यह फ़ील्ड भरें।',
    tooShort: (n: number) => `कम से कम ${n} अक्षर लिखें।`,
    original: 'आपके अपने शब्द, जैसे आपने लिखे',
    number: 'सही सीमा में संख्या डालें।',
    date: 'तारीख चुनें।',
    preview: 'आपका ड्राफ़्ट',
    empty: 'फ़ॉर्म भरकर बटन दबाएँ। ड्राफ़्ट यहाँ दिखेगा।',
    private: 'आप जो लिखते हैं वह धाराएँ भरने के लिए एक बार हमारे सर्वर पर भेजा जाता है।',
    fix: 'पहले लाल निशान वाले फ़ील्ड भरें।',
    rate: 'पिछले एक घंटे में आप 5 ड्राफ़्ट बना चुके हैं। बाद में कोशिश करें।',
    signIn: 'अभी ड्राफ़्ट नहीं बन सकता। कुछ मिनट बाद कोशिश करें।',
    failed: 'अभी ड्राफ़्ट नहीं बन सका। एक मिनट बाद कोशिश करें।',
    disclaimerTitle: 'यह ड्राफ़्ट है, क़ानूनी सलाह नहीं',
    disclaimer:
      'यह मानक धाराओं और आपकी डाली जानकारी से बना है। यह रजिस्टर्ड या स्टैंप किया हुआ दस्तावेज़ नहीं है। किसी के हस्ताक्षर से पहले वकील से पढ़वाएँ, और अपने राज्य के सही मूल्य के स्टैंप पेपर पर प्रिंट करें।',
  },
};

export const PAGE: Record<Kind, Record<'en' | 'hi', { heading: string; lead: string; title: string; description: string; keywords: string; faqTitle: string }>> = {
  rent_agreement: {
    en: {
      heading: 'Rent agreement drafter',
      lead: 'Fill in the parties, the rent and the term, and get a draft leave and licence agreement to print. It is a draft from standard clauses, not legal advice.',
      title: 'Rent Agreement Drafter: Free Draft to Print | 360Ghar',
      description: 'Draft a rent (leave and licence) agreement from standard clauses. Enter the parties, rent, deposit and term, then print. A draft, not legal advice.',
      keywords: 'rent agreement format, rent agreement draft, leave and licence agreement, rental agreement India',
      faqTitle: 'Rent agreements: questions people ask',
    },
    hi: {
      heading: 'किराया समझौता ड्राफ़्टर',
      lead: 'दोनों पक्ष, किराया और अवधि भरें, और प्रिंट के लिए लीव एंड लाइसेंस समझौते का ड्राफ़्ट पाएँ। यह मानक धाराओं का ड्राफ़्ट है, क़ानूनी सलाह नहीं।',
      title: 'किराया समझौता ड्राफ़्टर: प्रिंट के लिए मुफ़्त ड्राफ़्ट | 360Ghar',
      description: 'मानक धाराओं से किराया (लीव एंड लाइसेंस) समझौते का ड्राफ़्ट बनाएँ। पक्ष, किराया, डिपॉज़िट और अवधि भरें, फिर प्रिंट करें। यह ड्राफ़्ट है, क़ानूनी सलाह नहीं।',
      keywords: 'किराया समझौता, रेंट एग्रीमेंट फ़ॉर्मेट, लीव एंड लाइसेंस',
      faqTitle: 'किराया समझौता: अक्सर पूछे जाने वाले सवाल',
    },
  },
  legal_notice: {
    en: {
      heading: 'Legal notice drafter',
      lead: 'Describe what happened and get a draft legal notice for a deposit refund, unpaid rent or a home to vacate. It is a draft, not legal advice.',
      title: 'Legal Notice Drafter for Landlords and Tenants | 360Ghar',
      description: 'Draft a legal notice for a security deposit refund, unpaid rent or a vacated home. Enter the facts and print. A draft, not legal advice.',
      keywords: 'legal notice format, legal notice for deposit refund, legal notice unpaid rent, tenant legal notice',
      faqTitle: 'Legal notices: questions people ask',
    },
    hi: {
      heading: 'लीगल नोटिस ड्राफ़्टर',
      lead: 'बताइए क्या हुआ, और डिपॉज़िट वापसी, बकाया किराये या घर खाली कराने के लिए लीगल नोटिस का ड्राफ़्ट पाएँ। यह ड्राफ़्ट है, क़ानूनी सलाह नहीं।',
      title: 'मकान मालिक और किरायेदार के लिए लीगल नोटिस ड्राफ़्टर | 360Ghar',
      description: 'सिक्योरिटी डिपॉज़िट वापसी, बकाया किराये या खाली किए घर के लिए लीगल नोटिस का ड्राफ़्ट बनाएँ। तथ्य भरें और प्रिंट करें। यह ड्राफ़्ट है, क़ानूनी सलाह नहीं।',
      keywords: 'लीगल नोटिस फ़ॉर्मेट, डिपॉज़िट वापसी नोटिस, बकाया किराया नोटिस',
      faqTitle: 'लीगल नोटिस: अक्सर पूछे जाने वाले सवाल',
    },
  },
};

export const FAQ: Record<Kind, Record<'en' | 'hi', Faq[]>> = {
  rent_agreement: {
    en: [
      { q: 'Is the draft a valid rent agreement?', a: 'It is a draft from standard clauses. It becomes an agreement when both sides sign it on stamp paper of the right value for your state. Have a lawyer check it first.' },
      { q: 'Why is the term 11 months?', a: 'Many leave and licence agreements run for 11 months because, in many states, a lease of 12 months or more has to be registered. Check the rule for your state.' },
      { q: 'Where does what I type go?', a: 'The details are sent to our server once, to fill the clauses. Nothing is kept in your browser.' },
    ],
    hi: [
      { q: 'क्या यह ड्राफ़्ट वैध किराया समझौता है?', a: 'यह मानक धाराओं का ड्राफ़्ट है। यह तब समझौता बनता है जब दोनों पक्ष अपने राज्य के सही मूल्य के स्टैंप पेपर पर हस्ताक्षर करें। पहले वकील से जँचवाएँ।' },
      { q: 'अवधि 11 महीने क्यों है?', a: 'कई लीव एंड लाइसेंस समझौते 11 महीने के होते हैं, क्योंकि कई राज्यों में 12 महीने या ज़्यादा के पट्टे का रजिस्ट्रेशन करना पड़ता है। अपने राज्य का नियम देखें।' },
      { q: 'मेरी डाली जानकारी कहाँ जाती है?', a: 'धाराएँ भरने के लिए जानकारी एक बार हमारे सर्वर पर भेजी जाती है। आपके ब्राउज़र में कुछ नहीं रखा जाता।' },
    ],
  },
  legal_notice: {
    en: [
      { q: 'Is the draft a legal notice I can send?', a: 'It is a draft. A lawyer should read it, and it is usually sent by registered post or speed post with proof of delivery.' },
      { q: 'How many days should I give?', a: 'Fifteen days is common. The form lets you set 7 to 90 days.' },
      { q: 'Where does what I type go?', a: 'The details are sent to our server once, to fill the clauses. Nothing is kept in your browser.' },
    ],
    hi: [
      { q: 'क्या यह ड्राफ़्ट सीधे भेजने लायक लीगल नोटिस है?', a: 'यह ड्राफ़्ट है। इसे वकील को पढ़ना चाहिए, और आम तौर पर यह रजिस्टर्ड या स्पीड पोस्ट से, डिलीवरी के सबूत के साथ भेजा जाता है।' },
      { q: 'कितने दिन देने चाहिए?', a: 'आम तौर पर पंद्रह दिन। फ़ॉर्म में 7 से 90 दिन चुन सकते हैं।' },
      { q: 'मेरी डाली जानकारी कहाँ जाती है?', a: 'धाराएँ भरने के लिए जानकारी एक बार हमारे सर्वर पर भेजी जाती है। आपके ब्राउज़र में कुछ नहीं रखा जाता।' },
    ],
  },
};

export const HOWTO: Record<Kind, Record<'en' | 'hi', HowTo>> = {
  rent_agreement: {
    en: {
      name: 'How to draft a rent agreement',
      description: 'Draft a rent agreement from standard clauses and print it.',
      steps: [
        { name: 'Enter the parties', text: 'Add the names and addresses of the landlord and the tenant.' },
        { name: 'Enter the home and terms', text: 'Add the address, rent, deposit, start date, term and notice period.' },
        { name: 'Draft and check', text: 'Press the button, read the draft and have a lawyer check it.' },
        { name: 'Print on stamp paper', text: 'Print it on stamp paper of the right value and sign it.' },
      ],
    },
    hi: {
      name: 'किराया समझौते का ड्राफ़्ट कैसे बनाएँ',
      description: 'मानक धाराओं से किराया समझौते का ड्राफ़्ट बनाएँ और प्रिंट करें।',
      steps: [
        { name: 'पक्ष भरें', text: 'मकान मालिक और किरायेदार के नाम और पते डालें।' },
        { name: 'घर और शर्तें भरें', text: 'पता, किराया, डिपॉज़िट, शुरू की तारीख, अवधि और नोटिस अवधि डालें।' },
        { name: 'ड्राफ़्ट बनाएँ और जाँचें', text: 'बटन दबाएँ, ड्राफ़्ट पढ़ें और वकील से जँचवाएँ।' },
        { name: 'स्टैंप पेपर पर प्रिंट करें', text: 'सही मूल्य के स्टैंप पेपर पर प्रिंट करें और हस्ताक्षर करें।' },
      ],
    },
  },
  legal_notice: {
    en: {
      name: 'How to draft a legal notice',
      description: 'Draft a legal notice for a rental dispute and print it.',
      steps: [
        { name: 'Choose the reason', text: 'Pick deposit refund, unpaid rent, vacate the home or breach of the agreement.' },
        { name: 'Enter the facts', text: 'Add the address, the amount, the dates and what happened.' },
        { name: 'Enter both parties', text: 'Add your details and the details of the person you write to.' },
        { name: 'Draft and check', text: 'Press the button, read the draft and have a lawyer check it before you send it.' },
      ],
    },
    hi: {
      name: 'लीगल नोटिस का ड्राफ़्ट कैसे बनाएँ',
      description: 'किराये के विवाद के लिए लीगल नोटिस का ड्राफ़्ट बनाएँ और प्रिंट करें।',
      steps: [
        { name: 'कारण चुनें', text: 'डिपॉज़िट वापसी, बकाया किराया, घर खाली करना या समझौते का उल्लंघन चुनें।' },
        { name: 'तथ्य भरें', text: 'पता, राशि, तारीख़ें और क्या हुआ, यह डालें।' },
        { name: 'दोनों पक्ष भरें', text: 'अपनी जानकारी और जिसे लिख रहे हैं उसकी जानकारी डालें।' },
        { name: 'ड्राफ़्ट बनाएँ और जाँचें', text: 'बटन दबाएँ, ड्राफ़्ट पढ़ें और भेजने से पहले वकील से जँचवाएँ।' },
      ],
    },
  },
};
