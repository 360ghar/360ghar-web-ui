/**
 * Sample JSON-LD from the old generators (src/lib/seo/legacy) and the site-wide blocks, for validate.test.ts and
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
} from './legacy/structuredData.js';
import { siteBlocks, speakableWebPage } from './siteSchemas.ts';

const ctx = (b: object) => ({ '@context': 'https://schema.org', ...b });
/** The old generators are plain JS with required-looking destructured params; pass partial samples through. */
const call = (fn: unknown, arg: unknown): object => (fn as (a: unknown) => object)(arg);

/** Named blocks as a page would emit them (with @context). */
export function fixtureBlocks(): Record<string, object[]> {
  return {
    'site-wide (every page)': siteBlocks().map(ctx),
    'speakable page': [ctx(speakableWebPage('https://360ghar.com/faq', ['#main h1'])!)],
    JobPosting: [ctx(call(generateJobPostingStructuredData, { title: 'Test Intern', description: 'Test description', datePosted: '2026-06-01', validThrough: '2026-12-01' }))],
    Article: [ctx(call(generateArticleStructuredData, { headline: 'Test Article', description: 'Test description', publishedAt: '2026-06-01' }))],
    VideoObject: [ctx(call(generateVideoStructuredData, { title: 'Test Video', description: 'Test description', contentUrl: 'https://360ghar.com/tour.mp4', uploadDate: '2026-06-01' }))],
    BlogPosting: [ctx(call(generateBlogStructuredData, { title: 'Test Post', description: 'Test', image: 'https://360ghar.com/og-image-home.jpg', publishedAt: '2026-06-01', updatedAt: '2026-06-02', url: 'https://360ghar.com/blog/test' }))],
    BreadcrumbList: [ctx(call(generateBreadcrumbStructuredData, [{ name: 'Home', url: 'https://360ghar.com/' }, { name: 'Blog', url: 'https://360ghar.com/blog' }]))],
    FAQPage: [ctx(call(generateFaqStructuredData, [{ question: 'Is it free?', answer: 'Yes.' }]))],
    Place: [ctx(call(generateLocalityStructuredData, { name: 'Sector 49', city: 'Gurgaon', slug: 'sector-49-gurgaon', lat: 28.41, lng: 77.05, entityType: 'sector' }))],
    HowTo: [ctx(call(generateHowToStructuredData, { name: 'List a home', description: 'Steps', steps: [{ name: 'Sign in', text: 'Sign in.' }], image: 'https://360ghar.com/og-image-home.jpg' }))],
  };
}
