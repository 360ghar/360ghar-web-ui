/** /price-index, /authors, /editorial-policy and /methodology: render, link and pass the a11y scan. */
import { expect, test } from '@playwright/test';
import { axe, watch } from './helpers';

test('/price-index is on editorial hold', async ({ page }) => {
  const w = watch(page);
  expect((await page.goto('/price-index'))?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'Property price data under review' })).toBeVisible();
  await axe(page);
  await w.check();
});

for (const [path, h1] of [
  ['/authors', 'Authors and editorial team'],
  ['/editorial-policy', 'Editorial policy'],
  ['/methodology', 'Methodology and data sources'],
  ['/hi/methodology', 'पद्धति और डेटा स्रोत'],
  ['/hi/price-index', 'प्रॉपर्टी कीमत डेटा समीक्षा के अधीन'],
] as const) {
  test(`${path} renders`, async ({ page }) => {
    const w = watch(page);
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: h1 })).toBeVisible();
    await axe(page);
    await w.check();
  });
}
