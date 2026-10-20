/**
 * Checklist page text. Document names and descriptions come from tools.json
 * (old site). The old FAQ and HowTo said "40+ documents" and "select property
 * type"; the tool has 13 documents and no type filter, so they are rewritten.
 */
import type { Faq, HowTo } from '../seo';

export const CHECKLIST_UI = {
  en: {
    progress: 'Your progress',
    of: (d: number, t: number) => `${d} of ${t}`,
    papers: 'papers checked',
    print: 'Print or save as PDF',
    copy: 'Copy summary',
    copied: 'Summary copied',
    copyFailed: 'Could not copy. Use Print instead.',
    clear: 'Clear all ticks',
    cleared: 'Ticks cleared',
    undo: 'Undo',
    addFile: 'Note a file',
    fileHint: 'Only the file name is saved, on this device. Nothing is uploaded.',
    fileNoted: (n: string) => `Noted ${n}`,
    remove: 'Remove',
    removeFile: (n: string) => `Remove ${n}`,
    saved: 'Your ticks are saved in this browser only.',
    summaryTitle: 'Property document checklist',
    progressLine: (d: number, t: number) => `Checked: ${d} of ${t}`,
  },
  hi: {
    progress: 'आपकी प्रगति',
    of: (d: number, t: number) => `${t} में से ${d}`,
    papers: 'कागज़ जाँचे गए',
    print: 'प्रिंट करें या PDF सेव करें',
    copy: 'सारांश कॉपी करें',
    copied: 'सारांश कॉपी हो गया',
    copyFailed: 'कॉपी नहीं हो सका। प्रिंट का इस्तेमाल करें।',
    clear: 'सभी निशान हटाएँ',
    cleared: 'निशान हटा दिए गए',
    undo: 'वापस लाएँ',
    addFile: 'फ़ाइल नोट करें',
    fileHint: 'सिर्फ़ फ़ाइल का नाम इसी डिवाइस पर सेव होता है। कुछ भी अपलोड नहीं होता।',
    fileNoted: (n: string) => `${n} नोट हो गई`,
    remove: 'हटाएँ',
    removeFile: (n: string) => `${n} हटाएँ`,
    saved: 'आपके निशान सिर्फ़ इसी ब्राउज़र में सेव हैं।',
    summaryTitle: 'प्रॉपर्टी दस्तावेज़ चेकलिस्ट',
    progressLine: (d: number, t: number) => `जाँचे गए: ${t} में से ${d}`,
  },
};

export const CHECKLIST_PAGE = {
  en: {
    heading: 'Property document checklist',
    lead: 'Tick each paper as you check it before you buy. Print the list or share it with your lawyer.',
    description:
      'Checklist of the 13 legal, tax and registration papers to check before you buy a property in India: title deed, EC, occupancy certificate, NOCs and more. Free and private.',
    lawyerTitle: 'Get a lawyer to read the papers',
    faqTitle: 'Property documents: questions people ask',
  },
  hi: {
    heading: 'प्रॉपर्टी दस्तावेज़ चेकलिस्ट',
    lead: 'खरीदने से पहले हर कागज़ जाँचते हुए उस पर निशान लगाएँ। सूची प्रिंट करें या अपने वकील को भेजें।',
    description:
      'भारत में प्रॉपर्टी खरीदने से पहले जाँचने वाले 13 कानूनी, टैक्स और रजिस्ट्रेशन कागज़ों की चेकलिस्ट: टाइटल डीड, EC, ऑक्युपेंसी सर्टिफ़िकेट, NOC और अन्य। मुफ़्त और निजी।',
    lawyerTitle: 'कागज़ किसी वकील से पढ़वाएँ',
    faqTitle: 'प्रॉपर्टी दस्तावेज़: अक्सर पूछे जाने वाले सवाल',
  },
};

export const CHECKLIST_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'What documents are needed to buy a flat?',
      a: 'The key papers are the title or sale deed, the encumbrance certificate, the approved building plan, the completion or occupancy certificate, property tax receipts, NOCs from the bank and the society, the sale agreement, stamp duty proof, the registration receipt and the possession letter. This checklist lists 13 of them.',
    },
    {
      q: 'What is an encumbrance certificate?',
      a: 'An encumbrance certificate (EC) records the transactions on a property, such as mortgages, liens and transfers. It shows whether the property is free of dues. You get it from the sub-registrar office.',
    },
    {
      q: 'Do I need a lawyer for a property purchase?',
      a: 'It is not required by law, but a property lawyer can verify the title, read the agreement and do the due diligence. That is a small cost next to the value of the property.',
    },
    {
      q: 'What is an occupancy certificate?',
      a: 'An occupancy certificate (OC) is issued by the local authority. It confirms that the building is complete and fit to live in. Without an OC the building may not be legal, and banks may not lend on it.',
    },
    {
      q: 'Where are my ticks saved?',
      a: 'In your browser only (localStorage). If you note a file, only its name and size are saved. Nothing is sent to 360Ghar.',
    },
  ],
  hi: [
    {
      q: 'फ़्लैट खरीदने के लिए कौन से दस्तावेज़ चाहिए?',
      a: 'मुख्य कागज़ हैं: टाइटल या सेल डीड, एनकम्ब्रेंस सर्टिफ़िकेट, स्वीकृत बिल्डिंग प्लान, कम्प्लीशन या ऑक्युपेंसी सर्टिफ़िकेट, प्रॉपर्टी टैक्स रसीदें, बैंक और सोसाइटी की NOC, सेल एग्रीमेंट, स्टैंप ड्यूटी का प्रमाण, रजिस्ट्रेशन रसीद और कब्ज़ा पत्र। यह चेकलिस्ट इनमें से 13 दिखाती है।',
    },
    {
      q: 'एनकम्ब्रेंस सर्टिफ़िकेट क्या है?',
      a: 'एनकम्ब्रेंस सर्टिफ़िकेट (EC) प्रॉपर्टी पर हुए लेन-देन दर्ज करता है, जैसे गिरवी, दावे और हस्तांतरण। इससे पता चलता है कि प्रॉपर्टी पर कोई बकाया नहीं है। इसे सब-रजिस्ट्रार कार्यालय से लें।',
    },
    {
      q: 'क्या प्रॉपर्टी खरीदने के लिए वकील चाहिए?',
      a: 'कानून में ज़रूरी नहीं है, पर प्रॉपर्टी वकील टाइटल जाँच सकता है, एग्रीमेंट पढ़ सकता है और ड्यू डिलिजेंस कर सकता है। प्रॉपर्टी की कीमत के सामने यह छोटा खर्च है।',
    },
    {
      q: 'ऑक्युपेंसी सर्टिफ़िकेट क्या है?',
      a: 'ऑक्युपेंसी सर्टिफ़िकेट (OC) स्थानीय प्राधिकरण जारी करता है। यह बताता है कि इमारत पूरी है और रहने लायक है। OC के बिना इमारत कानूनी नहीं भी हो सकती, और बैंक लोन देने से मना कर सकते हैं।',
    },
    {
      q: 'मेरे निशान कहाँ सेव होते हैं?',
      a: 'सिर्फ़ आपके ब्राउज़र में (localStorage)। फ़ाइल नोट करने पर सिर्फ़ उसका नाम और साइज़ सेव होता है। 360Ghar को कुछ नहीं भेजा जाता।',
    },
  ],
};

export const CHECKLIST_HOWTO: Record<'en' | 'hi', HowTo> = {
  en: {
    name: 'How to use the property document checklist',
    description: 'Track the documents you need for a property purchase, step by step.',
    steps: [
      { name: 'Read each document', text: 'Go through the 13 documents in three groups: legal, financial and tax, agreement and registration.' },
      { name: 'Tick what you have checked', text: 'Tick a document when you have seen it and it is in order. Your ticks stay in this browser.' },
      { name: 'Note the file', text: 'Optionally note the file name of your copy, so you know where it is.' },
      { name: 'Print or share', text: 'Print the list, save it as PDF, or copy a text summary for your lawyer or family.' },
    ],
  },
  hi: {
    name: 'प्रॉपर्टी दस्तावेज़ चेकलिस्ट कैसे इस्तेमाल करें',
    description: 'प्रॉपर्टी खरीदने के लिए ज़रूरी दस्तावेज़ों को कदम-दर-कदम ट्रैक करें।',
    steps: [
      { name: 'हर दस्तावेज़ पढ़ें', text: 'तीन समूहों के 13 दस्तावेज़ देखें: कानूनी, वित्तीय और टैक्स, एग्रीमेंट और रजिस्ट्रेशन।' },
      { name: 'जाँचे गए पर निशान लगाएँ', text: 'दस्तावेज़ देख लेने और सही पाने पर निशान लगाएँ। निशान इसी ब्राउज़र में रहते हैं।' },
      { name: 'फ़ाइल नोट करें', text: 'चाहें तो अपनी कॉपी की फ़ाइल का नाम नोट करें, ताकि पता रहे वह कहाँ है।' },
      { name: 'प्रिंट करें या भेजें', text: 'सूची प्रिंट करें, PDF सेव करें, या अपने वकील या परिवार के लिए सारांश कॉपी करें।' },
    ],
  },
};
