/**
 * Sentence search: "2 BHK for rent in Sector 57 under 50k" -> search filters.
 * The backend (POST /api/v1/properties/nl-search) turns the sentence into filters. When it is missing, slow or
 * answers with nothing usable, the sentence is searched as plain keywords (`q`), which always works.
 */
import { apiUrl, authedFetch } from '@/lib/api/client';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { parseFilters, toSearchParams } from './filters';

/** Four words or more is a sentence; a sector or a society name is not. */
export const isSentence = (text: string) => text.trim().split(/\s+/).filter(Boolean).length >= 4;

/** The backend's `filters` object as URL params. Values are read by `parseFilters`, which drops unknown keys and clamps the rest. */
export function filtersToParams(filters: unknown): URLSearchParams {
  const params = new URLSearchParams();
  if (!filters || typeof filters !== 'object') return params;
  for (const [key, value] of Object.entries(filters as Record<string, unknown>)) {
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') params.append(key, String(v));
  }
  return params;
}

const TIMEOUT_MS = 6000;

/** The /properties URL for a sentence. Never throws. `ai` is true when the backend understood it. */
export async function sentenceHref(sentence: string, locale: Locale): Promise<{ href: string; ai: boolean }> {
  const q = sentence.trim().slice(0, 300);
  const base = localizePath('/properties', locale);
  const keyword = { href: `${base}?${new URLSearchParams({ q })}`, ai: false };
  try {
    const res = await authedFetch(
      new Request(apiUrl('/api/v1/properties/nl-search'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ q }) }),
      TIMEOUT_MS,
    );
    if (!res.ok) return keyword;
    const body = (await res.json()) as { filters?: unknown };
    const filters = parseFilters(filtersToParams(body.filters));
    const params = toSearchParams(filters);
    // Nothing understood: keep the words, so the search is not blank.
    if (!params.toString()) return keyword;
    return { href: `${base}?${params}`, ai: true };
  } catch {
    return keyword;
  }
}
