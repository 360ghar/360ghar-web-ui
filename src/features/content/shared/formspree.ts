/**
 * Formspree forms. The backend has no contact, newsletter or referral
 * endpoint, so these forms post to the same Formspree forms as the old site.
 */
export const FORMSPREE = {
  /** Contact, FAQ contact and referral forms (referrals carry form_type=referral). */
  contact: 'mwpqglyb',
  newsletter: 'mkgzdjyj',
} as const;

type SendResult = { ok: true } | { ok: false; network: boolean; message: string; fields: Record<string, string> };

/** Reads a Formspree error body: `{ error?, errors?: [{ field?, message }] }`. */
export function parseFormspreeError(body: unknown): { message: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  const messages: string[] = [];
  const b = (body ?? {}) as { error?: unknown; errors?: unknown };
  if (Array.isArray(b.errors)) {
    for (const e of b.errors as { field?: unknown; message?: unknown }[]) {
      const msg = typeof e?.message === 'string' ? e.message : '';
      if (!msg) continue;
      if (typeof e.field === 'string' && e.field) fields[e.field] = msg;
      else messages.push(msg);
    }
  }
  if (!messages.length && typeof b.error === 'string') messages.push(b.error);
  return { message: messages.join(' '), fields };
}

export async function sendFormspree(form: string, data: Record<string, string | boolean>): Promise<SendResult> {
  let res: Response;
  try {
    res = await fetch(`https://formspree.io/f/${form}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return { ok: false, network: true, message: '', fields: {} };
  }
  if (res.ok) return { ok: true };
  const body = await res.json().catch(() => null);
  return { ok: false, network: false, ...parseFormspreeError(body) };
}
