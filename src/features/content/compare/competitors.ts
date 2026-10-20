/**
 * Competitor data from the old src/data/competitors.js (last changed 2026-03-29), ported as is
 * except: unsourced anonymous "testimonials" are left out, the SquareYards claim that used
 * `answer` instead of `reality` is fixed, and each entry carries its route slug.
 */
export type Competitor = {
  key: string;
  slug: string;
  name: string;
  fullName: string;
  founded: string;
  valuation: string;
  users: string;
  cities: string;
  tagline: string;
  website: string;
  strengths: string[];
  claims: { claim: string; reality: string }[];
  faqs: { q: string; a: string }[];
  features: { feature: string; them: boolean; note: string }[];
  keywords: string;
  truth?: string;
};

export const COMPETITORS: Competitor[] = [
  {
    "key": "nobroker",
    "slug": "nobroker",
    "name": "NoBroker",
    "fullName": "NoBroker Technologies Solutions Pvt. Ltd.",
    "founded": "2013",
    "valuation": "$1+ Billion (PropTech unicorn)",
    "users": "16M+ users",
    "cities": "Bangalore, Mumbai, Pune, Chennai, Hyderabad, Delhi NCR",
    "tagline": "Zero-brokerage marketplace",
    "website": "https://www.nobroker.in",
    "strengths": [
      "Large user base and market presence",
      "AI-powered property matching",
      "Wide range of services (packers, movers, legal)",
      "Mobile app experience"
    ],
    "claims": [
      {
        "claim": "Zero brokerage",
        "reality": "Now charges subscription fees to owners for tenant contact details"
      },
      {
        "claim": "Money Back Guarantee",
        "reality": "Multiple complaints about refund not processed"
      },
      {
        "claim": "Verified listings",
        "reality": "Users report fake and duplicate listings"
      },
      {
        "claim": "Free property posting",
        "reality": "Free posts have zero visibility; effective posting requires paid plans"
      },
      {
        "claim": "Dedicated Relationship Manager",
        "reality": "Users report RMs are unresponsive and provide no real assistance"
      }
    ],
    "faqs": [
      {
        "q": "Does NoBroker really charge zero brokerage?",
        "a": "NoBroker now charges property owners subscription fees (₹3,000-20,000+) to get tenant contact details. The \"zero brokerage\" marketing is misleading."
      },
      {
        "q": "Is NoBroker refund policy reliable?",
        "a": "Multiple user reviews on Trustpilot and Consumer Court websites indicate refund requests are often denied or delayed significantly."
      },
      {
        "q": "Are NoBroker listings verified?",
        "a": "NoBroker relies on self-verification by owners. Users report encountering fake listings, unavailable properties, and misleading photos."
      },
      {
        "q": "How much does NoBroker actually cost?",
        "a": "NoBroker offers various subscription plans starting from ₹2,000-20,000+ for property owners. Tenants may also face charges for premium features."
      },
      {
        "q": "Is NoBroker customer support responsive?",
        "a": "User reviews consistently report unresponsive relationship managers, lack of escalation paths, and poor issue resolution times."
      },
      {
        "q": "Does NoBroker work in tier-2 cities?",
        "a": "NoBroker has limited presence in tier-2 and tier-3 cities. Their service quality and property inventory is concentrated in major metros."
      }
    ],
    "features": [
      {
        "feature": "360° Virtual Tours",
        "them": false,
        "note": "Not available"
      },
      {
        "feature": "On-site Verification",
        "them": false,
        "note": "Self-verification only"
      },
      {
        "feature": "Spam-free Experience",
        "them": false,
        "note": "50+ spam calls reported"
      },
      {
        "feature": "Dedicated RM",
        "them": false,
        "note": "Unresponsive RM"
      },
      {
        "feature": "Transparent Pricing",
        "them": false,
        "note": "Hidden charges"
      },
      {
        "feature": "AI Property Match",
        "them": true,
        "note": "Basic matching"
      },
      {
        "feature": "Verified Properties",
        "them": false,
        "note": "Not verified"
      },
      {
        "feature": "Zero Hidden Fees",
        "them": false,
        "note": "Multiple fees"
      }
    ],
    "keywords": "nobroker alternative, nobroker vs 360ghar, nobroker gurgaon, nobroker review, nobroker fake listings, nobroker refund issues",
    "truth": "nobroker-listings"
  },
  {
    "key": "magicbricks",
    "slug": "magicbricks",
    "name": "MagicBricks",
    "fullName": "MagicBricks (Times Group)",
    "founded": "2006",
    "valuation": "Part of Times Group",
    "users": "10M+ users",
    "cities": "600+ cities across India",
    "tagline": "Property Search & Lead Generation",
    "website": "https://www.magicbricks.com",
    "strengths": [
      "Part of Times Group - strong brand recognition",
      "Wide reach across 600+ cities",
      "Multiple language support",
      "Property valuation tools and EMI calculators"
    ],
    "claims": [
      {
        "claim": "Verified properties",
        "reality": "Users report spam calls the moment you show interest"
      },
      {
        "claim": "Direct owner listings",
        "reality": "Majority are broker listings"
      },
      {
        "claim": "Best property search experience",
        "reality": "Cluttered interface, excessive ads"
      },
      {
        "claim": "Quality leads for owners",
        "reality": "Leads are mostly brokers, not genuine buyers/tenants"
      },
      {
        "claim": "Privacy protected",
        "reality": "Phone numbers sold to broker databases within hours"
      }
    ],
    "faqs": [
      {
        "q": "Why do I get so many spam calls from MagicBricks?",
        "a": "MagicBricks monetizes user data by selling contact information to brokers and agents. This is their primary revenue model."
      },
      {
        "q": "Are MagicBricks listings actually verified?",
        "a": "The \"verified\" badge is largely symbolic. Multiple users report fake, unavailable, or misleading listings despite the verification claim."
      },
      {
        "q": "Is MagicBricks good for renters?",
        "a": "Renters face the worst experience - spam calls, broker intermediation, and hidden charges. The platform is more broker-friendly than user-friendly."
      },
      {
        "q": "How does MagicBricks make money?",
        "a": "MagicBricks generates revenue through listing fees from builders/brokers, premium placements, and by selling user contact data to agents."
      },
      {
        "q": "Is MagicBricks free for property owners?",
        "a": "Basic listings may be free, but visibility is extremely limited. Effective marketing requires expensive premium packages with unclear ROI."
      },
      {
        "q": "Does MagicBricks have good customer support?",
        "a": "User reviews indicate poor customer support with slow response times and no effective resolution mechanism for disputes."
      }
    ],
    "features": [
      {
        "feature": "360° Virtual Tours",
        "them": false,
        "note": "Limited availability"
      },
      {
        "feature": "On-site Verification",
        "them": false,
        "note": "No verification"
      },
      {
        "feature": "Spam-free Experience",
        "them": false,
        "note": "50+ calls/day"
      },
      {
        "feature": "Dedicated RM",
        "them": false,
        "note": "No RM service"
      },
      {
        "feature": "Transparent Pricing",
        "them": false,
        "note": "Hidden broker fees"
      },
      {
        "feature": "Direct Owner Listings",
        "them": false,
        "note": "Mostly brokers"
      },
      {
        "feature": "Data Privacy",
        "them": false,
        "note": "Sells user data"
      },
      {
        "feature": "Modern App Experience",
        "them": false,
        "note": "Outdated UI"
      }
    ],
    "keywords": "magicbricks alternative, magicbricks vs 360ghar, magicbricks spam calls, magicbricks fake listings, magicbricks review",
    "truth": "magicbricks-spam"
  },
  {
    "key": "99acres",
    "slug": "99acres",
    "name": "99acres",
    "fullName": "99acres (Info Edge India Ltd.)",
    "founded": "2005",
    "valuation": "Part of Info Edge (Naukri, Jeevansathi)",
    "users": "5M+ users",
    "cities": "600+ cities",
    "tagline": "Property Search Portal",
    "website": "https://www.99acres.com",
    "strengths": [
      "Part of Info Edge (Naukri.com parent)",
      "Pan-India presence",
      "Strong in tier-2/3 cities",
      "Mobile app"
    ],
    "claims": [
      {
        "claim": "Verified property database",
        "reality": "Users report fake and unavailable listings"
      },
      {
        "claim": "Best prices",
        "reality": "Premium packages are expensive with unclear ROI"
      },
      {
        "claim": "Quality leads",
        "reality": "Most leads are from brokers, not genuine buyers"
      }
    ],
    "faqs": [
      {
        "q": "Does 99acres have a spam call problem?",
        "a": "Yes, like MagicBricks, 99acres sells user contact information to brokers, resulting in 50+ spam calls after posting inquiries."
      },
      {
        "q": "Are 99acres listings verified?",
        "a": "No. Despite claiming verification, 99acres has numerous complaints about fake and duplicate listings that are never removed."
      },
      {
        "q": "Is 99acres premium worth the cost?",
        "a": "User reviews suggest premium packages offer poor ROI with no guarantee of quality leads. Many report wasted investment."
      },
      {
        "q": "How responsive is 99acres customer support?",
        "a": "Customer support is reported as unresponsive with no escalation process. Complaints often go unresolved."
      },
      {
        "q": "Can I get a refund from 99acres?",
        "a": "Refund requests are typically denied or ignored. Users report difficulty getting money back for unused services."
      },
      {
        "q": "Is 99acres better than MagicBricks?",
        "a": "Both platforms have similar issues - spam calls, fake listings, and poor support. Neither offers a significantly better experience."
      }
    ],
    "features": [
      {
        "feature": "360° Virtual Tours",
        "them": false,
        "note": "Rarely available"
      },
      {
        "feature": "On-site Verification",
        "them": false,
        "note": "No verification"
      },
      {
        "feature": "Spam-free Experience",
        "them": false,
        "note": "Heavy spam"
      },
      {
        "feature": "Dedicated RM",
        "them": false,
        "note": "No support"
      },
      {
        "feature": "Refund Policy",
        "them": false,
        "note": "No refunds"
      },
      {
        "feature": "Property Verification",
        "them": false,
        "note": "Not verified"
      },
      {
        "feature": "Customer Support",
        "them": false,
        "note": "Poor"
      },
      {
        "feature": "Value for Money",
        "them": false,
        "note": "Expensive"
      }
    ],
    "keywords": "99acres alternative, 99acres vs 360ghar, 99acres fake listings, 99acres spam calls, 99acres review",
    "truth": "99acres-fake"
  },
  {
    "key": "housing",
    "slug": "housing",
    "name": "Housing.com",
    "fullName": "Housing.com (REA India)",
    "founded": "2012",
    "valuation": "Part of REA Group (Australia)",
    "users": "53M+ annual users",
    "cities": "Major metros",
    "tagline": "Tech-forward Property Search",
    "website": "https://www.housing.com",
    "strengths": [
      "Backed by REA Group (Australia)",
      "AR/VR virtual property tours",
      "AI price estimates",
      "Strong in new construction projects"
    ],
    "claims": [
      {
        "claim": "Trusted platform",
        "reality": "Trustpilot 1.3/5 rating from thousands of complaints"
      },
      {
        "claim": "Verified listings",
        "reality": "Focus is on builder projects, not owner verification"
      },
      {
        "claim": "Best tech features",
        "reality": "AR/VR only available for select premium listings"
      }
    ],
    "faqs": [
      {
        "q": "Is Housing.com trustworthy?",
        "a": "With a Trustpilot rating of 1.3/5 and hundreds of complaints, Housing.com has serious trust issues that users should be aware of."
      },
      {
        "q": "Does Housing.com verify properties?",
        "a": "Housing.com focuses on builder projects. Individual property verification is minimal and unreliable."
      },
      {
        "q": "Is Housing.com premium worth it?",
        "a": "User reviews suggest premium features are overpriced and don't deliver meaningful value for the cost."
      },
      {
        "q": "What is Housing.com's main focus?",
        "a": "Housing.com has shifted focus to new construction projects and builder partnerships, not individual property seekers."
      },
      {
        "q": "Does Housing.com have good AR/VR features?",
        "a": "AR/VR features are limited to select premium builder projects and not available for most listings on the platform."
      },
      {
        "q": "How is Housing.com customer support?",
        "a": "Customer support is reported as slow and unresponsive with long wait times and unresolved issues."
      }
    ],
    "features": [
      {
        "feature": "360° Virtual Tours",
        "them": true,
        "note": "Premium only"
      },
      {
        "feature": "On-site Verification",
        "them": false,
        "note": "Builder focus"
      },
      {
        "feature": "Trust Rating",
        "them": false,
        "note": "1.3/5 Trustpilot"
      },
      {
        "feature": "Dedicated RM",
        "them": false,
        "note": "No RM"
      },
      {
        "feature": "Owner Listings",
        "them": false,
        "note": "Builder focus"
      },
      {
        "feature": "Value Pricing",
        "them": false,
        "note": "Overpriced"
      },
      {
        "feature": "Customer Support",
        "them": false,
        "note": "Poor"
      },
      {
        "feature": "Transparent Process",
        "them": false,
        "note": "Not transparent"
      }
    ],
    "keywords": "housing.com alternative, housing vs 360ghar, housing.com review, housing.com complaints"
  },
  {
    "key": "commonfloor",
    "slug": "commonfloor",
    "name": "CommonFloor",
    "fullName": "CommonFloor (Quikr)",
    "founded": "2007",
    "valuation": "Acquired by Quikr (~₹500Cr)",
    "users": "Was 5M+, now declining",
    "cities": "Major cities",
    "tagline": "Property Search + Apartment Management",
    "website": "https://www.commonfloor.com",
    "strengths": [
      "Unique apartment management features",
      "CF Groups community platform",
      "CF Retina VR tours"
    ],
    "claims": [
      {
        "claim": "All-in-one platform",
        "reality": "Post-acquisition, focus shifted away from core product"
      },
      {
        "claim": "Active community",
        "reality": "Community features largely abandoned"
      },
      {
        "claim": "Modern experience",
        "reality": "Interface and features outdated"
      }
    ],
    "faqs": [
      {
        "q": "Is CommonFloor still active?",
        "a": "After Quikr acquisition, CommonFloor has seen declining investment and user base. The platform is largely stagnant."
      },
      {
        "q": "Does CommonFloor offer good property verification?",
        "a": "No. Verification standards have dropped significantly. Many listings are outdated or unavailable."
      },
      {
        "q": "What happened to CommonFloor community features?",
        "a": "The CF Groups community platform has been largely abandoned with no active development or moderation."
      },
      {
        "q": "Is CommonFloor worth using in 2024?",
        "a": "With declining user base and no new features, CommonFloor offers poor value compared to modern platforms."
      },
      {
        "q": "Does CommonFloor have good customer support?",
        "a": "Customer support has deteriorated significantly. Response times are extremely long or nonexistent."
      },
      {
        "q": "What are CommonFloor's VR tour features?",
        "a": "CF Retina VR tours are limited to select listings and the feature has not been updated in years."
      }
    ],
    "features": [
      {
        "feature": "Active Development",
        "them": false,
        "note": "Declining"
      },
      {
        "feature": "Modern Features",
        "them": false,
        "note": "Outdated"
      },
      {
        "feature": "360° Virtual Tours",
        "them": true,
        "note": "Limited"
      },
      {
        "feature": "On-site Verification",
        "them": false,
        "note": "Not available"
      },
      {
        "feature": "Customer Support",
        "them": false,
        "note": "Neglected"
      },
      {
        "feature": "Community Features",
        "them": false,
        "note": "Abandoned"
      }
    ],
    "keywords": "commonfloor alternative, commonfloor vs 360ghar, commonfloor review"
  },
  {
    "key": "proptiger",
    "slug": "proptiger",
    "name": "PropTiger",
    "fullName": "PropTiger (REA India)",
    "founded": "2011",
    "valuation": "$263.8M revenue",
    "users": "Limited to 8 cities",
    "cities": "8 major cities only",
    "tagline": "Full-stack Real Estate Advisory",
    "website": "https://www.proptiger.com",
    "strengths": [
      "End-to-end advisory services",
      "Site visits and negotiation support",
      "Home loan assistance",
      "Backed by News Corp, Accel, REA"
    ],
    "claims": [
      {
        "claim": "Best advisory",
        "reality": "Perceived as sales-driven with high pressure tactics"
      },
      {
        "claim": "Pan-India presence",
        "reality": "Only 8 cities - no tier-2/3 coverage"
      },
      {
        "claim": "Customer-first approach",
        "reality": "Focus on transactions, not customer satisfaction"
      }
    ],
    "faqs": [
      {
        "q": "Does PropTiger operate in my city?",
        "a": "PropTiger is only available in 8 major cities - Mumbai, Delhi NCR, Bangalore, Pune, Chennai, Hyderabad, Kolkata. No tier-2/3 coverage."
      },
      {
        "q": "Is PropTiger expensive?",
        "a": "Yes. PropTiger charges premium fees for advisory services that may not justify the value delivered."
      },
      {
        "q": "Is PropTiger unbiased in recommendations?",
        "a": "PropTiger has partnerships with specific builders which may influence property recommendations toward partner projects."
      },
      {
        "q": "Does PropTiger help with rentals?",
        "a": "PropTiger focuses primarily on new construction purchases. Rental and resale property support is limited."
      },
      {
        "q": "How is PropTiger's advisory service?",
        "a": "The advisory is perceived as sales-driven with high pressure tactics rather than genuine customer assistance."
      },
      {
        "q": "Is PropTiger good for first-time buyers?",
        "a": "While they offer end-to-end support, the cost and potential bias in recommendations should be considered."
      }
    ],
    "features": [
      {
        "feature": "City Coverage",
        "them": false,
        "note": "Gurugram-focused"
      },
      {
        "feature": "Transparent Pricing",
        "them": false,
        "note": "Premium fees"
      },
      {
        "feature": "No Pressure Sales",
        "them": false,
        "note": "Sales-driven"
      },
      {
        "feature": "All Property Types",
        "them": false,
        "note": "New projects only"
      },
      {
        "feature": "Dedicated RM",
        "them": true,
        "note": "Transaction-focused"
      },
      {
        "feature": "Value for Money",
        "them": false,
        "note": "Overpriced"
      }
    ],
    "keywords": "proptiger alternative, proptiger vs 360ghar, proptiger review, proptiger cities"
  },
  {
    "key": "squareyards",
    "slug": "squareyards",
    "name": "Square Yards",
    "fullName": "Square Yards",
    "founded": "2014",
    "valuation": "Rs 1,400+ crore revenue",
    "users": "Pan-India + International",
    "cities": "50+ cities in India + Global",
    "tagline": "Integrated Real Estate Platform",
    "website": "https://www.squareyards.com",
    "strengths": [
      "International presence (UAE, Middle East, Australia, Canada)",
      "Strong mortgage/loan integration",
      "Full lifecycle services",
      "NRI market focus"
    ],
    "claims": [
      {
        "claim": "Unbiased recommendations",
        "reality": "Commission-driven model creates bias toward certain builders"
      },
      {
        "claim": "Seamless experience",
        "reality": "Complex structure often leads to confusion"
      },
      {
        "claim": "Best for NRIs",
        "reality": "While strong in NRI segment, domestic users report mixed experiences"
      }
    ],
    "faqs": [
      {
        "q": "Are Square Yards recommendations unbiased?",
        "a": "Square Yards operates on commission from builders, which may create bias toward properties that pay higher commissions."
      },
      {
        "q": "Is Square Yards good for NRIs?",
        "a": "Square Yards has strong international presence and NRI-focused services, making it one of the better options for overseas buyers."
      },
      {
        "q": "Does Square Yards have transparent pricing?",
        "a": "No. Users report complex pricing structures with multiple fees that are not clearly disclosed upfront."
      },
      {
        "q": "What cities does Square Yards operate in?",
        "a": "Square Yards operates in 50+ Indian cities plus international markets including UAE, Middle East, Australia, and Canada."
      },
      {
        "q": "How is Square Yards customer service?",
        "a": "Service quality varies significantly by city and branch. Consistency is a major issue reported by users."
      },
      {
        "q": "Does Square Yards help with home loans?",
        "a": "Yes, Square Yards has integrated mortgage services, but interest rates and terms may be influenced by partner banks."
      }
    ],
    "features": [
      {
        "feature": "Unbiased Recommendations",
        "them": false,
        "note": "Commission-driven"
      },
      {
        "feature": "Transparent Process",
        "them": false,
        "note": "Complex"
      },
      {
        "feature": "Consistent Quality",
        "them": false,
        "note": "Varies by location"
      },
      {
        "feature": "No Hidden Charges",
        "them": false,
        "note": "Many fees"
      }
    ],
    "keywords": "squareyards alternative, squareyards vs 360ghar, squareyards review"
  },
  {
    "key": "nestaway",
    "slug": "nestaway",
    "name": "NestAway",
    "fullName": "NestAway Technologies",
    "founded": "2015",
    "valuation": "Rs 90 Crore (sold 2024) - was Rs 1,800Cr",
    "users": "Was 100K+ properties",
    "cities": "Was 50+ cities",
    "tagline": "Managed Home Rentals",
    "website": "https://www.nestaway.in",
    "strengths": [
      "Managed furnished rentals",
      "Targeted at students/young professionals"
    ],
    "claims": [
      {
        "claim": "Trusted managed rentals",
        "reality": "Sold for 95% less than peak valuation amid legal turmoil"
      },
      {
        "claim": "Professional management",
        "reality": "Numerous property management complaints"
      },
      {
        "claim": "Sustainable business model",
        "reality": "Failed to achieve profitability, led to valuation collapse"
      }
    ],
    "faqs": [
      {
        "q": "Is NestAway still operational?",
        "a": "NestAway was sold in 2024 for Rs 90 crore (95% less than peak valuation) amid significant financial and legal challenges."
      },
      {
        "q": "Can I trust NestAway with my property?",
        "a": "Given the valuation collapse and legal issues, NestAway's long-term viability and service quality are questionable."
      },
      {
        "q": "What happened to NestAway?",
        "a": "NestAway failed to achieve profitability despite $110M+ funding, leading to a 95% valuation drop and forced sale."
      },
      {
        "q": "Are NestAway deposits safe?",
        "a": "Multiple users report difficulties with deposit refunds. The company's financial troubles raise concerns about deposit security."
      },
      {
        "q": "Is NestAway good for tenants?",
        "a": "Users report property maintenance issues, poor service quality, and deposit refund problems."
      },
      {
        "q": "What legal issues does NestAway face?",
        "a": "Co-founder filed FIR against investors alleging corporate malpractices. The company faces significant governance concerns."
      }
    ],
    "features": [
      {
        "feature": "Financial Stability",
        "them": false,
        "note": "95% value loss"
      },
      {
        "feature": "Trust & Transparency",
        "them": false,
        "note": "Legal issues"
      },
      {
        "feature": "Sustainable Model",
        "them": false,
        "note": "Failed"
      },
      {
        "feature": "Customer Satisfaction",
        "them": false,
        "note": "Poor"
      },
      {
        "feature": "Future Viability",
        "them": false,
        "note": "Questionable"
      }
    ],
    "keywords": "nestaway alternative, nestaway vs 360ghar, nestaway sold, nestaway valuation collapse",
    "truth": "nestaway-collapse"
  },
  {
    "key": "zolo",
    "slug": "zolo",
    "name": "Zolo Stays",
    "fullName": "Zolostays Solutions Pvt. Ltd.",
    "founded": "2015",
    "valuation": "~$150M+",
    "users": "100K+ customers",
    "cities": "10+ cities",
    "tagline": "India's Largest Co-living Brand",
    "website": "https://www.zolostays.com",
    "strengths": [
      "500+ properties across 10+ cities",
      "Fully furnished rooms",
      "Amenities included (WiFi, food, housekeeping)"
    ],
    "claims": [
      {
        "claim": "Premium co-living",
        "reality": "Trustpilot 1.7/5 rating contradicts premium positioning"
      },
      {
        "claim": "All amenities included",
        "reality": "Users report sudden fee increases and hidden charges"
      },
      {
        "claim": "Hassle-free living",
        "reality": "Maintenance issues and deposit refund problems common"
      }
    ],
    "faqs": [
      {
        "q": "Is Zolo Stays worth the cost?",
        "a": "With a Trustpilot rating of 1.7/5 and numerous complaints about hidden charges and poor service, Zolo Stays offers poor value for money."
      },
      {
        "q": "Does Zolo refund security deposits?",
        "a": "Multiple user reviews indicate significant delays and difficulties in getting security deposits refunded, often taking months."
      },
      {
        "q": "How is Zolo Stays maintenance?",
        "a": "Maintenance requests are frequently reported as ignored or delayed, with poor response times for critical issues."
      },
      {
        "q": "Does Zolo have hidden charges?",
        "a": "Yes. Users report sudden fee increases and additional charges that were not disclosed during booking."
      },
      {
        "q": "Is Zolo food quality good?",
        "a": "User reviews indicate inconsistent food quality that often deteriorates over time after initial good experience."
      },
      {
        "q": "What is Zolo's Trustpilot rating?",
        "a": "Zolo Stays has a Trustpilot rating of 1.7 out of 5, indicating widespread user dissatisfaction."
      }
    ],
    "features": [
      {
        "feature": "Trust Rating",
        "them": false,
        "note": "1.7/5 Trustpilot"
      },
      {
        "feature": "No Hidden Charges",
        "them": false,
        "note": "Hidden fees common"
      },
      {
        "feature": "Deposit Refunds",
        "them": false,
        "note": "Delayed/difficult"
      },
      {
        "feature": "Maintenance Response",
        "them": false,
        "note": "Ignored"
      },
      {
        "feature": "Service Quality",
        "them": false,
        "note": "Inconsistent"
      },
      {
        "feature": "Value for Money",
        "them": false,
        "note": "Overpriced"
      }
    ],
    "keywords": "zolo stays alternative, zolo vs 360ghar, zolo review, zolo complaints, zolo deposit refund",
    "truth": "zolo-issues"
  },
  {
    "key": "stanza",
    "slug": "stanza-living",
    "name": "Stanza Living",
    "fullName": "Dtwelve Spaces Private Limited",
    "founded": "2017",
    "valuation": "$231M+ raised",
    "users": "50,000+ beds",
    "cities": "15 cities",
    "tagline": "Premium Managed Accommodation",
    "website": "https://www.stanzaliving.com",
    "strengths": [
      "Largest managed accommodation provider in India",
      "$231M+ in funding",
      "Premium positioning",
      "Community-focused living"
    ],
    "claims": [
      {
        "claim": "Premium experience",
        "reality": "Premium pricing doesn't always match service quality"
      },
      {
        "claim": "Consistent quality",
        "reality": "User reviews indicate variation by location"
      },
      {
        "claim": "Hassle-free",
        "reality": "Maintenance delays reported at some properties"
      }
    ],
    "faqs": [
      {
        "q": "Is Stanza Living worth the premium pricing?",
        "a": "While Stanza Living offers premium amenities, user reviews suggest service quality varies significantly by location and may not justify the premium price."
      },
      {
        "q": "Does Stanza Living have consistent quality?",
        "a": "No. Service quality, maintenance, and amenities vary significantly between different Stanza properties."
      },
      {
        "q": "What is Stanza Living's commitment period?",
        "a": "Stanza Living typically requires long-term commitments which may not be flexible for all users."
      },
      {
        "q": "How is Stanza Living maintenance?",
        "a": "Maintenance response times vary by location with some properties reporting significant delays."
      },
      {
        "q": "Is Stanza Living better than Zolo?",
        "a": "Stanza Living generally has better brand reputation than Zolo, but both face similar issues with service consistency."
      },
      {
        "q": "What cities does Stanza Living operate in?",
        "a": "Stanza Living operates in 15 major cities across India with concentration in metro areas."
      }
    ],
    "features": [
      {
        "feature": "Consistent Quality",
        "them": false,
        "note": "Varies by location"
      },
      {
        "feature": "Value for Money",
        "them": false,
        "note": "Premium pricing"
      },
      {
        "feature": "Maintenance Response",
        "them": false,
        "note": "Delays reported"
      },
      {
        "feature": "Flexible Terms",
        "them": false,
        "note": "Long commitment"
      }
    ],
    "keywords": "stanza living alternative, stanza vs 360ghar, stanza living review"
  }
];

export const competitorBySlug = (slug: string) => COMPETITORS.find((c) => c.slug === slug) ?? null;
