import { describe, expect, it } from 'vitest';
import { STATIC_PATHS } from '@/features/feeds/data';
import { LANDMARKS, nearAlias } from './loadNear';

describe('near pages', () => {
  it('lists in the sitemap only landmarks that exist', () => {
    const slugs = new Set(LANDMARKS.map((l) => l.slug));
    for (const p of STATIC_PATHS.filter((x: string) => x.startsWith('/near/'))) expect(slugs.has(p.slice(6)), p).toBe(true);
  });

  it('sends a close slug to its landmark and leaves other slugs as 404', () => {
    expect(nearAlias('golf-course-road')?.slug).toBe('golf-course-road-corporate');
    expect(nearAlias('medanta-hospital')?.slug).toBe('medanta');
    expect(nearAlias('cyber-city')).toBeNull();
    expect(nearAlias('nowhere')).toBeNull();
    expect(nearAlias('sec')).toBeNull();
  });
});
