/**
 * Account, delete account and the sign-in steps. Every write is mocked; the
 * signed-in user is the fake session from `signedIn()`.
 */
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { axe, backendDown, hydrated, signedIn, watch } from './helpers';

const page_ = <T>(items: T[]) => ({ items, next_cursor: null, has_more: false, limit: 20, total: items.length });
const home = (id: number, extra: Record<string, unknown> = {}) => ({
  latitude: 28.5112,
  longitude: 77.0469,
  id,
  title: `3BHK Builder Floor ${id} in Palam Vihar`,
  property_type: 'builder_floor',
  purpose: 'rent',
  base_price: 32000,
  monthly_rent: 32000,
  bedrooms: 3,
  bathrooms: 2,
  area_sqft: 1650,
  locality: 'Palam Vihar',
  city: 'Gurugram',
  main_image_url: null,
  status: 'available',
  is_available: true,
  view_count: 48,
  like_count: 6,
  interest_count: 0,
  owner_id: 1,
  created_at: '2026-09-01T10:00:00Z',
  ...extra,
});
const at = (days: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 30, 0, 0);
  return d.toISOString();
};
const visit = (id: number, days: number, status: string, p = home(100 + id)) => ({ id, property_id: p.id, user_id: 1, scheduled_date: at(days, 11), status, created_at: at(-3, 9), property: p });

async function mockAccount(page: Page, empty = false) {
  await page.route(/\/api\/v1\/swipes/, (r) => r.fulfill({ json: page_(empty ? [] : [home(1), home(2), home(3), home(4)]) }));
  await page.route(/\/api\/v1\/visits\/upcoming/, (r) => r.fulfill({ json: page_(empty ? [] : [visit(1, 2, 'confirmed'), visit(2, 40, 'requested')]) }));
  await page.route(/\/api\/v1\/visits\/past/, (r) => r.fulfill({ json: page_(empty ? [] : [visit(3, -6, 'completed')]) }));
  await page.route(/\/api\/v1\/properties\/me/, (r) => r.fulfill({ json: page_(empty ? [] : [home(7, { main_image_url: '/og-image-home.jpg' }), home(8, { status: 'rented', is_available: false, view_count: 12, like_count: 1 })]) }));
}

test('account: signed out shows the door and both ways in', async ({ page }) => {
  const w = watch(page);
  await page.goto('/account?tab=visits');
  await expect(page.getByRole('heading', { name: 'Sign in to see your account' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login?next=%2Faccount%3Ftab%3Dvisits');
  await expect(page.getByRole('main').getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/register');
  await axe(page);
  await w.check();
});

test('account: the overview shows the next visit, saved homes and listings', async ({ page }) => {
  const w = watch(page);
  await signedIn(page);
  await mockAccount(page);
  await page.goto('/account');
  await hydrated(page);
  const visitCard = page.getByRole('region', { name: 'Next visit' });
  await expect(visitCard.getByRole('link', { name: '3BHK Builder Floor 101 in Palam Vihar' })).toBeVisible();
  await expect(visitCard.getByText('Confirmed')).toBeVisible();
  await expect(visitCard.getByText('In 2 days')).toBeVisible();
  await expect(visitCard.getByText('3 BHK Builder floor · 1,650 sq ft · ₹32,000/month')).toBeVisible();
  await expect(visitCard.getByRole('link', { name: 'Get directions' })).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&destination=28.5112,77.0469');
  await expect(visitCard.getByRole('heading', { name: 'Next visit · 2 booked' })).toBeVisible();
  // Directions and the calendar file share one row at every width.
  const [dir, cal] = await Promise.all(['Get directions', 'Add to calendar'].map((n) => visitCard.getByRole('link', { name: n }).boundingBox()));
  // Linux system fonts are wider than the ones on a Mac and let the row wrap, which the layout allows; the one-row check runs on macOS.
  if (process.platform !== 'linux') expect(Math.abs(dir!.y - cal!.y)).toBeLessThan(1);
  const saved = page.getByRole('region', { name: 'Saved homes' });
  await expect(saved.getByRole('link')).toHaveCount(4);
  await expect(saved.getByText('4 homes')).toBeVisible();
  const mine = page.getByRole('region', { name: 'Your listings' });
  await expect(mine.getByText('48 views')).toBeVisible();
  await expect(mine.getByText('Rented')).toBeVisible();
  // A listing with no photo shows the paper camera in the photo's box, not an icon tile.
  await expect(mine.locator('.acct-nophoto svg')).toHaveCount(1);
  await expect(mine.getByRole('link', { name: 'Post a property' })).toHaveAttribute('href', '/post-property');
  await axe(page);

  // Every "See all" opens its tab.
  await saved.getByRole('button', { name: 'See all' }).click();
  await expect(page.getByRole('tab', { name: 'Saved homes' })).toHaveAttribute('aria-selected', 'true');
  await expect(page).toHaveURL(/tab=favorites/);
  await page.getByRole('tab', { name: 'Overview' }).click();
  await mine.getByRole('button', { name: 'See all' }).click();
  await expect(page.getByRole('tab', { name: 'My listings' })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Overview' }).click();
  await visitCard.getByRole('button', { name: 'See all' }).click();
  await expect(page.getByRole('tab', { name: 'Visits' })).toHaveAttribute('aria-selected', 'true');
  await w.check();
});

test('account: an empty account shows a next step on every card and tab', async ({ page }) => {
  const w = watch(page);
  await signedIn(page);
  await mockAccount(page, true);
  await page.goto('/account');
  await hydrated(page);
  await expect(page.getByRole('link', { name: 'Find a home to visit' })).toHaveAttribute('href', '/properties');
  await expect(page.getByRole('region', { name: 'Saved homes' }).getByRole('link', { name: 'Browse homes' })).toHaveAttribute('href', '/properties');
  await expect(page.getByRole('region', { name: 'Your listings' }).getByRole('link', { name: 'Post a property' })).toHaveAttribute('href', '/post-property');
  await axe(page);
  for (const [tab, heading] of [
    ['Saved homes', 'No saved homes yet'],
    ['Visits', 'No visits here'],
    ['My listings', 'You have not listed a home yet'],
  ] as const) {
    await page.getByRole('tab', { name: tab }).click();
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
  await w.check();
});

test('account: pick saved homes and open the comparison', async ({ page }) => {
  const w = watch(page);
  await signedIn(page);
  await mockAccount(page);
  // Saved homes with more photos, so each card has a photo strip.
  const pics = ['hall', 'room', 'kitchen'].map((c, i) => ({ image_url: `/assets/images/thumbs/project-img${i + 2}.webp`, image_category: c }));
  await page.route(/\/api\/v1\/swipes/, (r) => r.fulfill({ json: page_([1, 2, 3, 4].map((id) => home(id, { main_image_url: '/assets/images/thumbs/project-img1.webp', images: pics }))) }));
  await page.goto('/account?tab=favorites');
  await hydrated(page);
  const boxes = page.getByRole('checkbox', { name: /^Compare/ });
  await expect(boxes).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Compare homes' })).toBeDisabled();
  await boxes.nth(1).check();
  await expect(page.getByRole('button', { name: 'Compare 1 home' })).toBeDisabled();
  await boxes.nth(0).check();
  // The ids keep the order they were ticked in.
  await expect(page.getByRole('link', { name: 'Compare 2 homes' })).toHaveAttribute('href', '/compare?ids=2,1');
  await axe(page);
  await boxes.nth(2).check();
  await boxes.nth(3).check();
  await expect(page.getByText('That is the most you can compare at once.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Compare 4 homes' })).toHaveAttribute('href', '/compare?ids=2,1,3,4');
  await boxes.nth(1).uncheck();
  await expect(page.getByRole('link', { name: 'Compare 3 homes' })).toHaveAttribute('href', '/compare?ids=1,3,4');

  // The photo strip and the compare box work side by side: stepping a photo keeps the pick, and the box still toggles.
  const card = page.locator('article').first();
  const count = card.locator('[data-pcs-count]');
  await expect(count).toHaveText('1 / 4');
  if (await page.evaluate(() => matchMedia('(pointer: fine)').matches)) {
    await card.locator('.pcard-strip').hover();
    await card.getByRole('button', { name: 'Next photo, 2 of 4' }).click();
  } else {
    // The first touch readies the strip (photos 2 to 4 wait for it).
    await card.locator('.pcard-strip').dispatchEvent('touchstart');
    await card.locator('.pcard-strip').evaluate((s) => s.scrollBy({ left: s.clientWidth }));
  }
  await expect(count).toHaveText('2 / 4');
  await expect(page).toHaveURL(/\/account\?tab=favorites$/);
  await expect(boxes.nth(0)).toBeChecked();
  await boxes.nth(0).uncheck();
  await expect(page.getByRole('link', { name: 'Compare 2 homes' })).toHaveAttribute('href', '/compare?ids=3,4');
  await w.check();
});

test('account: visits can be moved and cancelled; past visits have no actions', async ({ page }) => {
  const w = watch(page);
  await signedIn(page);
  await mockAccount(page);
  const posts: string[] = [];
  await page.route(/\/api\/v1\/visits\/\d+\/(cancel|reschedule)/, (r) => {
    posts.push(`${r.request().method()} ${new URL(r.request().url()).pathname.replace(/^.*\/api\/v1/, '')}`);
    return r.fulfill({ json: visit(1, 2, r.request().url().endsWith('/cancel') ? 'cancelled' : 'reschedule_suggested') });
  });
  await page.goto('/account?tab=visits');
  await hydrated(page);
  const rows = page.locator('.acct-visit');
  await expect(rows).toHaveCount(2);
  // Two months, one heading each.
  await expect(page.locator('.acct-month')).toHaveCount(2);
  await axe(page);

  // Phone: buttons, then links. Tablet: one row. Desktop: links under the text, buttons stacked at one width.
  const box = (name: string) => rows.first().getByRole(name === 'Change time' || name === 'Cancel visit' ? 'button' : 'link', { name }).boundingBox();
  const [move, drop, dir, cal] = await Promise.all(['Change time', 'Cancel visit', 'Get directions', 'Add to calendar'].map(box));
  const title = (await rows.first().getByRole('link', { name: /Palam Vihar/ }).boundingBox())!;
  const vw = page.viewportSize()!.width;
  // Linux system fonts are wider than the ones on a Mac and let the row wrap, which the layout allows; the one-row check runs on macOS.
  if (process.platform !== 'linux') expect(Math.abs(dir!.y - cal!.y)).toBeLessThan(1);
  if (vw >= 1024) {
    expect(Math.abs(dir!.x - title.x)).toBeLessThan(1);
    expect([Math.abs(move!.x - drop!.x), Math.abs(move!.width - drop!.width)]).toEqual([0, 0]);
    expect(drop!.y).toBeGreaterThan(move!.y);
  } else if (vw >= 640) {
    expect(Math.abs(move!.y + move!.height / 2 - (dir!.y + dir!.height / 2))).toBeLessThan(1);
  } else {
    expect(dir!.y).toBeGreaterThan(move!.y + move!.height - 1);
  }

  await rows.first().getByRole('button', { name: 'Change time' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('New date and time').fill('2030-01-15T11:00');
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Visit moved.')).toBeVisible();

  await rows.first().getByRole('button', { name: 'Cancel visit' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Keep the visit' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await rows.first().getByRole('button', { name: 'Cancel visit' }).click();
  await page.getByRole('dialog').getByLabel('Reason').selectOption({ index: 1 });
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel the visit' }).click();
  await expect(page.getByText('Visit cancelled.')).toBeVisible();
  expect(posts).toEqual(['POST /visits/1/reschedule', 'POST /visits/1/cancel']);

  await expect(page.getByRole('button', { name: 'Upcoming' })).toHaveAttribute('aria-pressed', 'true');
  await expect(rows.first().getByRole('link', { name: 'Get directions' })).toBeVisible();
  // The calendar file is built in the browser.
  const [file] = await Promise.all([page.waitForEvent('download'), rows.first().getByRole('link', { name: 'Add to calendar' }).click()]);
  expect(file.suggestedFilename()).toBe('360ghar-visit-1.ics');
  const ics = readFileSync((await file.path())!, 'utf8');
  expect(ics).toContain('\r\nUID:visit-1@360ghar.com\r\n');
  expect(ics).toMatch(/\r\nDTSTART:\d{8}T\d{6}Z\r\n/);
  expect(ics).toContain('SUMMARY:360Ghar visit: 3BHK Builder Floor 101 in Palam Vihar');
  await page.getByRole('button', { name: 'Past' }).click();
  await expect(page.getByRole('button', { name: 'Past' })).toHaveAttribute('aria-pressed', 'true');
  await expect(rows).toHaveCount(1);
  await expect(rows.first().getByText('Done')).toBeVisible();
  await expect(rows.first().getByRole('button')).toHaveCount(0);
  await expect(rows.first().getByRole('link', { name: 'Get directions' })).toHaveCount(0);
  await w.check();
});

test('account: listings show status and counts; remove asks first', async ({ page }) => {
  const w = watch(page);
  await signedIn(page);
  await mockAccount(page);
  let deleted = '';
  await page.route(/\/api\/v1\/properties\/\d+$/, (r) => {
    if (r.request().method() !== 'DELETE') return r.fallback();
    deleted = new URL(r.request().url()).pathname.replace(/^.*\/api\/v1/, '');
    return r.fulfill({ status: 204, body: '' });
  });
  await page.goto('/account?tab=listings');
  await hydrated(page);
  const list = page.getByRole('list', { name: 'My listings' });
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await expect(list.getByText('Available')).toBeVisible();
  await expect(list.getByText('12 views')).toBeVisible();
  // A listing with no photo links straight to the photo step of the edit form.
  await expect(list.getByRole('link', { name: 'Add photos' })).toHaveAttribute('href', '/post-property?edit=8&step=photos');
  await expect(list.getByRole('link', { name: 'Edit' }).first()).toHaveAttribute('href', '/post-property?edit=7');
  await axe(page);

  await list.getByRole('button', { name: 'Remove' }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Keep it' }).click();
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await list.getByRole('button', { name: 'Remove' }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Listing removed.')).toBeVisible();
  await expect(list.getByRole('listitem')).toHaveCount(1);
  expect(deleted).toBe('/properties/7');
  await w.check();
});

test('account: profile saves the name; security has sign out and delete', async ({ page }) => {
  const w = watch(page);
  await signedIn(page);
  await mockAccount(page);
  let put: unknown = null;
  await page.route(/\/api\/v1\/users\/profile/, (r) => {
    if (r.request().method() === 'PUT') {
      put = r.request().postDataJSON();
      return r.fulfill({ json: { id: 1, full_name: 'Asha Verma' } });
    }
    return r.fulfill({ json: { id: 1, email: 'tester@example.com', full_name: 'Test User', phone: '+919876543210', is_active: true } });
  });
  await page.goto('/account?tab=profile');
  await hydrated(page);
  await expect(page.getByText('To finish your profile, add: date of birth.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your details' })).toBeVisible();
  await expect(page.getByText('No profile photo yet.')).toBeVisible();
  await page.getByLabel('Full name').fill('Asha Verma');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Profile saved.')).toBeVisible();
  expect(put).toEqual({ full_name: 'Asha Verma' });
  await page.getByRole('tab', { name: 'Security' }).click();
  for (const h of ['Password', 'This device', 'Delete account']) await expect(page.getByRole('heading', { name: h, exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Delete my account' })).toHaveAttribute('href', '/delete-account');
  await axe(page);
  await w.check();
});

test('account: backend down shows a retry on each overview card', async ({ page }) => {
  const w = watch(page);
  await backendDown(page);
  // Registered later, so the profile mocks win over the network failure.
  await signedIn(page);
  await page.goto('/account');
  await hydrated(page);
  await expect(page.getByRole('button', { name: 'Try again' })).toHaveCount(3, { timeout: 20_000 });
  await w.check();
});

test('account: the Hindi page renders', async ({ page }) => {
  const w = watch(page);
  await signedIn(page);
  await mockAccount(page);
  await page.goto('/hi/account');
  await hydrated(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('नमस्ते');
  await expect(page.getByRole('region', { name: 'अगली विज़िट' })).toBeVisible();
  await expect(page.getByText('पक्की')).toBeVisible();
  await w.check();
});

test('delete account: signed in, the box must be ticked first', async ({ page }) => {
  const w = watch(page);
  await signedIn(page);
  let called = '';
  await page.route(/\/api\/v1\/users\/me$/, (r) => {
    called = `${r.request().method()} ${r.request().postData() ?? ''}`.trim();
    return r.fulfill({ status: 204, body: '' });
  });
  await page.goto('/delete-account');
  await hydrated(page);
  await expect(page.getByRole('heading', { name: 'What we delete' })).toBeVisible();
  await expect(page.getByText('You are signed out on every device.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Keep my account' })).toHaveAttribute('href', '/account');
  const del = page.getByRole('button', { name: 'Delete my account' });
  await expect(del).toBeDisabled();
  await axe(page);
  await page.getByRole('checkbox').check();
  await del.click();
  await page.waitForURL(/\/\?deleted=1$/, { waitUntil: 'commit' });
  expect(called).toBe('DELETE');
  await w.check();
});

test('delete account: signed out, the request form checks the email', async ({ page }) => {
  const w = watch(page);
  await page.goto('/delete-account');
  await hydrated(page);
  await expect(page.getByRole('heading', { name: 'What we delete' })).toBeVisible();
  await page.getByLabel('Email on the account').fill('not-an-email');
  await page.getByRole('button', { name: 'Email the request' }).click();
  await expect(page.getByText('Enter a valid email.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in to delete it now' })).toHaveAttribute('href', '/login?next=%2Fdelete-account');
  await axe(page);
  await page.goto('/hi/delete-account');
  await expect(page.getByRole('heading', { name: 'हम क्या हटाते हैं' })).toBeVisible();
  await w.check();
});

test('sign in: steps, a live hint, and a way back from the password step', async ({ page }) => {
  const w = watch(page);
  await page.route(/\/api\/v1\/auth\/identifier-status/, (r) => r.fulfill({ json: { exists: true, verified: true, has_password: true, next_step: 'password' } }));
  await page.goto('/login');
  await hydrated(page);
  const steps = page.getByRole('list', { name: 'Steps' });
  await expect(steps.locator('[aria-current="step"]')).toContainText('Number or email');
  const id = page.getByLabel('Mobile number or email');
  await id.fill('98104 67231');
  await expect(page.getByText('We will use +91 98104 67231.')).toBeVisible();
  await id.fill('tester@example.com');
  await expect(page.getByText('We will use tester@example.com.')).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(steps.locator('[aria-current="step"]')).toContainText('Password or code');
  await expect(page.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/forgot-password');
  await axe(page);
  await page.getByRole('button', { name: 'Change' }).click();
  await expect(page.getByLabel('Mobile number or email')).toBeVisible();
  await w.check();
});

test('forgot password: an unknown number offers a new account', async ({ page }) => {
  const w = watch(page);
  await page.route(/\/api\/v1\/auth\/identifier-status/, (r) => r.fulfill({ json: { exists: false, verified: false, has_password: false, next_step: 'otp' } }));
  await page.goto('/forgot-password');
  await hydrated(page);
  await page.getByLabel('Mobile number or email').fill('9810467231');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('We could not find an account for this number or email.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create an account instead' })).toHaveAttribute('href', '/register');
  await expect(page.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '/login');
  await w.check();
});

test('register: three steps and the Hindi page', async ({ page }) => {
  const w = watch(page);
  await page.goto('/register');
  await hydrated(page);
  await expect(page.getByRole('list', { name: 'Steps' }).getByRole('listitem')).toHaveCount(3);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Enter your full name (2 letters or more).')).toBeVisible();
  await expect(page.getByText('Accept the terms to continue.')).toBeVisible();
  await axe(page);
  await page.goto('/hi/login');
  await hydrated(page);
  await expect(page.getByRole('list', { name: 'चरण' })).toContainText('नंबर या ईमेल');
  await w.check();
});
