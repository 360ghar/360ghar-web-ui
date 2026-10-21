# Parity notes: home, forms, reviews (Agent A)

Status: A1, A2, A3 done in code; unit tests, tsc, eslint and astro check pass. E2E written (`tests/e2e/home-parity.spec.ts`), not run.

## Section decisions (v1 Home.jsx -> v2)

| v1 section | Decision | v2 place |
|---|---|---|
| MessageThree (owner form) | Port (A1) | Paper sheet that rises out of the bottom of the Owners band. Formspree `mwpqglyb`, `source=home-enquiry` |
| ReferEarnCta | Port, redesigned as one plain line | Under the owner sheet. Amounts are the real terms (`refer/terms.ts`): Rs 100 on listing, up to Rs 10,000 on deal |
| PropertyManagementShowcase | Already merged | Owners band (4 owner-app features + app link). No change |
| AppDownload | Port | Mist sheet with a new paper-cut phone drawing (`app` vignette). Real Play link, QR file for desktop, no invented stats |
| AIAgentShowcase | Port | Prompts as plain slips, MCP URL + copy button, link to /ai-agent. No fake chat replies |
| ToolShowcase | Already merged | Tools section, now three groups (Money, Checks, Design). `/design-blueprint` added. Live counts from the data hub API in the notes of circle rates, RERA and bank auctions |
| CounterThree | Merged | 300+/500+/5+/20+ cannot be traced (founding year is 2025). Real counts sit in place: live homes, 3,215 localities, and live data hub counts in the tool notes |
| FAQ + FAQ_DATA | Already ported | 10 Q&As + FAQPage JSON-LD (unchanged) |
| AiFactSheet | Port | Server-rendered `dl` + WebPage (`#facts`) with ItemList JSON-LD (see F1 fixes below) |
| Newsletter | Port | Existing `NewsletterBand` |
| BlogFeed | Already ported | Unchanged |
| CustomerReviews / ReviewCapture | A3 | See below |

## A3 reviews decision

- `GET https://api.360ghar.com/api/v1/reviews`: 404. `GET https://360ghar.com/api/reviews`: 404. No `/reviews` path in `openapi/openapi.json`.
- v1 `reviewsData.js` (8 reviews, 4.7 from 128) is invented (no source, initials avatars). Not used.
- Capture goes to Formspree (`source=review`). Display is only the real Google Business reviews link.

## Progress log

- A1 done in code: `src/features/content/home-enquiry/` (schema + test, strings en/hi, `HomeEnquiryForm.tsx`, `HomeEnquiry.astro`). Not yet placed on the page.
- A3 done in code: `src/features/reviews/` (schema + test, strings en/hi, `ReviewForm.tsx`, `ReviewSection.astro`). Export names: `ReviewSection.astro` (props `locale`, `id`, `propertyId`, `googleLink`, `headingLevel`) and `ReviewForm` (island, props `locale`, `s`, `id`, `propertyId`). Not yet placed on the page.

## Page order now

Hero, homes, how it works, places and searches, Owners band, owner enquiry sheet (rises over the band), refer and earn, app, tools (3 groups), AI assistant, review form, FAQ, blog, fact sheet, newsletter.

## New files

- `src/features/content/home-enquiry/`: `schema.ts` (+ test), `strings.ts`, `HomeEnquiryForm.tsx`, `HomeEnquiry.astro`.
- `src/features/reviews/`: `schema.ts` (+ test), `strings.ts`, `ReviewForm.tsx`, `ReviewSection.astro`. Reusable elsewhere: `<ReviewSection locale id propertyId googleLink headingLevel />`.
- `src/features/home/`: `more.ts` (copy), `facts.ts` (+ test), `qr.ts` (+ test), `sections/{Refer,AppSection,AiSection,Facts}.astro`, `load.test.ts`; `app` vignette added to `vignettes/vignettes.ts` (served at `/art/home/app.svg` by the existing route).

## Notes

- Both forms post to Formspree `mwpqglyb` with `source` and `form_type` set (`home-enquiry`, `review`) and a `_gotcha`-style honeypot field `website` that is never sent; a filled honeypot shows "sent" and posts nothing.
- Data hub counts (183 circle rates, 30 RERA projects, 237 auctions on 2026-09-29) come from `GET ...?limit=1&include_total=true` on each render (page cache is 10 minutes). A failed call hides that number.
- Left out on purpose: v1 counters (300+ customers, 500+ properties, 5+ years, 20+ RMs; founding year is 2025), app stats (50+ downloads, v1.0.7, 3+ rated), "Trusted by 2000+ homeowners", v1 reviews and the 4.7 from 128 score, "India's first" and "360° walkthrough for every listing" in the fact sheet (D9).

## Follow-up round (A4 to A8)

### A4 Claims in the new sections

Removed: "The iPhone app is coming soon." (en and hi). Only source was v1 `AppDownload.jsx` ("Coming Soon on the App Store"). No 360Ghar app exists on the App Store (iTunes search, country in, 2026-09-29) and `src/lib/seo/siteSchemas.ts` says no App Store link exists.

| Claim (en) | Result |
|---|---|
| Refer: Rs 100 when verified and listed; at most Rs 10,000 when the deal closes; open to all, no account | sourced: `features/content/refer/terms.ts`, `ReferPage.astro` (H.listed, H.closed), v1 `home:referEarn.note` |
| App: "Search homes, book visits, and call or message your relationship manager" | sourced: app repo `360-ghar-app/lib/features/visits` (visits), `visits/presentation/widgets/agent_card.dart` (relationship manager card with call and WhatsApp). v1 "chat" claim was reworded to "call or message" |
| App: "Suggestions of homes like the ones you like" | sourced: `app_messages.dart` `similar_properties_desc`, `features/swipes`; API `GET /properties/recommendations` |
| App: "360° tours for the homes that have one" | sourced: `360-ghar-app/lib/core/utils/tour_url.dart`, `features/tour`. True, and honest: 1 of 109 listings has one (A5) |
| App: "Alerts for new homes and price drops" | sourced: `app_messages.dart` `push_notifications_desc` ("new properties"), `price_drop_alerts_desc` |
| App: Google Play link, QR | sourced: `features/layout/nav.ts` PLAY_STORE; QR decodes to it |
| AI: "Search works without an account. Visits and rent tools ask you to sign in" | sourced: `features/content/ai/mcp.ts` (`open` flags), `AiAgentPage.astro` |
| AI: MCP address and prompts | sourced: `mcp.ts` MCP_URL; prompts from v1 `AIAgentData.jsx` and `AiAgentPage.astro`, each maps to a tool in `mcp.ts` |
| Enquiry: "We come to your door, photograph the home, check the details and the location, and publish your listing. No upfront listing fee." | sourced: v1 `home:message.desc`, v2 `site:home.ownersBody`, `structuredFaq.a2/a5`. "studio-quality", "360°" and "(limited time)" removed |
| Enquiry sent: "We have received your request." | true statement. The promise "we will write to you" was removed |
| Review lead: "Tell us how it went." | "Our team reads every review" removed (a promise nobody can check) |
| Review note: goes to the team by email, not posted here, public reviews are on Google | true by construction of the form (Formspree) |
| Facts: Gurugram site and app; N homes listed; 3,215 locality pages; free listing; relationship manager; data hub and calculators; MCP with N tools; founded 2025; Sector 50 office, email, phone | sourced: live API total; `data/localities.json` length; `structuredFaq`; `nav.ts`; `mcp.ts`; `lib/seo/legacy/structuredData.js` (foundingDate, address); `lib/company.ts` |
| Facts and steps: "Our team visits each home before it goes live and checks the owner's papers"; "Our team verifies each one" | sourced: v1 `home:structuredFaq.a3`, existing v2 step copy (`copy.ts`). Not checkable from code: owner should confirm |
| Owners body: "We photograph it, verify it and list it free" | sourced: v2 `site:home.ownersBody` with "in 360°" removed |
| Tools: counts | live API (`total`), hidden when the call fails |
| Steps title and body: "Look room by room ... a 360° tour when one has been shot" | replaces "Walk through from home / go room by room on your phone" |

Not in my files, but the same claim: the H1 "Walk in before you visit." (`site:home.title`) and SEO copy in `seo.json` promise walkthroughs. The owner decides.

### A5 Tour count (measured 2026-09-29, GETs only)

- `GET /api/v1/properties?limit=50&include_total=true`, 3 pages, plus a second sort (`sort_by=price_low`, 3 pages) because page cursors repeat some rows (103 unique ids on the first pass, 109 after both). Detail GETs for ids 182, 122 and 105 agree with the list. Responses are in the scratchpad `tour/`.
- Fields: `virtual_tour_url`, `video_tour_url`, `video_urls`.
- Result: **1 of 109 listings has a tour** (id 75, "Godrej Prana 3BHK, Sector 68", a Kuula link). **0 of 109 have a video.** D9 in `backend-gaps.md` ("no listing has virtual_tour_url") is off by one.
- Copy now says a tour exists "for the homes that have one" (app feature, step 1, fact sheet row "Tours" and its JSON-LD). The fact sheet test forbids "every listing", "all listings" and "walkthrough".

### A6 Latency

- `features/home/cap.ts` `capped(promise, ms, fallback)`: Promise.race with a cleared timer. `cap.test.ts` uses fake timers (value before the cap, fallback at exactly 2000 ms, rejection, background finish).
- `load.ts` `cached(key, call)`: `memo()` (key `home:<name>`, TTL 10 min, in-flight sharing) plus 2 s cap. A failed call throws inside memo, so it is not cached. Used for the three counts and the four spotlight localities. A capped or failed locality still sets `failed` (short page cache), as before. The three core calls (recommendations, total, blog) are unchanged.

### A7 Star contrast (WCAG 1.4.11 needs 3:1)

| Colour | white | mist-50 | mist-100 | mist-200 |
|---|---|---|---|---|
| ink-400 (old unchosen star) | 3.28 | 3.09 | 2.85 | 2.52 |
| kesar-600 (old chosen star) | 3.66 | 3.45 | 3.19 | 2.81 |
| ink-600 (new unchosen outline) | 8.53 | 8.03 | 7.42 | 6.55 |
| kesar-700 (new chosen fill) | 5.47 | 5.15 | 4.76 | 4.20 |

The old pair passed only on white and mist-50 and differed by hue alone (1.12:1 between them). New: unchosen is an outline in ink-600, chosen is a filled kesar-700 star, so state shows in shape. All pass on every background.

### A8 Visual re-pass

Screenshots (headless Chrome, iframe at the width, from `http://127.0.0.1:4321`) are in the scratchpad `shots2/`. Fixed: the newsletter sheet ran to the screen edge (no gutter) on the home page: wrapped in `container-page`; QR and button alignment.

## F1 fixes (2026-09-29)
- Fact sheet JSON-LD (`features/home/facts.ts`) is now a `WebPage` (`<canonical>#facts`, `about` = the site Organization id) with an `ItemList` of `ListItem` (name = label, description = value). It no longer emits an Organization, so `/` has one node per `@id`. Tests: `facts.test.ts`, `jsonld.test.ts`. `lib/seo/validate.ts`: `ListItem` needs `position` plus `name` or `item`; breadcrumb steps still need both.
- App drawing: artboard now `viewBox="0 28 360 392"` (`TOP.app = 28`, `SIZE.app = [360, 392]`); the drawing's top edge is y = 30.7. Desktop keeps its old place through `margin-top: 7.778%` on the image (AppSection.astro). Test: `vignettes/vignettes.test.ts`.
- `lib/clientImports.test.ts` scans every `.tsx` under `features` and `ui`, transitively, for server-only imports. No violation found; allowlist is empty.
