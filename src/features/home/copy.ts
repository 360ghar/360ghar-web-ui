/** New home page strings (round 3). Older strings stay in `site:home.*`. */
export const COPY = {
  en: {
    diorama: 'Paper-cut golden-hour Gurugram street: a layered paper sun, the Aravalli ridge, Cyber City towers, a kite, the Rapid Metro, a lit apartment window, gulmohar trees, a chai stall and a cow.',
    photos: (n: number) => `${n} photos of this home`,
    photoAlt: (i: number, n: number, name: string) => `${name}, photo ${i} of ${n}`,
    open: 'Open this home',
    ownersBody: 'Use the current listing form to share property details. Review its terms and any fees before you submit.',
    rail: 'More property listings',
    prev: 'Previous homes',
    next: 'Next homes',
    steps: [
      { art: 'tour', title: 'Review listing details', body: 'Check the photos and details shown for each listing. Confirm current availability and terms with the listing party.' },
      { art: 'review', title: 'Confirm important details', body: 'The site does not independently verify every property or document. Check the records you rely on with the relevant parties.' },
      { art: 'visit', title: 'Arrange a visit', body: 'Contact the listing party to confirm access and timing before you travel.' },
    ],
    owner: [
      { title: 'Check the listing', body: 'Confirm the price, availability and terms before you submit property details.' },
      { title: 'Check what you can share', body: 'Make sure you are allowed to submit the property details and contact information.' },
      { title: 'Review the current terms', body: 'Check the form for fees, privacy details and the review process.' },
      { title: 'Keep your own records', body: 'Keep copies of the documents and messages you need for your records.' },
    ],
    moreQuestions: (n: number) => `${n} more questions`,
    placesTitle: 'Where the homes are',
    homes: (n: number) => (n === 1 ? '1 listing' : `${n} listings`),
    allPlaces: 'Browse locality pages',
    toolsets: [
      {
        art: 'calculator',
        title: 'Money',
        lead: 'Work out the cost before you pay.',
        tools: [
          { href: '/emi-calculator', icon: 'calculator', name: 'EMI calculator', note: 'Estimate an EMI from entered values' },
          { href: '/loan-eligibility-calculator', icon: 'rupee', name: 'Loan eligibility', note: 'Estimate a possible loan range, not a bank decision' },
          { href: '/stamp-duty-calculator', icon: 'stamp', name: 'Stamp duty calculator', note: 'Rates and fee figures are withheld during source review' },
          { href: '/capital-gains-tax-calculator', icon: 'receipt', name: 'Property sale gain worksheet', note: 'Pre-tax sale arithmetic; not an income-tax estimate' },
        ],
      },
      {
        art: 'document',
        title: 'Checks',
        lead: 'Check current source notes before you decide.',
        tools: [
          { href: '/circle-rates', icon: 'map', name: 'Circle rates', note: 'Official schedules are not confirmed; no rates are shown.' },
          { href: '/rera-projects', icon: 'building', name: 'RERA projects', note: 'Registered projects and their status' },
          { href: '/bank-auctions', icon: 'gavel', name: 'Bank auctions', note: 'Auction records are withheld during source review' },
        ],
      },
      {
        art: 'villa',
        title: 'Design',
        lead: 'Use the design tools to explore layouts.',
        tools: [
          { href: '/vastu-checker', icon: 'compass', name: 'Vastu checker', note: 'Review a floor plan with the Vastu checker' },
          { href: '/ai-design-studio', icon: 'sofa', name: 'AI design studio', note: 'Explore room-design options in the AI design studio' },
          { href: '/design-blueprint', icon: 'floor-plan', name: '3D floor plan builder', note: 'Create and view a 2D/3D floor plan' },
        ],
      },
    ],
  },
  hi: {
    diorama: 'कागज़ से कटी गुरुग्राम की सुनहरी शाम: कागज़ का सूरज, अरावली की पहाड़ियाँ, साइबर सिटी के टावर, एक पतंग, रैपिड मेट्रो, अपार्टमेंट की एक रोशन खिड़की, गुलमोहर के पेड़, चाय की दुकान और एक गाय।',
    photos: (n: number) => `इस घर की ${n} फ़ोटो`,
    photoAlt: (i: number, n: number, name: string) => `${name}, फ़ोटो ${i} / ${n}`,
    open: 'यह घर खोलें',
    ownersBody: 'प्रॉपर्टी की जानकारी मौजूदा लिस्टिंग फ़ॉर्म में दें। भेजने से पहले उसकी शर्तें और शुल्क देखें।',
    rail: 'और प्रॉपर्टी लिस्टिंग',
    prev: 'पिछले घर',
    next: 'अगले घर',
    steps: [
      { art: 'tour', title: 'लिस्टिंग की जानकारी देखें', body: 'हर लिस्टिंग में दी गई फ़ोटो और जानकारी देखें। उपलब्धता और शर्तों की पुष्टि लिस्टिंग देने वाले से करें।' },
      { art: 'review', title: 'ज़रूरी जानकारी की पुष्टि करें', body: 'वेबसाइट हर प्रॉपर्टी या दस्तावेज़ की स्वतंत्र पुष्टि नहीं करती। भरोसा करने से पहले संबंधित पक्षों से रिकॉर्ड जाँचें।' },
      { art: 'visit', title: 'विज़िट की योजना बनाएँ', body: 'जाने से पहले लिस्टिंग देने वाले से प्रवेश और समय की पुष्टि करें।' },
    ],
    owner: [
      { title: 'लिस्टिंग जाँचें', body: 'प्रॉपर्टी की जानकारी भेजने से पहले कीमत, उपलब्धता और शर्तें जाँचें।' },
      { title: 'साझा करने का अधिकार जाँचें', body: 'पुष्टि करें कि आपको प्रॉपर्टी और संपर्क जानकारी भेजने की अनुमति है।' },
      { title: 'मौजूदा शर्तें पढ़ें', body: 'फ़ॉर्म पर शुल्क, गोपनीयता और समीक्षा प्रक्रिया देखें।' },
      { title: 'अपने रिकॉर्ड रखें', body: 'ज़रूरी दस्तावेज़ों और संदेशों की कॉपी अपने पास रखें।' },
    ],
    moreQuestions: (n: number) => `${n} और सवाल`,
    placesTitle: 'घर कहाँ हैं',
    homes: (n: number) => `${n} लिस्टिंग`,
    allPlaces: 'लोकैलिटी पेज देखें',
    toolsets: [
      {
        art: 'calculator',
        title: 'पैसा',
        lead: 'भुगतान से पहले खर्च जानें।',
        tools: [
          { href: '/emi-calculator', icon: 'calculator', name: 'EMI कैलकुलेटर', note: 'दर्ज मानों से EMI का अनुमान' },
          { href: '/loan-eligibility-calculator', icon: 'rupee', name: 'लोन पात्रता', note: 'संभावित लोन सीमा का अनुमान, बैंक का निर्णय नहीं' },
          { href: '/stamp-duty-calculator', icon: 'stamp', name: 'स्टाम्प ड्यूटी कैलकुलेटर', note: 'स्रोत की समीक्षा तक दरें और शुल्क के आँकड़े रोके गए हैं' },
          { href: '/capital-gains-tax-calculator', icon: 'receipt', name: 'प्रॉपर्टी बिक्री लाभ वर्कशीट', note: 'बिक्री का कर-पूर्व हिसाब; आयकर का अनुमान नहीं' },
        ],
      },
      {
        art: 'document',
        title: 'जाँच',
        lead: 'फैसले से पहले मौजूदा स्रोत जानकारी देखें।',
        tools: [
          { href: '/circle-rates', icon: 'map', name: 'सर्किल रेट', note: 'आधिकारिक दर-सूची की पुष्टि नहीं हुई; दरें नहीं दिखाई जातीं।' },
          { href: '/rera-projects', icon: 'building', name: 'RERA प्रोजेक्ट', note: 'रजिस्टर्ड प्रोजेक्ट और उनकी स्थिति' },
          { href: '/bank-auctions', icon: 'gavel', name: 'बैंक नीलामी', note: 'स्रोत की समीक्षा तक नीलामी रिकॉर्ड रोके गए हैं' },
        ],
      },
      {
        art: 'villa',
        title: 'डिज़ाइन',
        lead: 'डिज़ाइन टूल से लेआउट के विकल्प देखें।',
        tools: [
          { href: '/vastu-checker', icon: 'compass', name: 'वास्तु चेकर', note: 'वास्तु चेकर में फ़्लोर प्लान देखें' },
          { href: '/ai-design-studio', icon: 'sofa', name: 'AI डिज़ाइन स्टूडियो', note: 'AI डिज़ाइन स्टूडियो में कमरे के डिज़ाइन विकल्प देखें' },
          { href: '/design-blueprint', icon: 'floor-plan', name: '3D फ़्लोर प्लान बिल्डर', note: '2D/3D फ़्लोर प्लान बनाएँ और देखें' },
        ],
      },
    ],
  },
} as const;
