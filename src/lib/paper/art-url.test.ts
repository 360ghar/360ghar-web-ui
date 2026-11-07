import { describe, expect, it } from 'vitest';
import { artUrl } from './art-url';

describe('artUrl', () => {
  it('keeps the URL shapes the art route serves', () => {
    expect(artUrl.scene('sector-404')).toBe('/art/scene/sector-404.svg');
    expect(artUrl.home('tour')).toBe('/art/home/tour.svg');
    expect(artUrl.home('tour', true)).toBe('/art/home/tour-bare.svg');
    expect(artUrl.vignette('calculator', 'menu')).toBe('/art/vignette/calculator-menu.svg');
    expect(artUrl.skyline('footer')).toBe('/art/skyline/footer.svg');
    expect(artUrl.skyline('menu')).toBe('/art/skyline/menu.svg');
    expect(artUrl.map(182)).toBe('/art/map/182.svg');
  });
});
