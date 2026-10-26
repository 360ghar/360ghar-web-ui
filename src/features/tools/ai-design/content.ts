/**
 * AI Design Studio text. Most island strings come from tools.json
 * (tools:aiDesignStudio) through pick(); AID_KEYS lists the ones used.
 * The FAQ and HowTo describe the current image-generation flow and its limits.
 */
import type { Faq, HowTo } from '../seo';

export const AID_KEYS = [
  'generationMode',
  'modeCreate',
  'modeCreateDesc',
  'modeReimagine',
  'modeReimagineDesc',
  'designType',
  'typeInterior',
  'typeInteriorDesc',
  'typeExterior',
  'typeExteriorDesc',
  'roomType',
  'spaceType',
  'designStyle',
  'customInstructions',
  'promptNote',
  'sourcePhoto',
  'dragDropPhoto',
  'orBrowse',
  'remove',
  'sourcePreview',
  'photoTip',
  'validationFileType',
  'validationFileSize',
  'errorNoImage',
  'generateDesign',
  'errorConnection',
  'errorTimeout',
  'errorValidation',
  'errorQuota',
  'errorGeneral',
  'errorQuotaMsg',
  'errorTimeoutMsg',
  'errorNetworkMsg',
  'errorGeneralMsg',
  'suggestions',
  'suggestionNetwork1',
  'suggestionNetwork2',
  'suggestionNetwork3',
  'suggestionTimeout1',
  'suggestionTimeout2',
  'suggestionTimeout3',
  'suggestionValidation1',
  'suggestionValidation2',
  'suggestionValidation3',
  'suggestionQuota1',
  'suggestionQuota2',
  'suggestionQuota3',
  'suggestionGeneral1',
  'suggestionGeneral2',
  'suggestionGeneral3',
  'tryAgain',
  'startOver',
  'original',
  'aiRedesign',
  'designGenerated',
  'generatedAlt',
  'download',
  'saved',
  'saveToGallery',
  'share',
  'regenerate',
  'newDesign',
  'viewPrompt',
  'shareTitle',
  'shareText',
  'yourDesigns',
  'clearAll',
  'beforeAfter',
  'dragSlider',
  'loadingCreating',
  'loadingUnderstanding',
  'loadingGenerating',
  'loadingEnhancing',
  'loadingNote',
] as const;

export const AID_UI = {
  en: {
    note: 'Generated images are design concepts. They may change room details and do not show measured dimensions.',
    elapsed: (t: string) => `Time so far: ${t}`,
    photo: 'Room photo',
    choose: 'Choose a photo',
    change: 'Choose another photo',
    compare: 'Show more of the original or the redesign',
    open: (n: number) => `Open design ${n}`,
    del: (n: number) => `Delete design ${n}`,
    cleared: 'Saved designs cleared',
    undo: 'Undo',
    full: 'Browser storage is full, so this design was not saved. Download it instead.',
    shareFail: 'Sharing is not available here. Download the image instead.',
    chars: (n: number, max: number) => `${n}/${max} characters`,
  },
  hi: {
    note: 'बनी हुई इमेज डिज़ाइन के विचार हैं। उनमें कमरे की बातें बदल सकती हैं और वे नाप नहीं दिखातीं।',
    elapsed: (t: string) => `अब तक का समय: ${t}`,
    photo: 'कमरे की फ़ोटो',
    choose: 'फ़ोटो चुनें',
    change: 'दूसरी फ़ोटो चुनें',
    compare: 'मूल या नया डिज़ाइन ज़्यादा दिखाएँ',
    open: (n: number) => `डिज़ाइन ${n} खोलें`,
    del: (n: number) => `डिज़ाइन ${n} हटाएँ`,
    cleared: 'सहेजे गए डिज़ाइन हटा दिए गए',
    undo: 'वापस लाएँ',
    full: 'ब्राउज़र स्टोरेज भर गया है, इसलिए यह डिज़ाइन सहेजा नहीं गया। इसे डाउनलोड कर लें।',
    shareFail: 'यहाँ शेयर नहीं हो सकता। इमेज डाउनलोड कर लें।',
    chars: (n: number, max: number) => `${n}/${max} अक्षर`,
  },
};

export const AID_PAGE = {
  en: {
    heading: 'AI Design Studio',
    lead: 'Describe a room or upload a photo, choose a style, and explore an AI-generated design concept. Results may change the layout and do not show measured dimensions.',
    howToName: 'How to generate AI room designs',
    howToDesc: 'Steps to create an AI-generated room design concept from a prompt or photo.',
    faqTitle: 'AI Design Studio: questions people ask',
  },
  hi: {
    heading: 'AI डिज़ाइन स्टूडियो',
    lead: 'कमरे का विवरण लिखें या फ़ोटो अपलोड करें, स्टाइल चुनें और AI से बना डिज़ाइन विचार देखें। नतीजे लेआउट बदल सकते हैं और नाप नहीं दिखाते।',
    howToName: 'AI से कमरे का डिज़ाइन कैसे बनाएँ',
    howToDesc: 'प्रॉम्प्ट या फ़ोटो से AI डिज़ाइन विचार बनाने के चरण।',
    faqTitle: 'AI डिज़ाइन स्टूडियो: अक्सर पूछे जाने वाले सवाल',
  },
};

export const AID_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'How does AI Design Studio work?',
      a: 'It sends a prompt or uploaded room photo to an image-generation service. The result is a design concept and may change the layout, objects, or dimensions.',
    },
    {
      q: 'Can I use a generated image as a measured floor plan?',
      a: 'No. It is an image concept, not a measured floor plan or construction drawing. Check dimensions and building requirements against suitable plans and professional advice.',
    },
    {
      q: 'Can I upload my own room photo?',
      a: 'Yes. Choose "Reimagine Photo" and upload a JPEG, PNG or WebP photo up to 5 MB. The generated image may change the layout, objects, or other details.',
    },
    {
      q: 'What design styles are available?',
      a: 'There are 12 styles: Modern, Traditional Indian, Contemporary, Minimalist, Luxury, Scandinavian, Industrial, Bohemian, Art Deco, Rustic, Mediterranean and Japanese.',
    },
    {
      q: 'Where are my saved designs kept?',
      a: 'The gallery stores up to 20 designs in this browser. Download a copy to keep it elsewhere.',
    },
  ],
  hi: [
    {
      q: 'AI डिज़ाइन स्टूडियो कैसे काम करता है?',
      a: 'यह प्रॉम्प्ट या डाली गई कमरे की फ़ोटो को इमेज बनाने वाली सेवा तक भेजता है। नतीजा डिज़ाइन का विचार है और लेआउट, चीज़ें या नाप बदल सकता है।',
    },
    {
      q: 'क्या बनी हुई इमेज को नाप वाले फ़्लोर प्लान की तरह इस्तेमाल कर सकते हैं?',
      a: 'नहीं। यह इमेज का विचार है, नाप वाला फ़्लोर प्लान या निर्माण ड्रॉइंग नहीं। नाप और निर्माण की ज़रूरतें सही प्लान और विशेषज्ञ की सलाह से जाँचें।',
    },
    {
      q: 'क्या मैं अपने कमरे की फ़ोटो डाल सकता हूँ?',
      a: 'हाँ। "फोटो पुनर्कल्पना" चुनें और 5 MB तक की JPEG, PNG या WebP फ़ोटो डालें। बनी हुई इमेज में लेआउट, चीज़ें या अन्य विवरण बदल सकते हैं।',
    },
    {
      q: 'कौन-सी डिज़ाइन स्टाइल मिलती हैं?',
      a: '12 स्टाइल हैं: मॉडर्न, पारंपरिक भारतीय, कंटेम्पररी, मिनिमलिस्ट, लग्ज़री, स्कैंडिनेवियन, इंडस्ट्रियल, बोहेमियन, आर्ट डेको, रस्टिक, मेडिटेरेनियन और जापानी।',
    },
    {
      q: 'मेरे सहेजे डिज़ाइन कहाँ रहते हैं?',
      a: 'गैलरी में 20 तक डिज़ाइन इसी ब्राउज़र में सेव होते हैं। कहीं और रखने के लिए कॉपी डाउनलोड करें।',
    },
  ],
};

export const AID_HOWTO: Record<'en' | 'hi', HowTo> = {
  en: {
    name: AID_PAGE.en.howToName,
    description: AID_PAGE.en.howToDesc,
    steps: [
      { name: 'Choose generation mode', text: 'Select text-to-image to describe your idea, or image-to-image to restyle an existing room photo.' },
      { name: 'Select room type and style', text: 'Pick the room type (bedroom, living room, kitchen and more) and one of 12 style presets.' },
      { name: 'Add your prompt or upload a photo', text: 'Type extra details, or upload a room photo for the AI to work with.' },
      { name: 'Generate and save', text: 'Generate the design, then download it or save it to the gallery in your browser.' },
    ],
  },
  hi: {
    name: AID_PAGE.hi.howToName,
    description: AID_PAGE.hi.howToDesc,
    steps: [
      { name: 'मोड चुनें', text: 'अपना आइडिया लिखने के लिए टेक्स्ट से इमेज, या मौजूदा फ़ोटो की स्टाइल बदलने के लिए इमेज से इमेज चुनें।' },
      { name: 'कमरा और स्टाइल चुनें', text: 'कमरे का प्रकार (बेडरूम, लिविंग रूम, रसोई और अन्य) और 12 में से एक स्टाइल चुनें।' },
      { name: 'विवरण लिखें या फ़ोटो डालें', text: 'अतिरिक्त बातें लिखें, या AI के लिए कमरे की फ़ोटो अपलोड करें।' },
      { name: 'डिज़ाइन बनाएँ और सहेजें', text: 'डिज़ाइन बनाएँ, फिर उसे डाउनलोड करें या ब्राउज़र की गैलरी में सहेजें।' },
    ],
  },
};
