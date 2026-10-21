/**
 * AI Design Studio text. Most island strings come from tools.json
 * (tools:aiDesignStudio) through pick(); AID_KEYS lists the ones used.
 * The FAQ is the old page FAQ, shortened, with Hindi added. Generation is free
 * and needs no sign-in: the backend runs Agnes AI.
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
    free: 'Free. No sign-up. Made by Agnes AI image models on 360Ghar servers, so nothing is charged to you.',
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
    free: 'मुफ़्त। साइन-अप नहीं। डिज़ाइन 360Ghar के सर्वर पर Agnes AI इमेज मॉडल बनाते हैं, आपसे कोई शुल्क नहीं।',
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
    lead: 'Describe a room or upload a photo, pick a style, and get a new interior or exterior design in about half a minute. Free, with no sign-up.',
    howToName: 'How to generate AI room designs',
    howToDesc: 'Step-by-step guide to creating photorealistic room designs with AI.',
    faqTitle: 'AI Design Studio: questions people ask',
  },
  hi: {
    heading: 'AI डिज़ाइन स्टूडियो',
    lead: 'कमरे का वर्णन करें या फ़ोटो डालें, स्टाइल चुनें, और लगभग आधे मिनट में नया इंटीरियर या एक्सटीरियर डिज़ाइन पाएँ। मुफ़्त, साइन-अप नहीं।',
    howToName: 'AI से कमरे का डिज़ाइन कैसे बनाएँ',
    howToDesc: 'AI से असली जैसे दिखने वाले कमरे के डिज़ाइन बनाने का आसान तरीका।',
    faqTitle: 'AI डिज़ाइन स्टूडियो: अक्सर पूछे जाने वाले सवाल',
  },
};

export const AID_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'How does AI Design Studio work?',
      a: 'It uses image generation models to create interior and exterior designs. Describe your idea in text, or upload a photo of an existing room to see it in a different style.',
    },
    {
      q: 'Is AI Design Studio free to use?',
      a: 'Yes. It is free and needs no sign-up or account. 360Ghar runs the Agnes AI image models on its own servers and pays for them. To keep it fast for everyone, one device can make about 10 designs a minute.',
    },
    {
      q: 'Can I upload my own room photo?',
      a: 'Yes. Choose "Reimagine Photo" and upload a JPEG, PNG or WebP photo up to 5 MB. The AI keeps the layout and changes colours, materials and decor.',
    },
    {
      q: 'What design styles are available?',
      a: 'There are 12 styles: Modern, Traditional Indian, Contemporary, Minimalist, Luxury, Scandinavian, Industrial, Bohemian, Art Deco, Rustic, Mediterranean and Japanese.',
    },
    {
      q: 'Where are my saved designs kept?',
      a: 'Saved designs stay in this browser only (up to 20). They are not uploaded to 360Ghar. Download a design to keep it anywhere else.',
    },
  ],
  hi: [
    {
      q: 'AI डिज़ाइन स्टूडियो कैसे काम करता है?',
      a: 'यह इमेज बनाने वाले AI मॉडल से इंटीरियर और एक्सटीरियर डिज़ाइन बनाता है। अपना आइडिया लिखें, या मौजूदा कमरे की फ़ोटो डालकर उसे नई स्टाइल में देखें।',
    },
    {
      q: 'क्या AI डिज़ाइन स्टूडियो मुफ़्त है?',
      a: 'हाँ। यह मुफ़्त है और इसके लिए साइन-अप या खाते की ज़रूरत नहीं। 360Ghar अपने सर्वर पर Agnes AI इमेज मॉडल चलाता है और उनका खर्च खुद उठाता है। सबके लिए तेज़ रखने के लिए एक डिवाइस से एक मिनट में लगभग 10 डिज़ाइन बन सकते हैं।',
    },
    {
      q: 'क्या मैं अपने कमरे की फ़ोटो डाल सकता हूँ?',
      a: 'हाँ। "फोटो पुनर्कल्पना" चुनें और 5 MB तक की JPEG, PNG या WebP फ़ोटो डालें। AI कमरे का ढाँचा वही रखता है और रंग, मटीरियल और सजावट बदलता है।',
    },
    {
      q: 'कौन-सी डिज़ाइन स्टाइल मिलती हैं?',
      a: '12 स्टाइल हैं: मॉडर्न, पारंपरिक भारतीय, कंटेम्पररी, मिनिमलिस्ट, लग्ज़री, स्कैंडिनेवियन, इंडस्ट्रियल, बोहेमियन, आर्ट डेको, रस्टिक, मेडिटेरेनियन और जापानी।',
    },
    {
      q: 'मेरे सहेजे डिज़ाइन कहाँ रहते हैं?',
      a: 'सहेजे डिज़ाइन सिर्फ़ इसी ब्राउज़र में रहते हैं (20 तक)। वे 360Ghar पर अपलोड नहीं होते। कहीं और रखने के लिए डिज़ाइन डाउनलोड करें।',
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
