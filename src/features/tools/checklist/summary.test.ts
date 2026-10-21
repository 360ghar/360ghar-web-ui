import { describe, expect, it } from 'vitest';
import { fileSize, progress, summaryText, type Group } from './summary';

const groups: Group[] = [
  { title: 'Legal', items: [{ id: 1, text: 'Title deed', desc: '' }, { id: 2, text: 'EC', desc: '' }] },
  { title: 'Tax', items: [{ id: 3, text: 'Tax receipts', desc: '' }] },
];

describe('checklist', () => {
  it('counts only ticked documents that exist', () => {
    expect(progress(groups, {})).toEqual({ done: 0, total: 3, pct: 0 });
    expect(progress(groups, { 1: true, 3: true, 2: false, 99: true })).toEqual({ done: 2, total: 3, pct: 67 });
  });

  it('builds a plain-text summary with file names', () => {
    const text = summaryText('Checklist', groups, { 1: true }, { 2: { name: 'ec.pdf', size: 10 } }, 'Done: 1 of 3');
    expect(text).toBe(['Checklist', '', 'Legal', '  [x] Title deed', '  [ ] EC (ec.pdf)', '', 'Tax', '  [ ] Tax receipts', '', 'Done: 1 of 3'].join('\n'));
  });

  it('formats file sizes', () => {
    expect(fileSize(500)).toBe('500 B');
    expect(fileSize(1536)).toBe('1.5 KB');
    expect(fileSize(2 * 1024 * 1024)).toBe('2 MB');
  });
});
