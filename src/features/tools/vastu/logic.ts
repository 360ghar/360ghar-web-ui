/**
 * Pure helpers for the Vastu checker: file checks (same rules as the
 * backend: JPEG, PNG or WebP, 5 MB or less), the score band, the elapsed-time
 * label, string slots and the request itself.
 */
import { api, call, multipart, timeoutMs } from '@/lib/api/client';
import { exactEnum } from '@/lib/api/enums';
import type { components } from '@/lib/api/schema';

export type VastuResponse = components['schemas']['VastuAnalyzeResponse'];
export type VastuResult = components['schemas']['VastuAnalysisResult'];
export type North = components['schemas']['NorthDirection'];

/** In the order the picker shows them. Checked against the backend `NorthDirection` enum at build time. */
export const NORTH = exactEnum<North>()(['up', 'right', 'down', 'left', 'unknown']);
export const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_MB = 5;
export const MAX_NOTES = 1000;
export const TIMEOUT_MS = 180_000;

/** Null when the file is fine, else the reason. */
export function checkFile(file: { type: string; size: number }): 'type' | 'size' | null {
  if (!ACCEPT.includes(file.type)) return 'type';
  if (file.size > MAX_MB * 1024 * 1024) return 'size';
  return null;
}

export type Band = 'Excellent' | 'Good' | 'NeedsImprovement' | 'Poor';

/** Same bands as the old score card: 8+, 6+, 4+, below 4. */
export function scoreBand(score: number): Band {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'NeedsImprovement';
  return 'Poor';
}

/* ---------- Zones: the plan read as eight directions and a centre ---------- */

export type Zone = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'C';
/** The backend `VastuStatus`. `STATUS_RANK` below lists every value, so a value the backend adds fails the build there. */
export type Status = components['schemas']['VastuStatus'];

/** The map with north at the top. */
const GRID: Zone[][] = [
  ['NW', 'N', 'NE'],
  ['W', 'C', 'E'],
  ['SW', 'S', 'SE'],
];

/** Which zone lies at (row, col) of an image whose north side is `north`. Unknown reads as north up. */
export function zoneAt(row: number, col: number, north: North): Zone {
  switch (north) {
    case 'right':
      return GRID[2 - col]![row]!;
    case 'down':
      return GRID[2 - row]![2 - col]!;
    case 'left':
      return GRID[col]![2 - row]!;
    default:
      return GRID[row]![col]!;
  }
}

const ZONE_WORDS = new Map<string, Zone>([
  ['n', 'N'], ['north', 'N'],
  ['ne', 'NE'], ['northeast', 'NE'],
  ['e', 'E'], ['east', 'E'],
  ['se', 'SE'], ['southeast', 'SE'],
  ['s', 'S'], ['south', 'S'],
  ['sw', 'SW'], ['southwest', 'SW'],
  ['w', 'W'], ['west', 'W'],
  ['nw', 'NW'], ['northwest', 'NW'],
  ['c', 'C'], ['center', 'C'], ['centre', 'C'], ['central', 'C'], ['middle', 'C'], ['brahmasthan', 'C'],
]);

/** "NE", "North-East", "north east" -> "NE". Null when the text is not a direction. */
export function zoneOf(direction: string | null | undefined): Zone | null {
  return ZONE_WORDS.get((direction ?? '').toLowerCase().replace(/[^a-z]/g, '')) ?? null;
}

/** 0 is best, 4 is worst. */
export const STATUS_RANK: Record<Status, number> = { excellent: 0, good: 1, neutral: 2, concerning: 3, problematic: 4 };

/** A backend status, or null for any other value (it is never read as a known status). */
export function statusOf(status: string | null | undefined): Status | null {
  return status && Object.hasOwn(STATUS_RANK, status) ? (status as Status) : null;
}

type ZoneRoom = { name: string; status: Status | null };
type ZoneInfo = { rooms: ZoneRoom[]; status: Status | null };

const sameRoom = (a: string, b: string) => {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  return x === y || x.startsWith(y) || y.startsWith(x);
};

/**
 * Rooms per zone with the worst status in each. Rooms come from the analysis
 * rows (they carry a status) and from the plan's room list when the analysis
 * skipped them ("Dining" and "Dining Room" count as one). Rooms with no
 * readable direction go to `other`.
 */
export function zoneSummary(
  planRooms: { name: string; direction: string }[] = [],
  analysis: { room: string; direction: string; status: string }[] = [],
): { zones: Record<Zone, ZoneInfo>; other: ZoneRoom[] } {
  const empty = (): ZoneInfo => ({ rooms: [], status: null });
  const zones: Record<Zone, ZoneInfo> = { N: empty(), NE: empty(), E: empty(), SE: empty(), S: empty(), SW: empty(), W: empty(), NW: empty(), C: empty() };
  const other: ZoneRoom[] = [];
  const put = (direction: string, room: ZoneRoom) => {
    const z = zoneOf(direction);
    if (!z) return void other.push(room);
    const info = zones[z];
    info.rooms.push(room);
    if (room.status && (info.status === null || STATUS_RANK[room.status] > STATUS_RANK[info.status])) info.status = room.status;
  };
  for (const a of analysis) put(a.direction, { name: a.room, status: statusOf(a.status) });
  for (const r of planRooms) if (!analysis.some((a) => sameRoom(a.room, r.name))) put(r.direction, { name: r.name, status: null });
  return { zones, other };
}

/** Counts for the score slip. */
export function scoreStats(analysis: { status: string }[] = [], defects = 0) {
  const ranks = analysis.map((a) => {
    const s = statusOf(a.status);
    return s === null ? null : STATUS_RANK[s];
  });
  return { rooms: ranks.length, good: ranks.filter((r) => r !== null && r <= 1).length, attention: ranks.filter((r) => r !== null && r >= 3).length, defects };
}

/** Fills `{{name}}` slots in a backend string. */
export const fill = (s: string | undefined, vars: Record<string, string | number>) =>
  (s ?? '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => String(vars[k] ?? ''));

/** 75 -> "1:15". */
export function elapsed(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * POST /api/v1/vastu/analyze (multipart). The analysis can take up to 3
 * minutes, so the call has its own timeout instead of the shared 15 s.
 * A 200 always carries `data`. Failures are typed ApiErrors: network, timeout,
 * 400 or 422 with the backend message, 502 VASTU_UNUSABLE_OUTPUT when the
 * model output could not be used (try again), 5xx.
 */
export function analyze(file: File, north: North, notes: string, signal?: AbortSignal): Promise<VastuResponse> {
  const body = new FormData();
  body.append('image', file);
  body.append('north_direction', north);
  body.append('notes', notes);
  return call(api.POST('/api/v1/vastu/analyze', { ...multipart(body), ...timeoutMs(TIMEOUT_MS), ...(signal ? { signal } : {}) }));
}
