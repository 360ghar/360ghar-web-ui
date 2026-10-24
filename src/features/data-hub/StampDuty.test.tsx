import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import StampDuty from './StampDuty';

describe('stamp duty availability', () => {
  it('shows no rate or estimate before an official schedule is verified', () => {
    const html = renderToStaticMarkup(<StampDuty locale="en" sectors={[]} states />);

    expect(html).toContain('We have not verified an official schedule and effective date');
    expect(html).not.toMatch(/<input|<button|\d+%/);
  });

  it('shows the unavailable state in Hindi', () => {
    const html = renderToStaticMarkup(<StampDuty locale="hi" sectors={[]} states />);

    expect(html).toContain('आधिकारिक दर-सूची और लागू होने की तारीख सत्यापित नहीं है');
    expect(html).not.toContain('We have not verified');
    expect(html).not.toMatch(/<input|<button|\d+%/);
  });

  it('noindexes the notice and does not fetch circle-rate sectors', () => {
    const page = readFileSync(new URL('./StampDutyPage.astro', import.meta.url), 'utf8');
    const route = readFileSync(new URL('../../pages/stamp-duty-calculator.astro', import.meta.url), 'utf8');

    expect(page).toMatch(/noindex/);
    expect(route).not.toMatch(/circleSectors|safe\(/);
  });
});
