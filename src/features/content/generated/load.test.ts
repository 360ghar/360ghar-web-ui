import { describe, expect, it } from 'vitest';
import { parseGenerated } from './load';

const block = (over: Record<string, unknown> = {}) => ({
  body: { summary: ' A sector. ', highlights: ['One', '', 3], faqs: [{ question: 'Q?', answer: 'A.' }, { question: 'x' }], meta_description: 'Meta' },
  sources: [{ name: 'HSVP', url: 'https://hsvp.gov.in' }, { name: 'RERA', url: 'javascript:alert(1)' }, { url: 'https://x.y' }],
  data_as_of: null,
  updated_at: '2026-10-01T00:00:00Z',
  indexable: true,
  ...over,
});

describe('parseGenerated', () => {
  it('keeps only valid fields and safe source links', () => {
    expect(parseGenerated(block())).toEqual({
      summary: 'A sector.',
      highlights: ['One'],
      faqs: [{ q: 'Q?', a: 'A.' }],
      whoItSuits: null,
      pros: [],
      cons: [],
      metaDescription: 'Meta',
      date: '2026-10-01T00:00:00Z',
      sources: [{ label: 'HSVP', href: 'https://hsvp.gov.in' }, { label: 'RERA' }],
    });
  });
  it('gives null for missing, thin or empty blocks', () => {
    expect(parseGenerated(null)).toBeNull();
    expect(parseGenerated(block({ indexable: false }))).toBeNull();
    expect(parseGenerated(block({ body: { summary: '  ' } }))).toBeNull();
  });
});
