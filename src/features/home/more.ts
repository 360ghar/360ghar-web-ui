/**
 * Strings of the home sections added in the parity round: refer and earn, the
 * app and the AI assistant. The v1 copy
 * (`home:referEarn`, `home:appDownload`, `home:aiAgent` in the old site) is
 * cut to plain short sentences; claims that cannot be checked are left out.
 */
export const MORE = {
  en: {
    refer: {
      title: 'Know someone with a home to rent out or sell?',
      listed: { amount: '₹100', text: 'for a qualifying property listing' },
      deal: { amount: 'Up to ₹10,000', text: 'for qualifying sale deals; rent rewards have a lower cap' },
      note: 'Check the terms for eligibility and reward conditions.',
      cta: 'Refer and earn',
    },
    app: {
      title: 'Get the 360Ghar app',
      lead: 'Browse property listings, save or pass on options, open available tours and schedule visits in the app. Sign in for account actions.',
      features: ['Explore properties in map and list views', 'Save or pass on options', 'Review property details and available tours', 'Schedule visits after signing in'],
      qr: 'QR code of the 360Ghar app page on Google Play',
      qrNote: 'Scan with your phone',
    },
    ai: {
      title: 'MCP tools for AI assistants',
      lead: 'The MCP directory lists tool definitions and sign-in notes. It does not confirm current server availability, inventory or property details.',
      prompts: [
        { who: 'Search', say: 'Find a 2BHK furnished apartment in DLF Phase 3 under 35k' },
        { who: 'Search', say: 'Find 3BHK rentals near Cyber City under 50k' },
        { who: 'Visits', say: 'Prepare a visit request for this Saturday afternoon' },
        { who: 'EMI', say: 'Estimate EMI for ₹50 lakh at 8.5% over 20 years' },
      ],
      list: 'Example prompts',
      server: 'Server address',
      copy: 'Copy server address',
      copied: 'Copied',
      more: 'How to connect',
    },
  },
  hi: {
    refer: {
      title: 'क्या आप किसी को जानते हैं जो घर किराए पर देना या बेचना चाहता है?',
      listed: { amount: '₹100', text: 'योग्य प्रॉपर्टी लिस्टिंग के लिए' },
      deal: { amount: '₹10,000 तक', text: 'योग्य बिक्री डील के लिए; किराये के इनाम की सीमा कम है' },
      note: 'योग्यता और इनाम की शर्तों के लिए नियम देखें।',
      cta: 'रेफ़र करें और कमाएँ',
    },
    app: {
      title: '360Ghar ऐप पाएँ',
      lead: 'प्रॉपर्टी लिस्टिंग देखें, विकल्प सेव या पास करें, उपलब्ध टूर खोलें और ऐप में विज़िट शेड्यूल करें। अकाउंट वाले कामों के लिए साइन इन करें।',
      features: ['मैप और लिस्ट में प्रॉपर्टी देखें', 'विकल्प सेव या पास करें', 'प्रॉपर्टी की जानकारी और उपलब्ध टूर देखें', 'साइन इन करके विज़िट शेड्यूल करें'],
      qr: 'Google Play पर 360Ghar ऐप के पेज का QR कोड',
      qrNote: 'अपने फ़ोन से स्कैन करें',
    },
    ai: {
      title: 'AI सहायकों के लिए MCP टूल',
      lead: 'MCP डायरेक्टरी में टूल की जानकारी और साइन-इन नोट्स हैं। इससे लाइव सर्वर उपलब्धता, इन्वेंट्री या प्रॉपर्टी की जानकारी की पुष्टि नहीं होती।',
      prompts: [
        { who: 'खोज', say: 'DLF फेज़ 3 में 35k के अंदर 2BHK फर्निश्ड अपार्टमेंट खोजें' },
        { who: 'खोज', say: 'साइबर सिटी के पास 50k के अंदर 3BHK किराए के घर खोजें' },
        { who: 'विज़िट', say: 'इस शनिवार दोपहर की विज़िट का अनुरोध तैयार करें' },
        { who: 'EMI', say: '₹50 लाख के लोन पर 8.5% सालाना ब्याज और 20 साल की अवधि के लिए EMI का अनुमान लगाएँ' },
      ],
      list: 'उदाहरण प्रॉम्प्ट',
      server: 'सर्वर का पता',
      copy: 'सर्वर का पता कॉपी करें',
      copied: 'कॉपी हो गया',
      more: 'कैसे जोड़ें',
    },
  },
} as const;
