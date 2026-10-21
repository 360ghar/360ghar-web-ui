I built all 15 tool routes, and each also works under `/hi`. My files pass every required check. `pnpm lint`, `pnpm typecheck` and `pnpm test` still fail overall, because of other people's files. I re-checked the design law on every page. There are no kickers, pills, gradients (except the slider's hard-stop fill), glows or hover lifts, and no page scrolls sideways at 360 or 1440 px.

**Routes:** /tools, /emi-calculator, /area-converter, /loan-eligibility-calculator, /area-calculator, /property-document-checklist, /capital-gains-tax-calculator, /design-blueprint, /vastu-checker, /ai-design-studio, /check-fake-listing, /rent-receipt, /mofa-to-rera-converter, /sq-ft-calculator, /acre-in-gaj. All use `prerender = true`. The code is in `src/features/tools/`, and all pages share `ToolPage.astro`, `ui.tsx` and `tools.css`.

**Checks:**
1. **Typecheck:** 0 issues in tools files. It fails on 3 errors in other files: `content/shared/text.ts`, `data-hub/DataHubPage.astro`, `data-hub/SourcesPage.astro`.
2. **Lint:** 0 errors in tools files. `pnpm lint` fails on 8 errors in `AuthFlows.tsx`, `policies/sanitize.ts`, `locality/[slug]/[intent].astro` and `project/[title].astro`.
3. **Unit tests:** 72 tools tests in 10 files pass. `pnpm test` overall is 174 of 175. The failure is `src/features/chat/markdown.test.ts`; that file has not changed since before this work started.
4. **E2E:** `tests/e2e/tools.spec.ts` has 27 tests, and all 81 runs pass on phone, tablet and desktop. Vastu has a `backendDown` test and a mocked 400 test. One test also opens every tool page with the backend down.
5. **Screenshots:** 36 files in `docs/screenshots/tools/`, including the Vastu report and a filled rent receipt. I checked them all.

**Old features dropped:**
- Bank interest-rate tables and rate FAQs, because I could not verify the figures.
- The "Verified" badge on checklist files. Nothing was verified; the button is now "Note a file".
- "High risk" labels on named portals and the fake 400 ms delay.
- html2canvas/jspdf, replaced by print CSS.
- The separate social share buttons, replaced by native share.
- The original photo in the AI gallery, because its temporary link broke on reload.
- The English-only area essay and the MOFA swap button.

**Bugs fixed:** the NaN default on the area converter, the one-day date shift in IST, the 12.5% capital gains rule after 23 July 2024 (with the CII for 2025-26 corrected from 380 to 376, and the ₹10 crore cap), the EMI FAQ example (₹43,391, not ₹43,691), and the missing i18n keys on /tools.

**Backend gaps:** no new ones. Vastu returns 400 for size and type errors, and the page shows that message. `POST /design-studio/generate` is still unused; the Puter code is isolated in `ai-design/provider.ts` so it can be swapped. The tests mock `/vastu/analyze`. Do not call production to create test data; add a sanitized fixture instead. `netlify.toml` already sets `X-Frame-Options = SAMEORIGIN` on `/*`, so the blueprint iframe works.

**Shared-file changes I propose:**
- `seo.json` `fakeListingChecker.description` says "our AI checks". This is not true, and the page now uses its own text.
- `tools.json` `propertyChecklist` says "40+ documents" and "Verified by 360Ghar experts". The list has 13 documents, so the page uses new text.
- `tests/e2e/helpers.ts`: add an `exclude` option to `axe()`. The Blueprint3D app in `public/blueprint3d` fails axe on its own, so the tests skip the iframe.
- `lib/api/client.ts`: add a timeout option per request. Vastu needs 180 s, so it uses a raw fetch now.
- `conventions.md`: say that islands with no queries do not need `QueryProvider`. I left it out of the calculators.