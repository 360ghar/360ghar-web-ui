import { siteMetadata } from './siteMetadata';
import { authors } from '../data/authors';

// Real Estate focused structured data for LLM optimization
export const realEstateStructuredData = {
  // Organization schema for real estate company
  organization: {
    '@type': ['RealEstateAgent', 'Organization'],
    '@id': 'https://360ghar.com/#organization',
    name: '360Ghar',
    alternateName: ['360 Ghar', '360Ghar.com', 'Three Sixty Ghar', '३६०घर', '360 Ghar Hindi'],
    legalName: '360 Ghar',
    inLanguage: ['en-IN', 'hi-IN'],
    description: "India's VR-First Way to Find a Home. 360Ghar is India's first AI + VR real estate platform. We eliminate fake and misleading property listings in Gurugram with studio-quality 360° guided walkthroughs and physically verified property details. Buy, sell, or rent with zero upfront fees and AI-powered matching.",
    url: 'https://360ghar.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://360ghar.com/logo.png',
      width: 512,
      height: 512
    },
    image: 'https://360ghar.com/og-image-home.jpg',
    telephone: siteMetadata.organization.telephone,
    email: siteMetadata.organization.email,
    foundingDate: '2025',
    foundingLocation: 'Gurgaon, Haryana, India',
    slogan: "India's VR-First Way to Find a Home.",
    keywords: 'real estate Gurgaon, verified property, 360 virtual tour, VR real estate India, AI property search',
    areaServed: [
      { '@type': 'City', name: 'Gurgaon', alternateName: 'Gurugram' },
      { '@type': 'State', name: 'Haryana' },
      { '@type': 'Country', name: 'India' }
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurgaon',
      addressRegion: 'Haryana',
      postalCode: '122001',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.4595,
      longitude: 77.0266
    },
    sameAs: [
      'https://www.instagram.com/360ghar',
      'https://www.facebook.com/360ghar',
      'https://www.linkedin.com/company/360ghar',
      'https://twitter.com/360ghar',
      'https://www.youtube.com/@360ghar',
      'https://share.google/DgcLFqSyBgz7kBwKe',
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '21:00'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '360Ghar Real Estate Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Properties for Sale Gurugram', description: 'Browse verified flats, apartments & villas for sale in Gurugram with 360° virtual tours' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Properties for Rent Gurugram', description: 'Find verified rental flats and apartments in Gurugram with immersive 360° walkthroughs' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '360° VR Virtual Property Tours', description: 'Studio-quality 360-degree immersive virtual walkthroughs for every listed property' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Free Property Listing', description: 'Zero-cost property listing with professional photography and VR tour creation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Property Matching', description: 'AI-powered smart property recommendations based on buyer preferences' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dedicated Relationship Manager', description: 'Personal RM assigned to every buyer, tenant, and owner' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Property Documentation Support', description: 'End-to-end paperwork and legal documentation for property transactions' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'In-App Visit Scheduling', description: 'Schedule and manage property site visits directly through the 360Ghar app' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Real Estate Assistant', description: 'Smart AI-powered assistant for property search, visit booking, and management through natural conversation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'MCP Server Integration', description: 'Connect AI assistants like Claude and ChatGPT to 360Ghar via Model Context Protocol for seamless property services' } }
      ]
    }
  },

  // Website schema for search engines
  website: {
    '@type': 'WebSite',
    name: '360Ghar',
    alternateName: '360 Ghar',
    url: 'https://360ghar.com',
    description: "India's VR-First Way to Find a Home. India's first AI + VR real estate platform with verified properties in Gurugram and studio-quality 360° guided walkthroughs.",
    inLanguage: ['en-IN', 'hi-IN'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://360ghar.com/properties?q={search_term_string}&city=gurgaon'
      },
      'query-input': 'required name=search_term_string'
    }
  },

  // Enhanced real estate listing schemas for better AI understanding
  realEstateListing: {
    '@type': 'ItemList',
    name: 'Properties for Sale and Rent in Gurugram',
    description: 'Verified properties by our on-site team with 360° virtual tours in prime Gurugram locations. End-to-end support by dedicated Relationship Managers.',
    url: `${siteMetadata.siteUrl}/properties`,
    numberOfItems: 1000
  },

  // Enhanced local business schema for better local SEO
  localBusiness: {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'RealEstateAgent'],
    '@id': 'https://360ghar.com/#localbusiness',
    name: '360Ghar',
    image: ['https://360ghar.com/logo.png', 'https://360ghar.com/office.jpg'],
    url: 'https://360ghar.com',
    telephone: siteMetadata.organization.telephone,
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteMetadata.organization.address.streetAddress,
      addressLocality: 'Gurgaon',
      addressRegion: 'Haryana',
      postalCode: '122001',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.4595,
      longitude: 77.0266
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '21:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '20:00'
      }
    ],
    hasMap: 'https://maps.google.com/?q=360Ghar+Gurgaon',
    sameAs: [
      'https://www.instagram.com/360ghar',
      'https://www.facebook.com/360ghar',
      'https://www.linkedin.com/company/360ghar',
      'https://twitter.com/360ghar',
      'https://www.youtube.com/@360ghar',
      'https://share.google/DgcLFqSyBgz7kBwKe',
    ],
    areaServed: 'Gurgaon, Haryana, India'
  },

  // Enhanced FAQ schema for AI/LLM optimization with comprehensive real estate questions
  faq: {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is 360Ghar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '360Ghar is India\'s first AI-Enabled and Virtual Tour first Real Estate Platform. All properties are verified by our on-site team. Our dedicated Relationship Manager handles your end-to-end flow so that you can relax and enjoy. We provide end-to-end visibility, convenience, and transparency for the same brokerage amount.'
        }
      },
      {
        '@type': 'Question',
        name: 'How can I list my property on 360Ghar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can list your property on 360Ghar by visiting the post-property page. There are no upfront listing fees for owners. Simply provide property details, upload photos, and our team will help with verification and adding 360° virtual tours for maximum visibility.'
        }
      },
      {
        '@type': 'Question',
        name: 'What types of properties are available in Gurugram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '360Ghar offers various property types in Gurugram including apartments, flats, builder floors, independent houses, commercial spaces, and PG accommodations in prime locations like DLF Phase, Golf Course Road, Sohna Road, Cyber City, Sector 29, MG Road, and more. All properties come with verified details and virtual tours.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are all properties on 360Ghar verified?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, 360Ghar features verified properties with authentic photos, accurate details, exact locations, and 360° virtual tours to ensure transparency and authenticity. We verify each listing to provide you with reliable real estate information.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do I search for properties in Gurugram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use our AI-enabled search to find properties in Gurugram by location, price range, property type, BHK, furnishing status, and amenities. Browse verified listings with 360° virtual tours and get end-to-end assistance from a dedicated Relationship Manager.'
        }
      },
      {
        '@type': 'Question',
        name: 'What are the advantages of 360° virtual tours?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '360° virtual tours allow you to explore properties remotely from anywhere. Walk through rooms, check layouts, view amenities, and get a real feel of the property before scheduling a physical visit. This saves time and helps you make better real estate decisions.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does it cost to rent/buy property in Gurugram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Property prices in Gurugram vary by location and type. Luxury apartments in Golf Course Road start from ₹2-5 lakhs/month for rent and ₹2-10 crores for purchase. Affordable options in Sohna Road range from ₹15,000-50,000/month for rent. Check our platform for current market rates and verified listings.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are there PG options available in Gurugram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, 360Ghar offers verified PG accommodations in Gurugram with options for working professionals and students. PGs are available in prime locations with amenities like WiFi, meals, housekeeping, and security. Prices typically range from ₹8,000-25,000 per month including facilities.'
        }
      },
      {
        '@type': 'Question',
        name: 'What are the best areas to live in Gurugram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Top areas in Gurugram include DLF Phase 1-5, Golf Course Road, Sohna Road, Cyber City, Sector 29, MG Road, and Nirvana Country. Each area offers different price points and amenities. DLF Phase offers luxury living, Golf Course Road has premium malls and restaurants, while Sohna Road provides more affordable options.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do I schedule a property visit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Schedule instant visits through our platform. Use our 360° virtual tours first to shortlist properties, then our Relationship Manager will coordinate physical visits at your convenience and handle the entire process.'
        }
      },
      {
        '@type': 'Question',
        name: 'What makes 360Ghar India\'s first AI-Enabled real estate platform?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '360Ghar leverages AI technology to power smart property search, personalized recommendations, and immersive 360° virtual tours. We combine this technology with on-site verification and human expertise (Relationship Managers) to offer a seamless, transparent experience.'
        }
      },
      {
        '@type': 'Question',
        name: 'How are properties verified by on-site team at 360Ghar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our on-site verification team personally visits each property to verify ownership documents, confirm exact location, check amenities, and capture authentic photos and 360° virtual tours. This ensures every listing on 360Ghar is genuine and trustworthy.'
        }
      },
      {
        '@type': 'Question',
        name: 'What does the Relationship Manager service include at 360Ghar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Your dedicated Relationship Manager handles your entire property journey from end-to-end. They assist with shortlisting, scheduling visits, negotiations, documentation, and handover. They ensure you get value for your money, with full visibility and transparency throughout the process.'
        }
      },
      {
        '@type': 'Question',
        name: 'Why should I choose 360Ghar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Customers often feel they pay huge brokerage without getting value. At 360Ghar, for the same brokerage amount, we provide end-to-end visibility, convenience, and transparency. You get AI-enabled search, 360° virtual tours, properties verified by our on-site team, and a dedicated Relationship Manager to handle everything so you can relax.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do 360° virtual tours work on 360Ghar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our 360° virtual tours let you explore properties online as if you were there in person. You can navigate through rooms, zoom in on details, check layouts, view amenities, and understand the space before scheduling visits. This saves time and helps you make confident decisions.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does 360Ghar offer property management features for landlords?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, 360Ghar provides a complete property management platform for landlords. Features include financial dashboards for tracking rent and expenses, tenant management tools, maintenance request tracking, secure document storage, and automated financial reports. All accessible through our mobile app.'
        }
      },
      {
        '@type': 'Question',
        name: 'How can I track rent collection on 360Ghar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "360Ghar's financial dashboard gives you real-time visibility into rent collection. Track outstanding payments, view payment history, generate invoices, and get notifications for due dates."
        }
      },
      {
        '@type': 'Question',
        name: 'What is 360Ghar\'s AI Agent?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "360Ghar's AI Agent is an intelligent assistant powered by our MCP server that helps you find properties, book visits, and manage rentals through natural conversation. Connect it to Claude, ChatGPT, or any AI assistant to access all 360Ghar services via chat."
        }
      },
      {
        '@type': 'Question',
        name: 'How do I connect my AI assistant to 360Ghar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Visit the MCP login page on 360Ghar and authenticate your account. Once connected, your AI assistant will have access to search properties, schedule visits, and manage your rentals. The connection persists until you revoke access."
        }
      },
      {
        '@type': 'Question',
        name: 'Which AI assistants can connect to 360Ghar via MCP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Our MCP server is compatible with any AI assistant that supports the Model Context Protocol, including Claude (via Claude Desktop), ChatGPT, and custom AI implementations. The MCP server URL is https://api.360ghar.com/mcp"
        }
      },
      {
        '@type': 'Question',
        name: 'Can the AI help me manage rental properties?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Yes! Landlords can use the AI assistant to track rent collection, manage tenants, handle maintenance requests, and access property documents. Just ask: \"Show me this month's rent status\" or \"List all maintenance requests\"."
        }
      },
      {
        '@type': 'Question',
        name: '360Ghar kya hai?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '360Ghar India ka pehla AI aur Virtual Tour-first real estate platform hai. Yahan sabhi properties humare on-site team dwara verify ki jaati hain. Aapko milta hai dedicated Relationship Manager jo aapki poori journey handle karta hai — property search se lekar final handover tak. Same brokerage mein end-to-end visibility aur transparency.'
        }
      },
      {
        '@type': 'Question',
        name: 'Gurgaon mein flat kaise khariden?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '360Ghar par Gurgaon ke verified flats browse karein. AI-powered search se apni budget aur requirement ke hisaab se filter karein. Har listing mein 360° virtual tour available hai. Apna dedicated Relationship Manager shortlisting, site visits, negotiations, aur documentation mein help karta hai. Koi hidden charges nahi.'
        }
      },
      {
        '@type': 'Question',
        name: 'क्या 360Ghar पर सभी प्रॉपर्टी verified हैं?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'हाँ, 360Ghar पर हर प्रॉपर्टी हमारी on-site team द्वारा physically verify की जाती है। हम ownership documents, exact location, authentic photos, और 360° virtual tour verify करते हैं। कोई fake listing नहीं, कोई outdated inventory नहीं।'
        }
      },
      {
        '@type': 'Question',
        name: 'Gurugram mein kiraye par flat kaise milega?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '360Ghar par Gurugram ke verified rental flats search karein — DLF Phase, Golf Course Road, Sohna Road, Sector 56 jaise prime areas mein. Budget, BHK, aur amenity filters use karein. Har listing mein 360° virtual tour hai taaki aap ghar baithke property explore kar sakein. Relationship Manager agreement aur handover mein help karta hai.'
        }
      }
    ]
  },

  // Knowledge Panel data for AI/LLM responses
  knowledgePanel: {
    '@type': 'Organization',
    '@id': siteMetadata.siteUrl,
    name: siteMetadata.siteName,
    alternateName: ['360Ghar', '360 Ghar', '360Ghar Real Estate'],
    description: siteMetadata.defaultDescription,
    url: siteMetadata.siteUrl,
    logo: siteMetadata.defaultOgImage,
    image: siteMetadata.defaultOgImage,
    foundingDate: '2025',
    inLanguage: ['en-IN', 'hi-IN'],
    sameAs: [
      'https://www.facebook.com/360ghar',
      'https://www.instagram.com/360ghar',
      'https://www.linkedin.com/company/360ghar'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteMetadata.organization.telephone,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi']
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Real Estate Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Property Buying Assistance',
            description: 'Help buyers find verified properties in Gurugram with virtual tours'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Property Rental Services',
            description: 'Find rental properties and PG accommodations in Gurugram'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Property Listing Service',
            description: 'List properties for free with 360° virtual tours'
          }
        }
      ]
    },
    knowsAbout: [
      'Real Estate in Gurugram',
      'Property Buying in Delhi NCR',
      'Rental Properties India',
      'PG Accommodation Gurugram',
      'Virtual Property Tours',
      'Real Estate Technology',
      'Indian Property Market',
      'गुड़गाँव में संपत्ति',
      'Gurgaon mein property',
      'मकान खरीदना',
      'किराये पर मकान',
      'Flat rent Gurgaon',
      'DLF Gurgaon real estate',
      'Verified property India'
    ]
  },

  // Mobile Application schema for Property Management features
  mobileApplication: {
    '@type': 'MobileApplication',
    name: '360Ghar - Property Management & Search',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Android',
    inLanguage: ['en-IN', 'hi-IN'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR'
    },
    description: 'Complete property management for landlords and AI-powered property search. Manage rent, tenants, maintenance, and documents.',
    featureList: [
      'Financial Dashboard',
      'Tenant Management',
      'Maintenance Tracking',
      'Document Vault',
      'AI Property Search',
      '360 Virtual Tours',
      'Visit Scheduling'
    ],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.the360ghar.ghar360',
    publisher: {
      '@type': 'Organization',
      name: '360Ghar'
    }
  },

  // Person schema for founders/key team members (E-E-A-T boost)
  person: {
    '@type': 'Person',
    name: authors['saksham-mittal'].name,
    jobTitle: authors['saksham-mittal'].title,
    worksFor: {
      '@type': 'Organization',
      name: '360Ghar',
      url: 'https://360ghar.com'
    },
    description: authors['saksham-mittal'].bio,
    url: authors['saksham-mittal'].linkedin,
    image: `https://360ghar.com${authors['saksham-mittal'].image}`,
    sameAs: [
      authors['saksham-mittal'].linkedin,
      'https://twitter.com/360ghar'
    ],
    knowsAbout: authors['saksham-mittal'].credentials.split(', ').map(s => s.trim())
  },

  // Speakable schema for voice search optimization (Google Assistant, Alexa)
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['.speakable-summary', '.speakable-highlights'],
    xpath: '//div[@class="speakable-summary"] | //div[@class="speakable-highlights"]'
  }
};

// Location-based structured data for major Gurugram areas
export const gurugramAreasData = [
  {
    '@type': 'Place',
    name: 'DLF Phase 1, Gurgaon',
    description: 'Premium residential and commercial properties in DLF Phase 1',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurgaon',
      addressRegion: 'HR',
      addressCountry: 'IN'
    },
    alternateName: 'डीएलएफ फेज 1',
    keywords: 'DLF Phase 1 properties, DLF Phase 1 apartments, DLF Phase 1 flats, DLF Phase 1 flat for sale, DLF Phase 1 kiraye par'
  },
  {
    '@type': 'Place',
    name: 'Golf Course Road, Gurgaon',
    description: 'Luxury properties and premium apartments on Golf Course Road',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurgaon',
      addressRegion: 'HR',
      addressCountry: 'IN'
    },
    alternateName: 'गोल्फ कोर्स रोड',
    keywords: 'Golf Course Road properties, Golf Course Road luxury apartments, Golf Course Road flat rent, Golf Course Road property'
  },
  {
    '@type': 'Place',
    name: 'Sohna Road, Gurgaon',
    description: 'Affordable and mid-range apartments on Sohna Road',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurgaon',
      addressRegion: 'HR',
      addressCountry: 'IN'
    },
    alternateName: 'सोहना रोड',
    keywords: 'Sohna Road properties, Sohna Road apartments, Sohna Road flats, Sohna Road affordable flats, Sohna Road rent'
  },
  {
    '@type': 'Place',
    name: 'Cyber City, Gurgaon',
    description: 'Commercial and residential properties near Cyber City',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurgaon',
      addressRegion: 'HR',
      addressCountry: 'IN'
    },
    alternateName: 'साइबर सिटी',
    keywords: 'Cyber City properties, Cyber City apartments, Cyber City office space, Cyber City office space rent'
  },
  {
    '@type': 'Place',
    name: 'Sector 29, Gurgaon',
    description: 'Properties in Sector 29, near major commercial hubs',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurgaon',
      addressRegion: 'HR',
      addressCountry: 'IN'
    },
    alternateName: 'सेक्टर 29',
    keywords: 'Sector 29 properties, Sector 29 apartments, Sector 29 flats, Sector 29 property'
  }
];

// Property-specific structured data generator
export const generatePropertyStructuredData = (property) => ({
  '@type': 'Product',
  name: property.title || 'Property in Gurugram',
  description: property.description || 'Premium property with 360° virtual tour in Gurugram',
  url: property.url || `${siteMetadata.siteUrl}/property/${property.id}`,
  image: property.images || [siteMetadata.defaultOgImage],
  sku: String(property.id || ''),
  brand: {
    '@type': 'Brand',
    name: siteMetadata.siteName
  },
  category: property.propertyType || 'Apartment',
  offers: {
    '@type': 'Offer',
    url: property.url || `${siteMetadata.siteUrl}/property/${property.id}`,
    price: property.price || 0,
    priceCurrency: 'INR',
    availability: property.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    seller: {
      '@type': 'RealEstateAgent',
      name: siteMetadata.siteName,
      telephone: siteMetadata.organization.telephone
    }
  },
  additionalProperty: [
    {
      '@type': 'PropertyValue',
      name: 'Property Type',
      value: property.propertyType || 'Apartment'
    },
    {
      '@type': 'PropertyValue',
      name: 'Listing Type',
      value: property.listingType || 'Sale'
    },
    {
      '@type': 'PropertyValue',
      name: 'Furnishing',
      value: property.furnishing || 'Semi-Furnished'
    },
    {
      '@type': 'PropertyValue',
      name: 'Bathrooms',
      value: property.bathrooms || 1
    },
    {
      '@type': 'PropertyValue',
      name: 'Balconies',
      value: property.balconies || 0
    },
    {
      '@type': 'PropertyValue',
      name: 'Parking',
      value: property.parking || 0
    },
    {
      '@type': 'PropertyValue',
      name: 'Age of Property',
      value: property.age || 'New'
    },
    {
      '@type': 'PropertyValue',
      name: 'Transaction Type',
      value: property.transactionType || 'New Property'
    },
    {
      '@type': 'PropertyValue',
      name: 'Ownership Type',
      value: property.ownershipType || 'Freehold'
    },
    {
      '@type': 'PropertyValue',
      name: 'Floor',
      value: property.floor || 'Ground Floor'
    },
    {
      '@type': 'PropertyValue',
      name: 'Total Floors',
      value: property.totalFloors || 0
    },
    {
      '@type': 'PropertyValue',
      name: 'Facing',
      value: property.facing || 'North-East'
    },
    {
      '@type': 'PropertyValue',
      name: 'Overlooking',
      value: property.overlooking || 'Garden/Park'
    },
    {
      '@type': 'PropertyValue',
      name: 'Virtual Tour Available',
      value: 'Yes'
    }
  ],
  aggregateRating: property.rating
    ? {
        '@type': 'AggregateRating',
        ratingValue: property.rating,
        reviewCount: property.reviewCount || property.reviews?.length || 1,
        bestRating: '5',
      }
    : undefined,
  review: property.reviews ? property.reviews.map(review => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author
    },
    datePublished: review.date,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating
    },
    reviewBody: review.comment
  })) : undefined
});

// Blog post structured data generator
export const generateBlogStructuredData = ({ authorSchema, schemaMarkup, inLanguage, ...blog }) => ({
  ...(schemaMarkup || {}),
  '@type': 'BlogPosting',
  headline: blog.title || schemaMarkup?.headline || 'Real Estate Blog',
  description: blog.description || schemaMarkup?.description || 'Latest real estate insights and tips',
  image: blog.image || schemaMarkup?.image || siteMetadata.defaultOgImage,
  author: authorSchema || {
    '@type': 'Organization',
    name: siteMetadata.siteName,
  },
  publisher: {
    '@type': 'Organization',
    name: siteMetadata.siteName,
    logo: {
      '@type': 'ImageObject',
      url: siteMetadata.defaultOgImage
    }
  },
  datePublished: blog.publishedAt || schemaMarkup?.datePublished || new Date().toISOString(),
  dateModified: blog.updatedAt || schemaMarkup?.dateModified || new Date().toISOString(),
  inLanguage: inLanguage || ['en-IN', 'hi-IN'],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': blog.url || `${siteMetadata.siteUrl}/blog/${blog.slug}`
  }
});

// Breadcrumb structured data generator
export const generateBreadcrumbStructuredData = (breadcrumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

// Video object structured data for virtual tours
export const generateVideoStructuredData = (video) => ({
  '@type': 'VideoObject',
  name: video.title || '360° Virtual Tour',
  description: video.description || 'Experience this property through our immersive 360° virtual tour',
  thumbnailUrl: video.thumbnail || siteMetadata.defaultOgImage,
  uploadDate: video.uploadDate || new Date().toISOString(),
  duration: video.duration || 'PT1M',
  contentUrl: video.contentUrl,
  embedUrl: video.embedUrl,
  publisher: {
    '@type': 'Organization',
    name: siteMetadata.siteName,
    logo: {
      '@type': 'ImageObject',
      url: siteMetadata.defaultOgImage
    }
  }
});

/**
 * Generate Product schema for property detail pages.
 * Google uses Product (with offers) for price rich snippets in search results.
 * Combines RealEstateListing info into the Product format that Google renders.
 */
export const generatePropertyProductStructuredData = (property) => {
  const priceValue = property.purpose === 'rent'
    ? (property.monthly_rent || property.daily_rate || property.base_price || 0)
    : (property.base_price || property.monthly_rent || property.daily_rate || 0);

  const listingType = property.purpose === 'rent' ? 'Rent' : property.purpose === 'buy' || property.purpose === 'sale' ? 'Sale' : 'Listing';
  const locationLabel = property.locality || property.city || 'Gurugram';
  const propertyTypeLabel = property.property_type || 'Property';

  // Google rejects both `price: 0` and a Product with no Offer. When no price
  // is known, emit a valid Offer WITHOUT `price` (plus "Contact for price")
  // rather than omitting the Offer entirely or sending price:0.
  const hasPrice = Number(priceValue) > 0;
  const availability = property.is_available !== false
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
  const offers = {
    '@type': 'Offer',
    priceCurrency: 'INR',
    availability,
    url: `https://360ghar.com/property/${property.id}`,
    seller: {
      '@type': 'Organization',
      name: '360Ghar',
    },
    ...(hasPrice
      ? {
        price: priceValue,
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }
      : { description: 'Contact for price' }),
  };

  return {
    '@type': 'Product',
    name: property.title || `${propertyTypeLabel} for ${listingType} in ${locationLabel}`,
    description: property.description || `Verified ${propertyTypeLabel.toLowerCase()} for ${listingType.toLowerCase()} in ${locationLabel} with 360° virtual tour`,
    image: Array.isArray(property.images)
      ? property.images.map((img) => img.image_url).filter(Boolean).slice(0, 5)
      : [siteMetadata.defaultOgImage],
    url: `https://360ghar.com/property/${property.id}`,
    brand: {
      '@type': 'Brand',
      name: '360Ghar',
    },
    offers,
    // Only emit aggregateRating when we have a REAL rating — fabricated
    // ratings (4.5/50 fallbacks) violate Google's Review/Snippet spam policy.
    ...(property.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: property.rating,
            reviewCount: property.reviewCount || property.reviews?.length || 1,
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {}),
    review: property.reviews ? property.reviews.slice(0, 3).map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating || '4',
        bestRating: '5',
      },
      author: {
        '@type': 'Person',
        name: review.author_name || 'Verified Buyer',
      },
      reviewBody: review.comment || review.review || '',
      datePublished: review.created_at || new Date().toISOString(),
    })) : undefined,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'listingType',
        value: listingType,
      },
      {
        '@type': 'PropertyValue',
        name: 'bedrooms',
        value: property.bhk || property.bedrooms || 1,
      },
      {
        '@type': 'PropertyValue',
        name: 'area',
        value: `${property.area_sqft || 0} sq ft`,
      },
    ],
  };
};

/**
 * Generate Place schema for locality pages.
 * Enables Google Knowledge Panel eligibility for localities.
 */
export const generateLocalityStructuredData = ({ name, city, state = 'Haryana', slug, lat, lng, entityType, inLanguage }) => ({
  '@type': 'Place',
  name,
  address: {
    '@type': 'PostalAddress',
    addressLocality: name,
    addressRegion: state,
    addressCountry: 'IN',
  },
  ...(lat && lng ? {
    geo: {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng,
    },
  } : {}),
  url: `https://360ghar.com/locality/${slug}`,
  hasMap: `https://maps.google.com/?q=${encodeURIComponent(`${name}, ${city}, ${state}`)}`,
  containsPlace: {
    '@type': 'Place',
    name: `360Ghar Verified Properties in ${name}`,
    description: `Browse physically verified properties with 360° virtual tours in ${name}, ${city}`,
    url: `https://360ghar.com/locality/${slug}`,
  },
  additionalProperty: {
    '@type': 'PropertyValue',
    name: 'entityType',
    value: entityType || 'Locality',
  },
  inLanguage: inLanguage || ['en-IN', 'hi-IN'],
});

/**
 * Generate E-E-A-T trust signals for a page.
 * Includes Organization aggregate rating and review data.
 */
export const generateHowToStructuredData = ({ name, description, steps, image }) => {
  const howTo = {
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.name,
      text: step.text,
      ...(step.url ? { url: step.url } : {}),
      ...(step.image ? { image: { '@type': 'ImageObject', url: step.image } } : {}),
    })),
  };
  if (image) {
    howTo.image = { '@type': 'ImageObject', url: image };
  }
  return howTo;
};

export const generateFaqStructuredData = (faqItems) => ({
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    text: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
    author: item.author || { '@type': 'Organization', name: '360Ghar' },
    datePublished: item.datePublished || new Date().toISOString().split('T')[0],
  })),
});

export const generateEeaSignals = ({ reraNumber, verifiedCount } = {}) => {
  const signals = [];

  // Organization trust schema
  signals.push({
    '@type': 'Organization',
    '@id': 'https://360ghar.com/#organization',
    name: '360Ghar',
  });

  // RERA verification claim
  if (reraNumber) {
    signals.push({
      '@type': 'ClaimReview',
      claimReviewed: `RERA Registration: ${reraNumber}`,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      author: {
        '@type': 'Organization',
        name: 'Haryana RERA',
      },
    });
  }

  // Verification count claim
  if (verifiedCount) {
    signals.push({
      '@type': 'ClaimReview',
      claimReviewed: `${verifiedCount} properties physically verified by 360Ghar on-site team`,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      author: {
        '@type': 'Organization',
        name: '360Ghar',
      },
    });
  }

  return signals;
};

/**
 * Generate Person schema for team members/founders.
 * Boosts E-E-A-T signals for AI discoverability.
 */
export const generatePersonStructuredData = ({ name, jobTitle, image, bio, linkedin, twitter, expertise = [] }) => ({
  '@type': 'Person',
  name,
  jobTitle,
  worksFor: {
    '@type': 'Organization',
    name: '360Ghar',
    url: 'https://360ghar.com',
  },
  description: bio || `Key team member at 360Ghar, India's first AI + VR-first real estate platform.`,
  url: 'https://360ghar.com/about-us',
  image: image || 'https://360ghar.com/team/member.jpg',
  sameAs: [
    linkedin || 'https://www.linkedin.com/company/360ghar',
    twitter || 'https://twitter.com/360ghar',
  ].filter(Boolean),
  knowsAbout: expertise.length > 0 ? expertise : [
    'Real Estate Technology',
    'Property Management',
    'Gurugram Real Estate Market',
  ],
});

/**
 * Generate Event schema for property expos, webinars, and open houses.
 */
export const generateEventStructuredData = ({
  name,
  description,
  startDate,
  endDate,
  location,
  image,
  eventStatus = 'EventScheduled',
  attendanceMode = 'Mixed',
  price = 0,
  url,
}) => ({
  '@type': 'Event',
  name,
  description,
  startDate,
  endDate,
  eventStatus: `https://schema.org/${eventStatus}`,
  eventAttendanceMode: `https://schema.org/${attendanceMode}EventAttendanceMode`,
  location: {
    '@type': 'Place',
    name: location.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.streetAddress,
      addressLocality: location.addressLocality || 'Gurgaon',
      addressRegion: location.addressRegion || 'Haryana',
      postalCode: location.postalCode || '122001',
      addressCountry: location.addressCountry || 'IN',
    },
    ...(location.latitude && location.longitude ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: location.latitude,
        longitude: location.longitude,
      },
    } : {}),
  },
  image: image || 'https://360ghar.com/events/default-event.jpg',
  organizer: {
    '@type': 'Organization',
    name: '360Ghar',
    url: 'https://360ghar.com',
  },
  offers: {
    '@type': 'Offer',
    price: String(price),
    priceCurrency: 'INR',
    availability: price === 0 ? 'https://schema.org/InStock' : 'https://schema.org/LimitedAvailability',
    url: url || 'https://360ghar.com/events',
  },
  url: url || 'https://360ghar.com/events',
});

/**
 * Generate PodcastSeries schema for audio content.
 */
export const generatePodcastStructuredData = ({
  name,
  description,
  url,
  image,
  genre = ['Business', 'Real Estate'],
  language = 'en-IN',
  episodeCount = 0,
  ratingValue = '4.8',
  reviewCount = '100',
}) => ({
  '@type': 'PodcastSeries',
  name,
  description,
  url: url || 'https://360ghar.com/podcast',
  image: image || 'https://360ghar.com/podcast/cover-art.jpg',
  publisher: {
    '@type': 'Organization',
    name: '360Ghar',
    url: 'https://360ghar.com',
  },
  author: {
    '@type': 'Organization',
    name: '360Ghar Content Team',
  },
  language,
  genre,
  keywords: 'real estate podcast, property investment, Gurugram real estate, housing market India',
  inLanguage: ['hi', 'en'],
  numberOfEpisodes: episodeCount,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue,
    reviewCount,
    bestRating: '5',
    worstRating: '1',
  },
});

/**
 * Generate Course schema for real estate education.
 */
export const generateCourseStructuredData = ({
  name,
  description,
  url,
  image,
  educationalLevel = 'Intermediate',
  duration = 'PT8H',
  prerequisites = '',
  teaches = [],
  price = 0,
}) => ({
  '@type': 'Course',
  name,
  description,
  provider: {
    '@type': 'Organization',
    name: '360Ghar Academy',
    sameAs: 'https://360ghar.com/academy',
  },
  url: url || 'https://360ghar.com/academy',
  image: image || 'https://360ghar.com/academy/course-thumbnail.jpg',
  educationalLevel,
  courseMode: ['Online', 'Self-Paced'],
  coursePrerequisites: prerequisites,
  estimatedDuration: duration,
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'Online',
    courseWorkload: duration,
    instructor: {
      '@type': 'Person',
      name: '360Ghar Experts',
    },
  },
  offers: {
    '@type': 'Offer',
    price: String(price),
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: url || 'https://360ghar.com/academy',
  },
  teaches: teaches.length > 0 ? teaches : [
    'Market Analysis',
    'Property Valuation',
    'Legal Documentation',
    'Investment Strategies',
  ],
});

/**
 * Generate QAPage schema for community questions.
 */
export const generateQAPageStructuredData = ({
  question,
  answer,
  questionUrl,
  answerUrl,
  upvoteCount = 0,
  answerCount = 1,
  authorName = '360Ghar Team',
  authorUrl = 'https://360ghar.com/about',
  dateCreated,
  datePublished,
}) => ({
  '@type': 'QAPage',
  name: question,
  description: `Community Q&A: ${question}`,
  url: questionUrl || 'https://360ghar.com/community/qa',
  mainEntity: {
    '@type': 'Question',
    name: question,
    text: question,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: authorUrl,
    },
    datePublished: datePublished || new Date().toISOString(),
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer,
      dateCreated: dateCreated || new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: authorName,
        url: authorUrl,
      },
      upvoteCount,
      url: answerUrl || questionUrl,
    },
    answerCount,
    upvoteCount,
  },
});

/**
 * Generate Speakable schema for voice search optimization.
 * Helps Google Assistant and Alexa read key content aloud.
 */
export const generateSpeakableStructuredData = ({
  cssSelectors = ['.speakable-summary', '.speakable-highlights'],
  xpaths = [],
}) => {
  const speakable = {
    '@type': 'SpeakableSpecification',
    cssSelector: cssSelectors,
  };

  if (xpaths.length > 0) {
    speakable.xpath = xpaths;
  }

  return speakable;
};

/**
 * Generate FAQ schema for property-specific questions.
 */
export const generatePropertyFaqStructuredData = ({ propertyType = 'Apartment', location = 'Gurugram' }) => ({
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: `What is the average price of ${propertyType.toLowerCase()}s in ${location}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Prices for ${propertyType.toLowerCase()}s in ${location} vary based on size, amenities, and exact location. Contact 360Ghar for current market rates and verified listings with 360° virtual tours.`,
      },
    },
    {
      '@type': 'Question',
      name: `Are ${propertyType.toLowerCase()}s in ${location} good for investment?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${location} is a prime real estate market with strong rental demand and appreciation potential. ${propertyType}s here offer good ROI due to proximity to commercial hubs and infrastructure development.`,
      },
    },
    {
      '@type': 'Question',
      name: `What amenities are available in ${propertyType}s in ${location}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Most ${propertyType.toLowerCase()}s in ${location} offer amenities like 24/7 security, power backup, parking, gym, swimming pool, and clubhouse. Specific amenities vary by property - check our listings for details.`,
      },
    },
    {
      '@type': 'Question',
      name: `How can I schedule a visit for ${propertyType.toLowerCase()}s in ${location}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Browse verified ${propertyType.toLowerCase()}s in ${location} on 360Ghar, take 360° virtual tours, and our Relationship Manager will schedule physical visits at your convenience.`,
      },
    },
  ],
});

/**
 * Generate FAQ schema for locality-specific questions.
 */
export const generateLocalityFaqStructuredData = ({ localityName = 'DLF Phase 1', city = 'Gurgaon' }) => ({
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: `What is the average property price in ${localityName}, ${city}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Property prices in ${localityName}, ${city} range from ₹15,000-30,000 per sq ft depending on the sector, property type, and amenities. Contact 360Ghar for current rates and verified listings.`,
      },
    },
    {
      '@type': 'Question',
      name: `Is ${localityName} in ${city} a good area to live?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${localityName} is one of ${city}'s most sought-after localities with excellent connectivity, social infrastructure, schools, hospitals, and shopping centers. It offers a balanced lifestyle with good investment potential.`,
      },
    },
    {
      '@type': 'Question',
      name: `What are the top schools near ${localityName}, ${city}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${localityName} has several reputed schools including Delhi Public School, The Heritage School, and Pathways World School. Check our locality page for detailed information on nearby educational institutions.`,
      },
    },
    {
      '@type': 'Question',
      name: `How is the connectivity from ${localityName} to major areas?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${localityName} offers excellent connectivity to Cyber City, Udyog Vihar, and Delhi via NH-8 and the Rapid Metro. The area is well-connected to major employment hubs and the airport.`,
      },
    },
    {
      '@type': 'Question',
      name: `What types of properties are available in ${localityName}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${localityName} offers a mix of apartments, builder floors, independent houses, and luxury villas. Browse verified properties with 360° virtual tours on 360Ghar.`,
      },
    },
  ],
});

/**
 * Generate ItemList schema for property listings pages.
 */
export const generateItemListStructuredData = ({
  name,
  description,
  url,
  numberOfItems,
  items = [],
}) => ({
  '@type': 'ItemList',
  name,
  description,
  url: url || 'https://360ghar.com/properties',
  numberOfItems,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: item.url,
    item: {
      '@type': 'Product',
      name: item.name,
      description: item.description,
      image: item.image,
    },
  })),
});

/**
 * Generate VideoGallery schema for virtual tour collections.
 */
export const generateVideoGalleryStructuredData = ({
  name,
  description,
  url,
  videos = [],
}) => ({
  '@type': 'VideoGallery',
  name,
  description,
  url: url || 'https://360ghar.com/virtual-tours',
  hasPart: videos.map((video) => ({
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl,
  })),
});

/**
 * Generate AggregateOffer schema for price range displays.
 */
export const generateAggregateOfferStructuredData = ({
  name,
  description,
  lowPrice,
  highPrice,
  priceCurrency = 'INR',
  offerCount,
  url,
}) => ({
  '@type': 'AggregateOffer',
  name,
  description,
  lowPrice,
  highPrice,
  priceCurrency,
  offerCount,
  url: url || 'https://360ghar.com/properties',
});

/**
 * Generate JobPosting schema for career pages.
 * Library helper reused by validateStructuredData.js (not mounted directly by pages).
 */
export const generateJobPostingStructuredData = ({
  title,
  description,
  datePosted,
  validThrough,
  employmentType = 'FULL_TIME',
  jobLocationType = 'ONSITE',
  location = {
    addressLocality: 'Gurgaon',
    addressRegion: 'Haryana',
    addressCountry: 'IN',
  },
  baseSalary = {
    value: {
      min: 500000,
      max: 1500000,
    },
    unitText: 'YEAR',
  },
  qualifications = [],
  responsibilities = [],
  benefits = [],
  url,
}) => ({
  '@type': 'JobPosting',
  title,
  description,
  datePosted,
  validThrough: validThrough || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  employmentType,
  jobLocationType,
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.addressLocality,
      addressRegion: location.addressRegion,
      addressCountry: location.addressCountry,
    },
  },
  baseSalary: {
    '@type': 'MonetaryAmount',
    currency: 'INR',
    value: {
      '@type': 'QuantitativeValue',
      minValue: baseSalary.value.min,
      maxValue: baseSalary.value.max,
      unitText: baseSalary.unitText,
    },
  },
  qualifications,
  responsibilities,
  benefits,
  hiringOrganization: {
    '@type': 'Organization',
    name: '360Ghar',
    url: 'https://360ghar.com',
  },
  url: url || 'https://360ghar.com/careers',
});

/**
 * Generate Review schema for customer testimonials.
 */
export const generateReviewStructuredData = ({
  reviewBody,
  ratingValue,
  authorName,
  authorType = 'Person',
  datePublished,
  itemReviewed = '360Ghar Services',
  itemReviewedType = 'Service',
}) => ({
  '@type': 'Review',
  reviewBody,
  reviewRating: {
    '@type': 'Rating',
    ratingValue,
    bestRating: '5',
    worstRating: '1',
  },
  author: {
    '@type': authorType,
    name: authorName,
  },
  datePublished: datePublished || new Date().toISOString().split('T')[0],
  itemReviewed: {
    '@type': itemReviewedType,
    name: itemReviewed,
  },
});

/**
 * Generate Article schema for blog posts and news.
 */
export const generateArticleStructuredData = ({
  headline,
  description,
  image,
  author,
  publishedAt,
  modifiedAt,
  url,
  articleSection,
  keywords = [],
}) => ({
  '@type': 'Article',
  headline,
  description,
  image: image || 'https://360ghar.com/og-image-home.jpg',
  author: {
    '@type': 'Organization',
    name: author || '360Ghar Team',
  },
  publisher: {
    '@type': 'Organization',
    name: '360Ghar',
    logo: {
      '@type': 'ImageObject',
      url: 'https://360ghar.com/logo.png',
    },
  },
  datePublished: publishedAt || new Date().toISOString(),
  dateModified: modifiedAt || publishedAt || new Date().toISOString(),
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': url || 'https://360ghar.com/blog',
  },
  articleSection,
  keywords: keywords.join(', '),
});

/**
 * Career page FAQ structured data for Google rich results.
 */
export const careerFaqStructuredData = {
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I apply for an internship at 360Ghar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To apply for an internship at 360Ghar, email your resume and a brief note about yourself to info@360ghar.com with the subject line mentioning the role you are interested in. Our team will review your application and get back to you.',
      },
    },
    {
      '@type': 'Question',
      name: 'What internships are available at 360Ghar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '360Ghar currently offers internships for Content Creator Intern, Real Estate Agent, and Software Developer Intern roles. All positions are based in Gurugram, Haryana and run for 2-6 months with the possibility of extension based on performance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are 360Ghar internships paid?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '360Ghar internships offer hands-on mentorship, real product ownership, and direct guidance from the founding team. High-performing interns may receive extended opportunities or full-time offers. Contact info@360ghar.com for specific compensation details.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the duration of internships at 360Ghar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Internships at 360Ghar typically last 2-6 months. Some roles may be extended based on performance and mutual fit. The real estate agent and software developer roles specifically mention extendable durations.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where are 360Ghar internships located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All 360Ghar internship positions are based in Gurugram (Gurgaon), Haryana, India. Interns work on-site from our Gurugram office for maximum collaboration and mentorship.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can interns get full-time offers at 360Ghar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, high-performing interns at 360Ghar may receive extended opportunities or full-time offers. We value ownership and growth — interns who demonstrate impact and alignment with our mission are strongly considered for full-time roles.',
      },
    },
  ],
};
