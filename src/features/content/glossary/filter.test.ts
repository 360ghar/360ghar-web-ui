import { describe, expect, it } from 'vitest';
import { GLOSSARY } from './data';
import { ALL, filterGlossary, lettersOf } from './filter';

describe('glossary filter', () => {
  it('lists only letters that have terms', () => {
    const letters = lettersOf(GLOSSARY);
    expect(letters[0]).toBe('B');
    expect(letters).toContain('R');
    expect(letters).not.toContain('A');
  });

  it('filters by letter and by text', () => {
    expect(filterGlossary(GLOSSARY, '', 'R').map((e) => e.term)).toEqual(['RERA', 'Ready to Move']);
    expect(filterGlossary(GLOSSARY, 'stamp', ALL).map((e) => e.term)).toContain('Stamp Duty');
    expect(filterGlossary(GLOSSARY, '  CARPET ', ALL).map((e) => e.term)).toContain('Carpet Area');
    expect(filterGlossary(GLOSSARY, 'stamp', 'B')).toEqual([]);
    expect(filterGlossary(GLOSSARY, '', ALL)).toHaveLength(GLOSSARY.length);
  });
});
