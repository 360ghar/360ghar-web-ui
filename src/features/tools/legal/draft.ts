/**
 * The form model and the backend call for the legal drafters.
 * Typed call (openapi/openapi.json): POST /api/v1/ai/legal-draft { kind, fields } -> { kind, title, sections: [{ heading, body }], disclaimer,
 * original_text?, narrative_source }. The clauses are a fixed template filled with `fields`; the model only rewords the
 * free text, and `original_text` then holds the person's own words. Limits: 5 per hour per IP, model latency up to 80 s.
 */
import { z } from 'zod';
import { api, timeoutMs } from '@/lib/api/client';
import { SECTIONS, type Field, type Kind } from './content';

const isText = (f: Field) => f.type === 'text' || f.type === 'area';

/** One Zod object per kind. Every value is the string in the input; `toFields` turns numbers into numbers. */
export function schemaFor(kind: Kind) {
  const shape: Record<string, z.ZodType<string>> = {};
  for (const f of SECTIONS[kind].flatMap((s) => s.fields)) {
    let one: z.ZodType<string>;
    if (isText(f)) one = z.string().trim().max(f.max ?? 300).refine((v) => v === '' || v.length >= (f.min ?? 0), 'min');
    else if (f.type === 'num') {
      one = z.string().trim().refine((v) => v === '' || ((f.int ? /^\d+$/ : /^\d+(\.\d{1,2})?$/).test(v) && Number(v) >= (f.min ?? 0) && Number(v) <= (f.max ?? Infinity)), 'number');
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
export function toFields(kind: Kind, values: Record<string, string>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const f of SECTIONS[kind].flatMap((s) => s.fields)) {
    const v = (values[f.name] ?? '').trim();
    if (v === '') continue;
    out[f.name] = f.type === 'num' ? Number(v) : f.bool ? v === 'true' : v;
  }
  return out;
}

/** The backend needs an amount for these two notices (422 without it). */
export const amountRequired = (kind: Kind, values: Record<string, string>) =>
  kind === 'legal_notice' && ['rent_arrears', 'security_deposit_refund'].includes(values.notice_type ?? '') && !(values.amount ?? '').trim();

export type Draft = {
  title: string;
  /** Rendered as clauses: a heading and its text. */
  clauses: { heading?: string; text: string }[];
  /** The backend's fixed disclaimer (English). Shown with the draft. */
  disclaimer?: string;
  /** The person's own free text, when the model reworded it. Shown next to the draft. */
  original?: string;
};

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

/** Reads the reply. Null when it has no sections to show. */
export function parseDraft(json: unknown): Draft | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  const clauses = (Array.isArray(o.sections) ? o.sections : []).flatMap((c) => {
    const x = c as Record<string, unknown> | null;
    const text = str(x?.body);
    const heading = str(x?.heading);
    return text ? [{ ...(heading ? { heading } : {}), text }] : [];
  });
  if (!clauses.length) return null;
  const original = o.narrative_source === 'model' ? str(o.original_text) : null;
  return { title: str(o.title) ?? '', clauses, ...(str(o.disclaimer) ? { disclaimer: str(o.disclaimer)! } : {}), ...(original ? { original } : {}) };
}

export type DraftFailure = 'rate' | 'unavailable' | 'failed';

export async function requestDraft(kind: Kind, fields: Record<string, string | number | boolean>): Promise<{ draft: Draft } | { failure: DraftFailure }> {
  // The model can take up to 80 s to reword the free text.
  let status = 0;
  let json: unknown = null;
  try {
    // The body is a union of per-kind field sets; the form model already builds the right one for `kind`.
    const res = await api.POST('/api/v1/ai/legal-draft', { body: { kind, fields } as never, ...timeoutMs(120_000) });
    status = res.response.status;
    json = res.data ?? null;
  } catch {
    // network failure or timeout: status stays 0, shown as a failure
  }
  if (status === 429) return { failure: 'rate' };
  if (status === 404 || status === 405 || status === 501 || status === 503) return { failure: 'unavailable' };
  const draft = status >= 200 && status < 300 ? parseDraft(json) : null;
  return draft ? { draft } : { failure: 'failed' };
}
