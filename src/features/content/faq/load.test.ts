import { describe, expect, it } from 'vitest';
import { toFaqItems } from './load';

const faq = (id: number, order: number, extra: Partial<{ is_active: boolean; question: string; answer: string }> = {}) => ({
  id,
  question: `Q${id}`,
  answer: `A${id}`,
  category: null,
  tags: null,
  display_order: order,
  is_active: true,
  created_at: '2026-06-21T00:00:00Z',
  updated_at: null,
  ...extra,
});

describe('toFaqItems', () => {
  it('keeps active items in display order', () => {
    const items = toFaqItems([faq(1, 3), faq(2, 1), faq(3, 2, { is_active: false }), faq(4, 1)]);
    expect(items.map((f) => f.q)).toEqual(['Q2', 'Q4', 'Q1']);
  });

  it('drops empty questions or answers', () => {
    expect(toFaqItems([faq(1, 1, { answer: '  ' }), faq(2, 2, { question: '' })])).toEqual([]);
  });
});
