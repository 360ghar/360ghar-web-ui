All 21 content routes are built and every check is green.

**Routes (21 route files, each also at `/hi/...`)**
- Prerendered (SSG): `/about-us`, `/faq`, `/contact`, `/policies`, `/gurugram-real-estate-guide`, `/property-investment-gurugram`, `/refer-and-earn`, `/for-ai`, `/ai-agent`, `/celebrity-homes`, `/nri-property-guide`, `/landlord-not-returning-security-deposit`, `/list-property-free`, `/glossary`, `/links`, `/careers`, `/careers/:slug` (4), `/vs` (new hub), `/vs/:competitor` (10), `/truth/:slug` (5).
- `/policies/:slug` renders on request with a 1-day CDN cache. Unknown slugs return a real 404, and a backend failure returns 503.
- The closed role `/careers/software-developer-intern` returns 200 with noindex. `/truth` gives a 301 to `/vs`.
- Code is in `src/features/content/`; the routes are thin files in `src/pages/`.

**Checks**
- `pnpm typecheck`: 0 errors, 0 warnings. `pnpm lint`: 0 errors. `pnpm test`: 193/193 pass, 34 of them mine (sanitizer, policy renderer, Formspree client, FAQ transform, label split, mobile number, glossary filter, careers, compare data, MCP list).
- `tests/e2e/content.spec.ts`: 87/87 pass across phone, tablet and desktop. It covers every accordion, the glossary filter, both copy buttons, validation errors and mocked Formspree submits for all three forms, the 404s and the 301, axe, JSON-LD checks, and `backendDown` on `/faq` and `/policies/:slug`. Playwright output goes to my own scratch folder, and I used only the dev server on :4321.
- There are 50 screenshots in `docs/screenshots/content/` (360 and 1440 px). I looked at them and fixed what I found: tables wider than a phone screen, headings that ran to three lines, links that took bold from the page styles, and uneven job cards.

**Features I did not keep**
- Anonymous, unsourced competitor "testimonials" and the fake competitor logo SVGs.
- Two invented team members (Priya Singh, Vikram Malhotra). The "team1" photo is a stock photo, so the founder is shown without it and the Person JSON-LD has no image.
- Invented numbers: the AI-agent stats (50K+/10K+/99%) and its made-up chat results, "₹100 Crore", "3x trust", the "10k projects" counter, and a hard-coded ₹15,000 salary plus render-time `validThrough` in the JobPosting schema.
- The referral "Reference ID by email and SMS" tracking block, because Formspree sends none.
- The 10 "coming soon" social links and the Gurugram guide's stock image (not Gurugram).
- The careers search and filter (only 3 roles), and the contact map iframe (now a Google Maps link).
- Policy "last updated" dates (see the first backend gap below).

**Backend gaps**
1. In production, `GET /pages/{name}/public` changes `updated_at` on every view. Two calls 4 s apart returned 08:02:11 and 08:02:15, and `view_count` went 389 → 390. The fix exists at `app/services/core.py:188-200` but is not deployed. Each build also adds about 10 views.
2. The grievance policy text still contains "[Name of Grievance Officer]" and "(To be updated…)".
3. `/faqs/public` is English only, so `/hi/faq` shows English answers.
4. All 16 celebrity blog slugs return 404, so no celebrity card links to a post.
5. There is no endpoint for referrals, contact or the newsletter; all three go to Formspree. There is no careers API either.
6. The MCP tool list (37 tools) is copied by hand into `src/features/content/ai/mcp.ts` from `app/mcp/`.

**Content to confirm**
- The truth pages' date is 2026-06-20, the date the old truth files were last changed.
- The NRI guide's tax text (20% capital gains tax with indexation) is out of date after 23 July 2024.
- The guides still carry old unsourced figures ("500 Fortune 500", the ROI ranges, "2024" in titles).
- The competitor claims and the *issues users report* sections of the truth pages may need a legal review.

**Shared-file changes I propose**
1. Add Reddit, Pinterest and Google Play marks to `src/ui/icons/paths.ts`. They are local in `links/data.ts` for now.
2. Put the newsletter form in `Footer.astro` and remove the per-page `NewsletterBand` from 16 pages.
3. Move `shared/TableScroll.astro` (a focusable scroll region, which axe requires) into `src/ui/`. Also scope the prose styles in `Content.astro`, which currently reach into components' lists and links.
4. Export an inline renderer or real heading levels from `chat/markdown.ts`.
5. Record these gaps in `docs/backend-gaps.md`, and add `/vs` to the static sitemap.