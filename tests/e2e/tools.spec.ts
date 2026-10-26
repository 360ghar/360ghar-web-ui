/**
 * Tool pages: every control at 360, 768 and 1440 px (playwright projects),
 * axe, no page errors, no horizontal scroll. APIs are mocked; nothing is
 * posted to production.
 */
import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { axe, backendDown, hydrated, watch } from './helpers';

const FIXTURE = readFileSync(new URL('./fixtures/vastu-response.json', import.meta.url), 'utf8');
const PLAN = new URL('./fixtures/floorplan.png', import.meta.url).pathname;
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAIAAAAuKetIAAAAYElEQVR42u3ZoRHAIAxAUcJ1IwaqZhUWqGYgZiqqsqqCcve+jcm7i0vcraSdy2nzAAAAAAAAAAAAAAAAAFZ1vA3Oa/xt116LEwIAAAAAAAAAAAAAAAAAeAqPbgAAAIAvTU9pBtmEvzhtAAAAAElFTkSuQmCC';

async function open(page: Page, path: string) {
  const w = watch(page);
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await hydrated(page);
  return w;
}

async function copyAndReset(page: Page) {
  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByText(/Link copied|Could not copy/)).toBeVisible();
  await page.getByRole('button', { name: 'Reset' }).click();
}

async function typeNumber(box: Locator, value: string) {
  await box.click();
  await box.fill(value);
  await box.press('Enter');
}

/**
 * axe for the blueprint page without the vendored Blueprint3D app inside the
 * iframe (public/blueprint3d is third-party code; its issues are reported separately).
 */
async function axeOutsideFrame(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).exclude('iframe').analyze();
  const serious = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
}

async function stubPrint(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { printed: number }).printed = 0;
    window.print = () => {
      (window as unknown as { printed: number }).printed += 1;
    };
  });
  return () => page.evaluate(() => (window as unknown as { printed: number }).printed);
}

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
});

const ROUTES = [
  '/tools',
  '/emi-calculator',
  '/area-converter',
  '/loan-eligibility-calculator',
  '/area-calculator',
  '/property-document-checklist',
  '/capital-gains-tax-calculator',
  '/design-blueprint',
  '/vastu-checker',
  '/ai-design-studio',
  '/check-fake-listing',
  '/rent-receipt',
  '/mofa-to-rera-converter',
  '/sq-ft-calculator',
  '/acre-in-gaj',
];

test('every tool page renders and hydrates with the backend down', async ({ page }) => {
  test.setTimeout(120_000);
  await backendDown(page);
  for (const path of ROUTES) {
    const w = await open(page, path);
    await expect(page.locator('main')).toContainText(/\S/);
    await w.check();
  }
});

// ---------- EMI, tools index, checklist, fake listing ----------

test('emi: sliders, number boxes, prepayment, schedule, share, reset', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  const w = await open(page, '/emi-calculator');
  const value = page.getByTestId('emi-value');
  await expect(value).toHaveText('₹8,678');

  await page.getByRole('textbox', { name: 'Loan amount' }).fill('5000000');
  await page.getByRole('textbox', { name: 'Loan amount' }).press('Enter');
  await expect(value).toHaveText('₹43,391');

  await page.getByRole('slider', { name: 'Loan tenure' }).fill('30');
  await expect(value).toHaveText('₹38,446');
  await page.getByRole('slider', { name: 'Interest rate (per year)' }).fill('9');
  await expect(value).not.toHaveText('₹38,446');

  // The values go into the URL and come back on reload.
  await expect(page).toHaveURL(/amount=5000000/);
  await expect(page).toHaveURL(/tenure=30/);
  await page.reload();
  await hydrated(page);
  await expect(page.getByRole('slider', { name: 'Loan tenure' })).toHaveValue('30');

  await page.getByRole('textbox', { name: 'Prepayment amount' }).fill('500000');
  await expect(page.getByText('Interest you save')).toBeVisible();

  await page.getByText('Year-by-year schedule').click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(30);

  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByText(/Link copied|Could not copy/)).toBeVisible();

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(value).toHaveText('₹8,678');
  await expect(page).not.toHaveURL(/amount=/, { timeout: 5_000 });

  await axe(page);
  await w.check();
});

test('emi: Hindi page renders the calculator', async ({ page }) => {
  const w = await open(page, '/hi/emi-calculator');
  await expect(page.getByTestId('emi-value')).toHaveText('₹8,678');
  await page.getByRole('slider', { name: 'लोन अवधि' }).fill('10');
  await expect(page.getByTestId('emi-value')).not.toHaveText('₹8,678');
  await w.check();
});

// The two legal drafters join the list when PUBLIC_AI_OWNER_TOOLS=true (src/lib/flags.ts).
const COUNT = process.env.PUBLIC_AI_OWNER_TOOLS === 'true' ? 18 : 16;

test('tools index: all tools, filter, no results, links', async ({ page }) => {
  const w = await open(page, '/tools');
  const items = page.locator('[data-tool]');
  await expect(items).toHaveCount(COUNT);
  await expect(page.getByText(`${COUNT} tools`)).toBeVisible();
  const box = page.getByRole('searchbox', { name: 'Find a tool' });
  await box.fill('gaj');
  await expect(page.locator('[data-tool]:visible')).toHaveCount(3);
  await expect(page.getByText('3 tools')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Loans, tax and rent' })).toBeHidden();
  await box.fill('zzzz');
  await expect(page.getByText('No tool matches')).toBeVisible();
  await box.fill('');
  await expect(page.locator('[data-tool]:visible')).toHaveCount(COUNT);
  await page.getByRole('link', { name: /EMI calculator/ }).first().click();
  await expect(page).toHaveURL(/\/emi-calculator$/);
  await w.check();
});

test('tools index: Hindi list and filter', async ({ page }) => {
  const w = await open(page, '/hi/tools');
  await page.getByRole('searchbox', { name: 'टूल खोजें' }).fill('वास्तु');
  await expect(page.locator('[data-tool]:visible')).toHaveCount(1);
  await expect(page.locator('[data-tool]:visible a')).toHaveAttribute('href', '/hi/vastu-checker');
  await axe(page);
  await w.check();
});

test('document checklist: tick, persist, note a file, copy, clear with undo, print', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  const w = await open(page, '/property-document-checklist');
  const count = page.getByTestId('checklist-count');
  await expect(count).toHaveText('0 of 13');
  await page.getByRole('checkbox', { name: 'Title Deed / Sale Deed' }).check();
  await page.getByRole('checkbox', { name: 'Encumbrance Certificate (EC)' }).check();
  await expect(count).toHaveText('2 of 13');

  // Ticks survive a reload (localStorage, read after hydration).
  await page.reload();
  await hydrated(page);
  await expect(count).toHaveText('2 of 13');
  await expect(page.getByRole('checkbox', { name: 'Title Deed / Sale Deed' })).toBeChecked();

  await page.locator('input[type=file]').first().setInputFiles({ name: 'sale-deed.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
  await expect(page.getByText('sale-deed.pdf').first()).toBeVisible();
  await page.getByRole('button', { name: 'Remove sale-deed.pdf' }).click();
  await expect(page.getByRole('button', { name: 'Remove sale-deed.pdf' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Copy summary' }).click();
  await expect(page.getByText(/Summary copied|Could not copy/)).toBeVisible();

  await page.evaluate(() => {
    (window as unknown as { printed: number }).printed = 0;
    window.print = () => {
      (window as unknown as { printed: number }).printed += 1;
    };
  });
  await page.getByRole('button', { name: 'Print or save as PDF' }).click();
  expect(await page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(1);

  await page.getByRole('button', { name: 'Clear all ticks' }).click();
  await expect(count).toHaveText('0 of 13');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(count).toHaveText('2 of 13');

  await axe(page);
  await w.check();
});

test('fake listing: portal, lookalike, short link, invalid, 360Ghar', async ({ page }) => {
  const w = await open(page, '/check-fake-listing');
  const box = page.getByRole('textbox', { name: 'Listing link' });
  const go = page.getByRole('button', { name: 'Check the link' });
  await expect(go).toBeDisabled();

  await box.fill('https://www.99acres.com/3-bhk-flat-sector-57-gurgaon');
  await go.click();
  await expect(page.getByRole('heading', { name: 'This link goes to 99acres' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Points to check on 99acres' })).toBeVisible();
  await axe(page);

  await box.fill('https://99acres-deals.in/flat');
  await box.press('Enter');
  await expect(page.getByRole('heading', { name: 'Be careful with this link' })).toBeVisible();
  await expect(page.getByText(/contains "99acres" but the site is 99acres-deals\.in/)).toBeVisible();

  await box.fill('bit.ly/3abc');
  await go.click();
  await expect(page.getByText(/This is a short link/)).toBeVisible();

  await box.fill('not a link');
  await go.click();
  await expect(page.getByText(/Paste a full web address/)).toBeVisible();
  await expect(box).toHaveAttribute('aria-invalid', 'true');

  await box.fill('https://360ghar.com/property/1');
  await go.click();
  await expect(page.getByRole('heading', { name: 'This is a 360Ghar link' })).toBeVisible();
  await expect(page.getByText(/does not use AI/)).toBeVisible();
  await w.check();
});

// ---------- Area and land units ----------

test('area converter: value, units, swap, URL restore, reset', async ({ page }) => {
  const w = await open(page, '/area-converter');
  const result = page.getByTestId('area-result');
  await expect(result).toHaveText('111.1111sq yd');

  const area = page.getByRole('textbox', { name: 'Area', exact: true });
  await area.click();
  await area.fill('2400');
  await area.press('Enter');
  await expect(result).toHaveText('266.6667sq yd');

  await page.getByRole('combobox', { name: 'To' }).selectOption('acre');
  await expect(result).toHaveText('0.0551acre');
  await page.getByRole('combobox', { name: 'From' }).selectOption('bigha');
  await expect(page.getByText(/A bigha is not the same in every state/)).toBeVisible();

  await page.getByRole('button', { name: 'Swap units' }).click();
  await expect(page.getByRole('combobox', { name: 'From' })).toHaveValue('acre');
  await expect(page.getByRole('combobox', { name: 'To' })).toHaveValue('bigha');

  await expect(page).toHaveURL(/v=2400/);
  await expect(page).toHaveURL(/from=acre/);
  await page.reload();
  await hydrated(page);
  await expect(page.getByRole('combobox', { name: 'To' })).toHaveValue('bigha');
  await expect(result).toContainText('3,872');

  await copyAndReset(page);
  await expect(result).toHaveText('111.1111sq yd');
  await expect(page).not.toHaveURL(/v=/, { timeout: 5_000 });
  await axe(page);
  await w.check();
});

test('sq ft calculator: convert, swap, reset', async ({ page }) => {
  const w = await open(page, '/sq-ft-calculator');
  const result = page.getByTestId('area-result');
  await expect(result).toHaveText('1,076.39sq ft');
  const area = page.getByRole('textbox', { name: 'Area', exact: true });
  await area.click();
  await area.fill('250');
  await area.blur();
  await expect(result).toHaveText('2,690.975sq ft');
  await page.getByRole('combobox', { name: 'From' }).selectOption('gaj');
  await expect(result).toHaveText('2,250sq ft');
  await page.getByRole('button', { name: 'Swap units' }).click();
  await expect(result).toHaveText('27.7778gaj');
  await copyAndReset(page);
  await expect(result).toHaveText('1,076.39sq ft');
  await axe(page);
  await w.check();
});

test('acre in gaj: convert, swap, reset', async ({ page }) => {
  const w = await open(page, '/acre-in-gaj');
  const result = page.getByTestId('area-result');
  await expect(result).toHaveText('4,840gaj');
  const area = page.getByRole('textbox', { name: 'Area', exact: true });
  await area.click();
  await area.fill('2');
  await area.blur();
  await expect(result).toHaveText('9,680gaj');
  await page.getByRole('button', { name: 'Swap units' }).click();
  await expect(result).toHaveText('0.0004132acre');
  await page.getByRole('combobox', { name: 'To' }).selectOption('sq_ft');
  await expect(result).toHaveText('18sq ft');
  await copyAndReset(page);
  await expect(result).toHaveText('4,840gaj');
  await axe(page);
  await w.check();
});

test('mofa to rera: no default assumption, direction, assumption, area, reset', async ({ page }) => {
  const w = await open(page, '/mofa-to-rera-converter');
  const result = page.getByTestId('mofa-result');
  // No assumption is built in: the result waits for the visitor's own percentage.
  await expect(result).toHaveText('Enter an assumption to see an illustrative result.');
  const pct = page.getByRole('spinbutton', { name: 'Your assumed difference (%)' });
  await pct.fill('6');
  await expect(result).toHaveText('1,060sq ft');
  await page.getByRole('radio', { name: 'RERA to MOFA' }).click();
  await expect(page.getByRole('radio', { name: 'RERA to MOFA' })).toHaveAttribute('aria-checked', 'true');
  await expect(result).toHaveText('943sq ft');
  await page.getByRole('radio', { name: 'MOFA to RERA' }).click();
  await pct.fill('8');
  await expect(result).toHaveText('1,080sq ft');
  const area = page.getByRole('textbox', { name: 'MOFA carpet area' });
  await area.click();
  await area.fill('2000');
  await area.blur();
  await expect(result).toHaveText('2,160sq ft');
  await expect(page.getByText('+160 sq ft')).toBeVisible();
  await expect(page).toHaveURL(/pct=8/);
  await copyAndReset(page);
  await expect(result).toHaveText('Enter an assumption to see an illustrative result.');
  await axe(page);
  await w.check();
});

test('carpet area calculator: sliders, number boxes, reset', async ({ page }) => {
  const w = await open(page, '/area-calculator');
  const result = page.getByTestId('carpet-result');
  await expect(result).toHaveText('700sq ft');
  const superArea = page.getByRole('textbox', { name: 'Super built-up area' });
  await superArea.click();
  await superArea.fill('1500');
  await superArea.press('Enter');
  await expect(result).toHaveText('1,050sq ft');
  await page.getByRole('slider', { name: 'Loading factor' }).fill('40');
  await expect(result).toHaveText('900sq ft');
  await page.getByRole('slider', { name: 'Walls and balconies' }).fill('20');
  await expect(page.getByText('1,080 sq ft')).toBeVisible();
  await expect(page.getByText('Common areas 28%')).toBeVisible();
  await copyAndReset(page);
  await expect(result).toHaveText('700sq ft');
  await axe(page);
  await w.check();
});

test('area tools: Hindi pages render and convert', async ({ page }) => {
  const w = await open(page, '/hi/acre-in-gaj');
  await expect(page.getByTestId('area-result')).toHaveText('4,840गज');
  await page.getByRole('button', { name: 'इकाइयाँ आपस में बदलें' }).click();
  await expect(page.getByTestId('area-result')).toHaveText('0.0002066एकड़');
  await w.check();
  await page.goto('/hi/area-calculator');
  await hydrated(page);
  await expect(page.getByTestId('carpet-result')).toContainText('700');
  await axe(page);
});

// ---------- Loans, tax and rent ----------

test('loan eligibility: inputs, URL restore, zero case, share, reset', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  const w = await open(page, '/loan-eligibility-calculator');
  const value = page.getByTestId('loan-value');
  await expect(value).toHaveText('₹23,04,617');

  const income = page.getByRole('textbox', { name: 'Net monthly income' });
  await typeNumber(income, '100000');
  await expect(value).not.toHaveText('₹23,04,617');
  await expect(page.getByText('50%').first()).toBeVisible();
  await page.getByRole('slider', { name: 'Loan tenure' }).fill('30');
  await page.getByRole('slider', { name: 'Interest rate (per year)' }).fill('9');
  const changed = await value.textContent();

  await expect(page).toHaveURL(/income=100000/);
  await expect(page).toHaveURL(/tenure=30/);
  await page.reload();
  await hydrated(page);
  await expect(value).toHaveText(changed!);
  await expect(page.getByRole('slider', { name: 'Loan tenure' })).toHaveValue('30');
  await expect(income).toHaveValue('1,00,000');

  await page.getByRole('slider', { name: 'EMIs you already pay' }).fill('100000');
  await expect(value).toHaveText('₹0');
  await expect(page.getByText('This scenario leaves no monthly amount for another EMI.')).toBeVisible();

  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByText(/Link copied|Could not copy/)).toBeVisible();
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(value).toHaveText('₹23,04,617');
  await expect(page).not.toHaveURL(/income=/, { timeout: 5_000 });

  await axe(page);
  await w.check();
});

test('capital gains: pre-tax gain worksheet, URL restore, share, reset', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  const w = await open(page, '/capital-gains-tax-calculator');
  const value = page.getByTestId('cg-value');
  // Sale 50,00,000 minus purchase 20,00,000 minus expenses 50,000. No tax rate is applied.
  await expect(value).toHaveText('₹29,50,000');
  await typeNumber(page.getByRole('textbox', { name: 'Sale price' }), '6000000');
  await expect(value).toHaveText('₹39,50,000');
  await expect(page).toHaveURL(/sale=6000000/);
  await page.reload();
  await hydrated(page);
  await expect(value).toHaveText('₹39,50,000');

  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByText(/Link copied|Could not copy/)).toBeVisible();
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(value).toHaveText('₹29,50,000');

  await axe(page);
  await w.check();
});

test('capital gains: old links with tax fields still load', async ({ page }) => {
  const w = await open(page, '/capital-gains-tax-calculator?sale=12000000&purchase=3000000&expenses=0&py=2010-2011&sy=2024-2025&slab=30');
  await expect(page.getByTestId('cg-value')).toHaveText('₹90,00,000');
  await w.check();
});

test.describe('rent receipt', () => {
  test.use({ timezoneId: 'Asia/Kolkata' });

  test('rules, sample, print, full year, signature, clear', async ({ page }) => {
    const w = await open(page, '/rent-receipt');
    await expect(page.getByRole('textbox', { name: 'Receipt number' })).toHaveValue(/^RR-[0-9A-Z]{5}$/);

    // Dates are local: the period starts on the 1st of this month, not the last day of the one before.
    const first = await page.evaluate(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    });
    await expect(page.getByLabel('Rent period from')).toHaveValue(first);

    const printed = await stubPrint(page);
    await page.getByRole('button', { name: 'Print or save as PDF' }).click();
    await expect(page.getByText('Fill in the fields marked in red first.')).toBeVisible();
    expect(await printed()).toBe(0);

    await page.getByRole('textbox', { name: 'Monthly rent (₹)' }).fill('10000');
    await expect(page.getByText('PAN is needed when the yearly rent is more than ₹1,00,000.')).toBeVisible();

    await page.getByRole('button', { name: 'Fill sample' }).click();
    await expect(page.getByText('PAN is needed when the yearly rent is more than ₹1,00,000.')).toHaveCount(0);
    const preview = page.locator('.rr-side');
    await expect(preview.getByText('(Rupees Twenty Five Thousand Only)')).toBeVisible();

    await page.getByRole('textbox', { name: 'Landlord PAN' }).fill('ABCDE12345');
    await expect(page.getByText('This is not a valid PAN. Use the format ABCDE1234F.')).toBeVisible();
    await page.getByRole('textbox', { name: 'Landlord PAN' }).fill('ABCPG1234F');

    await page.getByRole('combobox', { name: 'Payment mode' }).selectOption('cash');
    await expect(page.getByText(/stick a ₹1 revenue stamp/)).toBeVisible();
    await expect(preview.getByText('Revenue stamp')).toBeVisible();

    await page.locator('input[type=file]').setInputFiles({
      name: 'sign.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
    });
    await expect(preview.getByRole('img', { name: 'Landlord signature' })).toBeVisible();
    await page.getByRole('button', { name: 'Remove signature' }).click();
    await expect(preview.getByRole('img', { name: 'Landlord signature' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Print or save as PDF' }).click();
    expect(await printed()).toBe(1);

    await page.getByRole('button', { name: 'Make 12 receipts for a year' }).click();
    await expect(page.getByRole('heading', { name: /^12 receipts for FY \d{4}-\d{2}$/ })).toBeVisible();
    await expect(preview.locator('.rr-paper')).toHaveCount(12);
    await expect(preview.getByText(/-01$/).first()).toBeVisible();
    await expect(preview.getByText('01 April', { exact: false }).first()).toBeVisible();
    const fy = page.getByRole('combobox', { name: 'Financial year' });
    const options = await fy.locator('option').allTextContents();
    await fy.selectOption({ label: options[0]! });
    await expect(page.getByRole('heading', { name: `12 receipts for FY ${options[0]}` })).toBeVisible();
    await page.getByRole('button', { name: 'Print all 12 receipts' }).click();
    expect(await printed()).toBe(2);
    await expect(page.locator('.rr-print .rr-paper')).toHaveCount(12);
    await axe(page);

    await page.getByRole('button', { name: 'Back to one receipt' }).click();
    await expect(page.getByRole('heading', { name: 'Receipt preview' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear all' }).click();
    await expect(page.getByRole('textbox', { name: 'Tenant name' })).toHaveValue('');

    await axe(page);
    await w.check();
  });

  test('Hindi page', async ({ page }) => {
    const w = await open(page, '/hi/rent-receipt');
    await page.getByRole('textbox', { name: 'मासिक किराया (₹)' }).fill('9000');
    await expect(page.getByText('सालाना किराया ₹1,00,000 से ज़्यादा हो तो PAN ज़रूरी है।')).toBeVisible();
    await w.check();
  });
});

// ---------- Vastu, AI Design Studio, blueprint ----------

test('vastu: validate, upload, direction, notes, analyze (mocked), report, copy, print, analyze another', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  let body = '';
  await page.route(/\/api\/v1\/vastu\/analyze/, async (route) => {
    body = route.request().postDataBuffer()?.toString('latin1') ?? '';
    await new Promise((r) => setTimeout(r, 1200));
    await route.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE });
  });
  const w = await open(page, '/vastu-checker');

  // No file yet, then a wrong type.
  await page.getByRole('button', { name: 'Analyze Vastu' }).click();
  await expect(page.getByText('No file selected')).toBeVisible();
  await page.locator('input[type=file]').setInputFiles({ name: 'plan.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') });
  await expect(page.getByText(/Invalid file type/)).toBeVisible();

  await page.locator('input[type=file]').setInputFiles(PLAN);
  await expect(page.getByRole('img', { name: 'Floor plan preview' })).toBeVisible();
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByRole('img', { name: 'Floor plan preview' })).toHaveCount(0);
  await page.locator('input[type=file]').setInputFiles(PLAN);

  for (const d of ['Right', 'Bottom', 'Left', 'Not sure', 'Top', 'Right']) await page.getByText(d, { exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Right' })).toBeChecked();
  await expect(page.getByRole('img', { name: 'North arrow: Right' })).toBeVisible();

  await page.getByRole('textbox', { name: /Additional Notes/ }).fill('Corner plot');
  await expect(page.getByText('11/1000 characters')).toBeVisible();

  await page.getByRole('button', { name: 'Analyze Vastu' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Working on your plan' })).toBeVisible();
  await expect(page.getByTestId('vastu-score')).toHaveText(/^8/);
  expect(body).toContain('name="north_direction"');
  expect(body).toMatch(/name="north_direction"\r\n\r\nright/);
  expect(body).toMatch(/name="notes"\r\n\r\nCorner plot/);
  await expect(page.getByText('Excellent', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Room Analysis' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Major Defects Identified' })).toBeVisible();

  await page.getByText('Full Analysis Report').click();
  await expect(page.getByText('Vastu Analysis Report', { exact: true })).toBeVisible();
  await axe(page);

  await page.getByRole('button', { name: 'Copy Report' }).click();
  await expect(page.getByText(/Report copied|Failed to copy/)).toBeVisible();
  await stubPrint(page);
  await page.getByRole('button', { name: 'Print or save as PDF' }).click();
  expect(await page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(1);

  await page.getByRole('button', { name: 'Analyze Another' }).click();
  await expect(page.getByRole('button', { name: 'Analyze Vastu' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Floor plan preview' })).toHaveCount(0);
  await axe(page);
  await w.check();
});

test('vastu: cancel while waiting returns to the form', async ({ page }) => {
  await page.route(/\/api\/v1\/vastu\/analyze/, () => {
    // Never answers.
  });
  const w = await open(page, '/vastu-checker');
  await page.locator('input[type=file]').setInputFiles(PLAN);
  await page.getByRole('button', { name: 'Analyze Vastu' }).click();
  await expect(page.getByText(/Time so far: 0:0\d/)).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('button', { name: 'Analyze Vastu' })).toBeEnabled();
  await w.check();
});

test('vastu: backend down shows the offline state', async ({ page }) => {
  await backendDown(page);
  const w = await open(page, '/vastu-checker');
  await page.locator('input[type=file]').setInputFiles(PLAN);
  await page.getByRole('button', { name: 'Analyze Vastu' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'You seem to be offline' })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Check your internet connection')).toBeVisible();
  await axe(page);
  await page.getByRole('button', { name: 'Upload Different Image' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('img', { name: 'Floor plan preview' })).toHaveCount(0);
  await w.check();
});

test('vastu: a 400 shows the backend message, and Try again resends', async ({ page }) => {
  let calls = 0;
  await page.route(/\/api\/v1\/vastu\/analyze/, (route) => {
    calls += 1;
    return route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'HTTP_400', message: 'Invalid or corrupted image file. Please upload a valid JPEG, PNG, or WebP image.' } }),
    });
  });
  const w = await open(page, '/vastu-checker');
  await page.locator('input[type=file]').setInputFiles(PLAN);
  await page.getByRole('button', { name: 'Analyze Vastu' }).click();
  await expect(page.getByText('Invalid or corrupted image file. Please upload a valid JPEG, PNG, or WebP image.')).toBeVisible();
  await expect(page.getByText('Use JPEG, PNG, or WebP image format')).toBeVisible();
  await page.getByRole('button', { name: 'Try Again' }).click();
  await expect.poll(() => calls).toBe(2);
  await w.check();
});

test('vastu: Hindi page', async ({ page }) => {
  await page.route(/\/api\/v1\/vastu\/analyze/, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
  const w = await open(page, '/hi/vastu-checker');
  await page.locator('input[type=file]').setInputFiles(PLAN);
  await page.getByText('दाएँ', { exact: true }).click();
  await page.getByRole('button', { name: /वास्तु/ }).first().click();
  await expect(page.getByTestId('vastu-score')).toHaveText(/^8/);
  await expect(page.getByRole('heading', { name: 'वास्तु स्कोर' })).toBeVisible();
  await w.check();
});

test('vastu: zone tiles, zone lines, north marker, zone map', async ({ page }) => {
  await page.route(/\/api\/v1\/vastu\/analyze/, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
  const w = await open(page, '/vastu-checker');

  // No plan yet: nine tiles, and their codes turn with the north choice.
  const first = page.locator('.vastu-tile').first().locator('b');
  await expect(page.locator('.vastu-tile')).toHaveCount(9);
  await expect(first).toHaveText('NW');
  await page.getByText('Right', { exact: true }).click();
  await expect(first).toHaveText('SW');
  await page.getByText('Top', { exact: true }).click();
  await expect(first).toHaveText('NW');

  // With a plan: zone lines on the plan, a toggle, and none while north is unknown.
  await page.locator('input[type=file]').setInputFiles(PLAN);
  await expect(page.locator('.vastu-zone')).toHaveCount(9);
  await page.getByRole('button', { name: 'Hide zones' }).click();
  await expect(page.locator('.vastu-zone')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show zones on plan' }).click();
  await expect(page.locator('.vastu-zone')).toHaveCount(9);
  await page.getByText('Not sure', { exact: true }).click();
  await expect(page.locator('.vastu-zone')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /zones/i })).toHaveCount(0);
  await page.getByText('Top', { exact: true }).click();

  await page.getByRole('button', { name: 'Analyze Vastu' }).click();
  await expect(page.getByTestId('vastu-score')).toHaveText(/^8/);

  // Zone map: every zone with rooms is toned; empty ones are off; a click marks the room rows.
  await expect(page.locator('.vastu-cell.is-good')).toHaveCount(6);
  await expect(page.locator('.vastu-cell.is-bad')).toContainText('Toilet');
  await expect(page.locator('.vastu-cell.is-bad')).toContainText('Problematic');
  await expect(page.locator('.vastu-cell.is-empty')).toHaveCount(2);
  await expect(page.locator('.vastu-cell.is-empty').first()).toBeDisabled();
  await expect(page.locator('.vastu-room').first()).toContainText('Toilet');
  await page.locator('.vastu-cell.is-bad').click();
  await expect(page.locator('.vastu-cell.is-bad')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.vastu-room.is-active')).toHaveCount(1);
  await expect(page.locator('.vastu-room.is-active')).toContainText('Toilet');
  await page.locator('.vastu-cell.is-bad').click();
  await expect(page.locator('.vastu-room.is-active')).toHaveCount(0);
  await expect(page.getByRole('img', { name: 'North arrow: Top' })).toBeVisible();
  await axe(page);
  await w.check();
});

test('ai design studio: free, no sign-in; generate, compare, save, gallery, errors', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: async () => undefined, configurable: true });
  });
  const calls: { mode: string; prompt: string; image?: string; auth: string | null }[] = [];
  let fail = 0;
  await page.route(/\/api\/v1\/design-studio\/generate/, async (route) => {
    calls.push({ ...(route.request().postDataJSON() as { mode: string; prompt: string; image?: string }), auth: route.request().headers()['authorization'] ?? null });
    await new Promise((r) => setTimeout(r, 300));
    if (fail) return route.fulfill({ status: fail, contentType: 'application/json', body: JSON.stringify({ error: { code: 'QUOTA_EXCEEDED', message: 'The image service is at its limit. Try again later.' } }) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ image: PNG }) });
  });
  const w = await open(page, '/ai-design-studio');
  await expect(page.getByText(/^Free\. No sign-up\./)).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i })).toHaveCount(0);
  await axe(page);

  // Every form control.
  await page.getByRole('radio', { name: /Exterior/ }).click();
  await expect(page.getByRole('radio', { name: 'Swimming Pool' })).toBeVisible();
  await page.getByRole('radio', { name: 'Garden', exact: true }).click();
  await page.getByRole('radio', { name: /Interior/ }).click();
  await expect(page.getByRole('radio', { name: 'Living Room' })).toHaveAttribute('aria-checked', 'true');
  for (const room of ['Bedroom', 'Pooja Room', 'Home Office']) await page.getByRole('radio', { name: room, exact: true }).click();
  for (const style of ['Luxury', 'Japanese']) await page.getByRole('radio', { name: style, exact: true }).click();
  await expect(page.getByText('Calm, natural materials, sliding panels.')).toBeVisible();
  await page.getByRole('textbox', { name: /Custom Instructions/ }).fill('large window');

  await page.getByRole('button', { name: 'Generate Design' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Creating Your Design' })).toBeVisible();
  await expect(page.getByTestId('aid-image')).toBeVisible();
  const first = calls[0]!;
  expect(first.mode).toBe('text-to-image');
  expect(first.prompt).toMatch(/^Interior design of a Home Office, Japanese design/);
  expect(first.prompt).toContain('large window');
  expect(first.auth).toBeNull();

  await page.getByText('View prompt used').click();
  await expect(page.getByText(/Interior design of a Home Office/).last()).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download' }).click();
  expect((await download).suggestedFilename()).toMatch(/^360ghar-design-\d+\.png$/);
  await page.getByRole('button', { name: 'Share' }).click();
  await page.getByRole('button', { name: 'Save to Gallery' }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Open design 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Regenerate' }).click();
  await expect.poll(() => calls.length).toBe(2);
  await expect(page.getByRole('button', { name: 'Save to Gallery' })).toBeEnabled();
  await axe(page);

  // Image to image: needs a photo, then shows the compare slider.
  await page.getByRole('radio', { name: /Reimagine Photo/ }).click();
  await page.getByRole('button', { name: 'Generate Design' }).click();
  await expect(page.getByText('Please upload a photo to reimagine')).toBeVisible();
  await page.locator('input[type=file]').setInputFiles(PLAN);
  await expect(page.getByRole('img', { name: 'Source preview' })).toBeVisible();
  await page.getByRole('button', { name: 'Generate Design' }).click();
  const compare = page.getByRole('slider', { name: 'Show more of the original or the redesign' });
  await expect(compare).toBeVisible();
  expect(calls[2]!.mode).toBe('image-to-image');
  expect(calls[2]!.image?.length).toBeGreaterThan(10);
  await compare.fill('20');
  await expect(page.locator('.aid-compare')).toHaveAttribute('style', /--cmp: 20%/);
  await page.getByRole('button', { name: 'Remove' }).click();

  // Gallery: open, delete, clear with undo.
  await page.getByRole('button', { name: 'Save to Gallery' }).click();
  await page.getByRole('button', { name: 'Open design 2' }).click();
  await expect(page.getByTestId('aid-image')).toBeVisible();
  await page.getByRole('button', { name: 'Delete design 2' }).click();
  await expect(page.getByRole('button', { name: 'Open design 2' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear All' }).click();
  await expect(page.getByRole('button', { name: 'Open design 1' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('button', { name: 'Open design 1' })).toBeVisible();

  // The per-device rate limit (429) shows a clear state.
  await page.getByRole('button', { name: 'New Design' }).click();
  fail = 429;
  await page.getByRole('button', { name: 'Generate Design' }).click();
  await expect(page.getByText('Too many designs at once')).toBeVisible();
  await expect(page.getByText('Wait about a minute')).toBeVisible();
  await axe(page);
  await page.getByRole('button', { name: 'Start Over' }).click();
  await expect(page.getByText('Too many designs at once')).toHaveCount(0);
  await page.getByRole('button', { name: 'Generate Design' }).click();
  await expect(page.getByText('Too many designs at once')).toBeVisible();
  fail = 0;
  await page.getByRole('button', { name: 'Try Again' }).click();
  await expect(page.getByTestId('aid-image')).toBeVisible();
  await w.check();
});

test('ai design studio: Hindi page', async ({ page }) => {
  const w = await open(page, '/hi/ai-design-studio');
  await page.getByRole('radio', { name: /एक्सटीरियर/ }).click();
  await expect(page.getByRole('radio', { name: 'बगीचा' })).toBeVisible();
  await w.check();
});

test('design blueprint: the planner loads in a same-origin iframe', async ({ page }) => {
  const w = await open(page, '/design-blueprint');
  const frame = page.frameLocator('iframe[title="360Ghar Blueprint Designer"]');
  await expect(frame.getByText('Blueprint Studio').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Loading blueprint designer...')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Check the Vastu of your design' })).toHaveAttribute('href', '/vastu-checker');
  await expect(page.getByRole('link', { name: 'Open the planner in a full window' })).toHaveAttribute('href', '/blueprint3d/index.html');
  await axeOutsideFrame(page);
  await w.check();
});

test('design blueprint: a load that hangs shows the error, and Try again loads it', async ({ page }) => {
  await page.clock.install();
  let hang = true;
  await page.route(/\/blueprint3d\/index\.html/, (route) => (hang ? undefined : route.continue()));
  const w = await open(page, '/design-blueprint');
  await expect(page.getByRole('status').filter({ hasText: 'Loading blueprint designer...' })).toBeVisible();
  await page.clock.fastForward(16_000);
  await expect(page.getByRole('heading', { name: 'The 3D planner did not load' })).toBeVisible();
  await axeOutsideFrame(page);
  hang = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.frameLocator('iframe[title="360Ghar Blueprint Designer"]').getByText('Blueprint Studio').first()).toBeVisible({ timeout: 30_000 });
  await w.check();
});
