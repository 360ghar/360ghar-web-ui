/**
 * Celebrity homes from the old CelebrityHomesHub.jsx. Each slug is a planned
 * blog post; a card links to /blog/{slug} only when the post exists (checked
 * at build time). Two unsourced money figures ("₹100 Crore") are removed.
 */
export const CELEBRITY_HOMES = [
  { name: 'Akshay Kumar', slug: 'akshay-kumars-house-in-juhu-a-verified-look-at-the-prime-beach-residence', location: 'Juhu, Mumbai', type: 'Sea-facing bungalow', highlights: 'Prime beach residence on the Juhu beachfront' },
  { name: 'Allu Arjun', slug: 'inside-allu-arjuns-100-crore-mansion-a-blueprint-for-luxury-living', location: 'Jubilee Hills, Hyderabad', type: 'Mansion', highlights: 'Jubilee Hills estate' },
  { name: 'Hardik Pandya', slug: 'inside-hardik-pandyas-real-estate-portfolio-a-look-at-his-mumbai-and-vadodara-homes', location: 'Mumbai and Vadodara', type: 'Multi-city portfolio', highlights: 'Mumbai penthouse and Vadodara family home' },
  { name: 'Shubman Gill', slug: 'shubman-gills-fazilka-residence-a-real-estate-case-study-in-lifestyle-and-location', location: 'Fazilka, Punjab', type: 'Family residence', highlights: 'Punjab roots, growing portfolio' },
  { name: 'Vikram (Chiyaan)', slug: 'decoding-the-design-and-location-of-vikrams-chennai-residence-a-360-ghar-insight', location: 'Besant Nagar, Chennai', type: 'Waterfront villa', highlights: 'Chennai coastline home' },
  { name: 'Kriti Sanon', slug: 'inside-kriti-sanons-mumbai-residence-a-case-study-in-premium-real-estate', location: 'Mumbai', type: 'Premium apartment', highlights: 'Bollywood luxury living' },
  { name: 'Rashmika Mandanna', slug: 'inside-rashmika-mandannas-real-estate-portfolio-lessons-in-luxury-and-diversification', location: 'Hyderabad and Mumbai', type: 'Multi-city portfolio', highlights: 'Pan-India property strategy' },
  { name: 'Nayanthara', slug: 'nayantharas-real-estate-portfolio-a-look-at-the-lady-superstars-100-crore-property-investments', location: 'Chennai and Hyderabad', type: 'Multi-city portfolio', highlights: 'Homes in Chennai and Hyderabad' },
  { name: 'Sharad Kelkar', slug: 'sharad-kelkars-malad-west-residence-a-look-at-real-estate-net-worth-and-career-highlights', location: 'Malad West, Mumbai', type: 'Suburban residence', highlights: 'Mumbai suburban real estate value' },
  { name: 'Ananya Panday', slug: 'inside-ananya-pandays-bandra-west-home-a-benchmark-for-luxury-living', location: 'Bandra West, Mumbai', type: 'Luxury apartment', highlights: 'Bandra premium living' },
  { name: 'Siddhant Chaturvedi', slug: 'siddhant-chaturvedis-home-a-detailed-look-at-his-juhu-residence-net-worth-lifestyle', location: 'Juhu, Mumbai', type: 'Juhu residence', highlights: 'Premium location' },
  { name: 'Milind Soman', slug: 'inside-milind-somans-prabhadevi-residence-a-blend-of-luxury-and-wellness', location: 'Prabhadevi, Mumbai', type: 'Wellness-focused home', highlights: 'Health meets luxury design' },
  { name: 'Keerthy Suresh', slug: 'inside-keerthy-sureshs-chennai-residence-a-look-at-modern-luxury-and-design', location: 'Chennai', type: 'Modern villa', highlights: 'South Indian design' },
  { name: 'Anupam Kher', slug: 'anupam-khers-homes-a-look-at-real-estate-choices-across-mumbai-shimla-and-new-york', location: 'Mumbai, Shimla, New York', type: 'Global portfolio', highlights: 'Homes in three cities' },
  { name: 'Suniel Shetty', slug: 'inside-suniel-shettys-real-estate-portfolio-a-case-study-in-luxury-and-strategic-investment', location: 'Mumbai', type: 'Investment portfolio', highlights: 'Real estate investor' },
  { name: 'Cristiano Ronaldo', slug: 'inside-cristiano-ronaldos-turin-villa-a-masterclass-in-luxury-real-estate', location: 'Turin, Italy', type: 'Italian villa', highlights: 'International luxury benchmark' },
] as const;

/**
 * The cards with their link. `post` is the English path of the case study, set only for slugs in `published`
 * (posts that exist in the API). All 16 posts are missing today (checked 2026-09-29: the blog has 20 posts,
 * none about a celebrity), so no card links. The locations are in Mumbai, Hyderabad, Chennai and abroad,
 * where 360Ghar has no listings or place pages, so a search link would not be honest either.
 */
export const celebrityCards = (published: ReadonlySet<string>) => CELEBRITY_HOMES.map((c) => ({ ...c, post: published.has(c.slug) ? `/blog/${c.slug}` : null }));

export const CELEBRITY_CITIES = [
  { city: 'Mumbai', places: ['Juhu: Akshay Kumar, Dharmendra', 'Bandra West: Ananya Panday, Shah Rukh Khan', 'Prabhadevi: Milind Soman', 'Malad West: Sharad Kelkar'] },
  { city: 'Hyderabad', places: ['Jubilee Hills: Allu Arjun, Prabhas', 'Banjara Hills: Nayanthara', 'Financial District: IT corridor growth'] },
  { city: 'Chennai', places: ['Besant Nagar: Vikram', 'Adyar and ECR: Keerthy Suresh', 'ECR corridor: premium sea-facing villas'] },
];
