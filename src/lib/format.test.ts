import { describe, expect, it } from 'vitest';
import { compactPrice, formatDate, formatDateOnly, imageUrl, listingPrice, srcSet } from './format';

describe('format', () => {
  it('uses lakh and crore', () => {
    expect(compactPrice(8_500_000)).toBe('₹85 L');
    expect(compactPrice(12_500_000)).toBe('₹1.25 Cr');
    expect(compactPrice(10_000_000)).toBe('₹1 Cr');
    expect(compactPrice(45_000)).toBe('₹45,000');
    expect(compactPrice(12_500_000, 'hi')).toBe('₹1.25 करोड़');
  });

  it('shows rent per month', () => {
    expect(listingPrice({ purpose: 'rent', base_price: 30000, monthly_rent: 32000, daily_rate: null })).toEqual({
      amount: '₹32,000',
      period: '/month',
    });
  });

  it('reads the price field of the purpose: base_price is neither a rent nor a nightly rate', () => {
    expect(listingPrice({ purpose: 'short_stay', base_price: 30000, monthly_rent: null, daily_rate: 1500 })).toEqual({ amount: '₹1,500', period: '/night' });
    expect(listingPrice({ purpose: 'buy', base_price: 8_500_000, monthly_rent: null, daily_rate: null })).toEqual({ amount: '₹85 L', period: '' });
    expect(listingPrice({ purpose: 'rent', base_price: 30000, monthly_rent: null, daily_rate: null })).toEqual({ amount: 'Price on request', period: '' });
    expect(listingPrice({ purpose: 'short_stay', base_price: 30000, daily_rate: null }, 'hi')).toEqual({ amount: 'कीमत पूछने पर', period: '' });
  });

  it('shows a date-only value as that day in any time zone', () => {
    const opts = { day: 'numeric', month: 'short', year: 'numeric' } as const;
    const was = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';
    try {
      expect(formatDate('2026-11-01', 'en', opts)).toBe('31 Oct 2026'); // a timestamp: shown in the viewer's zone
      expect(formatDateOnly('2026-11-01', 'en', opts)).toBe('1 Nov 2026'); // a calendar date: the same day everywhere
    } finally {
      if (was === undefined) delete process.env.TZ;
      else process.env.TZ = was;
    }
  });

  it('adds Cloudinary transforms', () => {
    const u = 'https://res.cloudinary.com/x/image/upload/v1/a.jpg';
    expect(imageUrl(u, 640)).toBe('https://res.cloudinary.com/x/image/upload/f_auto,q_auto,c_limit,w_640/v1/a.jpg');
    expect(srcSet(u, [320, 640])).toContain('320w');
    expect(imageUrl('https://example.com/a.jpg', 640)).toBe('https://example.com/a.jpg');
  });
});
