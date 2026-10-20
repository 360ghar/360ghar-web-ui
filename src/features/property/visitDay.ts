/**
 * The `?visit_date=YYYY-MM-DD` parameter of the property page. WebMCP
 * `schedule_visit` links to it so the visit form opens on the wanted day.
 * The form only preselects the day; the user still picks a time and submits.
 */
import { isoDay, slotOpen, SLOTS } from './slots';

/** The day buttons of the visit form: today and the next six days. */
export const VISIT_WINDOW_DAYS = 7;

/**
 * The day from the URL when it is a real date inside the offered window and
 * still has an open slot (today may be too late). Anything else (bad format,
 * 2026-02-30, past, too far ahead, script text, arrays) gives null, silently.
 */
export function visitDayFromParam(raw: unknown, now: Date = new Date()): string | null {
  if (typeof raw !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  const offered = Array.from({ length: VISIT_WINDOW_DAYS }, (_, i) => isoDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)));
  if (!offered.includes(raw)) return null;
  return SLOTS.some((s) => slotOpen(raw, s, now)) ? raw : null;
}
