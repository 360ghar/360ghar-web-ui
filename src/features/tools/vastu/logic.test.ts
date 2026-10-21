import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { analyze, checkFile, elapsed, scoreBand, scoreStats, statusOf, zoneAt, zoneOf, zoneSummary } from './logic';

describe('checkFile', () => {
  it('accepts JPEG, PNG and WebP up to 5 MB', () => {
    expect(checkFile({ type: 'image/png', size: 1000 })).toBeNull();
    expect(checkFile({ type: 'image/webp', size: 5 * 1024 * 1024 })).toBeNull();
  });
  it('rejects other types and big files', () => {
    expect(checkFile({ type: 'image/gif', size: 10 })).toBe('type');
    expect(checkFile({ type: 'application/pdf', size: 10 })).toBe('type');
    expect(checkFile({ type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 })).toBe('size');
  });
});

describe('scoreBand', () => {
  it('uses the old bands', () => {
    expect(scoreBand(10)).toBe('Excellent');
    expect(scoreBand(8)).toBe('Excellent');
    expect(scoreBand(7)).toBe('Good');
    expect(scoreBand(6)).toBe('Good');
    expect(scoreBand(5)).toBe('NeedsImprovement');
    expect(scoreBand(3.9)).toBe('Poor');
  });
});

describe('zoneOf', () => {
  it('reads codes, words and messy text', () => {
    expect(zoneOf('NE')).toBe('NE');
    expect(zoneOf('north-east')).toBe('NE');
    expect(zoneOf(' South West ')).toBe('SW');
    expect(zoneOf('Centre')).toBe('C');
    expect(zoneOf('Brahmasthan')).toBe('C');
  });
  it('returns null for anything else', () => {
    expect(zoneOf('None')).toBeNull();
    expect(zoneOf('')).toBeNull();
    expect(zoneOf(undefined)).toBeNull();
    expect(zoneOf('constructor')).toBeNull();
  });
});

describe('zoneAt', () => {
  const edge = (north: 'up' | 'right' | 'down' | 'left' | 'unknown') => ({
    top: zoneAt(0, 1, north),
    right: zoneAt(1, 2, north),
    bottom: zoneAt(2, 1, north),
    left: zoneAt(1, 0, north),
    corner: zoneAt(0, 0, north),
  });
  it('puts N on the side the person marked', () => {
    expect(edge('up').top).toBe('N');
    expect(edge('right').right).toBe('N');
    expect(edge('down').bottom).toBe('N');
    expect(edge('left').left).toBe('N');
  });
  it('turns the other zones with it', () => {
    expect(edge('up')).toEqual({ top: 'N', right: 'E', bottom: 'S', left: 'W', corner: 'NW' });
    expect(edge('right')).toEqual({ top: 'W', right: 'N', bottom: 'E', left: 'S', corner: 'SW' });
    expect(edge('down')).toEqual({ top: 'S', right: 'W', bottom: 'N', left: 'E', corner: 'SE' });
    expect(edge('left')).toEqual({ top: 'E', right: 'S', bottom: 'W', left: 'N', corner: 'NE' });
  });
  it('reads unknown as north up and always keeps the centre', () => {
    expect(edge('unknown')).toEqual(edge('up'));
    for (const n of ['up', 'right', 'down', 'left'] as const) expect(zoneAt(1, 1, n)).toBe('C');
  });
});

describe('zoneSummary', () => {
  const plan = [
    { name: 'Living Room', direction: 'N' },
    { name: 'Dining', direction: 'S' },
    { name: 'Toilet', direction: 'E' },
    { name: 'Store', direction: 'somewhere' },
  ];
  const analysis = [
    { room: 'Toilet', direction: 'E', status: 'problematic' },
    { room: 'Kitchen', direction: 'SE', status: 'excellent' },
    { room: 'Main Entrance', direction: 'N', status: 'excellent' },
    { room: 'Dining Room', direction: 'S', status: 'good' },
    { room: 'Study', direction: 'E', status: 'good' },
  ];
  const { zones, other } = zoneSummary(plan, analysis);
  it('takes the worst status in a zone', () => {
    expect(zones.E.status).toBe('problematic');
    expect(zones.SE.status).toBe('excellent');
    expect(zones.W.status).toBeNull();
    expect(zones.W.rooms).toEqual([]);
  });
  it('lists a plan room the analysis skipped, without a status, and joins Dining with Dining Room', () => {
    expect(zones.N.rooms.map((r) => r.name)).toEqual(['Main Entrance', 'Living Room']);
    expect(zones.N.status).toBe('excellent');
    expect(zones.S.rooms.map((r) => r.name)).toEqual(['Dining Room']);
    expect(zones.E.rooms.map((r) => r.name)).toEqual(['Toilet', 'Study']);
  });
  it('keeps rooms with no readable direction apart', () => {
    expect(other).toEqual([{ name: 'Store', status: null }]);
  });
  it('accepts empty input', () => {
    expect(zoneSummary().other).toEqual([]);
    expect(zoneSummary().zones.C.status).toBeNull();
  });
});

describe('statusOf', () => {
  it('knows the five backend statuses, and reads any other value as no status', () => {
    for (const s of ['excellent', 'good', 'neutral', 'concerning', 'problematic']) expect(statusOf(s)).toBe(s);
    for (const s of ['fine', 'GOOD', '', null, undefined]) expect(statusOf(s)).toBeNull();
  });
  it('does not count a room with an unknown status as good or as a concern', () => {
    expect(scoreStats([{ status: 'fine' }, { status: 'good' }, { status: 'problematic' }], 0)).toEqual({ rooms: 3, good: 1, attention: 1, defects: 0 });
  });
});

describe('scoreStats', () => {
  it('counts rooms that work, rooms that need attention and defects', () => {
    const rows = ['excellent', 'good', 'neutral', 'concerning', 'problematic'].map((status) => ({ status }));
    expect(scoreStats(rows, 2)).toEqual({ rooms: 5, good: 2, attention: 2, defects: 2 });
    expect(scoreStats(undefined, 0)).toEqual({ rooms: 0, good: 0, attention: 0, defects: 0 });
  });
});

describe('elapsed', () => {
  it('formats minutes and seconds', () => {
    expect(elapsed(0)).toBe('0:00');
    expect(elapsed(9.7)).toBe('0:09');
    expect(elapsed(75)).toBe('1:15');
  });
});

describe('analyze', () => {
  afterEach(() => vi.unstubAllGlobals());
  const file = new File([new Uint8Array([1, 2, 3])], 'plan.png', { type: 'image/png' });

  it('sends multipart fields and returns the result', async () => {
    const fetchMock = vi.fn(async (req: Request) => {
      const body = await req.formData();
      expect(body.get('north_direction')).toBe('left');
      expect(body.get('notes')).toBe('corner plot');
      expect((body.get('image') as File).name).toBe('plan.png');
      return new Response(JSON.stringify({ provider_used: 'agnes', data: { vastu_score: 7 } }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const r = await analyze(file, 'left', 'corner plot');
    expect(r.data.vastu_score).toBe(7);
    expect(fetchMock.mock.calls[0]![0].url).toMatch(/\/api\/v1\/vastu\/analyze$/);
  });

  it('turns a 400 into an ApiError with the backend message', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ error: { code: 'BAD_REQUEST', message: 'File too large. Max 5MB.' } }), { status: 400 }));
    const e = await analyze(file, 'up', '').catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect((e as ApiError).kind).toBe('bad_request');
    expect((e as ApiError).message).toBe('File too large. Max 5MB.');
  });

  it('reads a 502 VASTU_UNUSABLE_OUTPUT as a server-side failure with its code', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ error: { code: 'VASTU_UNUSABLE_OUTPUT', message: 'The analysis could not be read. Try again.' } }), { status: 502 }));
    const e = (await analyze(file, 'up', '').catch((x: unknown) => x)) as ApiError;
    expect(e).toBeInstanceOf(ApiError);
    expect(e.code).toBe('VASTU_UNUSABLE_OUTPUT');
    expect(e.kind).toBe('unavailable');
    expect(e.message).toBe('The analysis could not be read. Try again.');
  });

  it('maps a network failure to kind "network"', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('Failed to fetch');
    });
    const e = (await analyze(file, 'up', '').catch((x: unknown) => x)) as ApiError;
    expect(e.kind).toBe('network');
  });
});
