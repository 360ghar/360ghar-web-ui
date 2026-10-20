/** City copy for the city hubs (from the old pages/landing/CityHub.jsx), in English and Hindi. */
import type { Locale } from '@/lib/i18n/locale';

type CityMeta = { fullName: string; state: string; stateHi: string; description: string; descriptionHi: string };

export const CITY_META: Record<string, CityMeta> = {
  gurgaon: {
    fullName: 'Gurgaon',
    state: 'Haryana',
    stateHi: 'हरियाणा',
    description: 'Gurgaon (Gurugram) is a large office and housing hub of Delhi NCR, home to Cyber City, Golf Course Road and the DLF phases.',
    descriptionHi: 'गुड़गाँव (गुरुग्राम) दिल्ली NCR का बड़ा ऑफ़िस और रिहायशी केंद्र है। यहीं साइबर सिटी, गोल्फ़ कोर्स रोड और DLF के फ़ेज़ हैं।',
  },
  delhi: {
    fullName: 'Delhi',
    state: 'Delhi',
    stateHi: 'दिल्ली',
    description: 'Delhi has every kind of home, from Lutyens bungalows to high-rises in Dwarka and Rohini.',
    descriptionHi: 'दिल्ली में हर तरह के घर हैं, लुटियंस के बंगलों से लेकर द्वारका और रोहिणी की ऊँची इमारतों तक।',
  },
  noida: {
    fullName: 'Noida',
    state: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    description: 'Noida is a planned city with IT parks and a large apartment market along the Noida-Greater Noida Expressway.',
    descriptionHi: 'नोएडा एक योजनाबद्ध शहर है, जहाँ IT पार्क हैं और नोएडा-ग्रेटर नोएडा एक्सप्रेसवे के साथ अपार्टमेंट का बड़ा बाज़ार है।',
  },
  faridabad: {
    fullName: 'Faridabad',
    state: 'Haryana',
    stateHi: 'हरियाणा',
    description: 'Faridabad has lower-priced homes along Mathura Road, on the Violet Line of the Delhi Metro.',
    descriptionHi: 'फ़रीदाबाद में मथुरा रोड के साथ कम कीमत के घर हैं, और यह दिल्ली मेट्रो की वायलेट लाइन पर है।',
  },
  ghaziabad: {
    fullName: 'Ghaziabad',
    state: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    description: 'Ghaziabad has lower-priced homes in Indirapuram, Vaishali and Crossing Republik, close to East Delhi.',
    descriptionHi: 'ग़ाज़ियाबाद में इंदिरापुरम, वैशाली और क्रॉसिंग रिपब्लिक में कम कीमत के घर हैं, पूर्वी दिल्ली के पास।',
  },
};

export const cityFaqs = (m: CityMeta, name: string, locale: Locale = 'en') => {
  const where = m.state === m.fullName ? name : locale === 'hi' ? `${m.stateHi} के ${name}` : `${name}, ${m.state}`;
  return locale === 'hi'
    ? [
        {
          q: `क्या ${name} में प्रॉपर्टी खरीदना अच्छा है?`,
          a: `${where} में घरों की माँग नौकरियों और नई सड़कों-मेट्रो से जुड़ी है। फ़ैसले से पहले असली फ़ोटो वाली लिस्टिंग देखें, सर्कल रेट जाँचें और घर देखने जाएँ।`,
        },
        {
          q: `${name} में घर खरीदने के लिए कौन-से इलाके अच्छे हैं?`,
          a: `यह आपके बजट और ऑफ़िस की दूरी पर निर्भर करता है। इस पेज के इलाकों की तुलना करें और हर इलाके के लाइव घर देखें।`,
        },
        {
          q: `360Ghar ${name} में घरों को कैसे जाँचता है?`,
          a: `लिस्टिंग लाइव होने से पहले 360Ghar की टीम घर की जगह, जानकारी और फ़ोटो जाँचती है। घर देखने से पहले मालिक के काग़ज़ भी देखें।`,
        },
      ]
    : [
        {
          q: `Is ${name} a good place to buy a home?`,
          a: `Demand for homes in ${where} follows jobs and new roads and metro lines. Before you decide, compare listings with real photos, check the circle rate, and visit the home.`,
        },
        {
          q: `Which are the best localities to buy in ${name}?`,
          a: `That depends on your budget and the distance to your office. Compare the localities on this page, and look at the live homes in each.`,
        },
        {
          q: `How does 360Ghar check homes in ${name}?`,
          a: `The 360Ghar team checks the location, details and photos of a home before the listing goes live. Also ask the owner for the papers before you visit.`,
        },
      ];
};
