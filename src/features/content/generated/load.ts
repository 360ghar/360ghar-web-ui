/**
 * Generated, fact-checked copy for a locality or a property (backend GET /api/v1/content/{type}/{slug}).
 * The live API may not have the route yet, or the entity may have no block: every failure gives null and the
 * page keeps its fixed content. The body is free-form JSON on the wire, so it is checked here.
 */
import { api, attempt } from '@/lib/api/client';
import type { Locale } from '@/lib/i18n/locale';

export type Generated = {
  summary: string;
  highlights: string[];
  faqs: { q: string; a: string }[];
  whoItSuits: string | null;
  pros: string[];
  cons: string[];
  metaDescription: string | null;
  /** ISO date the facts are from (falls back to the update time). */
  date: string;
  sources: { label: string; href?: string }[];
};

type Wire = {
  body: Record<string, unknown>;
  sources: Record<string, unknown>[];
  data_as_of: string | null;
  updated_at: string;
  indexable: boolean;
};

const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const strings = (v: unknown) => (Array.isArray(v) ? v.map(text).filter((s): s is string => s !== null) : []);

/** Turns one API block into what the pages show. Null when it is thin (not indexable) or has no summary. */
export function parseGenerated(w: Wire | null | undefined): Generated | null {
  if (!w || !w.indexable || !w.body) return null;
  const summary = text(w.body.summary);
  if (!summary) return null;
  const faqs = Array.isArray(w.body.faqs)
    ? w.body.faqs.flatMap((f) => {
        const o = f as Record<string, unknown> | null;
        const q = text(o?.question);
        const a = text(o?.answer);
        return q && a ? [{ q, a }] : [];
      })
    : [];
  const sources = (w.sources ?? []).flatMap((s) => {
    const label = text(s.name);
    const url = text(s.url);
    return label ? [{ label, ...(url && /^https?:\/\//.test(url) ? { href: url } : {}) }] : [];
  });
  return {
    summary,
    highlights: strings(w.body.highlights),
    faqs,
    whoItSuits: text(w.body.who_it_suits),
    pros: strings(w.body.pros),
    cons: strings(w.body.cons),
    metaDescription: text(w.body.meta_description),
    date: w.data_as_of ?? w.updated_at,
    sources,
  };
}

export async function loadGenerated(entity: 'locality' | 'property', slug: string, locale: Locale): Promise<Generated | null> {
  const { data } = await attempt(
    api.GET('/api/v1/content/{entity_type}/{slug}', {
      params: { path: { entity_type: entity, slug }, query: { locale } },
      // One bounded attempt: an abort is not retried by the client, so a stalled optional call cannot hold the page.
      signal: AbortSignal.timeout(1500),
    }),
  );
  return parseGenerated(data as Wire | null);
}
