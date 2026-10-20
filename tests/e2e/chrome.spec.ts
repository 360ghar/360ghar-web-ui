import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { axe, backendDown, watch } from './helpers';

/** WCAG 2.2 AA scan of the header and footer only, so another page's content cannot fail this spec. */
async function axeChrome(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  const r = await new AxeBuilder({ page })
    .include('[data-header]')
    .include('footer.site-footer')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
}

type Box = { x: number; y: number; width: number; height: number };

/** The desktop bar shows from 1024 px; below that the phone menu takes over. */
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

test('header: desktop menus open, close and navigate', async ({ page }) => {
  const w = watch(page);
  await page.goto('/properties');
  if (!wide(page)) {
    await expect(page.locator('[data-menu]').first()).toBeHidden();
    return;
  }
  const nav = page.getByRole('navigation', { name: 'Main' }).first();
  const dataHub = nav.locator('summary', { hasText: 'Data hub' });
  const tools = nav.locator('summary', { hasText: 'Tools' });

  await dataHub.click();
  const panel = page.locator('[data-menu][open] [data-menu-panel]');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.menu-item')).toHaveCount(8);
  await expect(panel.getByRole('link', { name: /Circle rates.*Government rates by sector/ })).toBeVisible();
  // The menu vignette is a cached file (src/pages/art); it loads when the menu opens.
  await expect(panel.locator('img.menu-art')).toBeVisible();
  await expect.poll(() => panel.locator('img.menu-art').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  await axeChrome(page);

  // Pointing at the other trigger while one menu is open switches menus.
  await tools.hover();
  await expect(page.locator('[data-menu][open]')).toHaveCount(1);
  await expect(page.locator('[data-menu][open] summary')).toContainText('Tools');
  await expect(page.locator('[data-menu][open]').getByRole('link', { name: /All tools/ })).toBeVisible();

  // Escape closes and puts focus back on the trigger.
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-menu][open]')).toHaveCount(0);
  await expect(tools).toBeFocused();

  // A second click on the trigger closes; an outside click closes.
  await dataHub.click();
  await expect(panel).toBeVisible();
  await dataHub.click();
  await expect(page.locator('[data-menu][open]')).toHaveCount(0);
  await dataHub.click();
  await page.locator('main').click({ position: { x: 5, y: 400 } });
  await expect(page.locator('[data-menu][open]')).toHaveCount(0);

  // Keyboard: Tab through the menu and out of it closes it.
  await dataHub.focus();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  for (let i = 0; i < 9; i += 1) await page.keyboard.press('Tab');
  await expect(page.locator('[data-menu]').first()).not.toHaveAttribute('open', '');

  // A menu link goes to its page, and the page marks its group by weight.
  await tools.click();
  await page.locator('[data-menu][open]').getByRole('link', { name: /EMI calculator/ }).click();
  await expect(page).toHaveURL(/\/emi-calculator$/);
  await expect(page.locator('[data-menu][data-current] summary')).toContainText('Tools');
  const weight = await page.locator('[data-menu][data-current] summary').evaluate((el) => getComputedStyle(el).fontWeight);
  expect(Number(weight)).toBeGreaterThanOrEqual(800);
  await w.check();
});

test('header: with reduced motion the menu opens and closes at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about-us');
  if (!wide(page)) return;
  const dataHub = page.locator('[data-menu] summary', { hasText: 'Data hub' });
  await dataHub.click();
  await expect(page.locator('[data-menu][open] [data-menu-panel]')).toBeVisible();
  const anim = await page.locator('[data-menu][open] [data-menu-panel]').evaluate((el) => getComputedStyle(el).animationName);
  expect(anim).toBe('none');
  await dataHub.click();
  await expect(page.locator('[data-menu][open]')).toHaveCount(0);
});

test('header: the phone menu opens, folds its groups and closes', async ({ page }) => {
  const w = watch(page);
  await page.goto('/about-us');
  if (wide(page)) {
    await expect(page.locator('[data-menu-open]')).toBeHidden();
    return;
  }
  // The search button in the bar goes to the listing.
  await expect(page.getByRole('link', { name: 'Search homes' }).first()).toHaveAttribute('href', '/properties');

  await page.locator('[data-menu-open]').click();
  const dialog = page.locator('[data-mobile-menu]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Buy' })).toBeVisible();

  const tools = dialog.locator('.mobile-group', { hasText: 'Tools' });
  await expect(tools.getByRole('link', { name: /EMI calculator/ })).toBeHidden();
  await tools.locator('summary').click();
  await expect(tools.getByRole('link', { name: /EMI calculator.*Monthly EMI/ })).toBeVisible();
  await expect(tools.locator('li')).toHaveCount(9);
  await axeChrome(page);

  await dialog.getByRole('button', { name: 'Close menu' }).click();
  await expect(dialog).toBeHidden();

  // Escape closes it too, and a link in it navigates.
  await page.locator('[data-menu-open]').click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await page.locator('[data-menu-open]').click();
  await dialog.getByRole('link', { name: 'Localities' }).click();
  await expect(page).toHaveURL(/\/localities$/);
  await w.check();
});

test('header: the group of the current page starts open in the phone menu', async ({ page }) => {
  await page.goto('/circle-rates');
  if (wide(page)) return;
  await page.locator('[data-menu-open]').click();
  const hub = page.locator('[data-mobile-menu] .mobile-group', { hasText: 'Data hub' });
  await expect(hub).toHaveAttribute('open', '');
  await expect(hub.getByRole('link', { name: /Circle rates/ })).toHaveAttribute('aria-current', 'page');
});

test('header: casts its shadow once the page scrolls', async ({ page }) => {
  await page.goto('/about-us');
  const header = page.locator('[data-header]');
  await expect(header).not.toHaveAttribute('data-scrolled', '');
  await page.mouse.wheel(0, 600);
  await expect(header).toHaveAttribute('data-scrolled', '');
});

test('footer: link groups fold on phones and stay open on wider screens', async ({ page }) => {
  const w = watch(page);
  await page.goto('/about-us');
  const footer = page.locator('footer.site-footer');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.locator('.footer-skyline')).toBeVisible();
  const groups = footer.locator('[data-footer-group]');
  await expect(groups).toHaveCount(5);
  const tools = footer.locator('[data-footer-group]', { hasText: 'Tools' });
  const phone = (page.viewportSize()?.width ?? 0) < 768;
  if (phone) {
    await expect(tools.getByRole('link', { name: 'EMI calculator' })).toBeHidden();
    await tools.locator('summary').click();
    await expect(tools.getByRole('link', { name: 'EMI calculator' })).toBeVisible();
  } else {
    for (let i = 0; i < 5; i += 1) await expect(groups.nth(i)).toHaveAttribute('open', '');
    await expect(tools.locator('summary')).toHaveAttribute('tabindex', '-1');
    // A click on a heading does not fold the group.
    await tools.locator('summary').click({ force: true });
    await expect(tools).toHaveAttribute('open', '');
  }
  await expect(footer.getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/360ghar/');
  await expect(footer.getByRole('link', { name: 'info@360ghar.com' })).toHaveAttribute('href', 'mailto:info@360ghar.com');
  await tools.getByRole('link', { name: 'EMI calculator' }).click();
  await expect(page).toHaveURL(/\/emi-calculator$/);
  await w.check();
});

test('footer: the last row stays clear of the chat launcher', async ({ page }) => {
  await page.goto('/about-us');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const launcher = await page.locator('[data-chat-launcher]').boundingBox();
  const links = await page.locator('.footer-base a').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON() as DOMRect));
  expect(launcher).not.toBeNull();
  for (const r of links) {
    const overlap = r.right > launcher!.x && r.x < launcher!.x + launcher!.width && r.bottom > launcher!.y && r.y < launcher!.y + launcher!.height;
    expect(overlap, `link at ${r.x},${r.y} is under the launcher`).toBe(false);
  }
});

test('chrome: header and footer work with the backend down', async ({ page }) => {
  const w = watch(page);
  await backendDown(page);
  await page.goto('/emi-calculator');
  await expect(page.locator('[data-header]')).toBeVisible();
  await expect(page.locator('footer.site-footer')).toBeAttached();
  await axeChrome(page);
  await w.check();
});

test('chrome: Hindi labels, menus and the language switch', async ({ page }) => {
  const w = watch(page);
  await page.goto('/hi/about-us');
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi-IN');
  if (wide(page)) {
    await page.locator('[data-menu] summary', { hasText: 'डेटा हब' }).click();
    await expect(page.locator('[data-menu][open]').getByRole('link', { name: /सेक्टर के हिसाब से सरकारी रेट/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: 'English' }).first().click();
  } else {
    await page.locator('[data-menu-open]').click();
    await page.locator('[data-mobile-menu] .mobile-group', { hasText: 'टूल्स' }).locator('summary').click();
    await expect(page.locator('[data-mobile-menu]').getByRole('link', { name: /मासिक EMI और कुल ब्याज/ })).toBeVisible();
    await page.locator('[data-mobile-menu]').getByRole('link', { name: 'English' }).click();
  }
  await expect(page).toHaveURL(/\/about-us$/);
  await w.check();
});

test('404: the paper page with places to go, in English and Hindi', async ({ page }) => {
  const w = watch(page);
  const r = await page.goto('/404');
  expect(r?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'This page is not on our map' })).toBeVisible();
  const places = page.getByRole('navigation', { name: 'Main places' });
  await expect(places.getByRole('link')).toHaveCount(6);
  await axe(page);
  await places.getByRole('link', { name: 'Localities' }).click();
  await expect(page).toHaveURL(/\/localities$/);

  // Paths that no route matches go to the catch-all, which renders the same block.
  const hi = await page.goto('/hi/no/such/page/at/all');
  expect(hi?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'यह पेज हमारे नक्शे पर नहीं है' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'मुख्य जगहें' }).getByRole('link')).toHaveCount(6);
  await w.check();
});

test('styleguide: every vignette, icon and state renders', async ({ page }) => {
  const w = watch(page);
  await page.goto('/styleguide');
  await expect(page.locator('.sg-vignettes li')).toHaveCount(19);
  for (const svg of await page.locator('.sg-vignettes svg').all()) {
    const paths = await svg.locator('path').count();
    expect(paths).toBeGreaterThan(3);
  }
  // Filter ids are unique on the page, so a hidden scene never breaks a visible one.
  const dupes = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('filter[id], clipPath[id]')].map((f) => f.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(dupes).toEqual([]);
  await expect(page.locator('.sg-icons li').filter({ hasText: /^floor-plan$/ })).toHaveCount(1);
  await expect(page.locator('.sg-facts li')).toHaveCount(20);
  // fit="slice" fills the wide box edge to edge.
  const slice = await page.locator('.sg-slice-box').evaluate((box) => [box.getBoundingClientRect().height, box.querySelector('svg')!.getBoundingClientRect().height, box.querySelector('svg')!.getAttribute('preserveAspectRatio')]);
  expect(slice[2]).toBe('xMidYMax slice');
  expect(Math.abs(Number(slice[0]) - Number(slice[1]))).toBeLessThan(1);
  await axe(page);
  await w.check();
});

test('paper art: shared shadows resolve and ids stay unique, with hidden and visible scenes on one page', async ({ page }) => {
  for (const path of ['/404', '/styleguide', '/about-us']) {
    await page.goto(path);
    const report = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('filter[id], clipPath[id], symbol[id]')].map((f) => f.id);
      const refs = [...document.querySelectorAll('[filter^="url(#"], [clip-path^="url(#"]')].map((el) => (el.getAttribute('filter') ?? el.getAttribute('clip-path'))!.slice(5, -1));
      const uses = [...document.querySelectorAll('use[href^="#"]')].map((u) => u.getAttribute('href')!.slice(1));
      const defs = document.querySelectorAll('svg.paper-defs');
      const shared = refs.filter((r) => r.startsWith('pc-'));
      return {
        defs: defs.length,
        sharedUsed: shared.length,
        sharedOutside: shared.filter((r) => !defs[0]?.querySelector(`filter[id="${r}"]`)),
        dupes: ids.filter((id, i) => ids.indexOf(id) !== i),
        missing: [...refs, ...uses].filter((r) => !document.getElementById(r)),
      };
    });
    // One shared set of paper shadows per page, and every url(#pc-…) resolves inside it.
    expect(report.defs, path).toBe(1);
    expect(report.sharedUsed, path).toBeGreaterThan(0);
    expect(report.sharedOutside, path).toEqual([]);
    expect(report.dupes, path).toEqual([]);
    expect(report.missing, path).toEqual([]);
  }
  // The closed menus' vignettes are cached files with their own filters (unit test: ui/paper/standalone.test.ts); one loads when its menu opens.
  await page.goto('/about-us');
  if (!wide(page)) return;
  await page.locator('[data-menu] summary', { hasText: 'Tools' }).click();
  const art = page.locator('[data-menu][open] img.menu-art');
  await expect(art).toBeVisible();
  await expect.poll(() => art.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
});

test('chat launcher: below 1024 px it sits in the header slot and never floats over the page', async ({ page }) => {
  await page.goto('/about-us');
  if (wide(page)) return;
  const launcher = page.locator('[data-chat-launcher]');
  // Visible at the top of the page and after a scroll, in the header bar, left of search.
  for (const y of [0, 900]) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await expect(launcher).toBeVisible();
    const [box, bar, search] = (await Promise.all([launcher, page.locator('.header-bar'), page.locator('.search-button')].map((l) => l.boundingBox()))) as [Box, Box, Box];
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.y).toBeGreaterThanOrEqual(bar.y);
    expect(box.y + box.height).toBeLessThanOrEqual(bar.y + bar.height);
    expect(box.x + box.width).toBeLessThanOrEqual(search.x);
  }
  // Tab reaches it in visual order: after the logo (and the language and account links), before search.
  await page.locator('.brand').focus();
  const order: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => (document.activeElement?.hasAttribute('data-chat-launcher') ? 'chat' : (document.activeElement?.className.split(' ').pop() ?? ''))));
  }
  const chat = order.indexOf('chat');
  expect(chat, order.join(',')).toBeGreaterThanOrEqual(0);
  expect(order[chat + 1], order.join(',')).toBe('search-button');
  // Quiet in the bar: no dark card, no shadow.
  const look = await launcher.evaluate((el) => ({ card: getComputedStyle(el, '::before').display, filter: getComputedStyle(el).filter }));
  expect(look.card).toBe('none');
  expect(look.filter).toBe('none');
  // It opens the chat and closes it again.
  await launcher.click();
  await expect(page.locator('#chat-host')).toBeVisible();
  await expect(launcher).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: 'Close chat' }).click();
  await expect(page.locator('#chat-host')).toBeHidden();
  await expect(launcher).toBeFocused();
  // Escape closes it too and puts focus back on the button.
  await launcher.click();
  await expect(page.locator('#chat-host')).toBeVisible();
  // The panel mounts a moment after the host shows; Escape before its key handler exists is lost (seen once on a cold dev server).
  await expect(page.getByLabel('Type your message')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#chat-host')).toBeHidden();
  await expect(launcher).toBeFocused();
});

test('chat launcher: from 1024 px a paper tab that rises above bottom bars and steps aside from content', async ({ page }) => {
  const w = watch(page);
  await page.goto('/about-us');
  if (!wide(page)) return;
  const launcher = page.locator('[data-chat-launcher]');
  await expect(launcher).toBeVisible();
  const box = (await launcher.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  // The tab is a rounded card (radius 16px) with a soft, directional shadow; no clip-path.
  const look = await launcher.evaluate((el) => {
    const c = getComputedStyle(el, '::before');
    return { cut: c.clipPath, radius: c.borderTopLeftRadius, shadow: c.boxShadow };
  });
  expect(look.cut).toBe('none');
  expect(parseFloat(look.radius)).toBeGreaterThanOrEqual(12);
  expect(look.shadow).not.toBe('none');

  // A bar fixed to the bottom: the launcher rises above it.
  await page.evaluate(() => {
    const bar = document.createElement('div');
    bar.id = 'test-bar';
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:72px;background:#fff;z-index:45';
    document.body.append(bar);
    window.dispatchEvent(new Event('resize'));
  });
  await expect.poll(async () => (await launcher.boundingBox())!.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height - 72 - 8);
  await page.evaluate(() => document.getElementById('test-bar')?.remove());

  // Content under its resting place (a button, then plain text): it slides to the edge.
  for (const tag of ['button', 'p']) {
    await page.evaluate((t) => {
      const l = document.querySelector<HTMLElement>('[data-chat-launcher]')!;
      const el = document.createElement(t);
      el.id = 'test-under';
      el.textContent = 'Under the launcher, under the launcher';
      el.style.cssText = `position:absolute;left:${l.offsetLeft - 20}px;top:${window.scrollY + l.offsetTop - 4}px;width:${l.offsetWidth + 40}px;height:56px;margin:0`;
      document.body.append(el);
      window.dispatchEvent(new Event('resize'));
    }, tag);
    await expect(launcher).toHaveAttribute('data-tucked', '');
    await expect.poll(async () => (await launcher.boundingBox())!.x).toBeGreaterThanOrEqual(page.viewportSize()!.width - 16);
    if (tag === 'button') {
      await page.locator('#test-under').click();
      await page.evaluate(() => document.getElementById('test-under')?.remove());
    }
  }
  // Keyboard focus brings it back in full, even with text under it.
  await launcher.focus();
  await expect.poll(async () => (await launcher.boundingBox())!.x).toBeLessThan(page.viewportSize()!.width - 44);
  await page.evaluate(() => document.getElementById('test-under')?.remove());
  await w.check();
});
