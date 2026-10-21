/**
 * Chat parity with the old site: conversation history for signed-in users,
 * the full set of chat widgets, and the WebMCP tools. Every API call is
 * mocked; nothing reaches the backend. The sign-in is the fake session from
 * `signedIn()`. Written by agent B; the QA phase runs it.
 */
import { expect, test, type Page, type Route } from '@playwright/test';
import { axe, hydrated, signedIn, watch } from './helpers';

const stamp = '2026-09-21T10:00:00Z';

const summary = (id: number, title: string | null, count: number) => ({ id, title, created_at: stamp, updated_at: stamp, message_count: count });

const listBody = { items: [summary(2, '2 BHK in Sector 57', 3), summary(1, null, 2)], next_cursor: null, has_more: false, limit: 20, total: null };

const home = { id: 12, title: 'Bright 2 BHK', locality: 'Sector 57', city: 'Gurugram', purpose: 'rent', property_type: 'apartment', base_price: 0, monthly_rent: 32000, bedrooms: 2, bathrooms: 2, area_sqft: 1100 };

/** `GET /agent/conversations/{id}/messages/page`: a CursorPage, rows in chronological order. */
const messagesBody = {
  items: [
    { id: 10, role: 'user', content: 'Show 2 BHK homes to rent', created_at: stamp },
    { id: 11, role: 'widget', widget_name: 'PropertySearchWidget', widget_data: { items: [home], total: 1 }, created_at: stamp },
    { id: 12, role: 'assistant', content: 'Here is one **home** for you.', created_at: stamp },
  ],
  next_cursor: null,
  has_more: false,
  limit: 50,
  total: null,
};

/** Opens the chat panel. Focus first: from 1024 px the launcher tab steps aside, and focus brings it back. */
async function openChat(page: Page) {
  const launcher = page.locator('[data-chat-launcher]');
  await launcher.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#chat-host')).toBeVisible();
  return page.locator('#chat-host');
}

/** Records browser dialogs (confirm, alert) and dismisses them. The delete confirm must be inside the panel, so tests expect none. */
function watchDialogs(page: Page) {
  const seen: string[] = [];
  page.on('dialog', (d) => {
    seen.push(d.message());
    void d.dismiss();
  });
  return seen;
}

async function mockHistory(page: Page, opts: { failList?: () => boolean } = {}) {
  const deleted: number[] = [];
  const opened: number[] = [];
  await page.route(/\/api\/v1\/agent\/conversations/, async (route: Route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const m = /conversations\/(\d+)(\/messages\/page)?$/.exec(url.pathname);
    if (method === 'DELETE' && m) {
      deleted.push(Number(m[1]));
      return route.fulfill({ status: 204 });
    }
    if (m?.[2]) {
      opened.push(Number(m[1]));
      return route.fulfill({ json: messagesBody });
    }
    if (opts.failList?.()) return route.fulfill({ status: 500, json: { error: { code: 'SERVER', message: 'Broken' } } });
    return route.fulfill({ json: { ...listBody, items: listBody.items.filter((i) => !deleted.includes(i.id)) } });
  });
  return { deleted, opened };
}

const sse = (events: [string, unknown][]) => events.map(([name, data]) => `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`).join('');

async function mockGuestChat(page: Page, widgets: { widget_name: string; structured_content: unknown }[], text = 'Done.') {
  await page.route(/\/api\/v1\/agent\/chat-public/, (route) =>
    route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
      body: sse([
        ...widgets.map((w) => ['widget', w] as [string, unknown]),
        ['text_chunk', { text }],
        ['done', { response_text: text }],
      ]),
    }),
  );
}

async function ask(page: Page, host: ReturnType<Page['locator']>, message: string) {
  await host.getByLabel('Type your message').fill(message);
  await host.getByRole('button', { name: 'Send message' }).click();
}

test.describe('history', () => {
  test('signed in: list, open, keep, delete with an in-panel confirm, empty state', async ({ page }) => {
    const w = watch(page);
    const dialogs = watchDialogs(page);
    await signedIn(page);
    const calls = await mockHistory(page);
    await page.goto('/about-us');
    await hydrated(page);
    const host = await openChat(page);

    const historyButton = host.getByRole('button', { name: 'Past conversations' });
    await expect(historyButton).toBeVisible();
    const box = await historyButton.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await historyButton.click();

    // The list uses real fields only: title (or a fallback), date and message count.
    await expect(host.getByRole('heading', { name: 'Past conversations' }).first()).toBeVisible();
    await expect(host.getByRole('button', { name: /^2 BHK in Sector 57 / })).toBeVisible();
    await expect(host.getByRole('button', { name: /^Untitled conversation / })).toBeVisible();
    await expect(host.getByText('3 messages')).toBeVisible();
    await axe(page);

    // Open one: the messages load into the chat, the widget draws, focus lands in the input.
    await host.getByRole('button', { name: /^2 BHK in Sector 57 / }).click();
    await expect(host.locator('.chat-user')).toHaveText('Show 2 BHK homes to rent');
    await expect(host.locator('.chat-md')).toContainText('Here is one home for you.');
    await expect(host.locator('a[href="/property/12"]')).toBeVisible();
    await expect(host.getByLabel('Type your message')).toBeFocused();
    expect(calls.opened).toEqual([2]);

    // Back to the list. Delete asks in the panel; "Keep" cancels and returns focus to the trigger.
    await host.getByRole('button', { name: 'Past conversations' }).click();
    const del = host.getByRole('button', { name: /Delete conversation: 2 BHK in Sector 57/ });
    await del.click();
    await expect(host.getByText('Delete this conversation? You cannot undo this.')).toBeVisible();
    await expect(host.getByRole('button', { name: 'Keep' })).toBeFocused();
    await host.getByRole('button', { name: 'Keep' }).click();
    await expect(del).toBeFocused();
    expect(calls.deleted).toEqual([]);

    // Escape cancels the confirm and does not close the panel.
    await del.click();
    await page.keyboard.press('Escape');
    await expect(host.getByText('Delete this conversation?')).toBeHidden();
    await expect(host).toBeVisible();

    // Delete the open conversation: it goes from the list, and the chat resets.
    await del.click();
    await host.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(host.getByRole('button', { name: /^2 BHK in Sector 57 / })).toBeHidden();
    await expect(host.getByRole('status')).toHaveText('Conversation deleted.');
    expect(calls.deleted).toEqual([2]);

    await host.getByRole('button', { name: /Delete conversation: Untitled conversation/ }).click();
    await host.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(host.getByText('No past conversations yet.')).toBeVisible();
    expect(calls.deleted).toEqual([2, 1]);

    // Back returns to the (now empty) chat.
    await host.getByRole('button', { name: 'Back to chat' }).click();
    await expect(host.getByLabel('Type your message')).toBeFocused();
    await expect(host.locator('.chat-user')).toHaveCount(0);
    expect(dialogs, 'no browser confirm()').toEqual([]);
    await w.check();
  });

  test('a failed list shows the error with Try again, and Try again recovers', async ({ page }) => {
    await signedIn(page);
    let failing = true;
    await mockHistory(page, { failList: () => failing });
    await page.goto('/about-us');
    await hydrated(page);
    const host = await openChat(page);
    await host.getByRole('button', { name: 'Past conversations' }).click();
    const retry = host.getByRole('button', { name: 'Try again' });
    await expect(retry).toBeVisible({ timeout: 15_000 });
    await expect(host.getByRole('alert')).toBeVisible();
    failing = false;
    await retry.click();
    await expect(host.getByRole('button', { name: /^2 BHK in Sector 57 / })).toBeVisible();
  });

  test('guests never see history and never call the history API', async ({ page }) => {
    const seen: string[] = [];
    page.on('request', (r) => {
      if (/\/agent\/conversations/.test(r.url())) seen.push(r.url());
    });
    await page.goto('/about-us');
    await hydrated(page);
    const host = await openChat(page);
    await expect(host.getByLabel('Type your message')).toBeVisible();
    await expect(host.getByRole('button', { name: 'Past conversations' })).toHaveCount(0);
    expect(seen).toEqual([]);
  });

  test('the history code loads with the panel, not with the launcher', async ({ page }) => {
    await signedIn(page);
    await mockHistory(page);
    const scripts: string[] = [];
    page.on('request', (r) => {
      if (r.resourceType() === 'script') scripts.push(r.url());
    });
    await page.goto('/about-us');
    await hydrated(page);
    await page.waitForLoadState('networkidle');
    expect(scripts.filter((s) => /History|ChatPanel|WidgetViews/.test(s)), 'panel code before first open').toEqual([]);
    const host = await openChat(page);
    await expect(host.getByRole('button', { name: 'Past conversations' })).toBeVisible();
  });
});

test.describe('widgets', () => {
  test('renders each widget kind from real payload shapes, with localized links', async ({ page }) => {
    const w = watch(page);
    await mockGuestChat(page, [
      { widget_name: 'PropertySearchWidget', structured_content: { items: [home], total: 9, has_more: true, next_cursor: 'x', limit: 5 } },
      { widget_name: 'PropertyDetailsWidget', structured_content: { property: { ...home, id: 13, full_address: 'Sector 57, Gurugram', furnished_status: 'semi_furnished', floor_number: 4, total_floors: 12, amenities: [{ id: 1, name: 'Lift' }] } } },
      { widget_name: 'VisitListWidget', structured_content: { visits: [{ id: 5, property_id: 12, scheduled_date: '2026-10-05T05:30:00', status: 'requested', property: home }], total: 1 } },
      { widget_name: 'OwnerDashboardWidget', structured_content: { stats: { total_properties: 4, occupied: 3, vacant: 1, total_monthly_income: 90000 }, items: [] } },
      { widget_name: 'LeaseDetailsWidget', structured_content: { lease: { id: 1, property_id: 12, property: home, start_date: '2026-01-01', end_date: '2026-12-31', monthly_rent: 32000, security_deposit: 64000, status: 'active' } } },
      { widget_name: 'MaintenanceWidget', structured_content: { items: [{ id: 1, property_id: 12, title: 'Leaking tap', description: 'Kitchen', category: 'plumbing', priority: 'high', status: 'open', created_at: '2026-09-01T10:00:00' }] } },
      { widget_name: 'TenantRentWidget', structured_content: { charges: [{ id: 1, lease_id: 1, billing_month: '2026-09-01', due_date: '2026-09-05', amount_due: 32000, amount_paid: 0, balance: 32000, status: 'overdue' }], total_due: 32000, overdue_count: 1 } },
    ]);
    await page.goto('/about-us');
    await hydrated(page);
    const host = await openChat(page);
    await ask(page, host, 'show everything');

    const bot = host.locator('.chat-bot').last();
    await expect(bot.locator('.chat-md')).toContainText('Done.');
    // Property results: price, place, link.
    await expect(bot.locator('a[href="/property/12"]').first()).toContainText('₹32,000/mo');
    await expect(bot.getByText('Showing 1 of 9 results')).toBeVisible();
    // Detail.
    await expect(bot.locator('a[href="/property/13"]')).toContainText('Bright 2 BHK');
    await expect(bot.getByText('Amenities: Lift')).toBeVisible();
    // Visits.
    await expect(bot.getByRole('heading', { name: 'Visits' })).toBeVisible();
    await expect(bot.getByText('Requested')).toBeVisible();
    // Dashboard.
    await expect(bot.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(bot.getByText('Occupied')).toBeVisible();
    // Lease, maintenance, rent.
    await expect(bot.getByText('Deposit: ₹64,000')).toBeVisible();
    await expect(bot.getByText('Leaking tap')).toBeVisible();
    await expect(bot.getByRole('heading', { name: 'Rent', exact: true })).toBeVisible();
    await axe(page);
    await w.check();
  });

  test('Hindi: widget links keep the /hi prefix', async ({ page }) => {
    await mockGuestChat(page, [{ widget_name: 'PropertySearchWidget', structured_content: { items: [home] } }]);
    await page.goto('/hi/about-us');
    await hydrated(page);
    const host = await openChat(page);
    await host.locator('#chat-input').fill('घर दिखाओ');
    await host.locator('button[type="submit"]').click();
    await expect(host.locator('a[href="/hi/property/12"]')).toBeVisible();
  });

  test('unknown and malformed widgets degrade to a safe list and never break the panel', async ({ page }) => {
    const w = watch(page);
    await mockGuestChat(page, [
      { widget_name: 'BrandNewWidget', structured_content: { total_count: 3, status: 'ok', nested: { a: 1 } } },
      { widget_name: 'PropertySearchWidget', structured_content: 'not an object' },
      { widget_name: 'VisitListWidget', structured_content: null },
      { widget_name: 'MaintenanceWidget', structured_content: { items: { not: 'a list' } } },
      { widget_name: 'HostileWidget', structured_content: { '<img src=x onerror=window.__pwned=1>': '<img src=x onerror=window.__pwned=1>', note: '<script>window.__pwned=1</script>' } },
      { widget_name: 'PropertySearchWidget', structured_content: { items: [{ id: 99, main_image_url: 'javascript:window.__pwned=1', title: 'x' }] } },
    ]);
    await page.goto('/about-us');
    await hydrated(page);
    const host = await openChat(page);
    await ask(page, host, 'odd payloads');
    const bot = host.locator('.chat-bot').last();
    await expect(bot.locator('.chat-md')).toContainText('Done.');
    // The unknown widget is a key/value list with its top-level primitives only.
    await expect(bot.getByRole('heading', { name: 'Brand New' })).toBeVisible();
    await expect(bot.getByText('Total count')).toBeVisible();
    await expect(bot.getByText('Nested')).toHaveCount(0);
    // Hostile text is plain text: no element was made from it, nothing ran.
    await expect(bot.locator('img[src="x"], script')).toHaveCount(0);
    await expect(bot.locator('img[src^="javascript"]')).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    await expect(host.getByLabel('Type your message')).toBeVisible();
    await w.check();
  });
});

test.describe('WebMCP', () => {
  type Tools = Record<string, { name: string; inputSchema: { required?: string[] }; execute: (input: unknown) => Promise<Record<string, unknown>> }>;

  const withModelContext = async (page: Page) =>
    page.addInitScript(() => {
      const tools: Record<string, unknown> = {};
      (window as unknown as { __tools: unknown }).__tools = tools;
      Object.defineProperty(navigator, 'modelContext', { value: { registerTool: (t: { name: string }) => void (tools[t.name] = t) }, configurable: true });
    });

  test('registers the three tools after idle', async ({ page }) => {
    const w = watch(page);
    await withModelContext(page);
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => Object.keys((window as unknown as { __tools: object }).__tools).sort()), { timeout: 15_000 }).toEqual(['calculate_emi', 'schedule_visit', 'search_properties']);
    await w.check();
  });

  test('calculate_emi uses the calculator math', async ({ page }) => {
    await withModelContext(page);
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => Object.keys((window as unknown as { __tools: object }).__tools).length), { timeout: 15_000 }).toBe(3);
    const r = await page.evaluate(() => (window as unknown as { __tools: Tools }).__tools.calculate_emi!.execute({ principal: 1000000, rate: 8.5, tenure_years: 20 }));
    expect(r).toMatchObject({ ok: true, emi: 8678, months: 240 });
    const bad = await page.evaluate(() => (window as unknown as { __tools: Tools }).__tools.calculate_emi!.execute({ principal: -1 }));
    expect(bad).toMatchObject({ ok: false, error: { code: 'invalid_input' } });
  });

  test('search_properties returns compact results from the listing API', async ({ page }) => {
    await withModelContext(page);
    let query = '';
    await page.route(/\/api\/v1\/properties\?/, (route) => {
      query = new URL(route.request().url()).search;
      return route.fulfill({ json: { items: [{ ...home, is_available: true }], next_cursor: null, total: 1, has_more: false, limit: 10 } });
    });
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => Object.keys((window as unknown as { __tools: object }).__tools).length), { timeout: 15_000 }).toBe(3);
    const r = await page.evaluate(() => (window as unknown as { __tools: Tools }).__tools.search_properties!.execute({ query: '2 BHK', purpose: 'rent', price_max: 40000 }));
    expect(r).toMatchObject({ ok: true, count: 1, total: 1, results: [{ id: 12, price_inr: 32000 }] });
    expect(query).toContain('purpose=rent');
    expect(query).toContain('price_max=40000');
  });

  test('schedule_visit asks a signed-out user to sign in and never books', async ({ page }) => {
    await withModelContext(page);
    const posts: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && /\/api\/v1\/visits/.test(r.url())) posts.push(r.url());
    });
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => Object.keys((window as unknown as { __tools: object }).__tools).length), { timeout: 15_000 }).toBe(3);
    const day = await page.evaluate(() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const r = await page.evaluate((scheduled_date) => (window as unknown as { __tools: Tools }).__tools.schedule_visit!.execute({ property_id: '12', scheduled_date }), day);
    expect(r).toMatchObject({ ok: false, error: { code: 'sign_in_required' } });
    expect(String((r.error as { sign_in_url: string }).sign_in_url)).toContain('/login?next=');
    expect(posts).toEqual([]);
  });

  test('signed in, schedule_visit returns the property page to confirm on and still books nothing', async ({ page }) => {
    await signedIn(page);
    await withModelContext(page);
    const posts: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && /\/api\/v1\/visits/.test(r.url())) posts.push(r.url());
    });
    await page.route(/\/api\/v1\/properties\/12$/, (route) => route.fulfill({ json: { ...home, is_available: true } }));
    await page.goto('/');
    await hydrated(page);
    await expect.poll(() => page.evaluate(() => Object.keys((window as unknown as { __tools: object }).__tools).length), { timeout: 15_000 }).toBe(3);
    const { r, scheduled_date } = await page.evaluate(async () => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      const scheduled_date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return { scheduled_date, r: await (window as unknown as { __tools: Tools }).__tools.schedule_visit!.execute({ property_id: '12', scheduled_date }) };
    });
    expect(r).toMatchObject({ ok: true, booked: false, status: 'user_confirmation_required', property: { id: 12 } });
    // The page also gets the day, so the visit form opens with it chosen (see ContactPanel).
    expect(String(r.confirm_url)).toMatch(new RegExp(`/property/12\\?visit_date=${scheduled_date}$`));
    expect(posts).toEqual([]);
  });

  test('without WebMCP the page loads clean and downloads no WebMCP code', async ({ page }) => {
    const w = watch(page);
    const scripts: string[] = [];
    page.on('request', (r) => {
      if (r.resourceType() === 'script') scripts.push(r.url());
    });
    await page.goto('/');
    await hydrated(page);
    await page.waitForLoadState('networkidle');
    // Dev serves source paths; a build serves hashed chunks named after the module.
    expect(scripts.filter((s) => /features\/webmcp\/(register|tools)|\/(register|tools)\.[\w-]+\.js/.test(s))).toEqual([]);
    await w.check();
  });
});

test.describe('prefilled visit day (?visit_date=)', () => {
  const dayFromNow = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  async function openForm(page: Page, info: { project: { name: string } }) {
    await page.locator('#prop-book').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('#prop-book astro-island')].every((i) => !i.hasAttribute('ssr')));
    const side = page.locator('#prop-book');
    if (info.project.name === 'desktop') return side;
    await side.getByRole('button', { name: 'Book a visit' }).click();
    const sheet = page.getByRole('dialog', { name: 'Book a visit' });
    await expect(sheet).toBeVisible();
    return sheet;
  }

  test('a valid day inside the window is preselected and nothing is submitted', async ({ page }, info) => {
    const w = watch(page);
    const posts: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && /\/api\/v1\/visits/.test(r.url())) posts.push(r.url());
    });
    await page.goto(`/property/182?visit_date=${dayFromNow(2)}`);
    await hydrated(page);
    const form = await openForm(page, info);
    const days = form.getByRole('group', { name: 'Day' }).getByRole('button');
    await expect(days).toHaveCount(7);
    await expect(days.nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(form.getByRole('status')).toHaveCount(0);
    expect(posts).toEqual([]);
    await w.check();
  });

  test('invalid, past and out-of-window values are ignored silently', async ({ page }, info) => {
    for (const value of ['2020-01-01', dayFromNow(-1), dayFromNow(30), '2026-02-30', '"><script>window.__pwned=1</script>', 'tomorrow']) {
      await page.goto(`/property/182?visit_date=${encodeURIComponent(value)}`);
      await hydrated(page);
      const form = await openForm(page, info);
      await expect(form.getByRole('group', { name: 'Day' }).getByRole('button')).toHaveCount(7);
      await expect(form.locator('[aria-pressed="true"]')).toHaveCount(0);
      await expect(form.getByRole('alert')).toHaveCount(0);
    }
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
  });
});

test.describe('conversation continuity and privacy', () => {
  /** Answers /agent/chat with a short reply and records the request bodies. */
  async function mockSignedInChat(page: Page) {
    const bodies: Record<string, unknown>[] = [];
    await page.route(/\/api\/v1\/agent\/chat$/, (route) => {
      bodies.push(route.request().postDataJSON());
      return route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: sse([['conversation_info', { conversation_id: 2 }], ['text_chunk', { text: 'ok' }], ['done', { response_text: 'ok' }]]) });
    });
    return bodies;
  }

  test('an opened conversation continues with its id; new conversation starts without one', async ({ page }) => {
    await signedIn(page);
    await mockHistory(page);
    const bodies = await mockSignedInChat(page);
    await page.goto('/about-us');
    await hydrated(page);
    const host = await openChat(page);
    await host.getByRole('button', { name: 'Past conversations' }).click();
    await host.getByRole('button', { name: /^2 BHK in Sector 57 / }).click();
    await expect(host.locator('.chat-user')).toBeVisible();
    await ask(page, host, 'and in Sector 58?');
    await expect(host.locator('.chat-md').last()).toContainText('ok');
    expect(bodies[0]).toEqual({ message: 'and in Sector 58?', conversation_id: 2 });
    await host.getByRole('button', { name: 'Start new conversation' }).click();
    await expect(host.locator('.chat-user')).toHaveCount(0);
    await ask(page, host, 'fresh start');
    await expect(host.locator('.chat-md').last()).toContainText('ok');
    expect(bodies[1]).toEqual({ message: 'fresh start', conversation_id: null });
  });

  test('a guest request never carries conversation_id', async ({ page }) => {
    // Even with an id left in storage, the public endpoint gets only the message.
    await page.addInitScript(() => localStorage.setItem('360ghar:chat-v2', JSON.stringify({ state: { messages: [], conversationId: 77, owner: null }, version: 0 })));
    const bodies: Record<string, unknown>[] = [];
    await page.route(/\/api\/v1\/agent\/chat-public/, (route) => {
      bodies.push(route.request().postDataJSON());
      return route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: sse([['text_chunk', { text: 'ok' }], ['done', { response_text: 'ok' }]]) });
    });
    await page.goto('/about-us');
    await hydrated(page);
    const host = await openChat(page);
    await ask(page, host, 'hello');
    await expect(host.locator('.chat-md').last()).toContainText('ok');
    expect(bodies).toEqual([{ message: 'hello' }]);
  });

  test('a signed-out visitor never sees, and the browser drops, another user\'s stored chat', async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        '360ghar:chat-v2',
        JSON.stringify({ state: { messages: [{ id: 'm1', role: 'user', text: 'PRIVATE-QUESTION-OF-USER-A', tools: [], widgets: [] }], conversationId: 9, owner: 'user-a' }, version: 0 }),
      ),
    );
    await page.goto('/about-us');
    await hydrated(page);
    const host = await openChat(page);
    await expect(host.getByLabel('Type your message')).toBeVisible();
    await expect(host.getByText('PRIVATE-QUESTION-OF-USER-A')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => localStorage.getItem('360ghar:chat-v2'))).not.toContain('PRIVATE-QUESTION-OF-USER-A');
  });

  test('another account does not inherit the first account\'s chat', async ({ page }) => {
    await signedIn(page); // the fake session belongs to 00000000-0000-4000-8000-000000000001
    await page.addInitScript(() =>
      localStorage.setItem(
        '360ghar:chat-v2',
        JSON.stringify({ state: { messages: [{ id: 'm1', role: 'user', text: 'OTHER-USER-MESSAGE', tools: [], widgets: [] }], conversationId: 9, owner: 'someone-else' }, version: 0 }),
      ),
    );
    await page.goto('/about-us');
    await hydrated(page);
    const host = await openChat(page);
    await expect(host.getByLabel('Type your message')).toBeVisible();
    await expect(host.getByText('OTHER-USER-MESSAGE')).toHaveCount(0);
  });
});

test.describe('history a11y', () => {
  test('Hindi: labels are Hindi, focus moves as expected, only one status region', async ({ page }) => {
    await signedIn(page);
    await mockHistory(page);
    await page.goto('/hi/about-us');
    await hydrated(page);
    const host = await openChat(page);
    await host.getByRole('button', { name: 'पिछली बातचीत' }).click();
    await expect(host.getByRole('heading', { name: 'पिछली बातचीत' }).first()).toBeVisible();
    await expect(host.getByRole('status')).toHaveCount(1);
    const del = host.getByRole('button', { name: /^बातचीत हटाएं: 2 BHK in Sector 57/ });
    await del.click();
    await expect(host.getByRole('button', { name: 'रहने दें' })).toBeFocused();
    await expect(host.getByRole('button', { name: 'रहने दें' })).toHaveAccessibleDescription(/हटानी है/);
    await page.keyboard.press('Escape');
    await expect(host).toBeVisible();
    await expect(del).toBeFocused();
    await axe(page);
    // Tab order in a row: open, then delete.
    await host.getByRole('button', { name: /^2 BHK in Sector 57 / }).focus();
    await page.keyboard.press('Tab');
    await expect(del).toBeFocused();
  });

  test('with reduced motion the history view has no animation and only instant transitions (1 ms)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await signedIn(page);
    await mockHistory(page);
    await page.goto('/about-us');
    await hydrated(page);
    const host = await openChat(page);
    await host.getByRole('button', { name: 'Past conversations' }).click();
    const row = host.locator('.chat-hist-row').first();
    await expect(row).toBeVisible();
    const motion = await host.locator('.chat-hist *').evaluateAll((els) => els.filter((e) => getComputedStyle(e).animationName !== 'none' || getComputedStyle(e).transitionDuration.split(',').some((d) => parseFloat(d) > 0.01)).length);
    expect(motion).toBe(0);
  });
});
