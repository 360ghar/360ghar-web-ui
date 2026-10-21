/**
 * Openings from the old src/data/careers.js, plus the longer descriptions of
 * CareerDetails.jsx (CAREER_DETAILS_LAYOUT). English only. Applying is by
 * e-mail; there is no careers API.
 */
import { COMPANY_EMAIL } from '@/lib/company';

export const CAREERS_EMAIL = COMPANY_EMAIL;

export type Opening = {
  slug: string;
  title: string;
  description: string;
  about: string;
  requirements: string[];
  location: string;
  type: 'internship';
  duration: string;
  postedDate: string;
  status?: 'closed';
  closedDate?: string;
};

export const OPENINGS: Opening[] = [
  {
    slug: 'content-creator-internship',
    title: 'Content Creator Intern',
    description:
      'Join our content team to create engaging real estate-related content for blogs, social media, video scripts, and marketing collateral. You will research trending topics, write SEO-optimized articles, and help build the 360Ghar brand voice across digital channels.',
    about:
      "As a Content Creator Intern at 360Ghar, you will shape the voice of India's emerging property platform. You will research trending real estate topics, write SEO-optimized blog posts, craft engaging social media content, and help build a content engine that drives organic growth. You will also experiment with AI-powered tools to enhance content quality and productivity.",
    requirements: [
      'Strong writing and editing skills in English',
      'Familiarity with SEO best practices and content calendars',
      'Familiarity with AI tools for content generation and enhancement',
      'Interest in real estate, prop-tech, or digital media',
      'Basic graphic design or video editing skills are a plus',
    ],
    location: 'Gurugram, Haryana',
    type: 'internship',
    duration: '2-6 months',
    postedDate: '2026-06-01',
  },
  {
    slug: 'real-estate-agent',
    title: 'Real Estate Agent',
    description:
      'Work directly with buyers, sellers, and investors to facilitate property transactions in the Gurugram market. You will conduct property showings, maintain client relationships, negotiate deals, and stay updated on market trends and RERA regulations.',
    about:
      'As a Real Estate Agent Intern at 360Ghar, you will work side-by-side with our brokerage team to connect buyers, sellers, and investors with the right properties in Gurugram. You will conduct property showings, maintain client relationships, negotiate deals, and use AI tools for lead scoring and property matching. This is a hands-on role where you will learn the end-to-end property transaction cycle.',
    requirements: [
      'Excellent communication and negotiation skills',
      'Knowledge of Gurugram real estate market is preferred',
      'Familiarity with AI tools for lead generation and property matching',
      'Self-motivated with a results-driven mindset',
      'Own vehicle and valid driving licence is a plus',
    ],
    location: 'Gurugram, Haryana',
    type: 'internship',
    duration: '2-6 months (extendable based on performance)',
    postedDate: '2026-06-08',
  },
  {
    slug: 'founders-office-intern',
    title: "Founder's Office Intern",
    description:
      'Work directly with the founder on strategy, operations, and execution across every part of 360Ghar. You will run market and competitor research, turn open-ended problems into decision-ready analysis, prepare investor and partner material, and drive cross-team projects to completion. A wide-lens role for someone who wants to see how a startup is actually built.',
    about:
      "As a Founder's Office Intern at 360Ghar, you will sit beside the founder and work on whatever matters most that week: market and competitor research, pricing and unit-economics analysis, investor and partner material, hiring support, and the operational glue that keeps a small team shipping. You will own projects end to end: write the memo that frames a decision, then help execute it alongside the content, engineering, and field teams. It is the fastest way to learn how an early-stage company actually runs.",
    requirements: [
      'Structured thinking: able to break an open-ended problem into a clear, defensible analysis',
      'Excellent written and verbal communication in English',
      'Comfort with spreadsheets and data: building a case from numbers, not opinions',
      'Familiarity with AI tools for research, drafting, and analysis',
      'High ownership and follow-through with minimal supervision',
      'Interest in real estate, prop-tech, or early-stage startups',
    ],
    location: 'Gurugram, Haryana',
    type: 'internship',
    duration: '2-6 months (extendable based on performance)',
    postedDate: '2026-08-06',
  },
  {
    slug: 'ai-generalist-intern',
    title: 'AI Generalist Intern',
    description:
      'Work across product, content, operations, and growth with AI as your leverage. You will build AI workflows, automate research and drafting, prototype AI-assisted property search, and turn ambiguous problems into shipped systems. A builder role with startup-wide exposure.',
    about:
      'As an AI Generalist Intern at 360Ghar, you will use AI as leverage across the whole startup: product, content, operations, and growth. You will build AI workflows that automate research, drafting, and lead triage, prototype AI-assisted property search and internal dashboards, and turn ambiguous problems into shipped systems used by real buyers, sellers, and agents.',
    requirements: [
      'Deep fluency with modern AI tools (LLMs, agents, automation) for research, drafting, coding, and analysis',
      'Prototypes fast: prompts, scripts, no-code or low-code workflows; basic JS or Python is a plus',
      'Structured thinking: able to break an open-ended problem into a clear, defensible analysis',
      'Excellent written and verbal communication in English',
      'High ownership and follow-through with minimal supervision',
      'Interest in real estate, prop-tech, or early-stage startups',
    ],
    location: 'Gurugram, Haryana',
    type: 'internship',
    duration: '2-6 months (extendable based on performance)',
    postedDate: '2026-10-07',
  },
  {
    slug: 'software-developer-intern',
    title: 'Software Developer Intern',
    description:
      'Build and maintain web applications, APIs, and internal tools for the 360Ghar platform. You will work with React, Node.js, PostgreSQL, and Python to deliver a smooth property search experience, and integrate AI-powered features like smart search and recommendation engines. Ideal for students or recent graduates eager to ship real features in a startup.',
    about:
      'As a Software Developer Intern at 360Ghar, you will work in production code from day one: shipping React components, building API endpoints with Node.js or Python, and writing automated tests. You will pair with senior engineers on code reviews, take part in sprint planning, and own small features end-to-end. Whether it is improving the property search experience, optimising map rendering, or building internal dashboards, your work will reach real users.',
    requirements: [
      'Foundational knowledge of JavaScript/TypeScript and at least one backend language (Python or Node.js)',
      'Familiarity with React or a similar frontend framework',
      'Experience with RESTful APIs and relational databases (PostgreSQL)',
      'Understanding of version control (Git) and CI/CD workflows',
      'Familiarity with AI tools and libraries applied to web development',
      'Curiosity, ownership mindset, and ability to work in a fast-paced team',
    ],
    location: 'Gurugram, Haryana',
    type: 'internship',
    duration: '2-6 months (extendable based on performance)',
    postedDate: '2026-06-15',
    status: 'closed',
    closedDate: '2026-08-05',
  },
];

export const isOpen = (o: Opening) => o.status !== 'closed';
export const OPEN_ROLES = OPENINGS.filter(isOpen);
export const openingBySlug = (slug: string) => OPENINGS.find((o) => o.slug === slug) ?? null;

/** The subject names the role; the body asks the three questions the team screens on. */
export const mailtoFor = (o: Opening) => {
  const subject = `Application for ${o.title} - Career at 360Ghar`;
  const body = [
    'Hello 360Ghar team,',
    '',
    `I am applying for the ${o.title} internship.`,
    '',
    'Current city: [Your answer]',
    'Availability for onsite work in Gurugram: [Yes / No / Please explain]',
    'How do you use AI tools, and approximately how much do you use them each day? [Your answer]',
    '',
    'I have attached my resume or portfolio for your review.',
    '',
    'Regards,',
    '[Your name]',
  ].join('\n');
  return `mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/**
 * JobPosting with real fields only. The old schema hard-coded a salary of
 * ₹15,000 a month for every role and computed validThrough from the render
 * time; neither is in the data, so both are left out.
 */
export function jobPosting(o: Opening, url: string) {
  return {
    '@type': 'JobPosting',
    title: o.title,
    description: o.about || o.description,
    datePosted: o.postedDate,
    employmentType: 'INTERN',
    jobLocationType: 'ONSITE',
    hiringOrganization: { '@type': 'Organization', name: '360Ghar', sameAs: 'https://360ghar.com', url: 'https://360ghar.com' },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', streetAddress: 'Sector 50, Gurugram', addressLocality: 'Gurugram', addressRegion: 'Haryana', postalCode: '122001', addressCountry: 'IN' },
    },
    industry: 'Real Estate',
    qualifications: o.requirements.join('; '),
    url,
  };
}
