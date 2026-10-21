import type { GlossaryEntry } from './data';

export const ALL = 'ALL';

const first = (e: GlossaryEntry) => e.term.charAt(0).toUpperCase();

/** Letters that have at least one term, sorted. */
export function lettersOf(entries: GlossaryEntry[]): string[] {
  return [...new Set(entries.map(first))].sort();
}

/** Case-insensitive match on term, question or answer, plus the A-Z letter. */
export function filterGlossary(entries: GlossaryEntry[], query: string, letter: string): GlossaryEntry[] {
  const q = query.trim().toLowerCase();
  return entries.filter(
    (e) => (letter === ALL || first(e) === letter) && (!q || e.term.toLowerCase().includes(q) || e.question.toLowerCase().includes(q) || e.answer.toLowerCase().includes(q)),
  );
}
