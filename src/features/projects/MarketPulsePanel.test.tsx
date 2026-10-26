import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MarketPulsePanel } from './MarketPulsePanel';
import type { MarketPulse } from './types';

/**
 * The pulse table as the API serves it today: no register publishes a rate per
 * square foot, so both price fields are null on every row.
 */
const reading = (over: Partial<MarketPulse> = {}): MarketPulse => ({
  city: 'new delhi',
  captured_on: '2026-10-23',
  sentiment: 'unknown',
  avg_price_per_sqft: null,
  price_change_90d_pct: null,
  new_registrations: null,
  new_complaints: null,
  computed_at: '2026-10-23T22:16:51Z',
  ...over,
});

describe('MarketPulsePanel', () => {
  it('draws no price column when no reading carries a price', () => {
    // A column of dashes reads as a figure that is merely pending. No source for
    // it exists, so the column is left out rather than shown empty. The counts
    // keep their dashes: those are readings that were not taken, which is a
    // different fact and is labelled as such in the sentiment column.
    const html = renderToStaticMarkup(<MarketPulsePanel locale="en" rows={[reading()]} />);

    expect(html).not.toContain('Average price');
    expect(html).not.toContain('90-day change');
    expect(html).toContain('New registrations');
    expect(html).toContain('Not read');
  });

  it('draws the price column as soon as one reading carries a price', () => {
    // Self-healing: wiring a price source brings the column back with no change
    // to this component.
    const html = renderToStaticMarkup(
      <MarketPulsePanel
        locale="en"
        rows={[reading(), reading({ city: 'gurugram', avg_price_per_sqft: 6000 })]}
      />
    );

    expect(html).toContain('Average price');
    // The city without a price still shows a dash, because the column exists.
    expect(html).toContain('—');
  });

  it('draws the 90-day column on its own, because a price is not a change', () => {
    // A price with no earlier price to compare against is a real state: the
    // change column has its own condition rather than riding on the price one.
    const html = renderToStaticMarkup(
      <MarketPulsePanel
        locale="en"
        rows={[reading({ avg_price_per_sqft: 6000, price_change_90d_pct: null })]}
      />
    );

    expect(html).toContain('Average price');
    expect(html).not.toContain('90-day change');

    const withChange = renderToStaticMarkup(
      <MarketPulsePanel
        locale="en"
        rows={[reading({ avg_price_per_sqft: 6000, price_change_90d_pct: 4.2 })]}
      />
    );
    expect(withChange).toContain('90-day change');
    expect(withChange).toContain('up 4.2%');
  });

  it('shows a dash for a count that was not taken and a number for one that was', () => {
    const html = renderToStaticMarkup(
      <MarketPulsePanel
        locale="en"
        rows={[
          reading({ city: 'new delhi', new_registrations: null }),
          reading({ city: 'gurugram', new_registrations: 0, sentiment: 'neutral' }),
        ]}
      />
    );

    // "Not read" is the sentiment label for an unmeasured reading, and it must
    // not be shown as a zero anywhere on the row.
    expect(html).toContain('Not read');
    expect(html).toContain('Steady');
    expect(html).toContain('—');
    expect(html).toContain('0');
  });
});
