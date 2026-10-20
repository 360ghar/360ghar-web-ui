/**
 * A calendar file (RFC 5545) for one visit. Times are written in UTC with a
 * trailing Z, so every calendar shows the right local time (Asia/Kolkata for
 * the visit itself). The UID comes from the visit id, so adding the same visit
 * twice updates one event instead of making two.
 */

type IcsVisit = {
  id: number;
  /** ISO date-time from the API. */
  start: string;
  /** When the visit was booked (DTSTAMP). ISO date-time. */
  booked: string;
  title: string;
  address?: string | null;
  url: string;
  minutes?: number;
};

/** 2026-09-30T06:00:00.000Z -> 20260930T060000Z */
const icsTime = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Text values: backslash, semicolon, comma and new lines are escaped. */
export const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Lines longer than 75 octets are folded (CRLF + space), never inside a character. */
export function fold(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = '';
  let bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    // The first line takes 75 octets; each folded line starts with a space, so 74.
    if (bytes + n > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = '';
      bytes = 0;
    }
    cur += ch;
    bytes += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}

export function visitIcs(v: IcsVisit): string {
  const start = new Date(v.start);
  const end = new Date(start.getTime() + (v.minutes ?? 60) * 60_000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//360Ghar//Visits//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:visit-${v.id}@360ghar.com`,
    `DTSTAMP:${icsTime(new Date(v.booked))}`,
    `DTSTART:${icsTime(start)}`,
    `DTEND:${icsTime(end)}`,
    `SUMMARY:${icsText(`360Ghar visit: ${v.title}`)}`,
    ...(v.address ? [`LOCATION:${icsText(v.address)}`] : []),
    `DESCRIPTION:${icsText(v.url)}`,
    `URL:${v.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
