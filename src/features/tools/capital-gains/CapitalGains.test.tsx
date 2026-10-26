import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CapitalGains from './CapitalGains';

describe('capital gains tool output', () => {
  it('shows only a clearly labelled pre-tax gain in English', () => {
    const html = renderToStaticMarkup(<CapitalGains locale="en" labels={{ loss: 'Below zero' }} />);

    expect(html).toContain('Pre-tax gain');
    expect(html).not.toContain('Estimated tax');
    expect(html).not.toMatch(/\d+(\.\d+)?%/);
  });

  it('shows only a clearly labelled pre-tax gain in Hindi', () => {
    const html = renderToStaticMarkup(<CapitalGains locale="hi" labels={{ loss: 'शून्य से कम' }} />);

    expect(html).toContain('कर-पूर्व लाभ');
    expect(html).not.toContain('Estimated tax');
    expect(html).not.toMatch(/\d+(\.\d+)?%/);
  });
});
