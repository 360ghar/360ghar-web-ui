/**
 * Visit times, 9:00 to 19:00 every 30 minutes. Values are "HH:MM"; labels are
 * written by hand (not Intl) so the server and the browser print the same text.
 */
import type { Locale } from '@/lib/i18n/locale';

export const SLOTS = Array.from({ length: 21 }, (_, i) => {
  const m = 9 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
});

/** "5:30 pm", or "शाम 5:30" in Hindi. */
export function slotLabel(slot: string, locale: Locale = 'en'): string {
  const [h = 0, m = 0] = slot.split(':').map(Number);
  const hour12 = h % 12 || 12;
  const time = `${hour12}:${String(m).padStart(2, '0')}`;
  if (locale === 'hi') return `${h < 12 ? 'सुबह' : h < 16 ? 'दोपहर' : 'शाम'} ${time}`;
  return `${time} ${h < 12 ? 'am' : 'pm'}`;
}

export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** A slot is open when the day is after today, or it is today and the slot is at least 30 minutes away. Past days are closed. */
export const slotOpen = (day: string, slot: string, now: Date = new Date()) => {
  const today = isoDay(now);
  if (day !== today) return day > today;
  return new Date(`${day}T${slot}`).getTime() > now.getTime() + 30 * 60_000;
};
