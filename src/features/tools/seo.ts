/**
 * JSON-LD for tool pages, same blocks as the old site: SoftwareApplication
 * (legacy toolSchemas config), BreadcrumbList, FAQPage and HowTo.
 */
import type { Locale } from '@/lib/i18n/locale';
import { howTo as howToLd } from '@/features/content/shared/schema';
import { generateToolSchema, toolSchemas } from '@/lib/seo/legacy/toolSchemas.js';
import { breadcrumbs, faqPage } from '@/lib/seo/site';
import type { Tool } from './registry';

export type Faq = { q: string; a: string };
export type HowTo = { name: string; description: string; steps: { name: string; text: string }[] };

export const toolsCrumb = (locale: Locale) => ({ name: locale === 'hi' ? 'टूल्स' : 'Tools', path: '/tools' });
export const homeCrumb = (locale: Locale) => ({ name: locale === 'hi' ? 'होम' : 'Home', path: '/' });

export function toolJsonLd(tool: Tool, locale: Locale, faqs: Faq[], howTo?: HowTo): unknown[] {
  const config = (toolSchemas as Record<string, unknown>)[tool.schema];
  return [
    config ? generateToolSchema(config) : null,
    breadcrumbs([homeCrumb(locale), toolsCrumb(locale), { name: tool.name[locale], path: tool.route }], locale),
    faqs.length ? faqPage(faqs) : null,
    howTo ? howToLd(howTo.name, howTo.description, howTo.steps) : null,
  ].filter(Boolean);
}
