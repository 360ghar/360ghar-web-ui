import { describe, expect, it } from 'vitest';
import { checkListingUrl } from './rules';

describe('checkListingUrl', () => {
  it('finds the portal from the hostname only', () => {
    expect(checkListingUrl('https://www.99acres.com/3-bhk-flat-sector-57')).toEqual({ kind: 'portal', host: 'www.99acres.com', portal: '99acres', flags: [] });
    expect(checkListingUrl('magicbricks.com/propertyDetails/x')).toMatchObject({ kind: 'portal', portal: 'magicbricks' });
    expect(checkListingUrl('https://m.nobroker.in/property/1')).toMatchObject({ kind: 'portal', portal: 'nobroker' });
    // A portal name in the query string is not the portal (old bug).
    expect(checkListingUrl('https://example.com/?ref=nobroker.in')).toMatchObject({ kind: 'unknown', flags: [] });
  });

  it('flags lookalike domains', () => {
    expect(checkListingUrl('https://99acres-deals.in/flat')).toMatchObject({ kind: 'unknown', lookalikeOf: '99acres', flags: ['lookalike'] });
    expect(checkListingUrl('https://housing.com.offer-flats.xyz/1')).toMatchObject({ kind: 'unknown', lookalikeOf: 'housing', flags: ['lookalike'] });
    expect(checkListingUrl('https://www.magicbricks.com.verify-now.net')).toMatchObject({ lookalikeOf: 'magicbricks' });
  });

  it('flags risky link patterns', () => {
    expect(checkListingUrl('http://www.99acres.com/x')).toMatchObject({ kind: 'portal', flags: ['notSecure'] });
    expect(checkListingUrl('https://bit.ly/3abc')).toMatchObject({ kind: 'unknown', flags: ['shortener'] });
    expect(checkListingUrl('http://192.168.1.20/listing')).toMatchObject({ flags: ['notSecure', 'ipHost'] });
    expect(checkListingUrl('https://99ácres.com/x')).toMatchObject({ host: 'xn--99cres-qta.com', flags: ['punycode'] });
  });

  it('knows 360Ghar links and rejects non-links', () => {
    expect(checkListingUrl('https://360ghar.com/property/12')).toMatchObject({ kind: 'ours', flags: [] });
    expect(checkListingUrl('')).toEqual({ kind: 'invalid' });
    expect(checkListingUrl('not a link')).toEqual({ kind: 'invalid' });
    expect(checkListingUrl('javascript:alert(1)')).toEqual({ kind: 'invalid' });
    expect(checkListingUrl('localhost')).toEqual({ kind: 'invalid' });
  });
});
