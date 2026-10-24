/* Copied from 360ghar-web-ui/src (SEO parity). Keep in sync; do not edit by hand without a reason. */
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

export const defaultAuthor = '360ghar-team';

export function getAuthor(slug) {
  return authors[slug] || authors[defaultAuthor];
}

export function getAuthorSchema(authorSlug) {
  const author = getAuthor(authorSlug);
  return {
    '@type': 'Person',
    name: author.name,
    jobTitle: author.title,
    url: `https://360ghar.com/blog/author/${author.slug}`,
    image: {
      '@type': 'ImageObject',
      url: `https://360ghar.com${author.image}`,
    },
    worksFor: {
      '@type': 'Organization',
      name: '360Ghar',
      url: 'https://360ghar.com',
    },
    knowsAbout: author.credentials || 'Real Estate, Property Market, Gurugram Properties',
    sameAs: author.linkedin ? [author.linkedin] : [],
  };
}
