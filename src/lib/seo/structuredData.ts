import { authors } from './authors.ts';
import { siteMetadata } from './siteMetadata.ts';

// Real logo asset (exists at public/assets/images/logo/logo.png). The old
// https://360ghar.com/logo.png URL 404s in GSC image crawls.
const ORGANIZATION_LOGO_URL = 'https://360ghar.com/assets/images/logo/logo.png';

type Address = { streetAddress: string; addressLocality: string; addressRegion: string; postalCode: string; addressCountry: string };

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
    description: '360Ghar is a real estate platform for property search in Gurugram, India.',
    url: 'https://360ghar.com',
    logo: {
      '@type': 'ImageObject',
      url: ORGANIZATION_LOGO_URL,
      // The file is 2048x2048; declare its real size.
      width: 2048,
      height: 2048,
    },
    image: 'https://360ghar.com/og-image-home.jpg',
    telephone: siteMetadata.organization.telephone,
    email: siteMetadata.organization.email,
    foundingDate: '2025',
    foundingLocation: 'Gurgaon, Haryana, India',
    slogan: 'Property search in Gurugram.',
    keywords: 'real estate Gurgaon, property listings, property search',
    areaServed: [
      { '@type': 'City', name: 'Gurgaon', alternateName: 'Gurugram' },
      { '@type': 'State', name: 'Haryana' },
      { '@type': 'Country', name: 'India' },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteMetadata.organization.address.streetAddress,
      addressLocality: 'Gurgaon',
      addressRegion: 'Haryana',
      postalCode: '122001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.4595,
      longitude: 77.0266,
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
      closes: '21:00',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '360Ghar Real Estate Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Property listings for sale in Gurugram', description: 'Browse property listings for sale in Gurugram.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Property listings for rent in Gurugram', description: 'Browse property listings for rent in Gurugram.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '360° Virtual Property Tours', description: 'Some property listings include a 360° virtual tour.' } },
      ],
    },
  },

  // Website schema for search engines
  website: {
    '@type': 'WebSite',
    name: '360Ghar',
    alternateName: '360 Ghar',
    url: 'https://360ghar.com',
    description: 'Property listings and search in Gurugram, India.',
    inLanguage: ['en-IN', 'hi-IN'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://360ghar.com/properties?q={search_term_string}&city=gurgaon',
      },
      'query-input': 'required name=search_term_string',
    },
  },

  // Enhanced real estate listing schemas for better AI understanding
  realEstateListing: {
    '@type': 'ItemList',
    name: 'Properties for Sale and Rent in Gurugram',
    description: 'Property listings for sale and rent in Gurugram.',
    url: `${siteMetadata.siteUrl}/properties`,
  },

  // Enhanced local business schema for better local SEO
  localBusiness: {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'RealEstateAgent'],
    '@id': 'https://360ghar.com/#localbusiness',
    name: '360Ghar',
    image: [ORGANIZATION_LOGO_URL, siteMetadata.defaultOgImage],
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
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.4595,
      longitude: 77.0266,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '20:00',
      },
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
    areaServed: 'Gurgaon, Haryana, India',
  },

  // Knowledge Panel data for AI/LLM responses
  knowledgePanel: {
    '@type': 'Organization',
    '@id': siteMetadata.siteUrl,
    name: siteMetadata.siteName,
    alternateName: ['360Ghar', '360 Ghar', '360Ghar Real Estate'],
    description: 'Property search in Gurugram, India.',
    url: siteMetadata.siteUrl,
    logo: siteMetadata.defaultOgImage,
    image: siteMetadata.defaultOgImage,
    foundingDate: '2025',
    inLanguage: ['en-IN', 'hi-IN'],
    sameAs: [
      'https://www.facebook.com/360ghar',
      'https://www.instagram.com/360ghar',
      'https://www.linkedin.com/company/360ghar',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteMetadata.organization.telephone,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
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
            description: 'Browse property listings for sale in Gurugram.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Property Rental Services',
            description: 'Browse property listings for rent and PG accommodations in Gurugram.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Property Listing Service',
            description: 'Property listing services in Gurugram.',
          },
        },
      ],
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
      'Property listings India',
    ],
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
      priceCurrency: 'INR',
    },
    description: 'Property search and management tools for Android.',
    featureList: [
      'Financial Dashboard',
      'Tenant Management',
      'Maintenance Tracking',
      'Document Vault',
      'AI Property Search',
      '360° Virtual Tours on supported listings',
      'Visit Scheduling',
    ],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.the360ghar.ghar360',
    publisher: {
      '@type': 'Organization',
      name: '360Ghar',
    },
  },

  // Person schema for founders/key team members (E-E-A-T boost)
  person: {
    '@type': 'Person',
    name: authors['saksham-mittal'].name,
    jobTitle: authors['saksham-mittal'].title,
    worksFor: {
      '@type': 'Organization',
      name: '360Ghar',
      url: 'https://360ghar.com',
    },
    description: 'Saksham Mittal is the founder and CEO of 360Ghar. He leads product strategy and technology.',
    url: authors['saksham-mittal'].linkedin,
    image: `https://360ghar.com${authors['saksham-mittal'].image}`,
    sameAs: [
      authors['saksham-mittal'].linkedin,
      'https://twitter.com/360ghar',
    ],
    knowsAbout: authors['saksham-mittal'].credentials.split(', ').map((s) => s.trim()),
  },

  // Speakable schema for voice search optimization (Google Assistant, Alexa)
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['.speakable-summary', '.speakable-highlights'],
    xpath: '//div[@class="speakable-summary"] | //div[@class="speakable-highlights"]',
  },
};

// Blog post structured data generator
export const generateBlogStructuredData = ({
  authorSchema,
  schemaMarkup,
  inLanguage,
  ...blog
}: {
  title?: string;
  description?: string;
  image?: string;
  slug?: string;
  url?: string;
  publishedAt?: string;
  updatedAt?: string;
  authorSchema?: Record<string, unknown>;
  schemaMarkup?: Record<string, unknown>;
  inLanguage?: string[];
}) => ({
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
      url: ORGANIZATION_LOGO_URL,
    },
  },
  datePublished: blog.publishedAt || schemaMarkup?.datePublished || new Date().toISOString(),
  dateModified: blog.updatedAt || schemaMarkup?.dateModified || new Date().toISOString(),
  inLanguage: inLanguage || ['en-IN', 'hi-IN'],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': blog.url || (blog.slug ? `${siteMetadata.siteUrl}/blog/${blog.slug}` : `${siteMetadata.siteUrl}/blog`),
  },
});

// Breadcrumb structured data generator
export const generateBreadcrumbStructuredData = (breadcrumbs: { name: string; url: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Video object structured data for virtual tours
export const generateVideoStructuredData = (video: {
  title?: string;
  description?: string;
  thumbnail?: string;
  /** Required by Google's VideoObject: callers pass the real upload date. */
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}) => ({
  '@type': 'VideoObject',
  name: video.title || '360° Virtual Tour',
  description: video.description || 'Experience this property through our immersive 360° virtual tour',
  thumbnailUrl: video.thumbnail || siteMetadata.defaultOgImage,
  uploadDate: video.uploadDate,
  // Only emit a duration when a real value is provided: the old 'PT1M' fallback fabricated data.
  ...(video.duration ? { duration: video.duration } : {}),
  contentUrl: video.contentUrl,
  embedUrl: video.embedUrl,
  publisher: {
    '@type': 'Organization',
    name: siteMetadata.siteName,
    logo: {
      '@type': 'ImageObject',
      url: ORGANIZATION_LOGO_URL,
    },
  },
});

/**
 * Generate Place schema for locality pages.
 * Enables Google Knowledge Panel eligibility for localities.
 */
export const generateLocalityStructuredData = ({
  name,
  city,
  state = 'Haryana',
  slug,
  lat,
  lng,
  entityType,
  inLanguage,
}: {
  name: string;
  city: string;
  state?: string;
  slug: string;
  lat?: number;
  lng?: number;
  entityType?: string;
  inLanguage?: string[];
}) => ({
  '@type': 'Place',
  name,
  address: {
    '@type': 'PostalAddress',
    addressLocality: name,
    addressRegion: state,
    addressCountry: 'IN',
  },
  ...(lat != null && lng != null
    ? {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: lat,
          longitude: lng,
        },
      }
    : {}),
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

/** HowTo schema: named steps, each with optional link and image. */
export const generateHowToStructuredData = ({
  name,
  description,
  steps,
  image,
}: {
  name: string;
  description: string;
  steps: { name: string; text: string; url?: string; image?: string }[];
  image?: string;
}) => ({
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
  ...(image ? { image: { '@type': 'ImageObject', url: image } } : {}),
});

export const generateFaqStructuredData = (faqItems: { question: string; answer: string; author?: object; datePublished?: string }[]) => ({
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

/**
 * Generate JobPosting schema for a career page. Includes the full PostalAddress
 * (streetAddress/postalCode), which Search Console flags as missing when absent.
 */
export const generateJobPostingStructuredData = ({
  title,
  description,
  datePosted,
  validThrough,
  employmentType = 'FULL_TIME',
  jobLocationType = 'ONSITE',
  location = {
    streetAddress: 'Sector 50, Gurugram',
    addressLocality: 'Gurgaon',
    addressRegion: 'Haryana',
    postalCode: '122001',
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
}: {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string;
  jobLocationType?: string;
  location?: Address;
  baseSalary?: { value: { min: number; max: number }; unitText: string };
  qualifications?: string[];
  responsibilities?: string[];
  benefits?: string[];
  url?: string;
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
      streetAddress: location.streetAddress,
      addressLocality: location.addressLocality,
      addressRegion: location.addressRegion,
      postalCode: location.postalCode,
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
}: {
  headline: string;
  description: string;
  image?: string;
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  url?: string;
  articleSection?: string;
  keywords?: string[];
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
      url: ORGANIZATION_LOGO_URL,
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
        text: '360Ghar currently offers internships for Content Creator Intern, Real Estate Agent, Founder\'s Office Intern, and AI Generalist Intern roles. All positions are based in Gurugram, Haryana and run for 2-6 months with the possibility of extension based on performance.',
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
        text: 'Internships at 360Ghar typically last 2-6 months. Some roles may be extended based on performance and mutual fit. The real estate agent role specifically mentions an extendable duration.',
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
