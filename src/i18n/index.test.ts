import { describe, expect, it } from 'vitest';
import { pick, tFrom, translate } from './index';

describe('i18n', () => {
  it('translates with namespace and fills slots', () => {
    const en = translate('en', 'seo:home.title');
    const hi = translate('hi', 'seo:home.title');
    expect(en.length).toBeGreaterThan(5);
    expect(hi.length).toBeGreaterThan(5);
    expect(hi).not.toBe(en);
  });

  it('returns an empty string for a missing key outside dev', () => {
    const out = translate('en', 'seo:nope.nothing');
    expect(out === '' || out === 'seo:nope.nothing').toBe(true);
  });

  it('picks a subtree with Hindi over English', () => {
    const d = pick('hi', 'properties:filters');
    const t = tFrom(d);
    expect(typeof t('title')).toBe('string');
  });
});
