export const siteMetadata = {
  siteUrl: 'https://360ghar.com',
  siteName: '360Ghar',
  defaultTitle:
    '360Ghar - Best Real Estate Platform in Gurugram | Buy, Sell, Rent Properties & PGs',
  defaultDescription:
    "360Ghar is Gurugram's premier real estate platform offering verified properties with 360° virtual tours. Buy, sell, rent apartments, flats, houses, and find PGs in prime locations like DLF Phase, Golf Course Road, Sohna Road, Cyber City. Schedule visits instantly. No listing fees for owners.",
  defaultKeywords:
    [
      // Core intents and generic
      'real estate India','property sites','properties near me','buy property','rent house','PG near me','co-living','paying guest','real estate agents','property dealers',
      // City coverage
      'Gurugram real estate','Gurgaon properties','Delhi properties','Noida properties','Ghaziabad properties','Faridabad properties',
      // Residential types
      'flats','apartments','builder floors','independent houses','villas','studio apartment','society flats','gated community',
      // BHK + furnishing
      '1 BHK','2 BHK','3 BHK','4 BHK','furnished','semi-furnished','unfurnished','ready to move','under construction','new launch','resale',
      // Rental phrasing
      'for rent','on rent','rental','lease','without brokerage','no broker','direct owner',
      // Buy phrasing
      'for sale','purchase property','property for sale','resale flats','under construction projects',
      // Localities (NCR focus)
      'DLF Phase 1','DLF Phase 2','DLF Phase 3','DLF Phase 4','DLF Phase 5','Golf Course Road','Sohna Road','MG Road','Cyber City','Udyog Vihar','Palam Vihar','Sushant Lok','South City 1','South City 2','Nirvana Country','Dwarka Expressway',
      // Commercial
      'office space','co-working space','retail shop','showroom','warehouse','industrial property',
      // Amenities & proximity
      'near metro','covered parking','power backup','swimming pool','gym','park','24x7 security','lift','clubhouse','pet friendly',
      // Budget patterns
      'under 10k','under 15k','under 20k','under 50 lakhs','under 80 lakhs','under 1 crore',
      // Info & tools
      'EMI calculator','home loan','stamp duty Haryana','RERA Gurugram','price trends Gurugram','rent index Gurugram',
      // Brand & features
      '360 virtual tours','verified listings','no broker properties','direct owner listings','property management',
    ].join(', '),
  defaultOgImage: '/assets/images/logo/logo.png',
  twitterCard: 'summary_large_image',
  organization: {
    name: '360Ghar',
    email: 'info@360ghar.com',
    telephone: '+91-8178340031',
    address: {
      streetAddress: '',
      addressLocality: 'Gurugram',
      addressRegion: 'HR',
      postalCode: '122001',
      addressCountry: 'IN',
    },
  },
};

export const absoluteUrl = (urlOrPath) => {
  if (!urlOrPath) return siteMetadata.siteUrl;
  try {
    // If already absolute
    // eslint-disable-next-line no-new
    new URL(urlOrPath);
    return urlOrPath;
  } catch (_) {
    return `${siteMetadata.siteUrl.replace(/\/$/, '')}/${String(urlOrPath).replace(/^\//, '')}`;
  }
};
