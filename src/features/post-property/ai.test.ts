import { describe, expect, it } from 'vitest';
import { listingDetails, parseListing, parseStaged } from './ai';

describe('owner AI replies', () => {
  it('needs both a title and a description', () => {
    expect(parseListing({ title: ' 3 BHK in Sector 57 ', description: 'Bright home.' })).toEqual({ title: '3 BHK in Sector 57', description: 'Bright home.' });
    expect(parseListing({ title: 'x' })).toBeNull();
    expect(parseListing(null)).toBeNull();
  });
  it('takes the staged image from image_url or url, https only', () => {
    expect(parseStaged({ image_url: 'https://res.cloudinary.com/a.jpg' })).toBe('https://res.cloudinary.com/a.jpg');
    expect(parseStaged({ url: 'https://x/y.jpg' })).toBe('https://x/y.jpg');
    expect(parseStaged({ url: 'http://x/y.jpg' })).toBeNull();
    expect(parseStaged({})).toBeNull();
  });
  it('lists only filled details', () => {
    expect(listingDetails({ city: 'Gurugram', bedrooms: 3, balconies: '', locality: undefined })).toEqual({ city: 'Gurugram', bedrooms: 3 });
  });
});
