import { describe, expect, it } from 'vitest';
import landmarks from '@/data/office-landmarks.json';
import localities from '@/data/localities.json';
import { ENTITY_KIND, kindForLandmark } from './vignette';

type Row = { entityType?: string };
const rows: Row[] = Array.isArray(localities) ? (localities as Row[]) : (Object.values(localities).find(Array.isArray) as Row[]);

describe('place kinds cover the data', () => {
  it('reads the localities rows', () => {
    expect(rows.length).toBeGreaterThan(500);
  });

  it('maps every office landmark type, so none falls back to a city', () => {
    const types = new Set((landmarks as { type: string }[]).map((l) => l.type));
    expect([...types].filter((t) => kindForLandmark({ type: t }) === 'city')).toEqual([]);
  });

  it('draws Hero Honda Chowk as a road from its data kind, and other landmarks by type', () => {
    const lm = (landmarks as { slug: string; type: string; kind?: string }[]).find((l) => l.slug === 'hero-honda-chowk')!;
    expect(kindForLandmark(lm as Parameters<typeof kindForLandmark>[0])).toBe('road');
    expect(kindForLandmark({ type: 'it_hub' })).toBe('office');
    expect(kindForLandmark({ type: 'unknown' })).toBe('city');
  });

  it('maps every locality entity type, so none falls back to a locality', () => {
    const types = new Set(rows.map((r) => (r.entityType ?? '').toLowerCase()));
    expect([...types].filter((t) => !Object.hasOwn(ENTITY_KIND, t))).toEqual([]);
  });
});
