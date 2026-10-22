/** /price-index, /authors, /editorial-policy and /methodology: render, link and pass the a11y scan. */
import { expect, test } from '@playwright/test';
import { axe, hydrated, watch } from './helpers';

test('price index lists the five cities and links to each', async ({ page }) => {
  const w = watch(page);
  expect((await page.goto('/price-index'))?.status()).toBe(200);
  await hydrated(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Property price index' })).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(6);
  await expect(page.getByText('Updated 4 May 2026')).toBeVisible();
  await page.getByRole('link', { name: 'Delhi price index' }).click();
  await expect(page).toHaveURL(/\/price-index\/delhi$/);
  await expect(page.getByText('Updated 4 May 2026').first()).toBeVisible();
  await axe(page);
  await w.check();
});

for (const [path, h1] of [
  ['/authors', 'Authors and editorial team'],
  ['/editorial-policy', 'Editorial policy'],
  ['/methodology', 'Methodology and data sources'],
  ['/hi/methodology', 'पद्धति और डेटा स्रोत'],
  ['/hi/price-index', 'प्रॉपर्टी प्राइस इंडेक्स'],
] as const) {
  test(`${path} renders`, async ({ page }) => {
    const w = watch(page);
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: h1 })).toBeVisible();
    await axe(page);
    await w.check();
  });
}
