/** The five policy pages linked from the site. Content lives in the backend Pages API. */
export const POLICIES = [
  {
    slug: 'terms-of-service',
    en: { title: 'Terms of Service', description: 'Usage rules, disclaimers and fair-use expectations for the 360Ghar platform.' },
    hi: { title: 'सेवा की शर्तें', description: '360Ghar प्लेटफ़ॉर्म के उपयोग के नियम, अस्वीकरण और उचित उपयोग की अपेक्षाएँ।' },
  },
  {
    slug: 'privacy-policy',
    en: { title: 'Privacy Policy', description: 'How 360Ghar collects, secures and uses your information when you browse or list property.' },
    hi: { title: 'गोपनीयता नीति', description: 'प्रॉपर्टी देखते या लिस्ट करते समय 360Ghar आपकी जानकारी कैसे इकट्ठा, सुरक्षित और उपयोग करता है।' },
  },
  {
    slug: 'content-guidelines',
    en: { title: 'Content Guidelines', description: 'What you can and cannot submit in listings, media and community contributions.' },
    hi: { title: 'कंटेंट दिशानिर्देश', description: 'लिस्टिंग, मीडिया और कम्युनिटी योगदान में आप क्या भेज सकते हैं और क्या नहीं।' },
  },
  {
    slug: 'content-takedown-policy',
    en: { title: 'Content Takedown Policy', description: 'How to report infringing or inaccurate listings, and how 360Ghar reviews takedown requests.' },
    hi: { title: 'कंटेंट हटाने की नीति', description: 'गलत या उल्लंघन करने वाली लिस्टिंग की शिकायत कैसे करें, और 360Ghar हटाने के अनुरोध की जाँच कैसे करता है।' },
  },
  {
    slug: 'grievance-redressal-mechanism',
    en: { title: 'Grievance Redressal Mechanism', description: 'Escalation channels, timelines and the point of contact for platform grievances.' },
    hi: { title: 'शिकायत निवारण प्रक्रिया', description: 'प्लेटफ़ॉर्म से जुड़ी शिकायतों के लिए एस्केलेशन के रास्ते, समय-सीमा और संपर्क।' },
  },
] as const;

export const policyBySlug = (slug: string) => POLICIES.find((p) => p.slug === slug);

/** Slugs the backend can hold: lowercase words and hyphens. Anything else is a 404 without an API call. */
export const isPageSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80;
