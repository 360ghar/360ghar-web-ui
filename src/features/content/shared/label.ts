/**
 * Splits old copy like "Strategic Location: Just 30 minutes from Delhi" into a
 * bold label and the rest. Only a short leading label counts, so a sentence
 * that merely contains a colon stays whole.
 */
export function splitLabel(s: string): { label: string; text: string } {
  const i = s.indexOf(':');
  if (i < 1 || i > 40) return { label: '', text: s.trim() };
  const text = s.slice(i + 1).trim();
  return text ? { label: s.slice(0, i).trim(), text } : { label: '', text: s.trim() };
}

/** "1. Buy and Hold Strategy" -> { n: "1", text: "Buy and Hold Strategy" }. */
export function splitNumber(s: string): { n: string; text: string } {
  const m = s.match(/^\s*(\d+)[.)]\s+(.*)$/);
  return m ? { n: m[1]!, text: m[2]!.trim() } : { n: '', text: s.trim() };
}
