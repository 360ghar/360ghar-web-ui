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
    telephone: '+91-9999900876',
    address: {
      streetAddress: 'Sector 50, Gurugram',
      addressLocality: 'Gurgaon',
      addressRegion: 'Haryana',
      postalCode: '122001',
      addressCountry: 'IN',
    },
  },
  // AUDIT FIX (5.4 / 5.11): centralised Google Maps embed for the primary
  // service area (Gurugram, Haryana, India). Previously the off-canvas panel
  // hardcoded a New York City iframe; consumers now read it from here so the
  // map always reflects the real service area and can be reconfigured in one
  // place.
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224356.8202113498!2d76.9302921759173!3d28.423957136112284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d19d582e38859%3A0x2cf5fe8e5c64b1e!2sGurugram%2C%20Haryana!5e0!3m2!1sen!2sin!4v1653544138149!5m2!1sen!2sin',
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
