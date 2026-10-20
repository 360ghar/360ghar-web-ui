/**
 * Account: notification settings, search preferences and saved auction alerts.
 * Every write is mocked; the signed-in user is the fake session from `signedIn()`.
 */
import { expect, test, type Page } from '@playwright/test';
import { axe, hydrated, signedIn, watch } from './helpers';

const page_ = <T>(items: T[]) => ({ items, next_cursor: null, has_more: false, limit: 20, total: items.length });
const envelope = (status: number, code: string, message: string, fields?: { field: string; msg: string; type: string }[]) => ({
  status,
  json: { error: { code, message, ...(fields ? { details: { fields } } : {}) } },
});
const alert = (id: number, extra: Record<string, unknown> = {}) => ({ id, user_id: 1, is_active: true, created_at: '2026-10-01T10:00:00Z', ...extra });

const profile = (preferences: Record<string, unknown> = {}) => ({ id: 1, email: 'tester@example.com', full_name: 'Test User', phone: '+919876543210', is_active: true, preferences });

test.describe('notification settings', () => {
  test('loads, saves only after a click, and shows the saved state', async ({ page }) => {
    const w = watch(page);
    await signedIn(page);
    let put: Record<string, boolean> | null = null;
    await page.route(/\/api\/v1\/users\/notification-settings/, (r) => {
      if (r.request().method() === 'PUT') {
        put = r.request().postDataJSON();
        return r.fulfill({ json: put });
      }
      return r.fulfill({ json: { push_notifications: true, email_notifications: true, sms_notifications: false, promotional_emails: false } });
    });
    await page.goto('/account?tab=notifications');
    await hydrated(page);
    const promo = page.getByRole('checkbox', { name: 'Offers and news by email' });
    await expect(promo).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Email', exact: true })).toBeChecked();
    expect(put).toBeNull();
    await promo.check();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();
    expect(put).toEqual({ push_notifications: true, email_notifications: true, sms_notifications: false, promotional_emails: true });
    await axe(page);
    await w.check();
  });

  test('a 422 puts the message under its field', async ({ page }) => {
    await signedIn(page);
    await page.route(/\/api\/v1\/users\/notification-settings/, (r) =>
      r.request().method() === 'PUT'
        ? r.fulfill(envelope(422, 'VALIDATION_ERROR', 'Invalid', [{ field: 'sms_notifications', msg: 'Add a phone number first.', type: 'value_error' }]))
        : r.fulfill({ json: { push_notifications: true, email_notifications: true, sms_notifications: false, promotional_emails: false } }),
    );
    await page.goto('/account?tab=notifications');
    await hydrated(page);
    await page.getByRole('checkbox', { name: 'Text messages (SMS)' }).check();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Add a phone number first.')).toBeVisible();
  });

  test('a failed load shows Try again, and it works', async ({ page }) => {
    await signedIn(page);
    let calls = 0;
    await page.route(/\/api\/v1\/users\/notification-settings/, (r) => {
      calls += 1;
      // The client retries a 5xx once by itself, so the first two calls fail.
      return calls <= 2 ? r.fulfill(envelope(500, 'INTERNAL_ERROR', 'boom')) : r.fulfill({ json: { push_notifications: false, email_notifications: true, sms_notifications: false, promotional_emails: false } });
    });
    await page.goto('/account?tab=notifications');
    await hydrated(page);
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('checkbox', { name: 'Push notifications' })).not.toBeChecked();
  });
});

test.describe('preferences', () => {
  test('prefills from the profile and sends every key, null for cleared ones', async ({ page }) => {
    const w = watch(page);
    await signedIn(page);
    await page.route(/\/api\/v1\/users\/profile/, (r) => r.fulfill({ json: profile({ purpose: 'rent', property_type: ['apartment'], budget_max: 50000, location_preference: ['Sector 56'] }) }));
    let put: Record<string, unknown> | null = null;
    await page.route(/\/api\/v1\/users\/preferences/, (r) => {
      put = r.request().postDataJSON();
      return r.fulfill({ json: put });
    });
    await page.goto('/account?tab=preferences');
    await hydrated(page);
    await expect(page.getByLabel('Looking to')).toHaveValue('rent');
    await expect(page.getByRole('checkbox', { name: 'Apartment' })).toBeChecked();
    await expect(page.getByLabel('Maximum (₹)')).toHaveValue('50000');
    await expect(page.getByLabel('Preferred areas')).toHaveValue('Sector 56');
    await page.getByLabel('Maximum (₹)').fill('60,000');
    await page.getByRole('checkbox', { name: 'Villa' }).check();
    await page.getByLabel('At least').first().fill('2');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();
    expect(put).toEqual({
      purpose: 'rent',
      property_type: ['apartment', 'villa'],
      budget_min: null,
      budget_max: 60000,
      bedrooms_min: 2,
      bedrooms_max: null,
      area_min: null,
      area_max: null,
      location_preference: ['Sector 56'],
      max_distance_km: null,
    });
    await axe(page);
    await w.check();
  });

  test('a maximum below the minimum is refused before any request', async ({ page }) => {
    await signedIn(page);
    await page.route(/\/api\/v1\/users\/profile/, (r) => r.fulfill({ json: profile() }));
    let sent = false;
    await page.route(/\/api\/v1\/users\/preferences/, (r) => {
      sent = true;
      return r.fulfill({ json: {} });
    });
    await page.goto('/account?tab=preferences');
    await hydrated(page);
    await page.getByLabel('Minimum (₹)').fill('90000');
    await page.getByLabel('Maximum (₹)').fill('1000');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('The maximum must not be lower than the minimum.')).toBeVisible();
    expect(sent).toBe(false);
  });

  test('a 422 from the server lands under the field', async ({ page }) => {
    await signedIn(page);
    await page.route(/\/api\/v1\/users\/profile/, (r) => r.fulfill({ json: profile() }));
    await page.route(/\/api\/v1\/users\/preferences/, (r) => r.fulfill(envelope(422, 'VALIDATION_ERROR', 'Invalid', [{ field: 'max_distance_km', msg: 'Must be 100 or less.', type: 'value_error' }])));
    await page.goto('/account?tab=preferences');
    await hydrated(page);
    await page.getByLabel('Search distance (km)').fill('500');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Must be 100 or less.')).toBeVisible();
  });
});

async function alerts(page: Page, list: unknown[]) {
  const deleted: string[] = [];
  await page.route(/\/api\/v1\/data-hub\/auctions\/alerts/, (r) => {
    if (r.request().method() === 'DELETE') {
      deleted.push(new URL(r.request().url()).pathname.split('/').pop()!);
      return r.fulfill({ status: 204 });
    }
    return r.fulfill({ json: page_(list) });
  });
  return deleted;
}

test.describe('saved auction alerts', () => {
  test('lists alerts, asks before deleting, and deletes', async ({ page }) => {
    const w = watch(page);
    await signedIn(page);
    const deleted = await alerts(page, [alert(5, { bank_name: 'HDFC Bank', city: 'Gurugram', property_type: 'plot', max_price: 5_000_000, keyword: 'corner' }), alert(6, { is_active: false })]);
    await page.goto('/account?tab=alerts');
    await hydrated(page);
    await expect(page.getByText('HDFC Bank · Gurugram · Plot')).toBeVisible();
    await expect(page.getByText('Keyword: corner · ≤ ₹50 L')).toBeVisible();
    await expect(page.getByText('(Paused)')).toBeVisible();
    await axe(page);
    await page.getByRole('button', { name: 'Delete alert: HDFC Bank · Gurugram · Plot' }).click();
    await expect(page.getByText('Delete this alert?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Yes, delete' })).toBeFocused();
    await page.getByRole('button', { name: 'Keep it' }).click();
    await expect(page.getByText('Delete this alert?')).toHaveCount(0);
    expect(deleted).toEqual([]);
    await page.getByRole('button', { name: 'Delete alert: HDFC Bank · Gurugram · Plot' }).click();
    await page.getByRole('button', { name: 'Yes, delete' }).click();
    await expect(page.getByText('HDFC Bank · Gurugram · Plot')).toHaveCount(0);
    await expect(page.getByText('Alert deleted.')).toBeVisible();
    expect(deleted).toEqual(['5']);
    await w.check();
  });

  test('the empty state points to bank auctions', async ({ page }) => {
    await signedIn(page);
    await alerts(page, []);
    await page.goto('/account?tab=alerts');
    await hydrated(page);
    await expect(page.getByRole('heading', { name: 'No auction alerts yet' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse bank auctions/ })).toHaveAttribute('href', '/bank-auctions');
  });

  test('a failed delete puts the row back', async ({ page }) => {
    await signedIn(page);
    await page.route(/\/api\/v1\/data-hub\/auctions\/alerts/, (r) => (r.request().method() === 'DELETE' ? r.fulfill(envelope(500, 'INTERNAL_ERROR', 'boom')) : r.fulfill({ json: page_([alert(9, { city: 'Noida' })]) })));
    await page.goto('/account?tab=alerts');
    await hydrated(page);
    await page.getByRole('button', { name: 'Delete alert: Noida' }).click();
    await page.getByRole('button', { name: 'Yes, delete' }).click();
    await expect(page.getByText('Noida').first()).toBeVisible();
  });
});

test('the new tabs are reachable by click and keep ?tab= in the URL', async ({ page }) => {
  await signedIn(page);
  await page.route(/\/api\/v1\/users\/notification-settings/, (r) => r.fulfill({ json: { push_notifications: true, email_notifications: true, sms_notifications: false, promotional_emails: false } }));
  await page.goto('/account');
  await hydrated(page);
  await page.getByRole('tab', { name: 'Notifications' }).click();
  await expect(page).toHaveURL(/tab=notifications/);
  await expect(page.getByRole('checkbox', { name: 'Push notifications' })).toBeVisible();
});
