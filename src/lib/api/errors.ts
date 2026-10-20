/**
 * Typed API errors.
 *
 * Every non-2xx response is `{ error: { code, message, details? } }`. A 422 adds
 * `details.fields: [{ field, msg, type }]`. Network failures and timeouts have no
 * response; they get status 0.
 */
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import type { Locale } from '@/lib/i18n/locale';

type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'unavailable'
  | 'server'
  | 'bad_request';

export class ApiError extends Error {
  override readonly name = 'ApiError';
  readonly status: number;
  readonly code: string;
  readonly kind: ApiErrorKind;
  /** Field name to message, from a 422 response. Keys use the request field names. */
  readonly fields: Record<string, string>;
  readonly retryAfter?: number;

  constructor(init: { status: number; code: string; message: string; fields?: Record<string, string>; retryAfter?: number }) {
    super(init.message);
    this.status = init.status;
    this.code = init.code;
    this.fields = init.fields ?? {};
    this.kind = kindOf(init.status, init.code);
    if (init.retryAfter !== undefined) this.retryAfter = init.retryAfter;
  }

  /** True when trying again later can work. */
  get retryable(): boolean {
    return ['network', 'timeout', 'rate_limited', 'unavailable', 'server'].includes(this.kind);
  }
}

function kindOf(status: number, code: string): ApiErrorKind {
  if (status === 0) return code === 'TIMEOUT' ? 'timeout' : 'network';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 422) return 'validation';
  if (status === 429) return 'rate_limited';
  if (status === 502 || status === 503 || status === 504) return 'unavailable';
  if (status >= 500) return 'server';
  return 'bad_request';
}

type FieldError = { field?: unknown; msg?: unknown };

/** "body.monthly_rent" -> "monthly_rent". The backend prefixes the source: body, query or path. */
function fieldName(field: string): string {
  return field.replace(/^(body|query|path)(\.|$)/, '') || '_form';
}

/** Pydantic prefixes custom validator messages with "Value error, ". */
function cleanMessage(msg = ''): string {
  return msg.replace(/^Value error,\s*/i, '').trim();
}

/**
 * Reads the backend error envelope `{ error: { code, message, details } }` and nothing else.
 * Field errors come only from a 422: `details.fields[{ field, msg, type }]`. Other
 * `details` (for example a 503 `{ error_code, endpoint }`) are context, not form errors.
 */
export async function toApiError(response: Response, body?: unknown): Promise<ApiError> {
  let data = body;
  if (data === undefined) {
    try {
      data = await response.clone().json();
    } catch {
      data = undefined;
    }
  }
  const retryAfterHeader = response.headers.get('retry-after');
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) || undefined : undefined;
  const status = response.status;
  const retry = retryAfter ? { retryAfter } : {};

  const err = data && typeof data === 'object' ? (data as { error?: unknown }).error : undefined;
  if (err && typeof err === 'object') {
    const e = err as { code?: string; message?: string; details?: { fields?: unknown } | null };
    const fields: Record<string, string> = {};
    if (status === 422 && Array.isArray(e.details?.fields)) {
      for (const item of e.details.fields as FieldError[]) {
        if (typeof item.field !== 'string' || typeof item.msg !== 'string') continue;
        const key = fieldName(item.field);
        if (!fields[key]) fields[key] = cleanMessage(item.msg);
      }
    }
    return new ApiError({
      status,
      code: e.code ?? `HTTP_${status}`,
      message: cleanMessage(e.message) || response.statusText,
      fields,
      ...retry,
    });
  }
  return new ApiError({ status, code: `HTTP_${status}`, message: response.statusText || `HTTP ${status}`, ...retry });
}

export function networkError(cause: unknown): ApiError {
  const timeout = cause instanceof DOMException && (cause.name === 'TimeoutError' || cause.name === 'AbortError');
  return new ApiError({
    status: 0,
    code: timeout ? 'TIMEOUT' : 'NETWORK',
    message: cause instanceof Error ? cause.message : 'Network error',
  });
}

const MESSAGES: Record<Locale, Record<ApiErrorKind, { title: string; body: string }>> = {
  en: {
    network: { title: 'You seem to be offline', body: 'Check your connection, then try again.' },
    timeout: { title: 'This is taking too long', body: 'The server did not answer in time. Try again.' },
    validation: { title: 'Some details need a fix', body: 'Check the highlighted fields.' },
    unauthorized: { title: 'Please sign in', body: 'Your session has ended. Sign in to continue.' },
    forbidden: { title: 'You cannot do this', body: 'Your account does not have access to this action.' },
    not_found: { title: 'We could not find this', body: 'It may have been removed or the link is wrong.' },
    conflict: { title: 'This changed meanwhile', body: 'Reload the page to see the latest version.' },
    rate_limited: { title: 'Too many tries', body: 'Wait a minute, then try again.' },
    unavailable: { title: 'Our server is busy', body: 'This is on our side. Try again in a minute.' },
    server: { title: 'Something broke on our side', body: 'We could not finish this. Try again.' },
    bad_request: { title: 'We could not do that', body: 'Check the details and try again.' },
  },
  hi: {
    network: { title: 'आप ऑफ़लाइन लगते हैं', body: 'अपना इंटरनेट कनेक्शन जाँचें, फिर दोबारा कोशिश करें।' },
    timeout: { title: 'इसमें बहुत समय लग रहा है', body: 'सर्वर ने समय पर जवाब नहीं दिया। दोबारा कोशिश करें।' },
    validation: { title: 'कुछ जानकारी ठीक करनी है', body: 'चिह्नित फ़ील्ड जाँचें।' },
    unauthorized: { title: 'कृपया साइन इन करें', body: 'आपका सेशन खत्म हो गया है। आगे बढ़ने के लिए साइन इन करें।' },
    forbidden: { title: 'आप यह नहीं कर सकते', body: 'आपके खाते को इसकी अनुमति नहीं है।' },
    not_found: { title: 'यह नहीं मिला', body: 'शायद इसे हटा दिया गया है या लिंक गलत है।' },
    conflict: { title: 'इस बीच यह बदल गया', body: 'नया संस्करण देखने के लिए पेज रीलोड करें।' },
    rate_limited: { title: 'बहुत ज़्यादा कोशिशें', body: 'एक मिनट रुकें, फिर दोबारा कोशिश करें।' },
    unavailable: { title: 'हमारा सर्वर व्यस्त है', body: 'समस्या हमारी ओर से है। एक मिनट बाद कोशिश करें।' },
    server: { title: 'हमारी ओर से कुछ गड़बड़ हुई', body: 'यह काम पूरा नहीं हो सका। दोबारा कोशिश करें।' },
    bad_request: { title: 'यह नहीं हो सका', body: 'जानकारी जाँचें और दोबारा कोशिश करें।' },
  },
};

/** 403 `USER_INACTIVE`: the account is switched off, which is not a missing permission. */
const INACTIVE: Record<Locale, { title: string; body: string }> = {
  en: { title: 'Your account is not active', body: 'Contact support to turn it on again.' },
  hi: { title: 'आपका अकाउंट चालू नहीं है', body: 'इसे दोबारा चालू करने के लिए सहायता से संपर्क करें।' },
};

/** A title and body for any thrown value, in the page locale. */
export function describeError(error: unknown, locale: Locale = 'en'): { title: string; body: string; kind: ApiErrorKind } {
  const kind: ApiErrorKind = error instanceof ApiError ? error.kind : 'server';
  if (error instanceof ApiError && error.status === 403 && error.code === 'USER_INACTIVE') return { ...INACTIVE[locale], kind };
  const text = MESSAGES[locale][kind];
  // Validation and bad-request messages from the backend are specific, so show them.
  if (error instanceof ApiError && (kind === 'validation' || kind === 'bad_request' || kind === 'conflict') && error.message) {
    return { ...text, body: error.message, kind };
  }
  return { ...text, kind };
}

/**
 * Shows the messages of a 422 (`error.fields`) under their form fields.
 * By default only names that exist in the form values are set; `any` also sets
 * names of fields that are not mounted (steps of a wizard). `map` renames backend
 * names to form names. Returns the form names that got an error.
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  form: Pick<UseFormReturn<T>, 'setError' | 'getValues'>,
  opts: { map?: Record<string, string>; any?: boolean } = {},
): Path<T>[] {
  const fields = (error as { fields?: Record<string, string> } | null)?.fields ?? {};
  const applied: Path<T>[] = [];
  for (const [k, message] of Object.entries(fields)) {
    const name = (opts.map?.[k] ?? k) as Path<T>;
    if (!opts.any && !(name in form.getValues())) continue;
    form.setError(name, { message });
    applied.push(name);
  }
  return applied;
}
