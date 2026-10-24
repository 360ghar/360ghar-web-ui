import { expect, test } from '@playwright/test';

const heldPages = [
  {
    path: '/project',
    title: 'Project details are under review',
    notice: 'We are reviewing these project details because their sources are not documented.',
    search: 'Search properties',
    searchHref: '/properties',
  },
  {
    path: '/project/luxury-apartments-in-sector-62',
    title: 'Project details are under review',
    notice: 'We are reviewing these project details because their sources are not documented.',
    search: 'Search properties',
    searchHref: '/properties',
  },
  {
    path: '/hi/project',
    title: 'प्रोजेक्ट की जानकारी की समीक्षा चल रही है',
    notice: 'इन प्रोजेक्ट की जानकारी की समीक्षा हो रही है, क्योंकि इनके स्रोत दर्ज नहीं हैं।',
    search: 'घर खोजें',
    searchHref: '/hi/properties',
  },
  {
    path: '/hi/project/villa-projects-in-dlf-phase-2',
    title: 'प्रोजेक्ट की जानकारी की समीक्षा चल रही है',
    notice: 'इन प्रोजेक्ट की जानकारी की समीक्षा हो रही है, क्योंकि इनके स्रोत दर्ज नहीं हैं।',
    search: 'घर खोजें',
    searchHref: '/hi/properties',
  },
];

for (const held of heldPages) {
  test(`project hold is server-rendered: ${held.path}`, async ({ request }) => {
    const response = await request.get(held.path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1] ?? '';

    expect(html).toMatch(/<meta name="robots" content="noindex,follow"/);
    expect(html).not.toMatch(/<link[^>]+rel="canonical"/);
    expect(html).not.toMatch(/<link[^>]+rel="alternate"[^>]+hreflang=/);
    expect(html).not.toContain('application/ld+json');
    expect(main).toContain(`>${held.title}</h1>`);
    expect(main).toContain(held.notice);
    expect(main).toContain(`href="${held.searchHref}"`);
    expect(main).not.toMatch(/Gurugram|Gurgaon|Sector \d+|live, verified homes|refreshed every hour/i);
    expect(main).not.toContain('Luxury Apartments in Sector 62');
    expect(html).not.toContain('/assets/images/thumbs/project-img');
    expect(html).not.toContain('class="pj-card"');
  });
}
