export const siteMetadata = {
  siteUrl: 'https://360ghar.com',
  siteName: '360Ghar',
  defaultTitle:
    "360Ghar – VR Home Tours & Property in Gurugram",
  defaultDescription:
    "India's VR-First Way to Find a Home. 360Ghar is India's first AI + VR real estate platform. Explore verified flats, apartments & villas in Gurugram with studio-quality 360° guided walkthroughs. Zero upfront fees. No fake listings. AI-powered search.",
  defaultKeywords: [
    '360Ghar',
    'Gurugram real estate',
    'verified properties',
    '360 virtual tours',
    'AI property search',
    'property in Gurugram',
    'flat for rent Gurgaon',
    'flat for sale Gurgaon',
    'verified flats Gurugram',
    'no broker property Gurgaon',
    'मकान खरीदें गुड़गाँव',
    'किराये पर मकान गुड़गाँव',
    'गुड़गाँव प्रॉपर्टी',
    'ghar kharido Gurgaon',
    'property in gurgaon',
    'flat rent gurugram',
    'real estate gurgaon',
    '360 degree virtual tour property',
    'VR property tour India',
  ].join(', '),
  defaultOgImage: 'https://360ghar.com/og-image-home.jpg', // updated based on the required schema
  twitterCard: 'summary_large_image',
  organization: {
    name: '360Ghar',
    email: 'info@360ghar.com',
    telephone: '+91-8178340031',
    address: {
      streetAddress: 'Sector 43, Golf Course Road',
      addressLocality: 'Gurgaon',
      addressRegion: 'Haryana',
      postalCode: '122001',
      addressCountry: 'IN',
    },
  },
};

export const absoluteUrl = (urlOrPath) => {
  if (!urlOrPath) return siteMetadata.siteUrl;
  try {
    // If already absolute

    new URL(urlOrPath);
    return urlOrPath;
  } catch {
    return `${siteMetadata.siteUrl.replace(/\/$/, '')}/${String(urlOrPath).replace(/^\//, '')}`;
  }
};
