import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DeveloperDossier, safeHttpUrl } from './DeveloperDossier';
import { text } from './text';

const t = text('en');
// The fields the dossier reads; the rest of the wire type is optional for this check.
const dev = (over: Record<string, unknown>) => ({ slug: 'x', name: 'X', projects: [], ...over }) as unknown as Parameters<typeof DeveloperDossier>[0]['developer'];

describe('developer dossier', () => {
  it('links only http(s) websites', () => {
    expect(safeHttpUrl('https://example.org')).toBe('https://example.org/');
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('not a url')).toBeNull();
    const html = renderToStaticMarkup(<DeveloperDossier locale="en" developer={dev({ website_url: 'javascript:alert(1)' })} />);
    expect(html).not.toContain('javascript:');
  });

  it('shows the counts while the total score is pending, and no "undefined" founding year', () => {
    const html = renderToStaticMarkup(<DeveloperDossier locale="en" developer={dev({ score: { total_score: null, project_count: 4 }, summary: 'S' })} />);
    expect(html).toContain(t.ddScorePending);
    expect(html).toContain(t.ddProjects);
    expect(html).not.toContain('undefined');
  });
});
