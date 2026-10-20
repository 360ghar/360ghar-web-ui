import { expect, test, type Page } from '@playwright/test';
import { axe, backendDown, hydrated, signedIn, watch } from './helpers';

async function fillToLastStep(page: Page) {
  const next = page.getByRole('button', { name: 'Continue' });
  // Step 1: nothing chosen yet, so the type error shows.
  await next.click();
  await expect(page.getByText('Choose the type of property.')).toBeVisible();
  await page.getByRole('radio', { name: 'Builder floor' }).click();
  await next.click();
  // Step 2.
  await expect(page.getByText('Step 2 of 6')).toBeVisible();
  await page.getByLabel('Full address').fill('House 12, Sector 23, Palam Vihar');
  await page.getByLabel('Locality or sector').fill('Palam Vihar');
  await next.click();
  // Step 3.
  await page.getByLabel('Bedrooms').fill('3');
  await page.getByLabel('Floor', { exact: true }).fill('5');
  await page.getByLabel('Total floors').fill('4');
  await next.click();
  await expect(page.getByText('The floor cannot be above the top floor.')).toBeVisible();
  await page.getByLabel('Floor', { exact: true }).fill('2');
  await next.click();
  // Step 4: rent needs the monthly rent.
  await next.click();
  await expect(page.getByText('Enter the monthly rent.')).toBeVisible();
  await page.getByLabel('Monthly rent (₹)').fill('32000');
  await next.click();
  // Step 5: photos are optional.
  await expect(page.getByText('Step 5 of 6')).toBeVisible();
  await next.click();
  // Step 6.
  await page.getByRole('button', { name: 'Use a suggested title' }).click();
  await expect(page.getByLabel('Listing title')).toHaveValue('3 BHK Builder floor for rent in Palam Vihar');
  // Arriving on the last step must not submit the form (no terms error yet).
  await expect(page.getByText('Accept the terms to continue.')).toHaveCount(0);
  await page.getByLabel('Your name').fill('Asha Verma');
  await page.getByLabel('Your mobile number').fill('9876543210');
}

test('signed out: the draft survives the trip to sign in', async ({ page }) => {
  const w = watch(page);
  await page.goto('/post-property');
  await hydrated(page);
  await expect(page.getByText('Step 1 of 6')).toBeVisible();
  await axe(page);
  await fillToLastStep(page);
  await page.getByRole('button', { name: 'Sign in to post' }).click();
  await expect(page.getByText('Accept the terms to continue.')).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Sign in to post' }).click();
  await page.waitForURL(/\/login\?next=%2Fpost-property/, { waitUntil: 'commit' });
  await page.goto('/post-property');
  await expect(page.getByText('We restored your draft.')).toBeVisible();
  await expect(page.getByText('Step 6 of 6')).toBeVisible();
  await expect(page.getByLabel('Your name')).toHaveValue('Asha Verma');
  await w.check();
});

test('signed in: posts the payload and shows the listing link', async ({ page }) => {
  const w = watch(page);
  await signedIn(page);
  let body: Record<string, unknown> | null = null;
  await page.route(/\/api\/v1\/properties$/, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    body = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 201, json: { id: 9999, ...body } });
  });
  await page.goto('/post-property');
  await hydrated(page);
  await fillToLastStep(page);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Post my property' }).click();
  await expect(page.getByRole('heading', { name: 'Your property is posted' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'See the listing' })).toHaveAttribute('href', '/property/9999');
  await expect(page.getByText('What happens next')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to My listings' })).toHaveAttribute('href', '/account?tab=listings');
  await axe(page);
  await page.getByRole('button', { name: 'Post another property' }).click();
  await expect(page.getByText('Step 1 of 6')).toBeVisible();
  expect(body).toMatchObject({ purpose: 'rent', property_type: 'builder_floor', base_price: 32000, monthly_rent: 32000, bedrooms: 3, owner_contact: '+919876543210', city: 'Gurugram' });
  await w.check();
});

test('signed in: a 422 from the server lands on its field', async ({ page }) => {
  await signedIn(page);
  await page.route(/\/api\/v1\/properties$/, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 422, json: { error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', details: { fields: [{ field: 'body.full_address', msg: 'Value error, Address looks incomplete', type: 'value_error' }] } } } })
      : route.fallback(),
  );
  await page.goto('/post-property');
  await hydrated(page);
  await fillToLastStep(page);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Post my property' }).click();
  await expect(page.getByText('Step 2 of 6')).toBeVisible();
  await expect(page.getByText('Address looks incomplete')).toBeVisible();
});

test('backend down: the wizard still works to the last step', async ({ page }) => {
  const w = watch(page);
  await backendDown(page);
  await page.goto('/post-property');
  await hydrated(page);
  await fillToLastStep(page);
  await expect(page.getByText('Step 6 of 6')).toBeVisible();
  await w.check();
});

test('old URLs redirect (301) to the live pages', async ({ page }) => {
  await page.goto('/add-new-listing');
  await expect(page).toHaveURL(/\/post-property$/);
  await expect(page.getByRole('heading', { level: 1, name: 'List your property' })).toBeVisible();
  await page.goto('/property-sidebar');
  await expect(page).toHaveURL(/\/properties$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Homes in Gurugram' })).toBeVisible();
});

test('edit mode: loads the listing and saves with PUT', async ({ page }) => {
  await signedIn(page);
  const listing = {
    id: 4242, title: '2 BHK Apartment for rent in Sector 56', property_type: 'apartment', purpose: 'rent', base_price: 28000, monthly_rent: 28000,
    full_address: 'Tower B, Sector 56, Gurugram', locality: 'Sector 56', city: 'Gurugram', bedrooms: 2, bathrooms: 2, owner_name: 'Asha Verma',
    owner_contact: '+919876543210', amenities: [], images: [],
  };
  let put: Record<string, unknown> | null = null;
  await page.route(/\/api\/v1\/properties\/4242$/, async (route) => {
    if (route.request().method() === 'PUT') {
      put = route.request().postDataJSON() as Record<string, unknown>;
      return route.fulfill({ json: { ...listing, ...put } });
    }
    return route.fulfill({ json: listing });
  });
  await page.goto('/post-property?edit=4242');
  await hydrated(page);
  await expect(page.getByRole('radio', { name: 'Apartment' })).toHaveAttribute('aria-checked', 'true');
  const next = page.getByRole('button', { name: 'Continue' });
  for (const k of [2, 3]) {
    await next.click();
    await expect(page.getByText(`Step ${k} of 6`)).toBeVisible();
  }
  // PropertyUpdate takes these now (backend-gaps R23), so every one of them can be changed.
  for (const label of ['Balconies', 'Parking spaces', 'Age (years)', 'Bedrooms']) await expect(page.getByLabel(label)).not.toHaveAttribute('readonly', '');
  await page.getByLabel('Balconies').fill('2');
  await next.click();
  await page.getByLabel('Monthly rent (₹)').fill('30000');
  await next.click();
  await next.click();
  await expect(page.getByLabel('Listing title')).toHaveValue(listing.title);
  // Owner fields and the terms box are not asked again when editing.
  await expect(page.getByText('The owner name and phone cannot be changed here.', { exact: false })).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: 'Changes saved' })).toBeVisible();
  // PUT is a patch: an emptied field is null (it clears), no amenities and no photos are [].
  expect(put).toMatchObject({ monthly_rent: 30000, base_price: 30000, bedrooms: 2, balconies: 2, daily_rate: null, available_from: null, amenity_ids: [], image_urls: [], main_image_url: null });
  expect(put).not.toHaveProperty('owner_contact');
  expect(put).not.toHaveProperty('owner_name');
  // Not a PG or flatmate listing: the PG preferences are not touched, and the fields the backend refuses to clear are never null.
  expect(put).not.toHaveProperty('gender_preference');
  expect((put as unknown as Record<string, unknown>).title).toBe(listing.title);
  await expect(page.getByRole('link', { name: 'Go to My listings' })).toBeVisible();

  // "Add photos" in My listings opens the photo step of the edit form.
  await page.goto('/post-property?edit=4242&step=photos');
  await hydrated(page);
  await expect(page.getByText('Step 5 of 6')).toBeVisible();
});

/** The live preview: the sticky aside from 1024 px, else the strip above the form (its content is in the page even when closed). */
const preview = (page: Page) => page.locator((page.viewportSize()?.width ?? 0) >= 1024 ? '.post-aside .post-preview' : '.post-peek .post-preview');

const photo = (k: number) => `http://localhost:4321/og-image-home.jpg?p=${k}`;
const png = { mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64') };

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

test('signed in: photos upload, reorder, change cover and remove', async ({ page, isMobile }) => {
  const w = watch(page);
  await signedIn(page);
  let n = 0;
  await page.route(/\/api\/v1\/upload\/batch/, async (route) => {
    const files = (route.request().postData() ?? '').split('filename=').length - 1;
    // BatchUploadResponse: one item per file, in request order.
    await route.fulfill({ json: { items: Array.from({ length: files }, (_, index) => ({ index, filename: `f${index}.png`, status: 'uploaded', result: { public_url: photo((n += 1)) }, error: null })) } });
  });
  await page.goto('/post-property');
  await hydrated(page);
  await toPhotos(page);
  await page.locator('input[type=file]').setInputFiles([
    { name: 'a.png', ...png },
    { name: 'b.png', ...png },
    { name: 'c.png', ...png },
    { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('x') },
  ]);
  const imgs = page.locator('.post-photos li:not(.post-pending) img');
  await expect(imgs).toHaveCount(3);
  await expect(page.getByText('1 file was skipped.', { exact: false })).toBeVisible();
  await expect(page.locator('.post-photos li').first().getByText('Cover')).toBeVisible();
  // The live preview uses the cover.
  await expect(preview(page).locator('img')).toHaveAttribute('src', photo(1));
  await axe(page);

  await page.getByRole('button', { name: 'Move photo later: Photo 1 of 3' }).click();
  await expect(imgs.first()).toHaveAttribute('src', photo(2));
  await page.getByRole('button', { name: 'Move photo earlier: Photo 2 of 3' }).click();
  await expect(imgs.first()).toHaveAttribute('src', photo(1));
  await page.locator('.post-photos li').nth(2).getByRole('button', { name: 'Make cover' }).click();
  await expect(imgs.first()).toHaveAttribute('src', photo(3));
  await expect(preview(page).locator('img')).toHaveAttribute('src', photo(3));
  await page.getByRole('button', { name: 'Remove photo: Photo 2 of 3' }).click();
  await expect(imgs).toHaveCount(2);

  // Files dropped on the tray upload too.
  const dt = await page.evaluateHandle(() => {
    const d = new DataTransfer();
    d.items.add(new File(['x'], 'd.png', { type: 'image/png' }));
    return d;
  });
  await page.locator('.post-drop').dispatchEvent('drop', { dataTransfer: dt });
  await expect(imgs).toHaveCount(3);

  // Drag to reorder with a mouse (not on the touch phone profile).
  if (!isMobile) {
    const before = await imgs.nth(1).getAttribute('src');
    await page.locator('.post-photos li').nth(1).dragTo(page.locator('.post-photos li').nth(0));
    await expect(imgs.first()).toHaveAttribute('src', before!);
  }
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Step 6 of 6')).toBeVisible();
  await w.check();
});

test('the step bar opens earlier steps, and tips jump to their step', async ({ page }) => {
  const w = watch(page);
  await backendDown(page);
  await page.goto('/post-property');
  await hydrated(page);
  const wide = (page.viewportSize()?.width ?? 0) >= 1024;
  await expect(page.locator(wide ? '.post-aside' : '.post-peek')).toContainText('Choose the type of property to see your card.');
  // "Draft saved" appears after the first change, in a line that was kept free.
  const note = page.locator('.post-draft');
  await expect(note).toHaveText('');
  const navTop = await page.locator('.post-nav').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  // Purpose is one segmented control; PG allows rent only.
  await page.getByRole('button', { name: 'Sell' }).click();
  await expect(page.getByRole('button', { name: 'Sell' })).toHaveAttribute('aria-pressed', 'true');
  await expect(note).toHaveText('Draft saved on this device');
  expect(await page.locator('.post-nav').evaluate((el) => el.getBoundingClientRect().top + window.scrollY)).toBe(navTop);
  await page.getByRole('radio', { name: 'PG' }).click();
  await expect(page.getByRole('button', { name: 'Sell' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Rent out' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('radio', { name: 'Builder floor' }).click();
  await expect(preview(page)).toContainText('Builder floor');
  await expect(preview(page)).toContainText('Price not added yet');
  // No photo yet: the paper camera fills the card's photo box.
  await expect(preview(page).locator('img')).toHaveAttribute('src', /^data:image\/svg\+xml/);
  const next = page.getByRole('button', { name: 'Continue' });
  await next.click();
  await page.getByLabel('Full address').fill('House 12, Sector 23, Palam Vihar');
  await page.getByLabel('Locality or sector').fill('Palam Vihar');
  await next.click();
  await expect(page.getByText('Step 3 of 6')).toBeVisible();
  await expect(preview(page)).toContainText('Palam Vihar');

  await page.getByRole('button', { name: 'Go back to What' }).click();
  await expect(page.getByText('Step 1 of 6')).toBeVisible();
  await page.getByRole('button', { name: 'Details' }).click();
  await expect(page.getByText('Step 3 of 6')).toBeVisible();
  await next.click();
  await page.getByLabel('Monthly rent (₹)').fill('32000');
  await expect(preview(page)).toContainText('32,000');
  await expect(preview(page)).not.toContainText('Price not added yet');
  if (wide) {
    await page.locator('.post-aside').getByRole('button', { name: 'Add the area' }).click();
  } else {
    // The strip opens over the form: the form does not move.
    const top = () => page.locator('.post-sheet').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const before = await top();
    await page.locator('.post-peek summary').click();
    await expect(page.locator('.post-peek')).toHaveAttribute('open', '');
    expect(await top()).toBe(before);
    await page.locator('.post-peek').getByRole('button', { name: 'Add the area' }).click();
    await expect(page.locator('.post-peek')).not.toHaveAttribute('open', '');
  }
  await expect(page.getByText('Step 3 of 6')).toBeVisible();
  await expect(page.getByLabel('Area (sq ft)')).toBeVisible();
  await w.check();
});

test('the Hindi wizard renders', async ({ page }) => {
  const w = watch(page);
  await page.goto('/hi/post-property');
  await hydrated(page);
  await expect(page.getByText('चरण 1 / 6: क्या')).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) >= 1024) await expect(page.getByRole('heading', { name: 'यह ऐसा दिखेगा' })).toBeVisible();
  else await expect(page.locator('.post-peek summary')).toContainText('अपना कार्ड देखें');
  await page.getByRole('radio', { name: 'बिल्डर फ़्लोर' }).click();
  await expect(page.locator('.post-draft')).toHaveText('ड्राफ़्ट इसी डिवाइस पर सेव है');
  await w.check();
});
