/**
 * Owner and tenant AI tools: the rent agreement and legal notice drafters, the listing writer and virtual staging.
 * They are behind PUBLIC_AI_OWNER_TOOLS (src/lib/flags.ts), which CI sets; without it the routes are a 404.
 * Every backend call is mocked.
 */
import { expect, test, type Page } from '@playwright/test';
import { axe, hydrated, signedIn, watch } from './helpers';

const ON = process.env.PUBLIC_AI_OWNER_TOOLS === 'true';

const photo = (k: number) => `http://localhost:4321/og-image-home.jpg?p=${k}`;
const png = { mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64') };

test.describe('without the flag', () => {
  test.skip(ON, 'the flag is on');
  test('the drafter routes are a 404', async ({ request }) => {
    for (const path of ['/rent-agreement-drafter', '/legal-notice-drafter']) expect((await request.get(path)).status()).toBe(404);
  });
});

test.describe('with the flag', () => {
  test.skip(!ON, 'set PUBLIC_AI_OWNER_TOOLS=true');

  const rent = {
    landlord_name: 'Sunita Gupta', landlord_address: 'A-1, DLF Phase 1, Gurugram', tenant_name: 'Rahul Sharma', tenant_address: 'B-2, Sector 57, Gurugram',
    property_address: 'Flat 402, Tower B, DLF Phase 1, Gurugram', monthly_rent: '25000', security_deposit: '75000', start_date: '2026-11-01',
  };

  test('rent agreement: validates, sends the fields, shows the draft with the disclaimer', async ({ page }) => {
    const w = watch(page);
    let body: { kind: string; fields: Record<string, unknown> } | null = null;
    await page.route(/\/api\/v1\/ai\/legal-draft/, (route) => {
      body = route.request().postDataJSON();
      return route.fulfill({ json: { title: 'Leave and licence agreement', clauses: [{ heading: '1. Term', text: 'Eleven months.' }] } });
    });
    await page.goto('/rent-agreement-drafter');
    await hydrated(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Rent agreement drafter' })).toBeVisible();
    // The disclaimer is there before any draft.
    await expect(page.getByText('This is a draft, not legal advice.').first()).toBeVisible();
    await page.getByRole('button', { name: 'Draft the document' }).click();
    await expect(page.getByText('Fill in this field.').first()).toBeVisible();
    expect(body).toBeNull();
    for (const [k, v] of Object.entries(rent)) await page.locator(`[name=${k}]`).fill(v);
    await page.getByRole('button', { name: 'Draft the document' }).click();
    await expect(page.locator('.ld-paper').first().getByText('Eleven months.')).toBeVisible();
    await expect(page.locator('.ld-paper').first().getByText('This is a draft, not legal advice.')).toBeVisible();
    expect(body).toMatchObject({ kind: 'rent_agreement', fields: { monthly_rent: 25000, term_months: 11, maintenance_paid_by: 'tenant', tenant_name: 'Rahul Sharma' } });
    await axe(page);
    await w.check();
  });

  test('legal notice: the rate limit shows a plain message', async ({ page }) => {
    await page.route(/\/api\/v1\/ai\/legal-draft/, (route) => route.fulfill({ status: 429, json: { detail: 'Too many' } }));
    await page.goto('/legal-notice-drafter');
    await hydrated(page);
    const f = { property_address: 'Flat 1, Gurugram', facts: 'The deposit was not returned after I left.', sender_name: 'A Tenant', sender_address: 'Sector 1', recipient_name: 'A Landlord', recipient_address: 'Sector 2' };
    for (const [k, v] of Object.entries(f)) await page.locator(`[name=${k}]`).fill(v);
    await page.getByRole('button', { name: 'Draft the document' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'You have made 5 drafts in the last hour' })).toBeVisible();
  });

  test('the Hindi drafter renders in Hindi', async ({ page }) => {
    await page.goto('/hi/legal-notice-drafter');
    await hydrated(page);
    await expect(page.getByRole('heading', { level: 1, name: 'लीगल नोटिस ड्राफ़्टर' })).toBeVisible();
    await expect(page.getByText('यह ड्राफ़्ट है, क़ानूनी सलाह नहीं').first()).toBeVisible();
  });

  test('both drafters are in the tools list', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.getByRole('link', { name: /Rent agreement drafter/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Legal notice drafter/ }).first()).toBeVisible();
  });

  async function toPhotos(page: Page) {
    const next = page.getByRole('button', { name: 'Continue' });
    await page.getByRole('radio', { name: 'Builder floor' }).click();
    await next.click();
    await page.getByLabel('Full address').fill('House 12, Sector 23, Palam Vihar');
    await page.getByLabel('Locality or sector').fill('Palam Vihar');
    await next.click();
    await next.click();
    await page.getByLabel('Monthly rent (₹)').fill('32000');
    await next.click();
    await expect(page.getByText('Step 5 of 6')).toBeVisible();
  }

  async function withPhotos(page: Page) {
    await signedIn(page);
    let n = 0;
    await page.route(/\/api\/v1\/upload\/batch/, async (route) => {
      const files = (route.request().postData() ?? '').split('filename=').length - 1;
      await route.fulfill({ json: { items: Array.from({ length: files }, (_, index) => ({ index, filename: `f${index}.png`, status: 'uploaded', result: { public_url: photo((n += 1)) }, error: null })) } });
    });
    await page.goto('/post-property');
    await hydrated(page);
    await toPhotos(page);
    await page.locator('input[type=file]').setInputFiles([{ name: 'a.png', ...png }, { name: 'b.png', ...png }]);
    await expect(page.locator('.post-photos li:not(.post-pending) img')).toHaveCount(2);
  }

  test('virtual staging: a labelled copy replaces the photo, and the original comes back', async ({ page }) => {
    const w = watch(page);
    let sent: Record<string, unknown> | null = null;
    await page.route(/\/api\/v1\/design-studio\/stage/, (route) => {
      sent = route.request().postDataJSON();
      return route.fulfill({ json: { image_url: 'https://res.cloudinary.com/demo/image/upload/staged-1.jpg' } });
    });
    await withPhotos(page);
    const first = page.locator('.post-photos li').first();
    await first.getByRole('button', { name: 'Virtually stage' }).click();
    await expect(first.getByText('Virtually staged')).toBeVisible();
    await expect(first.locator('img')).toHaveAttribute('src', /staged-1\.jpg/);
    expect(sent).toEqual({ image_url: photo(1) });
    await expect(page.getByText('Staged photos are marked')).toBeVisible();
    await first.getByRole('button', { name: 'Show original' }).click();
    await expect(first.getByText('Virtually staged')).toHaveCount(0);
    await expect(first.locator('img')).toHaveAttribute('src', photo(1));
    await w.check();
  });

  test('listing writer: the draft is editable and fills the form only when used', async ({ page }) => {
    let sent: { image_urls: string[]; details: Record<string, unknown> } | null = null;
    await page.route(/\/api\/v1\/ai\/listing-draft/, (route) => {
      sent = route.request().postDataJSON();
      return route.fulfill({ json: { title: 'Bright 3 BHK floor in Palam Vihar', description: 'A second-floor home with parking.' } });
    });
    await withPhotos(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Step 6 of 6')).toBeVisible();
    await page.getByRole('button', { name: 'Write it with AI' }).click();
    const title = page.getByLabel('Suggested title');
    await expect(title).toHaveValue('Bright 3 BHK floor in Palam Vihar');
    expect(sent!.image_urls).toEqual([photo(1), photo(2)]);
    expect(sent!.details).toMatchObject({ city: 'Gurugram', locality: 'Palam Vihar', property_type: 'builder_floor' });
    // Nothing is in the form yet.
    await expect(page.getByLabel('Listing title')).toHaveValue('');
    await title.fill('Bright 3 BHK floor, Palam Vihar');
    await page.getByRole('button', { name: 'Use this text' }).click();
    await expect(page.getByLabel('Listing title')).toHaveValue('Bright 3 BHK floor, Palam Vihar');
    await expect(page.getByLabel('Description')).toHaveValue('A second-floor home with parking.');
    await expect(page.getByLabel('Suggested title')).toHaveCount(0);
  });
});
