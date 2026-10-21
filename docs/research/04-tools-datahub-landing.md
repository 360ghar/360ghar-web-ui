Every route below was traced from `App.jsx` through its page, services and data files to the FastAPI handler. There are three headline findings:
- **No backend at all for most pages.** The calculators, geo pages, price index, fake-listing checker and rent receipt all run in the browser on static data.
- **The programmatic landing pages never query listings.** They only link to `/properties?…`, so they have no zero-result state.
- **Several data-hub pages don't match the backend.** The mismatches are in parameter and field names, and the backend wins.

**Path legend** (every path in this report is under one of these):
- `W/` = `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/src/`
- `B/` = `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-backend/app/api/api_v1/endpoints/`
- `S/` = `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-backend/app/schemas/`

**Rules that apply to every route**
- **Hindi mirror:** all routes are also served under `/hi/*` (`W/App.jsx:316-325`).
- **Global JSON-LD** on every page: Organization/RealEstateAgent, WebSite + SearchAction, LocalBusiness, knowledgePanel, MobileApplication, Person, Speakable.
- **`SEO.jsx`:** when `noindex` is set, the page gets `robots: noindex,follow` and no canonical or hreflang tags.
- **Data-hub mount:** all data-hub endpoints live under `/api/v1/data-hub` (`B/data_hub/router.py`).
- **List responses** use `CursorPage {items, next_cursor, has_more, limit, total?}`, with `limit` defaulting to 20 (max 100) and `total` only when `include_total=true`.
- **Field names on the wire:** FastAPI's default `response_model_by_alias=True` is not overridden anywhere, so aliased schema fields go out under the alias, which is the database column name. Examples: `far_limit`, `max_coverage_pct`, `full_address`, `approval_status`, `total_units`. This is inferred from the framework default; I found no test that shows it.
- **Charts and maps:** no chart library is used. The "charts" are hand-built CSS bars, plus an SVG ring (`ScoreWheel`) for builder scores. None of these pages has a map.

---

## Tools

### `/tools` — `W/pages/tools/ToolsIndex.jsx`
- **What it does:** a static list of 13 tools in 4 groups, with a client-side search box. There is no API call.
  - Finance: EMI, loan eligibility, capital gains, stamp duty, rent receipt.
  - Utilities: area converter, area calculator, fake-listing checker, verify ownership.
  - Planning: document checklist.
  - Design: AI Design Studio, blueprint, Vastu.
- **Not listed:** mofa-to-rera, sq-ft-calculator, acre-in-gaj.
- **SEO:** BreadcrumbList + ItemList.
- **Bug:** the `toolsIndex.title`, `headingTitle`, `category*` and `tool<key>` keys are missing from `W/i18n/locales/en/tools.json:1044`, which holds only 4 keys. The page therefore shows raw key strings as its title and card text.
- **Indexing:** the page is not in `indexableStaticRoutes`, the prerender list, or `sitemap-static.xml`.

### `/emi-calculator` — `W/pages/tools/EmiCalculator.jsx`
- **Inputs:** a slider plus number box for each of:
  - amount: ₹1L–₹1Cr
  - rate: 1–20%
  - tenure: 1–30 years
- **Math (lines 96-184):**
  - EMI = P·r·(1+r)^n / ((1+r)^n − 1), with r = annual rate/12/100 and n = years × 12.
  - The page also produces a yearly amortization table and a one-time prepayment simulator (amount and month → months saved and interest saved).
- **Share and reset:** "Share" copies a link with `?amount&rate&tenure`, and those params are restored on load. There is also a reset button.
- **Chart:** a CSS principal-vs-interest bar.
- **Backend:** none.
- **SEO:** title "Home Loan EMI Calculator India | Calculate Mortgage EMI | 360Ghar". JSON-LD: SoftwareApplication (`toolSchemas.emiCalculator`), BreadcrumbList, FAQPage (9 questions), HowTo.

### `/area-converter` — `W/pages/tools/AreaConverter.jsx`
- **Units:** 12, converted through square feet (lines 45-58): sq_ft 1, sq_mt 10.7639, sq_yd 9, gaj 9, acre 43560, hectare 107639, bigha 27000 (approximate), guntha 1089, ground 2400, cent 435.6, kanal 5445, marla 272.25.
- **Controls:** from/to unit, a swap button, and a visual comparison of the two units. There is a static table of common conversions.
- **Bug:** the default `toUnit` is `'sq_yard'`, which is not a key in the rates table, so the result is `NaN` on first load.
- **Backend:** none.
- **SEO:** SoftwareApplication, BreadcrumbList, FAQPage (9), HowTo.

### `/loan-eligibility-calculator` — `W/pages/tools/LoanEligibilityCalculator.jsx`
- **Inputs:**
  - income: ₹10k–₹5L
  - existing EMIs: ₹0–₹1L
  - other expenses: ₹0–₹1L
  - rate: 1–20%
  - tenure: 1–30 years
- **Math (lines 100-135):**
  - FOIR (share of income a bank lets go to EMIs) depends on income: ≤₹50k → 0.50, >₹50k → 0.55, >₹1L → 0.60, >₹2L → 0.65.
  - Maximum EMI = (income − expenses) × FOIR − existing EMIs.
  - Maximum loan = present value of that EMI over the tenure.
- **Per-bank table:** fixed FOIRs for SBI 0.50, HDFC 0.55, ICICI 0.55, Axis 0.50, Bank of Baroda 0.60.
- **Share link:** `?income&emi&rate&tenure&expenses`.
- **Backend:** none.
- **SEO:** SoftwareApplication, BreadcrumbList, FAQPage, HowTo.

### `/area-calculator` — `W/pages/tools/AreaCalculator.jsx`
- **Inputs:** super built-up area (sq ft), loading % (slider 15–50), built-up loading % (slider 0–40).
- **Math (lines 47-57):**
  - carpet = super × (100 − loading)/100
  - built-up = min(carpet × (1 + builtUpLoading/100), super)
  - loading area = super − carpet
- **Backend:** none.
- **SEO:** SoftwareApplication, BreadcrumbList, FAQPage, HowTo.

### `/property-document-checklist` — `W/pages/tools/PropertyChecklist.jsx`
- **Content:** 13 documents in 3 categories (legal, financial/tax, agreement/registration), hard-coded as i18n keys.
- **State:** checkboxes are saved in `localStorage.propertyChecklist`. A per-document file picker (`image/*,.pdf`) saves only the file's name and size in `localStorage.propertyChecklistDocs`; nothing is uploaded.
- **Output:** a progress bar, "Download PDF" (which is just `window.print()`), and "copy summary" to the clipboard.
- **Backend:** none.
- **SEO:** SoftwareApplication, BreadcrumbList, FAQPage, HowTo.

### `/capital-gains-tax-calculator` — `W/pages/tools/CapitalGainsCalculator.jsx`
- **Inputs:** sale price, purchase price, purchase and sale financial year (a Cost Inflation Index table for 2001-02 through 2025-26 is hard-coded at lines 17-43), transfer expenses, tax slab (0/5/20/30%), and reinvestment under Sections 54, 54EC and 54F.
- **Math (lines 121-180):**
  - Long-term if (sale FY start year − purchase FY end year) ≥ 2.
  - Long-term: indexed cost = purchase × CII(sale)/CII(purchase), taxed at 20%. Short-term: taxed at the slab rate.
  - Exemptions: 54EC capped at ₹50L; 54F is proportional to proceeds reinvested; exemptions apply only to long-term gains.
- **Domain gap:** there is no post-July-2024 option of 12.5% without indexation.
- **Share link:** `?sale&purchase&py&sy&expenses&slab`.
- **Backend:** none.
- **SEO:** SoftwareApplication, BreadcrumbList, FAQPage, HowTo.

### `/design-blueprint` — `W/pages/tools/DesignBlueprint.jsx`
- **How it works:** an iframe loads `/blueprint3d/index.html` (about 14 MB of assets: three.js, jQuery, 44 furniture models, room textures).
- **Features:**
  - Draw, move and delete walls, and edit item width, depth and height.
  - Save and load a `design.blueprint3d` file, which is JSON produced by `loadSerialized`/`serialize`.
  - "Download as Image" saves a PNG.
  - A WhatsApp share downloads the PNG and then opens `wa.me` (`public/blueprint3d/js/example.js:472-644`).
- **Page shell:** a 15-second load timeout with a retry button, and a CTA to `/vastu-checker`.
- **Backend:** none.
- **SEO:** SoftwareApplication, BreadcrumbList, HowTo, FAQPage.

### `/vastu-checker` — `W/pages/tools/VastuChecker.jsx`
- **Upload:** one floor-plan image (JPEG, PNG or WebP, 5 MB or less) via `W/components/vastu/FloorPlanUpload.jsx`.
- **Other inputs:** north direction (up/right/down/left/unknown, `W/components/vastu/DirectionSelector.jsx`) and notes (up to 1000 characters).
- **API:** `analyzeFloorPlan` (`W/services/vastuService.js`) sends `POST /vastu/analyze` as multipart with `image`, `north_direction` and `notes`. It uses a 180-second timeout and calls `api.360ghar.com` directly in production, bypassing the Netlify proxy.
- **Backend handler:** `B/vastu.py:33`. It checks file type and size and that the image decodes, then calls the AI provider (gemini/glm/openai). An optional `provider` field is not sent by the frontend.
  - Response `VastuAnalyzeResponse` (`app/services/ai/vastu/schemas.py:261`): `success`, `data{floor_plan_analysis, vastu_score 1-10, room_analysis, major_defects, remedies, improvements, warnings, analysis_confidence, is_valid_floor_plan, disclaimer}`, `report_markdown`, `has_warnings`, `provider_used`, `analyzed_at`.
- **Output:** a score card, warnings banner, and the markdown report (react-markdown). You can copy the markdown, print (popup window), or download a PDF built with html2canvas + jspdf (`W/components/vastu/VastuReport.jsx:112-166`).
- **Minor:** the page handles 413/415 errors, but the backend returns 400 for size and type problems.
- **SEO:** SoftwareApplication, BreadcrumbList, FAQPage, HowTo.

### `/ai-design-studio` — `W/pages/tools/AIDesignStudio.jsx`
- **AI path:** the page runs entirely on **Puter** in the browser, not on the backend.
  - `puterService.signIn` is required first.
  - Text-to-image: `puter.ai.txt2img` with openai-image-generation / gpt-image-2.
  - Image-to-image: gemini-3.1-flash-image-preview with `input_image` (`W/services/puterService.js`).
- **Inputs:**
  - mode: text-to-image or image-to-image
  - design type: interior or exterior
  - room type: 10 interior or 7 exterior options (`W/components/design/RoomTypeSelector.jsx`)
  - 12 style presets (`W/components/design/StylePresetSelector.jsx`)
  - a custom prompt
  - an upload for image-to-image (5 MB or less)
- **Output:** a before/after slider, PNG download, regenerate, and a local gallery (up to 20 designs in `localStorage.designGallery`).
- **Unused backend:** `POST /design-studio/generate` (`B/design_studio.py:26`) requires login and returns `ImageGenResponse{success, image, error, code}` from Gemini 3 Pro Image. Nothing calls it.
- **SEO:** SoftwareApplication, BreadcrumbList, FAQPage, HowTo.

### `/check-fake-listing` — `W/pages/tools/FakeListingChecker.jsx`
- **Logic:** parses the pasted URL's hostname and looks it up in a fixed list of 5 portals (99acres and MagicBricks flagged high risk; Housing, NoBroker and CommonFloor medium) with canned issues and red flags. There is a 400 ms fake "analyzing" delay.
- **Backend:** none, and no AI. The SEO description in `seo.json` claims "our AI checks", which is not true.
- **SEO:** SoftwareApplication, BreadcrumbList, FAQPage, HowTo.

### `/rent-receipt` — `W/pages/tools/RentReceipt.jsx` + `W/pages/tools/RentReceiptPreview.jsx`
- **Inputs:** tenant, landlord, address, monthly rent, period start and end, payment mode (UPI, bank transfer, cheque, cash), receipt date, landlord PAN (regex `^[A-Z]{5}[0-9]{4}[A-Z]$`), transaction reference, and a signature image (2 MB or less, stored as a data URL).
- **Rules:** PAN is required when rent × 12 > ₹1L. A revenue-stamp box appears when the mode is cash and rent > ₹5,000. The amount in words comes from `W/utils/numberToWords.js`.
- **Batch mode:** 12 receipts for the current financial year (April–March), numbered `RR-XXXXX-01…12`.
- **Print/PDF:** `react-to-print` on an A4 page style, so the PDF is the browser's "Save as PDF". There is also a "fill sample" button.
- **Backend:** none.
- **Bug:** default and batch dates come from `new Date(y, m, d).toISOString()`, which shifts back one day in IST (UTC+5:30), e.g. the period starts on the last day of the previous month.
- **SEO:** SoftwareApplication, BreadcrumbList, FAQPage, HowTo.

### `/mofa-to-rera-converter` — `W/pages/tools/MofaToReraConverter.jsx`
- **Math:** RERA = MOFA × 1.06; the reverse is ÷ 1.06, with rounding. It has a direction toggle and a static table.
- **Backend:** none.
- **SEO:** SoftwareApplication, BreadcrumbList, FAQPage, HowTo.

### `/sq-ft-calculator` — `W/pages/tools/SqFtCalculator.jsx`
- **Units:** 5 (sq_ft 1, sq_mt 10.7639, sq_yd 9, gaj 9, acre 43560). The default converts 100 sq m to sq ft. It has a swap button and a table.
- **Backend:** none.
- **SEO:** same four JSON-LD types as the other tools.

### `/acre-in-gaj` — `W/pages/tools/AcreInGaj.jsx`
- **Units:** 3 (acre 43560, gaj 9, sq_ft 1), so 1 acre = 4840 gaj. It has a swap button and a table.
- **Backend:** none.
- **SEO:** same four JSON-LD types.

---

## Data hub

### `/circle-rates` — `W/pages/data-hub/CircleRateDirectory.jsx`
- **API calls:**
  - `getCircleRateSectors` → `GET /data-hub/circle-rates/sectors` (`B/data_hub/circle_rates.py:81`). Returns `list[str]`, cached for 24 hours.
  - `getCircleRates({sector, property_type, limit:20, cursor})` → `GET /data-hub/circle-rates` (`circle_rates.py:36`). Filters with case-insensitive substring matches on `sector`, `year` and `property_type`. Returns `CursorPage[CircleRateResponse]` (`S/data_hub.py:31`).
- **Filters:** a sector dropdown, and a property-type dropdown (residential/commercial/plot/industrial). The data has no industrial rows.
- **Table:** sector, colony, type, rate per sq yd, rate per sq ft, year, and a link to `/circle-rate/:slug`. Pagination is a "Load more" cursor button.
- **Extras:** an embedded `StampDutyWidget`, and a hard-coded "illustrative" CSS trend bar (index values 78→104).
- **SEO:** title "Gurugram Circle Rates 2024 | …" (stale year). JSON-LD: SoftwareApplication, BreadcrumbList, ItemList, FAQPage, HowTo.

### `/circle-rate/:slug` — `W/pages/data-hub/CircleRateDetail.jsx`
- **API:** `getCircleRateBySlug` → `GET /data-hub/circle-rates/{slug}` (`circle_rates.py:126`). Returns `CircleRateResponse`, or 404.
- **Slugs:**
  - **183** in `public/sitemap-datahub.xml`: 61 sectors × {residential, commercial, plot}.
  - Pattern: `gurugram-sector-{n}-{type}`.
  - Source: `CircleRate.slug`, fetched by `scripts/generate-datahub-sitemap.mjs`.
- **Output:** rate cards and `StampDutyWidget`. The widget never sends `sector`, so `circle_rate_per_sqyd` is never returned.
- **SEO:** title template `{{sector}} Circle Rates {{year}} | DLC Rate {{propertyType}} | 360Ghar`. JSON-LD: BreadcrumbList + FAQPage (3 questions). `noindex` on error.

### `/stamp-duty-calculator` — `W/pages/data-hub/StampDutyCalculator.jsx`
- **Inputs:** property value, buyer type (male 7%, female 5%, joint 6%), and an optional sector. The sector list comes from `dataHubStore.fetchCircleRateSectors`, i.e. `/circle-rates/sectors`.
- **API:** `calculateStampDuty` → `POST /data-hub/calculator/stamp-duty` with body `{property_value, buyer_type, sector?}` (`B/data_hub/calculations.py:56`, an alias of `circle_rates.py:87`).
  - Duty = value × rate; registration = 1% of value (`app/services/data_hub/utils.py:159-175`).
  - Response `{property_value, circle_rate_per_sqyd, stamp_duty_rate, stamp_duty_amount, registration_fee, total_cost, current_bank_rate}`. The bank rate is the latest `home_loan_min` value.
- **Client-side extra:** a comparison table across states with hard-coded rates (HR 7/5, DL 4/6, UP 7, RJ 5).
- **Gap:** the backend looks up the circle rate but never applies the "higher of circle rate or deal value" rule. There is no area input, and `property_type` is accepted but ignored.
- **SEO:** BreadcrumbList, SoftwareApplication, HowTo, FAQPage.

### `/rera-projects` — `W/pages/data-hub/ReraProjectDirectory.jsx`
- **API calls:**
  - `getReraProjects({limit:12, q, status, property_type, cursor})` → `GET /data-hub/rera-projects` (`B/data_hub/rera.py:30`). The backend accepts only `status` (exact match) and `q` (case-insensitive substring on project or developer name).
  - `verifyRera(num)` → `GET /rera-projects/verify/{n}` (`rera.py:65`), which returns `{valid, status, project_name}`.
- **Mismatches:**
  - The `property_type` filter (residential/commercial/mixed/plotted) is ignored by the backend.
  - Status option `expired` does not exist in the data (the model's values are registered, lapsed, revoked, completed).
  - The card shows `project.property_type`, but the field is `project_type`.
  - `verify` has no `developer_name` field, yet the UI tries to show it.
- **SEO:** SoftwareApplication, BreadcrumbList, ItemList, FAQPage, HowTo.

### `/bank-auctions` — `W/pages/data-hub/BankAuctions.jsx`
- **API calls:**
  - `GET /data-hub/auctions/banks` (`B/data_hub/bank_auctions.py:44`) and `GET /data-hub/auctions/cities` (`bank_auctions.py:62`), both `list[str]`.
  - `GET /data-hub/auctions` with `limit=12`, `type=bank|court`, `bank`, `city`, `property_type`, `min_price`, `max_price`, `date_from`, `date_to`, `cursor` (`bank_auctions.py:152`). Returns `CursorPage[BankAuctionResponse]`; court rows are mapped into the same bank schema.
- **Filters:** a sidebar with city, source type, bank, property type (residential/commercial/plot/industrial), price range and dates.
- **Cards:** `W/components/data-hub/AuctionCard.jsx`.
- **Alerts:** the alert modal calls `POST /data-hub/auctions/alerts` (login required, `B/data_hub/alerts.py:62`) with `{bank_name, property_type, min_price, max_price}`. The page never checks whether the user is logged in.
- **SEO:** title template `Bank & Govt Property Auctions {{city}} | 360Ghar` (default "Delhi NCR"). JSON-LD: SoftwareApplication, BreadcrumbList, ItemList, FAQPage, HowTo.

### `/bank-auctions/:id` — `W/pages/data-hub/BankAuctionDetail.jsx`
- **API:** `GET /data-hub/auctions/{id}` (`bank_auctions.py:132`). It checks the bank table first, then the court table, and has no `response_model`.
- **IDs:** **237** in the sitemap (range 61–315).
- **Output:** a countdown in days, reserve price, EMD (deposit), date, type, case details, contact block, source link, and the alert modal.
- **Field mismatches:**
  - The page reads `city`, `address`, `area`/`area_sqft`/`area_unit`, `contact_name`/`contact_phone`/`contact_email` and `loan_account_number`.
  - The schema has no `city`. The address comes back as `full_address`. The model columns `area_sqft`, `contact_person`/`phone`/`email` and `possession_type` are not exposed.
- **SEO:** title "`<description>` — Auction | 360Ghar". JSON-LD: BreadcrumbList, plus Event (Place, organizer Organization, Offer) when a date exists. `noindex` on error.

### `/auction-sources` — `W/pages/data-hub/AuctionSources.jsx`
- **Content:** entirely static `SOURCE_GROUPS`: 6 groups, about 30 portals and banks.
- **Unused API:** `GET /data-hub/auctions/source-categories` (`bank_auctions.py:68`) returns the same groups with live counts, but the page doesn't call it.
- **SEO:** BreadcrumbList, Article, FAQPage, HowTo.

### `/verify-ownership` — `W/pages/data-hub/VerifyOwnership.jsx`
- **Inputs:** tehsil (about 50 hard-coded names), village, khasra (plot) number, and a CAPTCHA.
- **API calls:**
  - `GET /data-hub/jamabandi/captcha` returns an image blob (login required, `B/data_hub/registry.py:44`).
  - `POST /data-hub/jamabandi/lookup {tehsil, village, khasra_number, captcha_token}` (login required, `registry.py:59`).
  - Response `{tehsil, village, khasra_number, owner_names[], area_acres, mutation_status, encumbrance, fetched_at, is_cached}`.
- **Mismatches:**
  - The UI reads `owners`/`owner`, `area`/`area_unit` and `last_updated`/`updated_at`.
  - Nothing on the page requires login, so logged-out users get 401s.
  - `setLoading(true)` is never called.
- **SEO:** BreadcrumbList, SoftwareApplication, HowTo.

### `/zone-checker` — `W/pages/data-hub/ZoneChecker.jsx`
- **API calls:**
  - `getZoningData({search, limit:12, cursor})` → `GET /data-hub/zoning` (`registry.py:120`). The backend filters only on `sector`.
  - `getColonyApprovals({limit:10, cursor})` → `GET /data-hub/colony-approvals` (`registry.py:153`).
- **FAR calculator:** buildable area = plot size × FAR (line 98).
- **Mismatches:**
  - The search box sends `search`, so the backend ignores it.
  - Zone cards read `far`/`max_height`, but the API returns `far_limit`/`max_height_m`.
  - The colony table reads `status`, but the API returns `approval_status`.
- **SEO:** BreadcrumbList, SoftwareApplication (inline), FAQPage.

### `/zone-checker/:slug` — `W/pages/data-hub/ZoneCheckerDetail.jsx`
- **API:** `GET /data-hub/zoning/{slug}` (`registry.py:108`).
- **Slugs:** **8** in the sitemap, pattern `gurugram-sector-{1,4,5,7,9,9a,10,10a}-residential`.
- **Mismatch:** the page reads `far`, `max_height`, `ground_coverage`, `setback_front/rear/side`, `parking_norm`, `density`, `notes`, `colony_approval`, `sector_name` and `primary_land_use`. None of these are in `ZoningDataResponse` (`S/data_hub.py:190`). The model does have `setback_*_m`, `master_plan_year` and `notes`, but they aren't exposed.
- **SEO:** title template `{{sector}} Gurugram Zoning | FAR Master Plan | 360Ghar`. JSON-LD: BreadcrumbList + Place. `noindex` when missing.

### `/regulatory-updates` — `W/pages/data-hub/RegulatoryUpdates.jsx`
- **API:** `GET /data-hub/gazette?type=&limit=20&cursor` (`registry.py:177`), sorted by date descending.
- **Tabs:** all, land_acquisition, rate_revision, policy, clu_change. These match the backend `GazetteType` values. Items render through `W/components/data-hub/GazetteItem.jsx`.
- **Alignment:** fine. `getGazetteDetail` (`/gazette/{id}`, `registry.py:211`) exists but isn't used.
- **SEO:** CollectionPage, BreadcrumbList, FAQPage.

### `/builder-reputation` — `W/pages/data-hub/BuilderReputation.jsx`
- **API:** `getBuilders({search, sort_by, limit:20, cursor})` → `GET /data-hub/builders` (`rera.py:94`). The backend accepts `q` and `order_by=score`.
  - Response items: `{builder_name, slug, total_projects, total_complaints, builder_score, rera_projects[:5], recent_complaints[:5]}`.
  - Score = 100 − 15 × (complaints/projects), and 50 when a builder has no projects (`utils.py:178`).
- **Mismatches:**
  - Params: `search` and `sort_by` (score_desc/projects_desc/complaints_desc) are ignored.
  - Fields: the UI reads `builder.name`, `builder.score` and `builder.id`, which don't exist.
- **SEO:** BreadcrumbList, ItemList, FAQPage.

### `/builder-reputation/:slug` — `W/pages/data-hub/BuilderReputationDetail.jsx`
- **API:** `GET /data-hub/builders/{slug}` (`rera.py:210`), which includes all of the builder's projects and 20 complaints.
- **Slugs:** come from `ReraProject.developer_slug`. The current sitemap has **0** builder detail URLs, because the builders endpoint returned nothing at build time.
- **Projects tab:** calls `/rera-projects?developer=<name>`. That param doesn't exist, so the tab shows every project in the database.
- **Missing fields:** the UI also reads `city`, `total_penalties` and `complaints`, which the API doesn't return.
- **Chart:** `ScoreWheel` SVG.
- **SEO:** title template `{{builder}} RERA Score & Complaints | 360Ghar`. JSON-LD: Organization with PropertyValue entries (deliberately no AggregateRating). `noindex` on 404 or error.

### `/builder-reputation-score`, `/tenant-demand-heatmap`, `/best-sectors-investment-2026` — `W/pages/geo/*.jsx`
- **Content:** all static arrays, no API.
  - Builder score: 8 builders (fields name, projects, reraScore, complaints, delivery, status, areas, note).
  - Tenant heatmap: 8 areas (demandScore, avgRent2bhk, vacancy, profile, demandTrend, topEmployers, tier).
  - Best sectors: 5 sectors (rank, priceRange, expectedReturn, rentalYield, risk, horizon, verdict).
- **Heatmap:** it is a set of cards, not a map.
- **SEO:** hard-coded titles. JSON-LD: FAQPage and BreadcrumbList, plus a Dataset node (the first two pages) or an Article node (best sectors). `dateModified` is hard-coded to 2026-01-01.

### `/price-index/:citySlug` — `W/pages/data-hub/PriceIndexPage.jsx`
- **Data:** static `W/data/priceContext.json`.
  - **5 slugs:** gurgaon, delhi, noida, faridabad, ghaziabad.
  - Price-range strings by buy/rent/pg × type.
  - Up to 20 localities come from `useLocalitiesIndex`.
- **Chart:** a hard-coded "illustrative" CSS trend.
- **SEO:**
  - Title template `{{city}} Property Price Index — May 2026` (hard-coded month).
  - JSON-LD: BreadcrumbList, Dataset, FAQPage.
  - `noindex` for unknown cities.
  - `scripts/build-price-context.mjs` can write a file generated from `/properties`, but the page imports the manual JSON.

---

## Programmatic

**How listings are picked:** none of these pages fetch properties. Each one builds a query with `buildPropertySearchQuery` (`W/utils/propertyFilters.js:173`) → `normalizePropertySearchFilters` (`W/utils/propertyTaxonomy.js:252`) and links to `/properties?limit=12&city=…&purpose=…&property_type=…&bedrooms_min/max&price_max&amenities`. That page then calls `GET /api/v1/properties` (`B/properties.py:295`). As a result, **there is no zero-result state and no noindex based on inventory**. Indexing is purely rule-based (`W/seo/indexationPolicy.js`), and nothing prunes by inventory.

### `/near/:slug` — `W/pages/landing/NearOfficePage.jsx`
- **Slugs:** **10** from `W/data/office-landmarks.json`, all Gurugram: cyber-city, udyog-vihar, golf-course-road-corporate, millennium-city-centre, medanta, artemis, sector-55-56-metro, dlf-cyber-park, ambience-mall, hero-honda-chowk. All 10 are in `indexableStaticRoutes`.
- **Links:** "Browse for Sale" and "Browse for Rent" use the landmark's lat/lng and a 5 km radius.
- **SEO:** title template `Property near {{name}}, {{city}} | 360Ghar`. JSON-LD: BreadcrumbList + WebPage(about Place + GeoCoordinates).
- **Bug:** an unknown slug renders "Location Not Found" with no SEO tags and no noindex (a soft 404).

### `/:citySlug` — `W/pages/landing/CityHub.jsx`
- **Content:** static `CITY_META`/`CITY_GEO`, 13 landing links (5 types × buy/rent + PG), top 8 localities, tool and comparison links, and FAQs.
- **Indexable cities:** 5 (gurgaon, delhi, noida, faridabad, ghaziabad); `gurugram` is treated as gurgaon.
- **Catch-all bug:** any other single-segment path renders a noindexed hub instead of a 404.
- **SEO:** title template `{{city}} Real Estate | Buy, Rent & PG in {{city}} | 360Ghar`. JSON-LD: BreadcrumbList, CollectionPage, Place(+Geo), FAQPage.

### `/:citySlug/:intent/:type` — `W/pages/landing/Landing.jsx`
- **Intent:** buy, rent or pg; anything else falls back to buy.
- **Type:** the URL word is mapped to a type by `PROPERTY_TYPE_ALIASES`.
  - Unknown words become `apartment`.
  - The canonical URL segment comes from `getPropertyRouteSlug`: flats, independent-house, builder-floor, plots, office-space, or the type name itself.
  - PG pages always use `flats`.
- **Types in sitemaps:**
  - The hub uses 5 (`W/utils/internalLinks.js:29`).
  - The sitemap uses 8, adding land, office-space and shop (`scripts/generate-sitemaps.mjs:94`).
  - `land` redirects its canonical to `/plots`, so the sitemap lists non-canonical URLs.
  - The landing sitemap has 85 English URLs of this shape.
- **Indexing:** indexed if the city is one of the 5.
- **Content:** a price-range string from `priceContext.json`, 5 localities, 8 FAQs plus type FAQs from `W/data/landingTypeContext.json` (gurgaon, delhi, noida only), and related links.
- **SEO:** title `{{facet}} for {{verb}} in {{city}} | {{city}} Real Estate | 360Ghar` (PG: `PG in {{city}} | …`). JSON-LD: BreadcrumbList, CollectionPage, FAQPage, ItemList (1 item: the /properties link).

### `/:citySlug/:intent/:type/:bhk` — `W/pages/landing/FacetLanding.jsx`
- **BHK values:** 1–5 BHK are valid, mapped to `bedrooms_min = N` and `bedrooms_max = N`; for 4 and above there is no maximum.
- **Indexing:** 1–3 BHK are indexable for the 5 cities with buy or rent. Anything else is noindexed with the canonical pointing to the base page. An invalid 4th segment renders the base page with noindex.
- **Sitemap:** 30 URLs, flats only.
- **SEO:** title `{{bhk}}{{facetText}} for {{intentLabel}} in {{city}}{{budget}}{{amenity}} | 360Ghar`. JSON-LD: BreadcrumbList, CollectionPage, FAQPage (5–6), ItemList.

### `/:citySlug/:intent/:type/budget/:budget`
- **Budget values (6):** under-10k, under-15k, under-20k (rent) and under-50-lakhs, under-80-lakhs, under-1-crore (buy). They map to `price_max` of 10,000 / 15,000 / 20,000 / 5,000,000 / 8,000,000 / 10,000,000.
- **Indexing:** only 4 are indexable: gurgaon buy under-50-lakhs, under-80-lakhs and under-1-crore, plus gurgaon rent under-20k.
- **Bug:** `getBudgetFacetLinks` gives PG pages the buy budgets.

### `/:citySlug/:intent/:type/amenity/:amenity`
- **Values:** any slug is accepted (no whitelist). These pages are always noindexed and have none in the sitemap.
- **Filter:** the slug is sent as `amenities=<slug>`. The backend matches it against `lower(Amenity.title)` exactly (`app/services/property/search.py:478-491`), so a hyphenated slug like `swimming-pool` never matches. When nothing matches, the filter is silently dropped.

---

## Backend gaps (backend wins)

1. **Zoning:** the page sends `search`, but the backend accepts only `sector` (`B/data_hub/registry.py:122`; `W/pages/data-hub/ZoneChecker.jsx:114,129`). The page reads fields the API doesn't return (`far`, `max_height`, `setback_*`, `parking_norm`, `density`, `colony_approval`, `sector_name`, `primary_land_use`). The API returns `far_limit`, `max_height_m` and `max_coverage_pct` (`S/data_hub.py:190-207`). The model's setbacks, `notes` and `master_plan_year` are not exposed.
2. **Colony approvals:** the UI reads `status`, but the API returns `approval_status` (alias at `S/data_hub.py:219`).
3. **Builders list:** the UI sends `search`/`sort_by` and reads `name`/`score`/`id`. The backend takes `q`/`order_by=score` and returns `builder_name`/`builder_score` with no id (`B/data_hub/rera.py:96-97,148-156`). It cannot sort by projects or complaints.
4. **Builder detail:** the page calls `/rera-projects?developer=`, a param that doesn't exist (`rera.py:32-33`), so it shows every project. `city`, `total_penalties` and `complaints` are not in `BuilderReputationResponse`. The sitemap has 0 builder URLs.
5. **RERA projects:** `property_type` is not a filter, `project_type` is not what the UI reads, and status `expired` doesn't exist in the data (`rera.py:30-45`, model comment at `app/models/data_hub.py:69`).
6. **Auction detail:**
   - `city`, `area_sqft`, `contact_person/phone/email` and `possession_type` exist on the model but not in `BankAuctionResponse` (`S/data_hub.py:85-109`). `contact_info` is never filled for bank rows.
   - Bank and court IDs share one lookup, bank first (`bank_auctions.py:132-149`), and court list items link to `/bank-auctions/{courtId}`. A court auction whose id matches a bank row can't be reached.
7. **Jamabandi (land records):**
   - Login is required (`registry.py:46,63`), but the page doesn't require it.
   - The response uses `owner_names`/`area_acres`/`fetched_at`, while the UI reads `owners`/`area`/`last_updated`.
   - `area_acres` is filled from `area_kanal`, which is a different unit (`registry.py:83`).
   - The CAPTCHA is fetched through a shared scraper client, not a per-user session (`app/services/data_hub/jamabandi.py:41-47`).
8. **Stamp duty:** duty is always value × rate. The looked-up circle rate is never used for "higher of circle rate or deal value", `property_type` is ignored, and there is no rural rate (`B/data_hub/calculations.py:56-92`, `utils.py:159-175`).
9. **Unused backend:**
   - `/design-studio/generate` (`B/design_studio.py:26`): the page uses Puter instead.
   - `/auctions/source-categories` (`bank_auctions.py:68`): `/auction-sources` is static.
   - `/bank-rates`, `/gazette/{id}` and `/rera-projects/{rera_number}` are also uncalled.
10. **No backend exists for:**
    - All 15 tool calculators, rent receipt, and fake-listing checker.
    - The 3 geo pages and the price index (static JSON).
    - Landing and near pages: there is no listing-count or inventory endpoint, so zero-result handling or noindex-on-empty can't be done.
11. **Amenity facet:** backend amenity matching is on exact title (`app/services/property/search.py:478-491`), so hyphenated URL slugs never match and the filter is dropped. It needs slug support or a slug→title mapping.
12. **Vastu:** aligned. The page expects 413/415 for size and type errors, but the backend returns 400 (`B/vastu.py:67-79`).

**Frontend bugs spotted along the way:**
- `/tools` has missing i18n keys and shows raw key strings.
- The area converter's default unit `sq_yard` gives `NaN`.
- Rent receipt dates are off by one day in IST.
- Capital gains has no 12.5% post-2024 option.
- The "near" not-found page and the CityHub catch-all are soft 404s.
- The sitemap lists `/land` URLs whose canonical is `/plots`.
- Hard-coded "2024" and "May 2026" in titles, plus illustrative trend data shown as if it were real.