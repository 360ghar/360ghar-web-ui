import { describe, expect, it } from 'vitest';
import { legacyRedirect, redirectLocation } from './redirects';

describe('legacyRedirect', () => {
  it('keeps canonical paths', () => {
    for (const p of ['/', '/hi', '/properties', '/gurgaon/buy/flats', '/hi/gurgaon/rent/flats/2-bhk', '/property/123']) {
      expect(legacyRedirect(p)).toBeNull();
    }
  });

  it('normalises city, type and legacy paths in one hop', () => {
    expect(legacyRedirect('/gurugram/buy/apartments')).toBe('/gurgaon/buy/flats');
    expect(legacyRedirect('/hi/gurugram/rent/apartment')).toBe('/hi/gurgaon/rent/flats');
    expect(legacyRedirect('/gurgaon/buy/land')).toBe('/gurgaon/buy/plots');
    expect(legacyRedirect('/gurgaon/buy/apartments/2-bhk')).toBe('/gurgaon/buy/flats/2-bhk');
    expect(legacyRedirect('/gurugram')).toBe('/gurgaon');
    expect(legacyRedirect('/data-hub/circle-rates')).toBe('/circle-rates');
    expect(legacyRedirect('/property')).toBe('/properties');
    expect(legacyRedirect('/hi/projects')).toBe('/hi/project');
  });

  it('strips trailing slashes and lower-cases', () => {
    expect(legacyRedirect('/About-Us/')).toBe('/about-us');
    expect(legacyRedirect('/blog/')).toBe('/blog');
    expect(legacyRedirect('/hi/')).toBe('/hi');
  });

  it('maps PG types to flats', () => {
    expect(legacyRedirect('/gurgaon/pg/villa')).toBe('/gurgaon/pg/flats');
    expect(legacyRedirect('/gurgaon/pg/apartments')).toBe('/gurgaon/pg/flats');
  });
});

describe('legacyRedirect duplicate routes', () => {
  it('301s /property-sidebar and /add-new-listing, keeping the locale', () => {
    expect(legacyRedirect('/property-sidebar')).toBe('/properties');
    expect(legacyRedirect('/add-new-listing')).toBe('/post-property');
    expect(legacyRedirect('/hi/property-sidebar')).toBe('/hi/properties');
    expect(legacyRedirect('/hi/add-new-listing')).toBe('/hi/post-property');
    expect(legacyRedirect('/Property-Sidebar/')).toBe('/properties');
  });
  it('keeps the query string on the 301 Location', () => {
    expect(redirectLocation('/property-sidebar', '?city=gurgaon&bhk=2')).toBe('/properties?city=gurgaon&bhk=2');
    expect(redirectLocation('/hi/add-new-listing', '?ref=old')).toBe('/hi/post-property?ref=old');
    expect(redirectLocation('/gurugram/buy/apartments', '?page=2')).toBe('/gurgaon/buy/flats?page=2');
    expect(redirectLocation('/properties', '?a=1')).toBeNull();
  });
  it('leaves the target pages alone', () => {
    expect(legacyRedirect('/properties')).toBeNull();
    expect(legacyRedirect('/hi/post-property')).toBeNull();
  });
});

describe('legacyRedirect with percent escapes', () => {
  it('does not redirect a path whose only upper-case letters are in escapes', () => {
    expect(legacyRedirect('/blog/%E0%A4%95')).toBeNull();
  });
  it('lower-cases letters but keeps the escapes', () => {
    expect(legacyRedirect('/Blog/%E0%A4%95-Guide')).toBe('/blog/%E0%A4%95-guide');
  });
});

describe('legacyRedirect scraped localities (owner decision 2026-09-29)', () => {
  // projects-in-dlf-phase-i-gurgaon is a scraped row; dlf-phase-1-gurgaon is its real twin.
  const from = '/locality/projects-in-golf-course-road-gurgaon';
  const to = '/locality/golf-course-road-gurgaon';

  it('301s the page and the buy and rent pages to the twin, in both locales', () => {
    expect(legacyRedirect(from)).toBe(to);
    expect(legacyRedirect(`${from}/buy`)).toBe(`${to}/buy`);
    expect(legacyRedirect(`${from}/rent`)).toBe(`${to}/rent`);
    expect(legacyRedirect(`/hi${from}`)).toBe(`/hi${to}`);
    expect(legacyRedirect(`/hi${from}/rent`)).toBe(`/hi${to}/rent`);
  });

  it('keeps the query string', () => {
    expect(redirectLocation(from, '?q=1')).toBe(`${to}?q=1`);
    expect(redirectLocation(`/hi${from}/buy`, '?bhk=2&page=3')).toBe(`/hi${to}/buy?bhk=2&page=3`);
  });

  it('is one hop for every slug form the page accepts (full, bare, and with -gurgaon added)', () => {
    for (const s of ['projects-in-golf-course-road-gurgaon', 'projects-in-golf-course-road', 'projects-in-golf-course-road-gurgaon-gurgaon']) {
      expect(legacyRedirect(`/locality/${s}`), s).toBe(to);
    }
  });

  it('combines with trailing slash and upper case in the same hop', () => {
    expect(legacyRedirect(`${from}/`)).toBe(to);
    expect(legacyRedirect('/Locality/Projects-In-Golf-Course-Road-Gurgaon')).toBe(to);
    expect(legacyRedirect('/hi/Locality/Projects-In-Golf-Course-Road-Gurgaon/Buy/')).toBe(`/hi${to}/buy`);
    expect(redirectLocation('/locality/Projects-In-Golf-Course-Road-Gurgaon/', '?q=1')).toBe(`${to}?q=1`);
  });

  it('sends an unknown intent word to /buy at once (the page would do it in a second hop)', () => {
    expect(legacyRedirect(`${from}/pg`)).toBe(`${to}/buy`);
  });

  it('does not touch the twin, other localities, seed rows, scraped rows without a twin, or other routes', () => {
    expect(legacyRedirect(to)).toBeNull();
    expect(legacyRedirect(`${to}/buy`)).toBeNull();
    expect(legacyRedirect('/locality/dlf-phase-1-gurgaon')).toBeNull();
    expect(legacyRedirect('/locality/huda-sector-45-gurgaon')).toBeNull();
    expect(legacyRedirect('/locality/projects-in-basai-village-gurgaon')).toBeNull();
    expect(legacyRedirect('/localities')).toBeNull();
    expect(legacyRedirect('/locality/no-such-place')).toBeNull();
    expect(legacyRedirect(`${from}/buy/extra`)).toBeNull();
  });

  it('leaves the older rules alone', () => {
    expect(legacyRedirect('/gurugram/buy/apartments')).toBe('/gurgaon/buy/flats');
    expect(legacyRedirect('/property-sidebar')).toBe('/properties');
  });
});
