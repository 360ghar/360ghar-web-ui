export const careerOpenings = [
  {
    slug: 'content-creator-internship',
    icon: 'fas fa-pen-nib',
    title: 'Content Creator Intern',
    description:
      'Join our content team to create engaging real estate-related content for blogs, social media, video scripts, and marketing collateral. You will research trending topics, write SEO-optimized articles, and help build the 360Ghar brand voice across digital channels.',
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
    icon: 'fas fa-building',
    title: 'Real Estate Agent',
    description:
      'Work directly with buyers, sellers, and investors to facilitate property transactions in the Gurugram market. You will conduct property showings, maintain client relationships, negotiate deals, and stay updated on market trends and RERA regulations.',
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
    icon: 'fas fa-compass',
    title: 'Founder\'s Office Intern',
    description:
      'Work directly with the founder on strategy, operations, and execution across every part of 360Ghar. You will run market and competitor research, turn open-ended problems into decision-ready analysis, prepare investor and partner material, and drive cross-team projects to completion. A wide-lens role for someone who wants to see how a startup is actually built.',
    requirements: [
      'Structured thinking — able to break an open-ended problem into a clear, defensible analysis',
      'Excellent written and verbal communication in English',
      'Comfort with spreadsheets and data — building a case from numbers, not opinions',
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
    icon: 'fas fa-robot',
    title: 'AI Generalist Intern',
    description:
      'Work across product, content, operations, and growth with AI as your leverage. You will build AI workflows, automate research and drafting, prototype AI-assisted property search, and turn ambiguous problems into shipped systems. A builder role with startup-wide exposure.',
    requirements: [
      'Deep fluency with modern AI tools (LLMs, agents, automation) for research, drafting, coding, and analysis',
      'Prototypes fast — prompts, scripts, no-code/low-code workflows; basic JS/Python a plus',
      'Structured thinking — able to break an open-ended problem into a clear, defensible analysis',
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
    icon: 'fas fa-laptop-code',
    title: 'Software Developer Intern',
    description:
      'Build and maintain web applications, APIs, and internal tools for the 360Ghar platform. You will work with React, Node.js, PostgreSQL, and Python to deliver a seamless property search experience, and integrate AI-powered features like smart search and recommendation engines. Ideal for students or recent graduates eager to ship real features and grow rapidly in a startup environment.',
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

/**
 * An opening with no explicit status is open. Closed openings are hidden from
 * the careers listing and drop their JobPosting schema, but keep their detail
 * URL alive as a noindex page so an indexed URL never becomes a soft 404.
 */
export const isOpeningOpen = (opening) => opening?.status !== 'closed';

export const openCareerOpenings = careerOpenings.filter(isOpeningOpen);
