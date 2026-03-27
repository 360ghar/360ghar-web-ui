export const authors = {
  'saksham-mittal': {
    name: 'Saksham Mittal',
    slug: 'saksham-mittal',
    title: 'Founder & CEO',
    bio: 'Saksham Mittal is the founder of 360Ghar, India\'s first AI + VR-first real estate platform. With deep expertise in PropTech and the Gurugram real estate market, he leads product strategy and technology innovation.',
    image: '/assets/images/team/team1.png',
    linkedin: 'https://www.linkedin.com/in/saksham360/',
    credentials: 'Real Estate Technology, AI/ML, Product Strategy',
    organization: '360Ghar Technologies Pvt Ltd',
  },
  '360ghar-team': {
    name: '360Ghar Team',
    slug: '360ghar-team',
    title: 'Real Estate Research Team',
    bio: 'The 360Ghar research team covers property market trends, locality guides, and verified listing insights across Gurugram and Delhi NCR. Every insight is backed by on-ground verification.',
    image: '/assets/images/logo/logo.png',
    organization: '360Ghar Technologies Pvt Ltd',
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
