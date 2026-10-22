/**
 * The form model and the backend call for the legal drafters.
 * Backend: POST /api/v1/ai/legal-draft { kind, fields } -> the clauses of a fixed template, filled with the fields.
 * The reply is read loosely (a title, then clauses as {heading?, text} or one text), so a small change of its shape
 * does not break the page. A reply with no text is a failure.
 */
import { z } from 'zod';
import { postJson } from '@/lib/api/client';
import { SECTIONS, type Field, type Kind } from './content';

const isText = (f: Field) => f.type === 'text' || f.type === 'area';

/** One Zod object per kind. Every value is the string in the input; `toFields` turns numbers into numbers. */
export function schemaFor(kind: Kind) {
  const shape: Record<string, z.ZodType<string>> = {};
  for (const f of SECTIONS[kind].flatMap((s) => s.fields)) {
    let one: z.ZodType<string>;
    if (isText(f)) one = z.string().trim().max(f.max ?? 300);
    else if (f.type === 'num') {
      one = z.string().trim().refine((v) => v === '' || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) >= (f.min ?? 0) && Number(v) <= (f.max ?? Infinity)), 'number');
    } else if (f.type === 'date') one = z.string().refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'date');
    else one = z.enum((f.options ?? []).map(([v]) => v) as [string, ...string[]]);
    // A required field must not be empty.
    shape[f.name] = f.optional || f.type === 'select' ? one : one.refine((v) => v !== '', 'required');
  }
  return z.object(shape);
}

export const defaults = (kind: Kind): Record<string, string> =>
  Object.fromEntries(SECTIONS[kind].flatMap((s) => s.fields).map((f) => [f.name, f.def ?? '']));

/** The request `fields`: numbers as numbers, empty optional values left out. */
export function toFields(kind: Kind, values: Record<string, string>): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const f of SECTIONS[kind].flatMap((s) => s.fields)) {
    const v = (values[f.name] ?? '').trim();
    if (v === '') continue;
    out[f.name] = f.type === 'num' ? Number(v) : v;
  }
  return out;
}

export type Draft = { title: string; clauses: { heading?: string; text: string }[] };

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

/** Reads the reply. Null when it has no text to show. */
export function parseDraft(json: unknown): Draft | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  const list = [o.clauses, o.sections].find(Array.isArray) as unknown[] | undefined;
  const clauses = list
    ? list.flatMap((c) => {
        if (typeof c === 'string') return str(c) ? [{ text: c.trim() }] : [];
        const x = c as Record<string, unknown> | null;
        const text = str(x?.text) ?? str(x?.body) ?? str(x?.content);
        const heading = str(x?.heading) ?? str(x?.title);
        return text ? [{ ...(heading ? { heading } : {}), text }] : [];
      })
    : (str(o.text) ?? str(o.body) ?? str(o.document) ?? '')
        .split(/\n{2,}/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((text) => ({ text }));
  if (!clauses.length) return null;
  return { title: str(o.title) ?? '', clauses };
}

export type DraftFailure = 'rate' | 'unavailable' | 'failed';

export async function requestDraft(kind: Kind, fields: Record<string, string | number>): Promise<{ draft: Draft } | { failure: DraftFailure }> {
  const { status, json } = await postJson('/api/v1/ai/legal-draft', { kind, fields });
  if (status === 429) return { failure: 'rate' };
  if (status === 404 || status === 405 || status === 501) return { failure: 'unavailable' };
  const draft = status >= 200 && status < 300 ? parseDraft(json) : null;
  return draft ? { draft } : { failure: 'failed' };
}
