/**
 * Fake listing checker text. Red flags and a few labels come from
 * common.json (fakeListingChecker.*). The old SEO text said "our AI checks";
 * the tool is rules only, so that copy is replaced.
 */
import type { Faq, HowTo } from '../seo';
import type { Flag, PortalKey } from './rules';

type Text = {
  label: string;
  check: string;
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
  pointsTitle: (name: string) => string;
  flags: Record<Flag, (host: string, portal: string) => string>;
  portals: Record<PortalKey, string[]>;
  rulesNote: string;
};

export const FAKE_UI: Record<'en' | 'hi', Text> = {
  en: {
    label: 'Listing link',
    check: 'Check the link',
    invalid: 'Paste a full web address, for example https://www.99acres.com/...',
    portalTitle: (n) => `This link goes to ${n}`,
    portalSub: (n) => `The site is the real ${n}. The listing itself can still be fake, so check the points below.`,
    oursTitle: 'This is a 360Ghar link',
    oursSub: 'The link goes to 360Ghar. Book a visit from the listing page.',
    careTitle: 'Be careful with this link',
    careSub: 'The address has signs that often go with fake pages.',
    unknownTitle: 'We have no notes for this site',
    unknownSub: 'The address looks normal, but we have no portal notes for it. Use the red flags below.',
    linkChecks: 'What we found in the link',
    pointsTitle: (n) => `Points to check on ${n}`,
    flags: {
      notSecure: () => 'The link uses http, not https. What you type on the page is not encrypted.',
      shortener: () => 'This is a short link. It hides the real site. Open it, then paste the full address here.',
      lookalike: (h, p) => `The address contains "${p}" but the site is ${h}. Fake pages often copy the names of real portals.`,
      ipHost: () => 'The link uses a number (an IP address) in place of a site name. Real portals do not do this.',
      punycode: () => 'The address has special characters that can look like normal letters. Read it letter by letter.',
    },
    portals: {
      '99acres': [
        'Most listings are not visited before they go live. See the home yourself.',
        'Agents often post homes. Ask if the owner agreed to the listing.',
        'Old and duplicate listings are common. Check the posting date.',
      ],
      magicbricks: [
        'Listings are not visited before they go live. See the home yourself.',
        'Paid listings are shown first and may not be available now.',
        'Expect sales calls after you share your number.',
      ],
      housing: [
        'Not every listing has a verified badge. Look for it.',
        'The contact can be an agent, not the owner. Ask who you are talking to.',
        'The price can be old. Compare it with recent prices nearby.',
      ],
      nobroker: [
        'Owner checks are not the same on every listing.',
        'Some listings are posted by agents. Ask before you pay any fee.',
        'Contact limits can slow you down. Plan your visits.',
      ],
      commonfloor: ['The site is less active, so many listings are old. Check the posting date.', 'Not every listing has a verified badge.'],
    },
    rulesNote: 'This check reads only the link you paste. It does not open the page and it does not use AI.',
  },
  hi: {
    label: 'लिस्टिंग का लिंक',
    check: 'लिंक जाँचें',
    invalid: 'पूरा वेब पता डालें, जैसे https://www.99acres.com/...',
    portalTitle: (n) => `यह लिंक ${n} पर जाता है`,
    portalSub: (n) => `साइट असली ${n} है। लिस्टिंग फिर भी फ़र्ज़ी हो सकती है, इसलिए नीचे के बिंदु जाँचें।`,
    oursTitle: 'यह 360Ghar का लिंक है',
    oursSub: 'लिंक 360Ghar पर जाता है। लिस्टिंग पेज से विज़िट बुक करें।',
    careTitle: 'इस लिंक से सावधान रहें',
    careSub: 'पते में ऐसे संकेत हैं जो अक्सर फ़र्ज़ी पेजों में होते हैं।',
    unknownTitle: 'इस साइट के बारे में हमारे पास नोट्स नहीं हैं',
    unknownSub: 'पता सामान्य दिखता है, पर इस पोर्टल के लिए हमारे पास नोट्स नहीं हैं। नीचे के रेड फ़्लैग देखें।',
    linkChecks: 'लिंक में हमें क्या मिला',
    pointsTitle: (n) => `${n} पर जाँचने वाले बिंदु`,
    flags: {
      notSecure: () => 'लिंक https की जगह http इस्तेमाल करता है। पेज पर लिखी जानकारी एन्क्रिप्ट नहीं होती।',
      shortener: () => 'यह छोटा लिंक है। यह असली साइट छिपाता है। इसे खोलें, फिर पूरा पता यहाँ डालें।',
      lookalike: (h, p) => `पते में "${p}" है पर साइट ${h} है। फ़र्ज़ी पेज अक्सर असली पोर्टल का नाम कॉपी करते हैं।`,
      ipHost: () => 'लिंक में साइट के नाम की जगह एक नंबर (IP पता) है। असली पोर्टल ऐसा नहीं करते।',
      punycode: () => 'पते में ऐसे खास अक्षर हैं जो सामान्य अक्षरों जैसे दिख सकते हैं। इसे अक्षर-दर-अक्षर पढ़ें।',
    },
    portals: {
      '99acres': [
        'ज़्यादातर लिस्टिंग लाइव होने से पहले देखी नहीं जातीं। घर खुद देखें।',
        'अक्सर एजेंट घर पोस्ट करते हैं। पूछें कि क्या मालिक ने लिस्टिंग की अनुमति दी है।',
        'पुरानी और डुप्लिकेट लिस्टिंग आम हैं। पोस्ट करने की तारीख देखें।',
      ],
      magicbricks: [
        'लिस्टिंग लाइव होने से पहले देखी नहीं जातीं। घर खुद देखें।',
        'पैसे देकर डाली गई लिस्टिंग पहले दिखती हैं और हो सकता है अभी उपलब्ध न हों।',
        'नंबर देने के बाद सेल्स कॉल आ सकती हैं।',
      ],
      housing: [
        'हर लिस्टिंग पर वेरिफ़ाइड बैज नहीं होता। इसे देखें।',
        'संपर्क मालिक की जगह एजेंट हो सकता है। पूछें कि आप किससे बात कर रहे हैं।',
        'कीमत पुरानी हो सकती है। आस-पास की हाल की कीमतों से मिलाएँ।',
      ],
      nobroker: [
        'हर लिस्टिंग पर मालिक की जाँच एक जैसी नहीं होती।',
        'कुछ लिस्टिंग एजेंट डालते हैं। कोई फ़ीस देने से पहले पूछें।',
        'संपर्क की सीमा से देरी हो सकती है। विज़िट की योजना बनाएँ।',
      ],
      commonfloor: ['साइट कम सक्रिय है, इसलिए कई लिस्टिंग पुरानी हैं। पोस्ट करने की तारीख देखें।', 'हर लिस्टिंग पर वेरिफ़ाइड बैज नहीं होता।'],
    },
    rulesNote: 'यह जाँच सिर्फ़ आपके डाले लिंक को पढ़ती है। यह पेज नहीं खोलती और AI का इस्तेमाल नहीं करती।',
  },
};

export const FAKE_PAGE = {
  en: {
    heading: 'Check if a property listing is fake',
    lead: 'Paste a listing link from 99acres, MagicBricks, Housing.com, NoBroker or any site. We check the link against simple rules and list the warning signs.',
    description:
      'Paste a listing link from 99acres, MagicBricks, Housing.com or NoBroker. A rules-based check flags lookalike and short links and lists the red flags to watch for. Free, no sign-in.',
    beforeTitle: 'Before you pay anything',
    before: 'Never pay a token amount or a visit fee before you have seen the home and the owner papers. Check the papers with the document checklist.',
    faqTitle: 'Fake listings: questions people ask',
  },
  hi: {
    heading: 'जाँचें कि प्रॉपर्टी लिस्टिंग फ़र्ज़ी है या नहीं',
    lead: '99acres, MagicBricks, Housing.com, NoBroker या किसी भी साइट का लिस्टिंग लिंक डालें। हम लिंक को आसान नियमों से जाँचते हैं और चेतावनी संकेत दिखाते हैं।',
    description:
      '99acres, MagicBricks, Housing.com या NoBroker का लिस्टिंग लिंक डालें। नियमों पर आधारित जाँच मिलते-जुलते और छोटे लिंक पकड़ती है और रेड फ़्लैग दिखाती है। मुफ़्त, बिना साइन-इन।',
    beforeTitle: 'कुछ भी भुगतान करने से पहले',
    before: 'घर और मालिक के कागज़ देखे बिना कभी टोकन राशि या विज़िट फ़ीस न दें। कागज़ दस्तावेज़ चेकलिस्ट से जाँचें।',
    faqTitle: 'फ़र्ज़ी लिस्टिंग: अक्सर पूछे जाने वाले सवाल',
  },
};

export const FAKE_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'How do I know if a property listing is fake?',
      a: 'Warning signs: a price far below the market, stock or heavily edited photos, an agent who will not show the home or join a video call, a demand for money before a visit, and no property papers. Visit the home and see the papers before you pay.',
    },
    {
      q: 'Are 99acres listings verified?',
      a: 'Most listings on 99acres are posted by agents or owners and are not inspected on site before they go live. Some carry verification labels; check what the label means on the listing.',
    },
    {
      q: 'What does this checker do with my link?',
      a: 'It reads the web address only. It finds the portal from the site name, flags short links, lookalike addresses, http links and IP addresses, and shows the points to check. It does not open the page, store the link or use AI.',
    },
    {
      q: 'Is the fake listing checker free?',
      a: 'Yes. It is free and needs no sign-in.',
    },
    {
      q: 'What should I do if I find a fake listing?',
      a: 'Do not pay. Report the listing to the portal. If you lost money, report it on the national cyber crime portal (cybercrime.gov.in) or call 1930.',
    },
  ],
  hi: [
    {
      q: 'कैसे पता करें कि प्रॉपर्टी लिस्टिंग फ़र्ज़ी है?',
      a: 'चेतावनी संकेत: बाज़ार से बहुत कम कीमत, स्टॉक या भारी एडिट की गई फ़ोटो, घर दिखाने या वीडियो कॉल से मना करने वाला एजेंट, विज़िट से पहले पैसे की माँग, और प्रॉपर्टी के कागज़ न होना। भुगतान से पहले घर देखें और कागज़ जाँचें।',
    },
    {
      q: 'क्या 99acres की लिस्टिंग वेरिफ़ाइड होती हैं?',
      a: '99acres पर ज़्यादातर लिस्टिंग एजेंट या मालिक डालते हैं और लाइव होने से पहले मौके पर जाँची नहीं जातीं। कुछ पर वेरिफ़िकेशन लेबल होता है; लिस्टिंग पर देखें कि उस लेबल का क्या मतलब है।',
    },
    {
      q: 'यह चेकर मेरे लिंक के साथ क्या करता है?',
      a: 'यह सिर्फ़ वेब पता पढ़ता है। साइट के नाम से पोर्टल पहचानता है, छोटे लिंक, मिलते-जुलते पते, http लिंक और IP पते पकड़ता है, और जाँचने वाले बिंदु दिखाता है। यह पेज नहीं खोलता, लिंक सेव नहीं करता और AI का इस्तेमाल नहीं करता।',
    },
    {
      q: 'क्या फ़र्ज़ी लिस्टिंग चेकर मुफ़्त है?',
      a: 'हाँ। यह मुफ़्त है और साइन-इन की ज़रूरत नहीं है।',
    },
    {
      q: 'फ़र्ज़ी लिस्टिंग मिले तो क्या करें?',
      a: 'भुगतान न करें। पोर्टल को लिस्टिंग की शिकायत करें। अगर पैसे गए हैं, तो राष्ट्रीय साइबर क्राइम पोर्टल (cybercrime.gov.in) पर शिकायत करें या 1930 पर कॉल करें।',
    },
  ],
};

export const FAKE_HOWTO: Record<'en' | 'hi', HowTo> = {
  en: {
    name: 'How to check if a property listing is fake',
    description: 'Step-by-step guide to checking a property listing link from a real estate portal.',
    steps: [
      { name: 'Copy the listing link', text: 'Copy the full address of the listing from 99acres, MagicBricks or any other site.' },
      { name: 'Paste it in the checker', text: 'Paste the link in the box and select "Check the link".' },
      { name: 'Read the findings', text: 'See what the link shows, the points to check for that portal and the common red flags.' },
      { name: 'Visit before you pay', text: 'See the home and the owner papers before you pay any amount.' },
    ],
  },
  hi: {
    name: 'कैसे जाँचें कि प्रॉपर्टी लिस्टिंग फ़र्ज़ी है',
    description: 'किसी रियल एस्टेट पोर्टल के लिस्टिंग लिंक को जाँचने का आसान तरीका।',
    steps: [
      { name: 'लिस्टिंग का लिंक कॉपी करें', text: '99acres, MagicBricks या किसी भी साइट से लिस्टिंग का पूरा पता कॉपी करें।' },
      { name: 'चेकर में डालें', text: 'लिंक बॉक्स में डालें और "लिंक जाँचें" चुनें।' },
      { name: 'नतीजे पढ़ें', text: 'देखें लिंक में क्या मिला, उस पोर्टल पर जाँचने वाले बिंदु और आम रेड फ़्लैग।' },
      { name: 'भुगतान से पहले विज़िट करें', text: 'कोई भी राशि देने से पहले घर और मालिक के कागज़ देखें।' },
    ],
  },
};
