/**
 * Text of /authors, /editorial-policy and /methodology. Plain statements of what the site does today;
 * no claim the site cannot back. Update it when the process changes.
 */
import { COMPANY_EMAIL } from '@/lib/company';
import type { Locale } from '@/lib/i18n/locale';

export type TrustKey = 'authors' | 'editorial-policy' | 'methodology';
type Section = { id: string; title: string; body: string[] };
type Page = { title: string; description: string; name: string; h1: string; lead: string; sections: Section[] };

const EN: Record<TrustKey, Page> = {
  authors: {
    title: 'Authors and editorial team | 360Ghar',
    description: 'Who writes and answers for the 360Ghar blog, guides and data pages.',
    name: 'Authors',
    h1: 'Authors and editorial team',
    lead: 'Who writes and answers for what you read on 360Ghar.',
    sections: [
      {
        id: 'team',
        title: '360Ghar editorial team',
        body: [
          'Blog posts, guides and data pages are published by the 360Ghar editorial team. A post names its category, its date and, where we have them, its sources.',
          'The team follows the rules in the editorial policy and states how numbers are made in the methodology.',
        ],
      },
      {
        id: 'founder',
        title: 'Saksham Mittal, Founder and CEO',
        body: ['Saksham Mittal founded 360Ghar and is accountable for the product, the editorial policy and the methodology. Questions and corrections go to the address below.'],
      },
      { id: 'contact', title: 'Contact', body: [`Write to ${COMPANY_EMAIL} with the page address and what to change.`] },
    ],
  },
  'editorial-policy': {
    title: 'Editorial policy | 360Ghar',
    description: 'How 360Ghar publishes posts, guides and data, how it handles sources, and how to report an error.',
    name: 'Editorial policy',
    h1: 'Editorial policy',
    lead: 'How we publish, what we cite, and how we fix mistakes.',
    sections: [
      {
        id: 'publishing',
        title: 'Publishing',
        body: [
          'Posts go through the 360Ghar blog system. Each post shows its publish date and, when it changes, its updated date.',
          'Guides and tools are written by the editorial team and change only when the facts they rest on change.',
        ],
      },
      {
        id: 'sources',
        title: 'Sources',
        body: [
          'A post lists its sources when we have them. Numbers on data pages come from the sources named on the page and in the methodology.',
          'We do not copy listing text or prices from other portals.',
        ],
      },
      {
        id: 'claims',
        title: 'What we do not do',
        body: ['We do not promise prices or returns. Price ranges describe the market spread, not a quote for a home.'],
      },
      {
        id: 'corrections',
        title: 'Corrections',
        body: [`Found an error? Write to ${COMPANY_EMAIL} with the page address. We fix confirmed errors and update the date on the page.`],
      },
    ],
  },
  methodology: {
    title: 'Methodology and data sources | 360Ghar',
    description: 'Where the numbers on 360Ghar come from: listings, circle rates, the price index and locality data, and how often they change.',
    name: 'Methodology',
    h1: 'Methodology and data sources',
    lead: 'Where each number on the site comes from and how current it is.',
    sections: [
      {
        id: 'listings',
        title: 'Listings',
        body: ['Homes, prices and photos on property and locality pages come live from the 360Ghar listings database. A locality page counts the homes in that place and shows the middle half of real asking prices (25th to 75th percentile) once at least three prices exist. Placeholder prices are counted but never priced.'],
      },
      {
        id: 'sources',
        title: 'Sources',
        body: [
          'Circle rates come from the rates published by the state governments and are read from the 360Ghar data hub. RERA projects and bank auctions come from the public registers and portals named on each page.',
          'The price index holds buy, rent and PG ranges by property type for five NCR cities. They are ranges, not averages, and are not transaction prices.',
        ],
      },
      {
        id: 'updates',
        title: 'How current the data is',
        body: ['Live pages show data as of the request. Static data sets show the date they were last updated under the numbers ("Updated ... Sources"). The price index was last updated on 4 May 2026.'],
      },
      {
        id: 'limits',
        title: 'Limits',
        body: ['A locality is matched to a home by name, so a home can be missed when its address spells the place differently. Prices are asking prices set by owners.'],
      },
    ],
  },
};

const HI: Record<TrustKey, Page> = {
  authors: {
    title: 'लेखक और संपादकीय टीम | 360Ghar',
    description: '360Ghar के ब्लॉग, गाइड और डेटा पेज कौन लिखता है और उनके लिए कौन जवाबदेह है।',
    name: 'लेखक',
    h1: 'लेखक और संपादकीय टीम',
    lead: '360Ghar पर जो आप पढ़ते हैं, उसे कौन लिखता है और उसके लिए कौन जवाबदेह है।',
    sections: [
      {
        id: 'team',
        title: '360Ghar संपादकीय टीम',
        body: ['ब्लॉग पोस्ट, गाइड और डेटा पेज 360Ghar की संपादकीय टीम प्रकाशित करती है। पोस्ट में उसकी श्रेणी, तारीख और, जहाँ हमारे पास हों, स्रोत दिए होते हैं।', 'टीम संपादकीय नीति के नियम मानती है और संख्याएँ कैसे बनती हैं, यह पद्धति पेज पर बताया गया है।'],
      },
      {
        id: 'founder',
        title: 'सक्षम मित्तल, संस्थापक और CEO',
        body: ['सक्षम मित्तल ने 360Ghar की स्थापना की और वे प्रोडक्ट, संपादकीय नीति और पद्धति के लिए जवाबदेह हैं। सवाल और सुधार नीचे दिए पते पर भेजें।'],
      },
      { id: 'contact', title: 'संपर्क', body: [`पेज का पता और क्या बदलना है, यह ${COMPANY_EMAIL} पर लिखें।`] },
    ],
  },
  'editorial-policy': {
    title: 'संपादकीय नीति | 360Ghar',
    description: '360Ghar पोस्ट, गाइड और डेटा कैसे प्रकाशित करता है, स्रोत कैसे संभालता है और ग़लती कैसे बताएँ।',
    name: 'संपादकीय नीति',
    h1: 'संपादकीय नीति',
    lead: 'हम कैसे प्रकाशित करते हैं, क्या स्रोत देते हैं और ग़लतियाँ कैसे सुधारते हैं।',
    sections: [
      { id: 'publishing', title: 'प्रकाशन', body: ['पोस्ट 360Ghar ब्लॉग सिस्टम से प्रकाशित होती हैं। हर पोस्ट पर प्रकाशन की तारीख और बदलाव होने पर अपडेट की तारीख दिखती है।', 'गाइड और टूल संपादकीय टीम लिखती है और तभी बदलते हैं जब उनके तथ्य बदलते हैं।'] },
      { id: 'sources', title: 'स्रोत', body: ['पोस्ट में स्रोत दिए जाते हैं, जहाँ हमारे पास हों। डेटा पेज की संख्याएँ पेज और पद्धति में बताए स्रोतों से आती हैं।', 'हम दूसरे पोर्टल से लिस्टिंग का टेक्स्ट या कीमतें नहीं उठाते।'] },
      { id: 'claims', title: 'हम क्या नहीं करते', body: ['हम कीमत या रिटर्न का वादा नहीं करते। कीमत रेंज बाज़ार का फैलाव बताती हैं, किसी घर का भाव नहीं।'] },
      { id: 'corrections', title: 'सुधार', body: [`कोई ग़लती दिखी? पेज के पते के साथ ${COMPANY_EMAIL} पर लिखें। पुष्ट ग़लती हम ठीक करते हैं और पेज की तारीख अपडेट करते हैं।`] },
    ],
  },
  methodology: {
    title: 'पद्धति और डेटा स्रोत | 360Ghar',
    description: '360Ghar की संख्याएँ कहाँ से आती हैं: लिस्टिंग, सर्कल रेट, प्राइस इंडेक्स और लोकेलिटी डेटा, और वे कितनी बार बदलती हैं।',
    name: 'पद्धति',
    h1: 'पद्धति और डेटा स्रोत',
    lead: 'साइट की हर संख्या कहाँ से आती है और कितनी ताज़ा है।',
    sections: [
      { id: 'listings', title: 'लिस्टिंग', body: ['प्रॉपर्टी और लोकेलिटी पेज पर घर, कीमतें और फ़ोटो सीधे 360Ghar के लिस्टिंग डेटाबेस से आते हैं। लोकेलिटी पेज उस जगह के घर गिनता है और कम से कम तीन असली कीमतें होने पर बीच की आधी माँगी गई कीमतें (25वें से 75वें पर्सेंटाइल) दिखाता है। प्लेसहोल्डर कीमतें गिनी जाती हैं, पर कीमत के रूप में नहीं दिखतीं।'] },
      { id: 'sources', title: 'स्रोत', body: ['सर्कल रेट राज्य सरकारों के प्रकाशित रेट से हैं और 360Ghar डेटा हब से पढ़े जाते हैं। RERA प्रोजेक्ट और बैंक नीलामी उन सार्वजनिक रजिस्टर और पोर्टल से हैं जिनका नाम हर पेज पर दिया है।', 'प्राइस इंडेक्स में NCR के पाँच शहरों के लिए प्रॉपर्टी प्रकार के हिसाब से खरीद, किराया और PG की रेंज हैं। ये रेंज हैं, औसत नहीं, और लेन-देन की कीमत नहीं हैं।'] },
      { id: 'updates', title: 'डेटा कितना ताज़ा है', body: ['लाइव पेज अनुरोध के समय का डेटा दिखाते हैं। स्थिर डेटा सेट संख्याओं के नीचे आख़िरी अपडेट की तारीख दिखाते हैं ("अपडेट ... स्रोत")। प्राइस इंडेक्स आख़िरी बार 4 मई 2026 को अपडेट हुआ।'] },
      { id: 'limits', title: 'सीमाएँ', body: ['लोकेलिटी और घर नाम से मिलाए जाते हैं, इसलिए जब पते में जगह का नाम अलग लिखा हो तो घर छूट सकता है। कीमतें मालिकों की माँगी गई कीमतें हैं।'] },
    ],
  },
};

export const trustCopy = (key: TrustKey, locale: Locale): Page => (locale === 'hi' ? HI : EN)[key];
