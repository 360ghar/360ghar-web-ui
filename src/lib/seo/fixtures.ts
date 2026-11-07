/**
 * Sample JSON-LD from the generators in src/lib/seo/structuredData.ts and the site-wide blocks, for validate.test.ts and
 * scripts/validate-structured-data.mjs. Relative imports with extensions only: Node's type stripping loads this file.
 */
import {
  generateArticleStructuredData,
  generateBlogStructuredData,
  generateBreadcrumbStructuredData,
  generateFaqStructuredData,
  generateHowToStructuredData,
  generateJobPostingStructuredData,
  generateLocalityStructuredData,
  generateVideoStructuredData,
} from './structuredData.ts';
import { siteBlocks, speakableWebPage } from './siteSchemas.ts';

const ctx = (b: object) => ({ '@context': 'https://schema.org', ...b });

/** Named blocks as a page would emit them (with @context). */
export function fixtureBlocks(): Record<string, object[]> {
  return {
    'site-wide (every page)': siteBlocks().map(ctx),
    'speakable page': [ctx(speakableWebPage('https://360ghar.com/faq', ['#main h1'])!)],
    JobPosting: [ctx(generateJobPostingStructuredData({ title: 'Test Intern', description: 'Test description', datePosted: '2026-06-01', validThrough: '2026-12-01' }))],
    Article: [ctx(generateArticleStructuredData({ headline: 'Test Article', description: 'Test description', publishedAt: '2026-06-01' }))],
    VideoObject: [ctx(generateVideoStructuredData({ title: 'Test Video', description: 'Test description', contentUrl: 'https://360ghar.com/tour.mp4', uploadDate: '2026-06-01' }))],
    BlogPosting: [ctx(generateBlogStructuredData({ title: 'Test Post', description: 'Test', image: 'https://360ghar.com/og-image-home.jpg', publishedAt: '2026-06-01', updatedAt: '2026-06-02', url: 'https://360ghar.com/blog/test' }))],
    BreadcrumbList: [ctx(generateBreadcrumbStructuredData([{ name: 'Home', url: 'https://360ghar.com/' }, { name: 'Blog', url: 'https://360ghar.com/blog' }]))],
    FAQPage: [ctx(generateFaqStructuredData([{ question: 'Is it free?', answer: 'Yes.' }]))],
    Place: [ctx(generateLocalityStructuredData({ name: 'Sector 49', city: 'Gurgaon', slug: 'sector-49-gurgaon', lat: 28.41, lng: 77.05, entityType: 'sector' }))],
    HowTo: [ctx(generateHowToStructuredData({ name: 'List a home', description: 'Steps', steps: [{ name: 'Sign in', text: 'Sign in.' }], image: 'https://360ghar.com/og-image-home.jpg' }))],
  };
}
