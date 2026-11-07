/**
 * The people named on the site. The founder is the only person shown on the
 * About page and in the Person schema; the team entry is the byline for
 * articles written by the editorial team. The literal keys keep the founder's
 * fields typed as present (no lookup by a string key).
 */
export const authors = {
  'saksham-mittal': {
    name: 'Saksham Mittal',
    slug: 'saksham-mittal',
    title: 'Founder & CEO',
    bio: 'Saksham Mittal is the founder of 360Ghar. He leads product strategy and technology.',
    image: '/assets/images/thumbs/team1.webp',
    linkedin: 'https://www.linkedin.com/in/saksham360/',
    credentials: 'Real Estate Technology, AI/ML, Product Strategy',
    organization: '360 Ghar',
  },
  '360ghar-team': {
    name: '360Ghar Team',
    slug: '360ghar-team',
    title: 'Real Estate Research Team',
    bio: 'The 360Ghar team prepares property content, locality pages, and tools for the website. Check each page for its sources, date, and scope.',
    image: '/assets/images/logo/logo.webp',
    organization: '360 Ghar',
  },
};
