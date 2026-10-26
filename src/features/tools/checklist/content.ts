/**
 * Checklist copy. The 13 entries are prompts, not a complete or verified
 * document list for any transaction.
 */
import type { Faq, HowTo } from '../seo';

export const CHECKLIST_UI = {
  en: {
    progress: 'Your progress',
    of: (d: number, t: number) => `${d} of ${t}`,
    papers: 'items marked',
    print: 'Print or save as PDF',
    copy: 'Copy summary',
    copied: 'Summary copied',
    copyFailed: 'Could not copy. Use Print instead.',
    clear: 'Clear all ticks',
    cleared: 'Ticks cleared',
    undo: 'Undo',
    addFile: 'Note a file',
    fileHint: 'Only the file name and size are stored in this browser. This tool does not upload the selected file.',
    fileNoted: (n: string) => `Noted ${n}`,
    remove: 'Remove',
    removeFile: (n: string) => `Remove ${n}`,
    saved: 'Your ticks are saved in this browser only.',
    summaryTitle: 'Property document prompts',
    progressLine: (d: number, t: number) => `Checked: ${d} of ${t}`,
  },
  hi: {
    progress: 'आपकी प्रगति',
    of: (d: number, t: number) => `${t} में से ${d}`,
    papers: 'आइटम चिह्नित',
    print: 'प्रिंट करें या PDF सेव करें',
    copy: 'सारांश कॉपी करें',
    copied: 'सारांश कॉपी हो गया',
    copyFailed: 'कॉपी नहीं हो सका। प्रिंट का इस्तेमाल करें।',
    clear: 'सभी निशान हटाएँ',
    cleared: 'निशान हटा दिए गए',
    undo: 'वापस लाएँ',
    addFile: 'फ़ाइल नोट करें',
    fileHint: 'फ़ाइल का नाम और आकार इसी ब्राउज़र में सेव होते हैं। यह टूल चुनी गई फ़ाइल अपलोड नहीं करता।',
    fileNoted: (n: string) => `${n} नोट हो गई`,
    remove: 'हटाएँ',
    removeFile: (n: string) => `${n} हटाएँ`,
    saved: 'आपके निशान सिर्फ़ इसी ब्राउज़र में सेव हैं।',
    summaryTitle: 'प्रॉपर्टी दस्तावेज़ के संकेत',
    progressLine: (d: number, t: number) => `जाँचे गए: ${t} में से ${d}`,
  },
};

export const CHECKLIST_PAGE = {
  en: {
    heading: 'Property document prompts',
    lead: 'Use these 13 prompts to organize a review with a qualified professional or relevant authority. This list is not complete and does not verify documents, title or legal compliance.',
    description:
      'A non-exhaustive set of 13 property-document prompts. Requirements vary by transaction and location. This tool does not review documents or confirm title or legal compliance.',
    lawyerTitle: 'Review requirements for your transaction',
    faqTitle: 'About these document prompts',
  },
  hi: {
    heading: 'प्रॉपर्टी दस्तावेज़ के संकेत',
    lead: 'योग्य पेशेवर या संबंधित प्राधिकरण के साथ समीक्षा व्यवस्थित करने के लिए इन 13 संकेतों का उपयोग करें। यह पूरी सूची नहीं है और दस्तावेज़, टाइटल या कानूनी अनुपालन सत्यापित नहीं करती।',
    description:
      'प्रॉपर्टी दस्तावेज़ों के 13 गैर-सम्पूर्ण संकेत। ज़रूरतें लेन-देन और स्थान के अनुसार बदलती हैं। यह टूल दस्तावेज़ों की समीक्षा या टाइटल अथवा कानूनी अनुपालन की पुष्टि नहीं करता।',
    lawyerTitle: 'अपने लेन-देन की ज़रूरतें जाँचें',
    faqTitle: 'दस्तावेज़ संकेतों के बारे में',
  },
};

export const CHECKLIST_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'Which documents may be relevant to a property purchase?',
      a: 'This tool lists 13 prompts, not a complete or universal document list. Requirements vary by transaction and location. Confirm what applies with the relevant authority or a qualified professional.',
    },
    {
      q: 'Does an encumbrance certificate prove clear title?',
      a: 'This checklist does not interpret an encumbrance certificate or establish clear title. Ask the issuing authority or a qualified professional about the record’s scope and period.',
    },
    {
      q: 'Does this checklist decide whether I need legal advice?',
      a: 'No. It cannot assess your transaction or determine legal requirements. A qualified professional can review the documents and rules that apply to your case.',
    },
    {
      q: 'Does this checklist verify an occupancy certificate?',
      a: 'No. It does not verify an occupancy certificate, building status or safety. Confirm the document’s scope and status with the issuing authority or a qualified professional.',
    },
    {
      q: 'Where are my ticks saved?',
      a: 'The checklist stores your ticks and selected file name and size in this browser. It does not upload the selected file itself.',
    },
  ],
  hi: [
    {
      q: 'प्रॉपर्टी खरीद में कौन से दस्तावेज़ काम आ सकते हैं?',
      a: 'यह टूल 13 संकेत देता है, पूरी या हर जगह लागू दस्तावेज़ सूची नहीं। ज़रूरतें लेन-देन और स्थान के अनुसार बदलती हैं। संबंधित प्राधिकरण या योग्य पेशेवर से लागू सूची की पुष्टि करें।',
    },
    {
      q: 'क्या एनकम्ब्रेंस सर्टिफ़िकेट साफ़ टाइटल साबित करता है?',
      a: 'यह चेकलिस्ट एनकम्ब्रेंस सर्टिफ़िकेट की व्याख्या या साफ़ टाइटल की पुष्टि नहीं करती। रिकॉर्ड के दायरे और अवधि के बारे में जारी करने वाले प्राधिकरण या योग्य पेशेवर से पूछें।',
    },
    {
      q: 'क्या यह चेकलिस्ट तय करती है कि कानूनी सलाह चाहिए?',
      a: 'नहीं। यह आपके लेन-देन का आकलन या कानूनी ज़रूरतें तय नहीं करती। योग्य पेशेवर आपके मामले के दस्तावेज़ और नियम देख सकता है।',
    },
    {
      q: 'क्या यह चेकलिस्ट ऑक्युपेंसी सर्टिफ़िकेट सत्यापित करती है?',
      a: 'नहीं। यह ऑक्युपेंसी सर्टिफ़िकेट, बिल्डिंग की स्थिति या सुरक्षा सत्यापित नहीं करती। दस्तावेज़ के दायरे और स्थिति की पुष्टि जारी करने वाले प्राधिकरण या योग्य पेशेवर से करें।',
    },
    {
      q: 'मेरे निशान कहाँ सेव होते हैं?',
      a: 'चेकलिस्ट आपके निशान और चुनी गई फ़ाइल का नाम व आकार इसी ब्राउज़र में सेव करती है। चुनी गई फ़ाइल अपलोड नहीं होती।',
    },
  ],
};

export const CHECKLIST_HOWTO: Record<'en' | 'hi', HowTo> = {
  en: {
    name: 'How to use these document prompts',
    description: 'Use this non-exhaustive list to organize a review; it does not verify documents or legal requirements.',
    steps: [
      { name: 'Review the prompts', text: 'Use the 13 entries as examples, not a complete list for your transaction.' },
      { name: 'Mark your progress', text: 'Mark an item after your own review. The checklist does not verify document contents or authenticity.' },
      { name: 'Note a file name', text: 'Optionally note a file name. The tool stores its name and size, not the selected file.' },
      { name: 'Print or share the summary', text: 'Share the prompts with a qualified professional. They are not a legal review.' },
    ],
  },
  hi: {
    name: 'दस्तावेज़ संकेतों का उपयोग कैसे करें',
    description: 'समीक्षा व्यवस्थित करने के लिए इस गैर-सम्पूर्ण सूची का उपयोग करें; यह दस्तावेज़ या कानूनी ज़रूरतें सत्यापित नहीं करती।',
    steps: [
      { name: 'संकेतों की समीक्षा करें', text: '13 आइटम को उदाहरण मानें, अपने लेन-देन की पूरी सूची नहीं।' },
      { name: 'अपनी प्रगति चिह्नित करें', text: 'अपनी समीक्षा के बाद आइटम चिह्नित करें। चेकलिस्ट दस्तावेज़ की सामग्री या असलियत सत्यापित नहीं करती।' },
      { name: 'फ़ाइल का नाम नोट करें', text: 'चाहें तो फ़ाइल का नाम नोट करें। टूल नाम और आकार सेव करता है, चुनी हुई फ़ाइल नहीं।' },
      { name: 'सारांश प्रिंट या साझा करें', text: 'संकेत किसी योग्य पेशेवर के साथ साझा करें। यह कानूनी समीक्षा नहीं है।' },
    ],
  },
};
