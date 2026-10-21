/**
 * Strings of the home sections added in the parity round: refer and earn, the
 * app, the AI assistant, and the live counts in the tool notes. The v1 copy
 * (`home:referEarn`, `home:appDownload`, `home:aiAgent` in the old site) is
 * cut to plain short sentences; claims that cannot be checked are left out.
 */
export const MORE = {
  en: {
    refer: {
      title: 'Know someone with a home to rent out or sell?',
      listed: { amount: '₹100', text: 'when their home is verified and listed' },
      deal: { amount: '₹10,000', text: 'at most, when the deal closes' },
      note: 'Open to all. No account needed.',
      cta: 'Refer and earn',
    },
    app: {
      title: 'Get the 360Ghar app',
      lead: 'Search homes, book visits, and call or message your relationship manager, all from your phone.',
      features: ['Suggestions of homes like the ones you like', '360° tours for the homes that have one', 'Alerts for new homes and price drops', 'Call or message your relationship manager'],
      qr: 'QR code of the 360Ghar app page on Google Play',
      qrNote: 'Scan with your phone',
    },
    ai: {
      title: 'Ask an AI assistant to search for you',
      lead: 'Connect Claude, ChatGPT or any assistant that supports MCP to the 360Ghar server. Search works without an account. Visits and rent tools ask you to sign in to 360Ghar.',
      prompts: [
        { who: 'Search', say: 'Find a 2BHK furnished apartment in DLF Phase 3 under 35k' },
        { who: 'Search', say: 'Find 3BHK rentals near Cyber City under 50k' },
        { who: 'Visits', say: 'Schedule a visit for this Saturday afternoon' },
        { who: 'Owners', say: 'Show me this month’s rent collection status' },
      ],
      list: 'Things you can ask',
      server: 'Server address',
      copy: 'Copy server address',
      copied: 'Copied',
      more: 'How to connect',
    },
    stat: (n: string) => `${n} listed`,
  },
  hi: {
    refer: {
      title: 'क्या आप किसी को जानते हैं जो घर किराए पर देना या बेचना चाहता है?',
      listed: { amount: '₹100', text: 'जब उनका घर वेरिफाई होकर लिस्ट हो' },
      deal: { amount: '₹10,000', text: 'अधिकतम, जब डील पूरी हो' },
      note: 'सभी के लिए खुला है। खाते की ज़रूरत नहीं।',
      cta: 'रेफ़र करें और कमाएँ',
    },
    app: {
      title: '360Ghar ऐप पाएँ',
      lead: 'घर खोजें, विज़िट बुक करें, और अपने रिलेशनशिप मैनेजर को कॉल या मैसेज करें, सब कुछ अपने फ़ोन से।',
      features: ['आपको पसंद घरों जैसे घरों के सुझाव', 'जिन घरों का 360° टूर है, उनका टूर', 'नए घरों और कीमत घटने के अलर्ट', 'रिलेशनशिप मैनेजर को कॉल या मैसेज'],
      qr: 'Google Play पर 360Ghar ऐप के पेज का QR कोड',
      qrNote: 'अपने फ़ोन से स्कैन करें',
    },
    ai: {
      title: 'AI सहायक से कहिए, वह आपके लिए खोजेगा',
      lead: 'Claude, ChatGPT या MCP समर्थन वाले किसी भी सहायक को 360Ghar सर्वर से जोड़ें। खोज बिना खाते के चलती है। विज़िट और किराए के टूल के लिए 360Ghar में साइन इन करना होता है।',
      prompts: [
        { who: 'खोज', say: 'DLF फेज़ 3 में 35k के अंदर 2BHK फर्निश्ड अपार्टमेंट खोजें' },
        { who: 'खोज', say: 'साइबर सिटी के पास 50k के अंदर 3BHK किराए के घर खोजें' },
        { who: 'विज़िट', say: 'इस शनिवार दोपहर के लिए विज़िट शेड्यूल करें' },
        { who: 'मालिक', say: 'इस महीने की किराया वसूली की स्थिति दिखाएँ' },
      ],
      list: 'आप यह पूछ सकते हैं',
      server: 'सर्वर का पता',
      copy: 'सर्वर का पता कॉपी करें',
      copied: 'कॉपी हो गया',
      more: 'कैसे जोड़ें',
    },
    stat: (n: string) => `${n} दर्ज`,
  },
} as const;
