/**
 * Ask panel on a locality page: the ready questions send the page as `context`, the answer streams into the
 * panel, and a backend that rejects `context` (422) gets the same question again with the place named in the text.
 * The chat API is mocked.
 */
import { expect, test, type Page } from '@playwright/test';
import { axe, watch } from './helpers';

const sse = (events: [string, unknown][]) => events.map(([name, data]) => `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`).join('');
const answer = sse([
  ['text_chunk', { text: 'Homes here start near the listed prices.' }],
  ['done', { response_text: 'Homes here start near the listed prices.' }],
]);

async function openAsk(page: Page) {
  await page.goto('/locality/sector-56-gurgaon');
  const panel = page.locator('section.ask');
  await panel.scrollIntoViewIfNeeded();
  await expect(panel.getByRole('heading', { name: 'Ask about Sector 56' })).toBeVisible();
  await page.waitForFunction(() => !document.querySelector('section.ask')?.closest('astro-island')?.hasAttribute('ssr'));
  return panel;
}

test('a ready question sends the locality as context and shows the answer', async ({ page }) => {
  const w = watch(page);
  const bodies: Record<string, unknown>[] = [];
  await page.route(/\/api\/v1\/agent\/chat-public/, (route) => {
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: answer });
  });
  const panel = await openAsk(page);
  await expect(panel.locator('li button.link')).toHaveCount(3);
  await panel.getByRole('button', { name: 'What do homes cost here?' }).click();
  await expect(panel.locator('.chat-md')).toContainText('Homes here start near the listed prices.');
  expect(bodies).toEqual([{ message: 'What do homes cost here?', context: { type: 'locality', slug: 'sector-56' } }]);
  await axe(page);
  await w.check();
});

test('a backend without context gets the question again with the place in the text', async ({ page }) => {
  const bodies: Record<string, unknown>[] = [];
  await page.route(/\/api\/v1\/agent\/chat-public/, (route) => {
    const body = route.request().postDataJSON();
    bodies.push(body);
    if ('context' in body) return route.fulfill({ status: 422, json: { detail: [{ type: 'extra_forbidden', loc: ['body', 'context'], msg: 'Extra inputs are not permitted' }] } });
    return route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: answer });
  });
  const panel = await openAsk(page);
  await panel.getByLabel('Your question').fill('Is it quiet?');
  await panel.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(panel.locator('.chat-md')).toContainText('Homes here start near the listed prices.');
  expect(bodies).toHaveLength(2);
  expect(bodies[1]).toEqual({ message: 'Locality: Sector 56. Is it quiet?' });
  // The next question skips the doomed first try.
  await panel.getByLabel('Your question').fill('And the metro?');
  await panel.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(panel.locator('.chat-md')).toHaveCount(2);
  expect(bodies).toHaveLength(3);
});
