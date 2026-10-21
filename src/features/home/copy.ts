/** New home page strings (round 3). Older strings stay in `site:home.*`. */
export const COPY = {
  en: {
    diorama: 'Paper-cut Gurugram street: Cyber City towers, a kite, sector apartment blocks, the Rapid Metro, a chai stall, gulmohar trees, an auto-rickshaw, a cow and a vegetable cart.',
    photos: (n: number) => `${n} photos of this home`,
    photoAlt: (i: number, n: number, name: string) => `${name}, photo ${i} of ${n}`,
    open: 'Open this home',
    ownersBody: 'We photograph it, verify it and list it free. For rentals, the 360Ghar app tracks rent, tenants, repairs and documents.',
    rail: 'More verified homes',
    prev: 'Previous homes',
    next: 'Next homes',
    steps: [
      { art: 'tour', title: 'Look room by room', body: 'Open a home to see its rooms in photos, and a 360° tour when one has been shot.' },
      { art: 'verify', title: 'We check it first', body: 'Our team visits every home before it goes live, and checks the owner’s papers.' },
      { art: 'visit', title: 'Visit once, with help', body: 'Book a visit to the homes you like. Your relationship manager fixes the time and helps with the papers.' },
    ],
    owner: [
      { title: 'Know your money', body: 'See who paid the rent and who did not. Track the income and costs of every home in one place.' },
      { title: 'Manage your tenants', body: 'Keep tenant details, agreements and messages together, not lost in old chats.' },
      { title: 'Handle repairs', body: 'Tenants report a problem in the app. You assign it, track it and close it.' },
      { title: 'Keep documents safe', body: 'Rent agreements, ID proofs and receipts, stored in the cloud. Open them at any time.' },
    ],
    moreQuestions: (n: number) => `${n} more questions`,
    placesTitle: 'Where the homes are',
    homes: (n: number) => (n === 1 ? '1 home' : `${n} homes`),
    allPlaces: (n: string) => `All ${n} localities`,
    toolsets: [
      {
        art: 'calculator',
        title: 'Money',
        lead: 'Work out the cost before you pay.',
        tools: [
          { href: '/emi-calculator', icon: 'calculator', name: 'EMI calculator', note: 'Your monthly loan EMI' },
          { href: '/loan-eligibility-calculator', icon: 'rupee', name: 'Loan eligibility', note: 'How much a bank may lend you' },
          { href: '/stamp-duty-calculator', icon: 'stamp', name: 'Stamp duty calculator', note: 'Stamp duty and registration cost' },
          { href: '/capital-gains-tax-calculator', icon: 'receipt', name: 'Capital gains tax calculator', note: 'Tax when you sell a property' },
        ],
      },
      {
        art: 'document',
        title: 'Checks',
        lead: 'Check the price and the project first.',
        tools: [
          { href: '/circle-rates', icon: 'map', name: 'Circle rates', note: 'The government rate for a sector', stat: 'circle' },
          { href: '/rera-projects', icon: 'verified', name: 'RERA projects', note: 'Check a project’s RERA status', stat: 'rera' },
          { href: '/bank-auctions', icon: 'gavel', name: 'Bank auctions', note: 'Homes that banks are selling', stat: 'auctions' },
        ],
      },
      {
        art: 'villa',
        title: 'Design',
        lead: 'Plan and check the layout of a home.',
        tools: [
          { href: '/vastu-checker', icon: 'compass', name: 'Vastu checker', note: 'Free AI vastu check of a floor plan' },
          { href: '/ai-design-studio', icon: 'sofa', name: 'AI design studio', note: 'Free AI redesign, no sign-up' },
          { href: '/design-blueprint', icon: 'floor-plan', name: '3D floor plan builder', note: 'Draw a 2D and 3D floor plan' },
        ],
      },
    ],
  },
  hi: {
    diorama: 'कागज़ से कटी गुरुग्राम की गली: साइबर सिटी के टावर, एक पतंग, सेक्टर के अपार्टमेंट, रैपिड मेट्रो, चाय की दुकान, गुलमोहर के पेड़, ऑटो-रिक्शा, एक गाय और सब्ज़ी का ठेला।',
    photos: (n: number) => `इस घर की ${n} फ़ोटो`,
    photoAlt: (i: number, n: number, name: string) => `${name}, फ़ोटो ${i} / ${n}`,
    open: 'यह घर खोलें',
    ownersBody: 'हम उसकी फ़ोटो लेते हैं, वेरिफाई करते हैं और मुफ़्त लिस्ट करते हैं। किराये के घरों के लिए 360Ghar ऐप किराया, किरायेदार, मरम्मत और दस्तावेज़ संभालता है।',
    rail: 'और वेरिफाइड घर',
    prev: 'पिछले घर',
    next: 'अगले घर',
    steps: [
      { art: 'tour', title: 'कमरा-दर-कमरा देखिए', body: 'कोई भी घर खोलें और हर कमरे की फ़ोटो देखें। जिस घर का 360° टूर बना है, उसका टूर भी।' },
      { art: 'verify', title: 'पहले हम जाँचते हैं', body: 'लिस्ट होने से पहले हमारी टीम हर घर पर जाती है और मालिक के कागज़ जाँचती है।' },
      { art: 'visit', title: 'एक बार विज़िट, पूरी मदद के साथ', body: 'पसंद के घरों की विज़िट बुक करें। आपके रिलेशनशिप मैनेजर समय तय करते हैं और कागज़ों में मदद करते हैं।' },
    ],
    owner: [
      { title: 'अपना पैसा जानें', body: 'देखें कि किसने किराया भरा और किसने नहीं। हर घर की आय और खर्च एक जगह देखें।' },
      { title: 'किरायेदार संभालें', body: 'किरायेदार की जानकारी, अनुबंध और बातचीत एक जगह रखें, पुरानी चैट में नहीं।' },
      { title: 'मरम्मत करवाएँ', body: 'किरायेदार ऐप में समस्या बताते हैं। आप काम सौंपते हैं, उसे ट्रैक करते हैं और पूरा करते हैं।' },
      { title: 'दस्तावेज़ सुरक्षित रखें', body: 'किराया अनुबंध, ID प्रूफ़ और रसीदें क्लाउड में सुरक्षित। जब चाहें खोलें।' },
    ],
    moreQuestions: (n: number) => `${n} और सवाल`,
    placesTitle: 'घर कहाँ हैं',
    homes: (n: number) => `${n} घर`,
    allPlaces: (n: string) => `सभी ${n} लोकेलिटीज़`,
    toolsets: [
      {
        art: 'calculator',
        title: 'पैसा',
        lead: 'भुगतान से पहले खर्च जानें।',
        tools: [
          { href: '/emi-calculator', icon: 'calculator', name: 'EMI कैलकुलेटर', note: 'आपके लोन की मासिक EMI' },
          { href: '/loan-eligibility-calculator', icon: 'rupee', name: 'लोन पात्रता', note: 'बैंक आपको कितना लोन दे सकता है' },
          { href: '/stamp-duty-calculator', icon: 'stamp', name: 'स्टाम्प ड्यूटी कैलकुलेटर', note: 'स्टाम्प ड्यूटी और रजिस्ट्री का खर्च' },
          { href: '/capital-gains-tax-calculator', icon: 'receipt', name: 'कैपिटल गेन टैक्स कैलकुलेटर', note: 'प्रॉपर्टी बेचने पर टैक्स' },
        ],
      },
      {
        art: 'document',
        title: 'जाँच',
        lead: 'पहले कीमत और प्रोजेक्ट जाँचें।',
        tools: [
          { href: '/circle-rates', icon: 'map', name: 'सर्किल रेट', note: 'किसी सेक्टर का सरकारी रेट', stat: 'circle' },
          { href: '/rera-projects', icon: 'verified', name: 'RERA प्रोजेक्ट', note: 'किसी प्रोजेक्ट का RERA स्टेटस', stat: 'rera' },
          { href: '/bank-auctions', icon: 'gavel', name: 'बैंक नीलामी', note: 'बैंक जो घर बेच रहे हैं', stat: 'auctions' },
        ],
      },
      {
        art: 'villa',
        title: 'डिज़ाइन',
        lead: 'घर का लेआउट बनाएँ और जाँचें।',
        tools: [
          { href: '/vastu-checker', icon: 'compass', name: 'वास्तु चेकर', note: 'फ़्लोर प्लान की मुफ़्त AI वास्तु जाँच' },
          { href: '/ai-design-studio', icon: 'sofa', name: 'AI डिज़ाइन स्टूडियो', note: 'मुफ़्त AI डिज़ाइन, साइन-अप नहीं' },
          { href: '/design-blueprint', icon: 'floor-plan', name: '3D फ़्लोर प्लान बिल्डर', note: '2D और 3D फ़्लोर प्लान बनाएँ' },
        ],
      },
    ],
  },
} as const;
