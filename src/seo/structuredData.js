import { siteMetadata } from './siteMetadata';

// Real Estate focused structured data for LLM optimization
export const realEstateStructuredData = {
  // Organization schema for real estate company
  organization: {
    '@type': 'RealEstateAgent',
    name: siteMetadata.organization.name,
    url: siteMetadata.siteUrl,
    logo: siteMetadata.defaultOgImage,
    description: "India's first AI-Enabled and Virtual Tour first Real Estate Platform. All properties are verified by our on-site team. Our dedicated Relationship Manager handles your end-to-end flow so that you can relax and enjoy. We provide end-to-end visibility, convenience, and transparency for the same brokerage amount.",
    email: siteMetadata.organization.email,
    telephone: siteMetadata.organization.telephone,
    address: {
      '@type': 'PostalAddress',
      ...siteMetadata.organization.address
    },
    areaServed: [
      {
        '@type': 'Place',
        name: 'Gurugram',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Gurugram',
          addressRegion: 'HR',
          addressCountry: 'IN'
        }
      },
      {
        '@type': 'Place',
        name: 'Gurgaon',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Gurgaon',
          addressRegion: 'HR',
          addressCountry: 'IN'
        }
      }
    ],
    serviceType: [
      'Property Buying',
      'Property Selling',
      'Property Rental',
      'PG Accommodation',
      'AI Property Search',
      '360° Virtual Tours',
      '3D Property Walkthroughs',
      'Property Verification',
      'Relationship Manager Service',
      'End-to-End Property Service',
      'Property Management'
    ],
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'RealEstateService',
          name: 'Property Listing Service',
          description: 'List your property on 360Ghar with 360° virtual tours'
        }
      }
    ]
  },

  // Website schema for search engines
  website: {
    '@type': 'WebSite',
    name: siteMetadata.siteName,
    url: siteMetadata.siteUrl,
    description: siteMetadata.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteMetadata.siteUrl}/properties?q={search_term_string}`
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

  // Real Estate Agency schema for enhanced visibility
  realEstateAgency: {
    '@type': 'RealEstateAgent',
    name: siteMetadata.siteName,
    description: "India's first AI-Enabled and Virtual Tour first Real Estate Platform. We verify all properties through our on-site team and provide dedicated Relationship Managers for end-to-end service. Customers feel they are paying lakhs in brokerage and still not getting the value, we at the same amount provide end-to-end visibility, convenience, and transparency.",
    url: siteMetadata.siteUrl,
    logo: siteMetadata.defaultOgImage,
    image: siteMetadata.defaultOgImage,
    telephone: siteMetadata.organization.telephone,
    email: siteMetadata.organization.email,
    address: siteMetadata.organization.address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.4595,
      longitude: 77.0266
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Gurugram',
        addressCountry: 'IN'
      },
      {
        '@type': 'City',
        name: 'Delhi',
        addressCountry: 'IN'
      },
      {
        '@type': 'City',
        name: 'Noida',
        addressCountry: 'IN'
      }
    ],
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: 'Verified Real Estate Platform',
      recognizedBy: {
        '@type': 'Organization',
        name: '360Ghar Verification System'
      }
    },
    serviceType: [
      'AI-Powered Property Search',
      'Residential Property Sales',
      'Residential Property Rentals',
      'PG Accommodation',
      'Property Marketing',
      '360° Virtual Property Tours',
      '3D Property Walkthroughs',
      'On-Site Property Verification',
      'Relationship Manager Services',
      'End-to-End Property Transactions',
      'Real Estate Consulting'
    ],
    priceRange: '₹',
    paymentAccepted: ['Cash', 'Bank Transfer', 'Cheque'],
    currenciesAccepted: 'INR'
  },

  // Search action for AI assistants to understand site functionality
  searchAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteMetadata.siteUrl}/properties?q={search_term_string}`,
      inLanguage: 'en-IN'
    },
    'query-input': 'required name=search_term_string',
    description: 'Search for properties in Gurugram by location, price, or type'
  },

  // Enhanced local business schema for better local SEO
  localBusiness: {
    '@type': 'RealEstateAgent',
    name: siteMetadata.siteName,
    description: "India's first AI-Enabled & Virtual Tour first Real Estate Platform in Gurugram. Offering verified properties by on-site team with 360° virtual tours. Dedicated Relationship Manager for end-to-end flow.",
    url: siteMetadata.siteUrl,
    telephone: siteMetadata.organization.telephone,
    email: siteMetadata.organization.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteMetadata.organization.address.streetAddress || 'Gurugram',
      addressLocality: 'Gurugram',
      addressRegion: 'HR',
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
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59'
      }
    ],
    sameAs: [
      'https://www.facebook.com/360ghar',
      'https://www.instagram.com/360ghar',
      'https://www.linkedin.com/company/360ghar',
      'https://twitter.com/360ghar'
    ],
    areaServed: [
      {
        '@type': 'City',
        name: 'Gurugram',
        sameAs: 'https://en.wikipedia.org/wiki/Gurugram'
      },
      {
        '@type': 'City',
        name: 'Delhi',
        sameAs: 'https://en.wikipedia.org/wiki/Delhi'
      },
      {
        '@type': 'City',
        name: 'Noida',
        sameAs: 'https://en.wikipedia.org/wiki/Noida'
      },
      {
        '@type': 'City',
        name: 'Faridabad',
        sameAs: 'https://en.wikipedia.org/wiki/Faridabad'
      }
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Real Estate Services in Gurugram',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Property Sales in Gurugram',
            description: 'Buy verified properties with 360° virtual tours in prime Gurugram locations'
          },
          areaServed: {
            '@type': 'City',
            name: 'Gurugram'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Property Rentals in Gurugram',
            description: 'Rent apartments, houses, and PGs in Gurugram with verified listings'
          },
          areaServed: {
            '@type': 'City',
            name: 'Gurugram'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'PG Accommodation in Gurugram',
            description: 'Find verified paying guest accommodations in Gurugram for professionals and students'
          },
          areaServed: {
            '@type': 'City',
            name: 'Gurugram'
          }
        }
      ]
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      reviewCount: 1250,
      bestRating: 5,
      worstRating: 1
    },
    priceRange: '₹',
    paymentAccepted: ['Cash', 'Bank Transfer', 'Cheque', 'UPI'],
    currenciesAccepted: 'INR'
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
    foundingDate: '2024',
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
      availableLanguage: 'English'
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
      'Indian Property Market'
    ]
  },

  // Mobile Application schema for Property Management features
  mobileApplication: {
    '@type': 'MobileApplication',
    name: '360Ghar - Property Management & Search',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Android',
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
  }
};

// Location-based structured data for major Gurugram areas
export const gurugramAreasData = [
  {
    '@type': 'Place',
    name: 'DLF Phase 1, Gurugram',
    description: 'Premium residential and commercial properties in DLF Phase 1',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurugram',
      addressRegion: 'HR',
      addressCountry: 'IN'
    },
    keywords: 'DLF Phase 1 properties, DLF Phase 1 apartments, DLF Phase 1 flats'
  },
  {
    '@type': 'Place',
    name: 'Golf Course Road, Gurugram',
    description: 'Luxury properties and premium apartments on Golf Course Road',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurugram',
      addressRegion: 'HR',
      addressCountry: 'IN'
    },
    keywords: 'Golf Course Road properties, Golf Course Road luxury apartments'
  },
  {
    '@type': 'Place',
    name: 'Sohna Road, Gurugram',
    description: 'Affordable and mid-range apartments on Sohna Road',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurugram',
      addressRegion: 'HR',
      addressCountry: 'IN'
    },
    keywords: 'Sohna Road properties, Sohna Road apartments, Sohna Road flats'
  },
  {
    '@type': 'Place',
    name: 'Cyber City, Gurugram',
    description: 'Commercial and residential properties near Cyber City',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurugram',
      addressRegion: 'HR',
      addressCountry: 'IN'
    },
    keywords: 'Cyber City properties, Cyber City apartments, Cyber City office space'
  },
  {
    '@type': 'Place',
    name: 'Sector 29, Gurugram',
    description: 'Properties in Sector 29, near major commercial hubs',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurugram',
      addressRegion: 'HR',
      addressCountry: 'IN'
    },
    keywords: 'Sector 29 properties, Sector 29 apartments, Sector 29 flats'
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
  aggregateRating: property.rating ? {
    '@type': 'AggregateRating',
    ratingValue: property.rating,
    reviewCount: property.reviewCount || 10
  } : undefined,
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
export const generateBlogStructuredData = (blog) => ({
  '@type': 'BlogPosting',
  headline: blog.title || 'Real Estate Blog',
  description: blog.description || 'Latest real estate insights and tips',
  image: blog.image || siteMetadata.defaultOgImage,
  author: {
    '@type': 'Organization',
    name: siteMetadata.siteName
  },
  publisher: {
    '@type': 'Organization',
    name: siteMetadata.siteName,
    logo: {
      '@type': 'ImageObject',
      url: siteMetadata.defaultOgImage
    }
  },
  datePublished: blog.publishedAt || new Date().toISOString(),
  dateModified: blog.updatedAt || new Date().toISOString(),
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
