import { describe, expect, it } from 'vitest';
import { coverScene, coverScenes, hasRealCover } from './cover';
import { paperArt, SCENE_NAMES } from './scenes';

describe('blog covers', () => {
  it('treats seed placeholders and empty covers as missing', () => {
    expect(hasRealCover('https://res.cloudinary.com/x/image/upload/v1/360ghar/360ghar/seed/blogs/a_cover.jpg')).toBe(false);
    expect(hasRealCover(null)).toBe(false);
    expect(hasRealCover('')).toBe(false);
    expect(hasRealCover('https://res.cloudinary.com/x/image/upload/v1/360ghar/blogs/real.jpg')).toBe(true);
  });

  it('picks a scene from the title, then the tags, then the category', () => {
    expect(coverScene({ slug: 'a', title: 'How 360 Virtual Tours Are Transforming Discovery' })).toBe('tour');
    expect(coverScene({ slug: 'b', title: 'Dwarka Expressway: The Next Big Corridor' })).toBe('flyover');
    expect(coverScene({ slug: 'c', title: 'Understanding RERA', categories: [] })).toBe('seal');
    expect(coverScene({ slug: 'd', title: 'Monsoon checklist', tags: [{ id: 1, name: 'PG & Flatmates', slug: 'pg', created_at: '' }] })).toBe('room');
    expect(['tolet', 'room', 'keys']).toContain(coverScene({ slug: 'e', title: 'A short note', categories: [{ id: 1, name: 'Rental Tips', slug: 'rental-tips', created_at: '' }] }));
  });

  it('gives a list no scene twice within three cards', () => {
    const titles = ['Manesar industrial hub investment', 'Rental yield by sector', 'Affordable sectors under 50 lakhs', 'Emerging sectors for budget buyers', 'Old vs new Gurgaon'];
    const scenes = coverScenes(titles.map((title, i) => ({ slug: `s${i}`, title })));
    for (let i = 1; i < scenes.length; i += 1) expect(scenes.slice(Math.max(0, i - 3), i)).not.toContain(scenes[i]);
  });

  it('draws every scene the same way twice, and differently for another seed', () => {
    for (const name of SCENE_NAMES) {
      const a = JSON.stringify(paperArt(name, 'x'));
      expect(JSON.stringify(paperArt(name, 'x'))).toBe(a);
      expect(JSON.stringify(paperArt(name, 'y'))).not.toBe(a);
      expect(paperArt(name, 'x').id).not.toBe(paperArt(name, 'x', { wide: true }).id);
    }
  });
});
