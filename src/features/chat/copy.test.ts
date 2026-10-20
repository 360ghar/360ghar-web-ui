import { describe, expect, it } from 'vitest';
import { chatCopy, humanize, valueLabel } from './copy';

describe('humanize', () => {
  it('replaces underscores and capitalizes', () => {
    expect(humanize('in_progress')).toBe('In progress');
    expect(humanize('awaiting__vendor  reply')).toBe('Awaiting vendor reply');
    expect(humanize('x')).toBe('X');
  });
  it('is blank only for a blank input', () => {
    expect(humanize('')).toBe('');
    expect(humanize('  _ ')).toBe('');
  });
});

describe('valueLabel', () => {
  const en = chatCopy('en');
  const hi = chatCopy('hi');

  it('translates every known value in both languages', () => {
    expect(Object.keys(hi.values).sort()).toEqual(Object.keys(en.values).sort());
    for (const key of Object.keys(en.values)) {
      expect(valueLabel(en, key), key).toBe(en.values[key]);
      expect(valueLabel(hi, key), key).toBe(hi.values[key]);
      expect(valueLabel(hi, key).length).toBeGreaterThan(0);
    }
    expect(valueLabel(en, 'pending_signature')).toBe('Waiting for signature');
    expect(valueLabel(hi, 'overdue')).toBe('बकाया');
  });

  it('matches case and separators loosely', () => {
    expect(valueLabel(en, 'In Review')).toBe('In review');
    expect(valueLabel(en, 'BANK-TRANSFER')).toBe('Bank transfer');
  });

  it('falls back to a humanized value for unknown values, never blank', () => {
    expect(valueLabel(en, 'awaiting_vendor')).toBe('Awaiting vendor');
    expect(valueLabel(hi, 'awaiting_vendor')).toBe('Awaiting vendor');
    expect(valueLabel(en, 'Some New Status')).toBe('Some New Status');
    expect(valueLabel(en, '__proto__')).toBe('Proto');
    expect(valueLabel(en, 'constructor')).toBe('Constructor');
    expect(valueLabel(en, 'toString')).toBe('ToString');
  });

  it('returns empty for a missing value (the renderer then hides it)', () => {
    expect(valueLabel(en, null)).toBe('');
    expect(valueLabel(en, undefined)).toBe('');
    expect(valueLabel(en, '')).toBe('');
  });
});

describe('history labels in Hindi', () => {
  it('are Hindi and carry the conversation title', () => {
    const hi = chatCopy('hi');
    expect(hi.deleteConversation('2 BHK')).toBe('बातचीत हटाएं: 2 BHK');
    for (const text of [hi.history, hi.historyBack, hi.deleteAsk, hi.deleteYes, hi.deleteNo, hi.deleted, hi.opening, hi.untitled, hi.messageCount(3)]) {
      expect(text).toMatch(/[\u0900-\u097F]/);
    }
  });
});
