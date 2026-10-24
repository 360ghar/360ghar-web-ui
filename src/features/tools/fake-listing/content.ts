import type { Faq } from '../seo';
import type { Flag } from './rules';

type Text = {
  label: string;
  check: string;
  placeholder: string;
  invalid: string;
  portalTitle: (name: string) => string;
  portalSub: (name: string) => string;
  oursTitle: string;
  oursSub: string;
  careTitle: string;
  careSub: string;
  unknownTitle: string;
  unknownSub: string;
  linkChecks: string;
  checklistTitle: string;
  checklist: string[];
  flags: Record<Flag, (host: string, portal: string) => string>;
  rulesNote: string;
};

export const FAKE_UI: Record<'en' | 'hi', Text> = {
  en: {
    label: 'Listing URL',
    check: 'Check URL',
    placeholder: 'https://example.com/listing',
    invalid: 'Enter a full web address, such as https://example.com/listing.',
    portalTitle: (name) => `The URL uses a domain identified as ${name}`,
    portalSub: (name) => `This identifies the host only. It does not confirm the listing, property, owner or documents for ${name}.`,
    oursTitle: '360Ghar domain detected',
    oursSub: 'This check identifies the URL host only. It does not verify the listing or property.',
    careTitle: 'URL pattern needs review',
    careSub: 'One or more URL patterns were flagged. This does not prove the listing is false.',
    unknownTitle: 'No known domain match',
    unknownSub: 'This domain is not in the tool’s list. That does not prove the URL is safe.',
    linkChecks: 'URL checks',
    checklistTitle: 'Check these details separately',
    checklist: [
      'Open the listing on its original service and check its current details.',
      'Confirm that the person offering the property has authority to do so.',
      'Visit the property and review current documents and terms before paying.',
    ],
    flags: {
      notSecure: () => 'This URL uses HTTP instead of HTTPS. Confirm the destination before entering personal or payment details.',
      shortener: () => 'This address uses a short-link service. Confirm its destination before opening it.',
      lookalike: (host, name) => `The full host is ${host}, not the standard ${name} domain. Check the exact address before opening it.`,
      ipHost: () => 'This URL uses an IP address instead of a domain name. Confirm the sender and destination before opening it.',
      punycode: () => 'This domain uses encoded characters. Check its exact spelling before continuing.',
    },
    rulesNote: 'This check reads the URL only. It does not open the page or verify a listing, property, owner, price or documents.',
  },
  hi: {
    label: 'लिस्टिंग URL',
    check: 'URL जाँचें',
    placeholder: 'https://example.com/listing',
    invalid: 'पूरा वेब पता डालें, जैसे https://example.com/listing।',
    portalTitle: (name) => `इस URL का डोमेन ${name} के रूप में पहचाना गया है`,
    portalSub: (name) => `यह केवल होस्ट की पहचान करता है। इससे ${name} की लिस्टिंग, प्रॉपर्टी, मालिक या दस्तावेज़ की पुष्टि नहीं होती।`,
    oursTitle: '360Ghar डोमेन मिला',
    oursSub: 'यह जाँच केवल URL होस्ट की पहचान करती है। यह लिस्टिंग या प्रॉपर्टी की पुष्टि नहीं करती।',
    careTitle: 'URL पैटर्न की समीक्षा करें',
    careSub: 'एक या अधिक URL पैटर्न मिले। इससे लिस्टिंग गलत साबित नहीं होती।',
    unknownTitle: 'पहचाना हुआ डोमेन नहीं मिला',
    unknownSub: 'यह डोमेन इस टूल की सूची में नहीं है। इससे URL सुरक्षित साबित नहीं होता।',
    linkChecks: 'URL जाँच',
    checklistTitle: 'इन विवरणों की अलग से जाँच करें',
    checklist: [
      'लिस्टिंग को उसकी मूल सेवा पर खोलें और मौजूदा विवरण देखें।',
      'पुष्टि करें कि प्रॉपर्टी देने वाले व्यक्ति को ऐसा करने का अधिकार है।',
      'भुगतान से पहले प्रॉपर्टी पर जाएँ और मौजूदा दस्तावेज़ व शर्तें देखें।',
    ],
    flags: {
      notSecure: () => 'यह URL HTTPS की जगह HTTP इस्तेमाल करता है। निजी या भुगतान की जानकारी देने से पहले गंतव्य की पुष्टि करें।',
      shortener: () => 'यह पता छोटा लिंक इस्तेमाल करता है। खोलने से पहले उसका गंतव्य जाँचें।',
      lookalike: (host, name) => `पूरा होस्ट ${host} है, ${name} का सामान्य डोमेन नहीं। खोलने से पहले सही पता जाँचें।`,
      ipHost: () => 'इस URL में डोमेन नाम की जगह IP पता है। खोलने से पहले भेजने वाले और गंतव्य की पुष्टि करें।',
      punycode: () => 'इस डोमेन में एन्कोड किए गए अक्षर हैं। आगे बढ़ने से पहले उसकी वर्तनी जाँचें।',
    },
    rulesNote: 'यह जाँच केवल URL पढ़ती है। यह पेज नहीं खोलती और लिस्टिंग, प्रॉपर्टी, मालिक, कीमत या दस्तावेज़ की पुष्टि नहीं करती।',
  },
};

export const FAKE_PAGE = {
  en: {
    heading: 'Check a property listing URL',
    lead: 'This tool checks a few URL patterns only. It does not open the listing or verify the property, owner, price or documents.',
    description: 'Review basic URL patterns. This tool does not open the page or verify a listing, property, owner, price or documents.',
    beforeTitle: 'Before you make a payment',
    before: 'Review the original listing, visit the property, and confirm the seller’s authority, price and documents with the relevant parties.',
    faqTitle: 'What this URL check can and cannot tell you',
  },
  hi: {
    heading: 'प्रॉपर्टी लिस्टिंग का URL जाँचें',
    lead: 'यह टूल केवल कुछ URL पैटर्न जाँचता है। यह लिस्टिंग पेज नहीं खोलता और प्रॉपर्टी, मालिक, कीमत या दस्तावेज़ की पुष्टि नहीं करता।',
    description: 'बुनियादी URL पैटर्न जाँचें। यह टूल पेज नहीं खोलता और लिस्टिंग, प्रॉपर्टी, मालिक, कीमत या दस्तावेज़ की पुष्टि नहीं करता।',
    beforeTitle: 'भुगतान करने से पहले',
    before: 'मूल लिस्टिंग देखें, प्रॉपर्टी पर जाएँ और संबंधित पक्षों से विक्रेता के अधिकार, कीमत और दस्तावेज़ की पुष्टि करें।',
    faqTitle: 'यह URL जाँच क्या बता सकती है',
  },
};

export const FAKE_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'What does this tool check?',
      a: 'It reads the URL and checks its host and a small set of patterns, such as HTTP, short links, IP addresses, encoded characters and lookalike domains. It does not open the listing page.',
    },
    {
      q: 'Do URL warnings prove that a listing is false?',
      a: 'No. A warning describes the URL pattern only. It does not verify the property, owner, price, availability or documents.',
    },
    {
      q: 'Does a clear result prove that a listing is genuine?',
      a: 'No. A URL without these patterns can still point to outdated or incorrect information. Confirm important details with the relevant parties.',
    },
    {
      q: 'Does this check send the URL to a verification service?',
      a: 'No. The checker reads the URL in the page and does not open it or send it to a verification service.',
    },
  ],
  hi: [
    {
      q: 'यह टूल क्या जाँचता है?',
      a: 'यह URL पढ़कर होस्ट और कुछ पैटर्न जाँचता है, जैसे HTTP, छोटे लिंक, IP पते, एन्कोड किए गए अक्षर और मिलते-जुलते डोमेन। यह लिस्टिंग पेज नहीं खोलता।',
    },
    {
      q: 'क्या URL चेतावनी से लिस्टिंग गलत साबित होती है?',
      a: 'नहीं। चेतावनी केवल URL पैटर्न बताती है। इससे प्रॉपर्टी, मालिक, कीमत, उपलब्धता या दस्तावेज़ सत्यापित नहीं होते।',
    },
    {
      q: 'क्या साफ़ नतीजा साबित करता है कि लिस्टिंग सही है?',
      a: 'नहीं। इन पैटर्न के बिना भी जानकारी पुरानी या गलत हो सकती है। ज़रूरी विवरण संबंधित पक्षों से पुष्टि करें।',
    },
    {
      q: 'क्या यह जाँच URL किसी सत्यापन सेवा को भेजती है?',
      a: 'नहीं। चेकर पेज में URL पढ़ता है। यह उसे खोलता नहीं और सत्यापन सेवा को नहीं भेजता।',
    },
  ],
};
