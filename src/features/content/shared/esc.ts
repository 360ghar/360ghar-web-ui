/**
 * Escapes text for HTML (also safe inside a double-quoted attribute).
 * Kept apart from cms.ts: browser code (the chat panel) imports it, and cms.ts
 * pulls in the server-only HTML sanitizer.
 */
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
