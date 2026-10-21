import { expect, test } from '@playwright/test';
import { axe, hydrated, watch } from './helpers';

test('compare: rows line up, remove works without JS, empty state', async ({ page }) => {
  const w = watch(page);
  await page.goto('/compare?ids=182,150,120');
  const cols = page.locator('thead th[scope="col"]');
  await expect(cols).toHaveCount(3);
  // Every row has one cell per home, so values sit on one line across columns.
  const cells = await page.locator('tbody tr').evaluateAll((rows) => rows.map((r) => r.querySelectorAll('td').length));
  expect(cells.every((n) => n === 3 || n === 4)).toBe(true);
  await axe(page);
  // "Show only differences" hides the rows where every home is the same (CSS only).
  const rows = page.locator('tbody tr');
  const all = await rows.count();
  const same = await page.locator('tbody tr[data-same]').count();
  await page.getByLabel('Show only differences').check();
  await expect.poll(async () => rows.filter({ visible: true }).count()).toBe(all - same);
  await page.getByLabel('Show only differences').uncheck();
  await page.getByRole('link', { name: /^Remove/ }).first().click();
  await expect(page).toHaveURL(/\/compare\?ids=150,120$/);
  await expect(cols).toHaveCount(2);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('360ghar:compare') ?? '{}').state?.ids)).toEqual([150, 120]);
  await page.getByRole('link', { name: /^Remove/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Pick one more home' })).toBeVisible();
  await w.check();
});

test('compare and cards: a stand-in ₹10 Cr price reads "Price on request"', async ({ page, request }) => {
  // Only while the backend still has the stand-in price on this home (ids 153-169 on 2026-09-28).
  const home = (await (await request.get('https://api.360ghar.com/api/v1/properties/153')).json()) as { base_price?: number; area_sqft?: number };
  test.skip(!(home.base_price === 1e8 && home.area_sqft && 1e8 / home.area_sqft > 40_000), 'Home 153 no longer has the stand-in price.');
  await page.goto('/compare?ids=182,153');
  await expect(page.locator('thead').getByText('Price on request')).toBeVisible();
  await expect(page.locator('tbody tr').first()).toContainText('Price on request');
  await expect(page.locator('main')).not.toContainText('₹10 Cr');
  await page.goto('/hi/compare?ids=182,153');
  await expect(page.locator('thead').getByText('कीमत पूछने पर')).toBeVisible();
});

test('map view: without Google Maps, a paper map of the homes filters the list', async ({ page }) => {
  const w = watch(page);
  await page.route(/maps\.googleapis\.com/, (route) => route.abort('connectionfailed'));
  await page.goto('/map-location');
  await hydrated(page);
  const map = page.getByRole('region', { name: 'Paper map of the homes' });
  await expect(map).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('The street map is not available right now.', { exact: false })).toBeVisible();
  await expect(page.locator('.results-item').first()).toBeVisible();
  const tags = map.locator('.pmap-tag');
  await expect(tags.first()).toBeVisible();
  // The map starts with the homes of the list, then adds the rest: wait for all of them.
  await expect(map).not.toHaveAttribute('aria-busy', 'true', { timeout: 20_000 });
  // Every tag sits fully inside the map.
  const box = (await map.locator('.pmap-sheet').boundingBox())!;
  for (const b of await tags.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON() as DOMRect))) {
    expect(b.left).toBeGreaterThanOrEqual(box.x - 1);
    expect(b.right).toBeLessThanOrEqual(box.x + box.width + 1);
    expect(b.top).toBeGreaterThanOrEqual(box.y - 1);
  }
  await axe(page);
  // A merged tag zooms in; "All areas" zooms out again.
  const merged = map.getByRole('button', { name: /Zoom in$/ });
  if (await merged.count()) {
    const before = await tags.count();
    await merged.first().click();
    await expect(page.getByRole('button', { name: 'All areas' })).toBeVisible();
    await page.getByRole('button', { name: 'All areas' }).click();
    await expect(tags).toHaveCount(before);
  }
  // A single area filters the list to its locality (on a narrow map, zoom in first).
  const single = map.getByRole('button', { name: /Show them in the list$/ }).first();
  if (!(await single.count())) await merged.first().click();
  const name = (await single.getAttribute('aria-label'))!.split(':')[0]!;
  await single.click();
  await expect(page).toHaveURL(new RegExp(`locality=${encodeURIComponent(name).replace(/%20/g, '(\\+|%20)')}`));
  await expect(page.getByRole('button', { name: `Remove filter: ${name}` })).toBeVisible();
  // The map toggle goes back to the grid.
  const toggle = page.getByRole('button', { name: 'Map view' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.results-map')).toHaveCount(0);
  await w.check();
});

test('map view at 360 px: tags show at once and filter the list', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'A fixed 360 px check; it runs once, on the phone project.');
  const w = watch(page);
  await page.setViewportSize({ width: 360, height: 780 });
  await page.route(/maps\.googleapis\.com/, (route) => route.abort('connectionfailed'));
  // Hold back the map's own call for up to 100 homes: the map must not wait for it.
  let released = false;
  await page.route(/\/api\/v1\/properties\?.*limit=100/, async (route) => {
    await new Promise((r) => setTimeout(r, 6000));
    released = true;
    await route.continue();
  });
  await page.goto('/map-location');
  await hydrated(page);
  const map = page.getByRole('region', { name: 'Paper map of the homes' });
  const tags = map.locator('.pmap-tag');
  await expect(tags.first()).toBeVisible({ timeout: 5000 });
  expect(released).toBe(false);
  const box = (await map.locator('.pmap-sheet').boundingBox())!;
  expect(box.width).toBeGreaterThan(300);
  for (const b of await tags.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON() as DOMRect))) {
    expect(b.left).toBeGreaterThanOrEqual(box.x - 1);
    expect(b.right).toBeLessThanOrEqual(box.x + box.width + 1);
    expect(b.top).toBeGreaterThanOrEqual(box.y - 1);
    expect(b.bottom).toBeLessThanOrEqual(box.y + box.height + 1);
  }
  let single = map.getByRole('button', { name: /Show them in the list$/ }).first();
  if (!(await single.count())) {
    await map.getByRole('button', { name: /Zoom in$/ }).first().click();
    single = map.getByRole('button', { name: /Show them in the list$/ }).first();
  }
  const name = (await single.getAttribute('aria-label'))!.split(':')[0]!;
  await single.click();
  await expect(page.getByRole('button', { name: `Remove filter: ${name}` })).toBeVisible();
  await expect(page).toHaveURL(/locality=/);
  await w.check();
});

/** A small stand-in for google.maps: enough for tags, bounds, circle and map type. */
function stubMaps() {
  class LatLng {
    constructor(private a: number, private b: number) {}
    lat() { return this.a; }
    lng() { return this.b; }
  }
  class LatLngBounds {
    pts: unknown[] = [];
    extend(p: unknown) { this.pts.push(p); }
    union() {}
    isEmpty() { return this.pts.length === 0; }
    contains() { return true; }
  }
  class MapStub {
    panes = { overlayMouseTarget: document.createElement('div') };
    constructor(el: HTMLElement) { el.append(this.panes.overlayMouseTarget); }
    setMapTypeId(t: string) { (window as unknown as { __mapType: string }).__mapType = t; }
    fitBounds() {}
    getBounds() { return new LatLngBounds(); }
    panTo() {}
  }
  class OverlayView {
    map: MapStub | null = null;
    setMap(m: MapStub | null) {
      const self = this as unknown as { onAdd: () => void; draw: () => void; onRemove: () => void };
      if (m) { this.map = m; self.onAdd(); self.draw(); } else self.onRemove();
    }
    getPanes() { return this.map!.panes; }
    static n = 0;
    // Each tag gets its own spot inside the map, in a 5 x 5 grid.
    getProjection() {
      const i = OverlayView.n++;
      return { fromLatLngToDivPixel: () => ({ x: 60 + (i % 5) * 50, y: 170 + (Math.floor(i / 5) % 4) * 36 }) };
    }
  }
  class Circle { setMap() {} getBounds() { return new LatLngBounds(); } }
  (window as unknown as { google: unknown }).google = { maps: { importLibrary: async () => ({ Map: MapStub }), Map: MapStub, OverlayView, LatLng, LatLngBounds, Circle } };
}

test('map view: price tags select homes, map type and near me work', async ({ page, context }) => {
  const w = watch(page);
  await page.addInitScript(stubMaps);
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 28.4089, longitude: 77.0418 });
  await page.goto('/map-location');
  await hydrated(page);
  const tags = page.locator('.map-tag');
  await expect(tags.first()).toBeVisible({ timeout: 15_000 });
  const withCoords = await page.locator('.results-item').count();
  expect(await tags.count()).toBeGreaterThan(0);
  expect(await tags.count()).toBeLessThanOrEqual(withCoords);
  await tags.first().click();
  await expect(page.locator('.results-item[data-selected]')).toHaveCount(1);
  await expect(tags.first()).toHaveAttribute('data-on', '');
  await page.getByRole('button', { name: 'Satellite' }).click();
  expect(await page.evaluate(() => (window as unknown as { __mapType: string }).__mapType)).toBe('hybrid');
  await page.getByRole('button', { name: 'Near me' }).last().click();
  await expect(page).toHaveURL(/lat=28\.4089/);
  await expect(page.getByRole('combobox', { name: 'Search radius' })).toBeVisible();
  await w.check();
});
