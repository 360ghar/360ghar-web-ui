// Persists the last successfully used auth method so the login screen can
// pre-select / highlight it on the user's next visit.
//
// Stored under localStorage key "360ghar:lastAuthMethod" as:
//   { method, identifierHint, ts }
// where `method` is one of the backend AuthMethod values
// ("google" | "email_password" | "phone_password" | "phone_otp" | "email_otp")
// and `identifierHint` is a masked email/phone (never the raw value).

const STORAGE_KEY = '360ghar:lastAuthMethod';

export const AUTH_METHODS = Object.freeze({
  GOOGLE: 'google',
  EMAIL_PASSWORD: 'email_password',
  PHONE_PASSWORD: 'phone_password',
  PHONE_OTP: 'phone_otp',
  EMAIL_OTP: 'email_otp',
});

const VALID_METHODS = new Set(Object.values(AUTH_METHODS));

// Mask an identifier so the persisted hint never stores the raw value.
//  - email: keeps first char + domain, e.g. "j***@gmail.com"
//  - phone: keeps the last 4 digits, e.g. "*****6789"
export function maskIdentifier(identifier) {
  const value = (identifier || '').trim();
  if (!value) return '';

  if (value.includes('@')) {
    const [local, domain] = value.split('@');
    const head = local.slice(0, 1);
    return `${head}***@${domain || ''}`;
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  return `*****${digits.slice(-4)}`;
}

export function getLastAuthMethod() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !VALID_METHODS.has(parsed.method)) return null;
    return {
      method: parsed.method,
      identifierHint: parsed.identifierHint || '',
      ts: parsed.ts || null,
    };
  } catch {
    return null;
  }
}

export function setLastAuthMethod(method, identifier) {
  if (!VALID_METHODS.has(method)) return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        method,
        identifierHint: maskIdentifier(identifier),
        ts: Date.now(),
      })
    );
  } catch {
    // Ignore storage quota / private-mode failures.
  }
}

export function clearLastAuthMethod() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures during cleanup.
  }
}
