/**
 * Round 3 visuals on the tool pages: the paper vignettes, the charts drawn
 * from the person's own numbers, and the result line on phones. Runs at 360,
 * 768 and 1440 px. Nothing is posted to production.
 */
import { expect, test } from '@playwright/test';
import { axe, hydrated, watch } from './helpers';

const wide = (name: string) => name !== 'phone';

test('tools index: a paper scene on every card', async ({ page }) => {
  const w = watch(page);
  await page.goto('/tools');
  const art = page.locator('.tools-card .tools-card-art svg.vignette');
  await expect(art).toHaveCount(process.env.PUBLIC_AI_OWNER_TOOLS === 'true' ? 18 : 16);
  for (const el of await art.all()) {
    const box = await el.boundingBox();
    expect(box && box.width > 60 && box.height > 40, 'vignette has a size').toBeTruthy();
  }
  await w.check();
});

test('tool header: the scene stands on the desk from 768 px, phones skip it', async ({ page }, info) => {
  await page.goto('/capital-gains-tax-calculator');
  const art = page.locator('.tool-head-art');
  if (wide(info.project.name)) {
    await expect(art).toBeVisible();
    // The scene's feet touch the top of the desk.
    const a = (await art.boundingBox())!;
    const desk = (await page.locator('.tool-desk').first().boundingBox())!;
    expect(Math.abs(a.y + a.height * (134 / 150) - desk.y)).toBeLessThan(3);
  } else {
    await expect(art).toBeHidden();
  }
});

test('emi: payoff chart, prepayment years, result line', async ({ page }, info) => {
  const w = watch(page);
  await page.goto('/emi-calculator');
  await hydrated(page);
  const chart = page.locator('section:has(#emi-chart)');
  await expect(chart.locator('rect.is-a')).toHaveCount(20);
  await expect(chart).toContainText('In year 1, ₹84,236 of the ₹1,04,139 you pay goes to interest. From year 13');
  await expect(chart.locator('.tool-chart-axis .is-mark')).toHaveText('Year 13');

  await page.getByRole('textbox', { name: 'Prepayment amount' }).fill('300000');
  await expect(chart.locator('.tool-chart-flag')).toHaveText('₹3 L prepaid');
  await expect.poll(() => chart.locator('rect.is-saved').count()).toBeGreaterThan(0);
  await expect(chart).toContainText(/the loan ends in year \d+ instead of year 20/);
  await expect(chart.getByText('Years you no longer pay')).toBeVisible();

  const peek = page.locator('.tool-peek');
  if (info.project.name === 'desktop') {
    await expect(peek).toBeHidden();
  } else {
    await expect(peek).toBeVisible();
    await expect(peek).toContainText('₹8,678');
    await peek.click();
    await expect(page).toHaveURL(/#emi-result$/);
  }
  await axe(page);
  await w.check();
});

test('loan eligibility: income strip with the EMI limit', async ({ page }) => {
  const w = watch(page);
  await page.goto('/loan-eligibility-calculator');
  await hydrated(page);
  const split = page.locator('section:has(#loan-split)');
  await expect(split).toContainText('Banks let 50% of your income after expenses (₹40,000) go to EMIs. That is ₹20,000 a month.');
  await expect(split.locator('.loan-cap')).toHaveText('EMI limit ₹20,000');
  await expect(split.getByText('EMI for the new loan ₹20,000')).toBeVisible();
  await page.getByRole('slider', { name: 'EMIs you already pay' }).fill('8000');
  await expect(split.getByText('EMIs you pay now ₹8,000')).toBeVisible();
  await expect(split.getByText('EMI for the new loan ₹12,000')).toBeVisible();
  await axe(page);
  await w.check();
});

test('capital gains: the two rules as bars on one scale', async ({ page }) => {
  const w = watch(page);
  await page.goto('/capital-gains-tax-calculator');
  await hydrated(page);
  const bars = page.locator('.cg-bar');
  await expect(bars).toHaveCount(2);
  await expect(bars.filter({ hasText: '12.5% without indexation' })).toHaveClass(/is-pay/);
  await expect(bars.first()).toContainText('Tax ₹3,68,750');
  await expect(page.locator('.cg-legend')).toContainText('Added by indexation');
  // Sold before 23 July 2024: one rule, one bar.
  await page.getByLabel('Date of sale').fill('2024-06-01');
  await expect(bars).toHaveCount(1);
  await expect(bars.first()).toContainText('20% with indexation');
  await axe(page);
  await w.check();
});

test('carpet area: three nested sheets to scale', async ({ page }) => {
  const w = watch(page);
  await page.goto('/area-calculator');
  await hydrated(page);
  const rects = page.locator('.area-nest svg rect');
  await expect(rects).toHaveCount(3);
  // The carpet square is 70% of the super area: side = sqrt(0.7) x 100.
  await expect(rects.nth(2)).toHaveAttribute('width', /^83\.66/);
  await w.check();
});

test('Hindi: chart text on the EMI and loan pages', async ({ page }) => {
  const w = watch(page);
  await page.goto('/hi/emi-calculator');
  await hydrated(page);
  await expect(page.locator('section:has(#emi-chart)')).toContainText('पहले साल आप जो ₹1,04,139 देते हैं');
  await page.goto('/hi/loan-eligibility-calculator');
  await hydrated(page);
  await expect(page.locator('.loan-cap')).toHaveText('EMI सीमा ₹20,000');
  await w.check();
});
