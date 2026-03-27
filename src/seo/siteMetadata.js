export const siteMetadata = {
  siteUrl: 'https://360ghar.com',
  siteName: '360Ghar',
  defaultTitle:
    "360Ghar – India's VR-First Way to Find a Home | Buy, Sell & Rent Property in Gurugram",
  defaultDescription:
    "India's VR-First Way to Find a Home. 360Ghar is India's first AI + VR real estate platform. Explore verified flats, apartments & villas in Gurugram with studio-quality 360° guided walkthroughs. Zero upfront fees. No fake listings. AI-powered search.",
  defaultKeywords:
      [
        // AI Agent & MCP
        'AI real estate assistant', 'MCP server', 'ChatGPT real estate', 'AI property search India', 'conversational property finder', 
        'AI booking assistant', 'smart property management', 'AI landlord assistant', 'MCP real estate', 'AI home search', 
        'ChatGPT property search', 'Claude real estate', 'AI rent collection', 'AI tenant management', 'AI maintenance tracking',
        // Brand positioning
        'India first AI enabled real estate platform', 'virtual tour first real estate', 'AI property search India', 'smart real estate platform',
      // AI & technology
      'AI real estate platform', 'AI property search', 'AI virtual tours', 'smart real estate India', 'AI-powered property platform', 'AI home search',
      // Virtual tours
      '360 virtual tours', '3D property tours', 'immersive property viewing', 'virtual walkthrough', 'VR real estate', '360 degree property tours', 'virtual property viewing India',
      // Verification & trust
      'verified properties', 'on-site verified', 'genuine property listings', 'authentic listings', 'property verification team', 'real estate verification service', 'verified by on-site team',
      // Relationship Manager service
      'relationship manager', 'personal assistance', 'dedicated RM', 'end to end real estate service', 'property manager service', 'hassle free real estate',
      // Value & transparency
      'transparent brokerage', 'full visibility', 'no hidden charges', 'value for money', 'convenience real estate', 'transparent real estate India',
      // Core intents and generic
      'real estate India', 'property sites', 'properties near me', 'buy property', 'rent house', 'PG near me', 'co-living', 'paying guest', 'real estate agents', 'property dealers',
      // City coverage
      'Gurugram real estate', 'Gurgaon properties', 'Delhi properties', 'Noida properties', 'Ghaziabad properties', 'Faridabad properties',
      // Residential types
      'flats', 'apartments', 'builder floors', 'independent houses', 'villas', 'studio apartment', 'society flats', 'gated community',
      // BHK + furnishing
      '1 BHK', '2 BHK', '3 BHK', '4 BHK', 'furnished', 'semi-furnished', 'unfurnished', 'ready to move', 'under construction', 'new launch', 'resale',
      // Rental phrasing
      'for rent', 'on rent', 'rental', 'lease', 'without brokerage', 'no broker', 'direct owner',
      // Buy phrasing
      'for sale', 'purchase property', 'property for sale', 'resale flats', 'under construction projects',
      // Localities (NCR focus)
      'DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'DLF Phase 4', 'DLF Phase 5', 'Golf Course Road', 'Sohna Road', 'MG Road', 'Cyber City', 'Udyog Vihar', 'Palam Vihar', 'Sushant Lok', 'South City 1', 'South City 2', 'Nirvana Country', 'Dwarka Expressway',
      // Commercial
      'office space', 'co-working space', 'retail shop', 'showroom', 'warehouse', 'industrial property',
      // Amenities & proximity
      'near metro', 'covered parking', 'power backup', 'swimming pool', 'gym', 'park', '24x7 security', 'lift', 'clubhouse', 'pet friendly',
      // Budget patterns
      'under 10k', 'under 15k', 'under 20k', 'under 50 lakhs', 'under 80 lakhs', 'under 1 crore',
      // Info & tools
      'EMI calculator', 'home loan', 'stamp duty Haryana', 'RERA Gurugram', 'price trends Gurugram', 'rent index Gurugram',
      // Brand & features
      '360 virtual tours', 'verified listings', 'no broker properties', 'direct owner listings', 'property management',
      // New Tools
      'floor planner India', '3D home design tool', 'online blueprint designer', 'area calculator', 'carpet area calculator', 'property valuation tool', 'capital gains calculator India', 'property document checklist',
      // Property Management keywords
      'property management app India', 'landlord app', 'rental management software', 'tenant management platform', 'rent collection app', 'property expense tracking', 'lease management software', 'maintenance request tracker', 'property document management', 'landlord dashboard', 'rental income tracker', 'property owner app',
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
