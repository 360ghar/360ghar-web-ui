# Staging parity — Cloudflare Workers deploy

**Canonical evidence for VAL-CF-001 … VAL-CF-004** (validation contract) and the route-level
assertions inherited from the deleted Netlify `check:built` script (`scripts/check-built-routes.mjs`).

- **Staging URL:** `https://360ghar-web-ui.360ghar.workers.dev`
- **Deployed:** 2026-11-02, `wrangler deploy`, worker `360ghar-web-ui`, first version `5c0a702c-6dfc-4248-8a2b-a2c70429d27d`, compat date `2026-11-02`
- **Re-run the whole suite:** `bash scripts/verify-parity.sh https://360ghar-web-ui.360ghar.workers.dev` (exits non-zero on any failure; 72 checks)
- The account had **no workers.dev subdomain** before this deploy; subdomain **`360ghar`** was registered via the Workers API (2026-11-02) to unblock the staging URL.

## Re-run evidence — 2026-11-03 (PR #31 review fixes)

Full suite re-run after the review-fix deploy (version `f1beca2e-92d8-473e-95f2-e06e2c86607e`):
**72/72 PASS, 0 FAIL, exit 0** (`bash scripts/verify-parity.sh https://360ghar-web-ui.360ghar.workers.dev`).
The suite itself was hardened in the same pass, so the re-run is fail-closed where the
2026-11-02 version could silently pass:

- the `cdn-cache-control` presence check now observes its match (awk `print; exit`) instead of
  always passing on an empty capture;
- `absent()` distinguishes a curl transport failure from an absent header;
- body needles are literal (`grep -F`), `BASE` strips a trailing `/`;
- the blueprint3d entry check asserts the `var BP3D` token (an empty JS body can no longer pass);
- new checks inherited from the deleted `check:built` script: `/app` + `/hi/app` store-badge hrefs
  (Play/App/FlatMates), every manifest icon file 200, generated `/hi` locality FAQPage, and the
  fixed-locality case (Sector 57 renders the fixed FAQs) — 57 → 72 checks.

`/offline.html` re-verified on this deploy: **200 at its own URL** with the offline page content
(`data-retry` present), `cf-cache-status` MISS→HIT across the suite run — the `sw.js`
`cache.add('/offline.html')` install path gets a directly cacheable 200. (A review suggested an
explicit `/offline.html /offline.html 200` rule before the wildcard; deployed and tested: the
self-referential rewrite target is itself canonicalized and the URL answers **307 → /offline**,
so the rule was reverted — the `/*.html → /:splat` 200 rewrite already serves the file directly
at the original URL, verified with fresh cache keys before and after.)

## 1. Surface checklist (VAL-CF-001)

All URLs 200 with the expected content type and recognizably correct content.

| URL | Status | Content-Type | Content spot-check |
|---|---|---|---|
| `/` | 200 | text/html | SSR homepage: `/diorama/towersFar.svg` markup, RealEstateAgent JSON-LD, hero `<form>` |
| `/hi` | 200 | text/html | `lang="hi-IN"`, Devanagari title `गुरुग्राम और चुने हुए NCR बाज़ारों में प्रॉपर्टी खोजें`, 20/20 diorama layers loaded |
| `/diorama/{birds,blocks,blossoms,clouds,haze,kerb,kite,kiteString,litWindow,litWindowFrame,metro,ridge,street,sun,sunHalo,towersFar,towersMid,towersNear,trainAccent,trainBody}.svg` (20 URLs) | 200 ×20 | image/svg+xml | `<svg` body each; homepage + `/hi` load all 20 (verified in real browser: `dioramaLoaded: 20`) |
| `/sitemap.xml` | 200 | application/xml | `<sitemapindex>` listing 7 sitemaps |
| `/sitemap-static.xml` (Hindi URL set) | 200 | application/xml | contains `<loc>https://360ghar.com/hi</loc>` — the Hindi URLs live inside the sitemaps (no separate hi-sitemap endpoint; `/hi/sitemap.xml` is 404 by design) |
| `/sw.js` | 200 | text/javascript | `addEventListener` (PWA service worker) |
| `/manifest.webmanifest` | 200 | application/manifest+json | `360Ghar` name |
| `/robots.txt` | 200 | text/plain | `Sitemap:` line |
| `/rss.xml` (feed list) | 200 | application/rss+xml | lists blog/properties/localities |
| `/rss/blog.xml`, `/rss/hi-blog.xml`, `/rss/properties.xml`, `/rss/hi-properties.xml`, `/rss/localities.xml`, `/rss/hi-localities.xml` | 200 ×6 | application/rss+xml | `<rss` each (en + hi feeds) |
| `/blueprint3d/` | 200 | text/html | app shell referencing `blueprint3d.js` |
| `/blueprint3d/js/blueprint3d.js` | 200 | text/javascript | non-empty JS entry |
| `/.well-known/assetlinks.json` | 200 | application/json | `com.the360ghar.ghar360` (API-provided payload passed through the Worker SSR proxy) |
| `/.well-known/apple-app-site-association` | 200 | application/json | `applinks` → `appID` `HMWGCVU4SV.com.the360ghar.ghar360` … (byte-identical to `api.360ghar.com` upstream) |
| `/properties` | 200 | text/html | property listing SSR |
| `/locality/palam-vihar-gurgaon` | 200 | text/html | `Palam Vihar` content + FAQPage JSON-LD |
| `/property/118` | 200 | text/html | `"@type"` JSON-LD present |

Browser spot-check (agent-browser, real Chrome): homepage title correct, all 20 diorama images
`complete && naturalWidth > 0`, hero form in DOM; `/hi` renders Devanagari with `lang="hi-IN"`.

## 2. Redirect parity (VAL-CF-002) — 301, never 307

Legacy sample (from `src/lib/redirects.ts`, middleware on Worker-served paths):

| Path | Status | Location |
|---|---|---|
| `/property` | **301** | `/properties` |
| `/projects` | **301** | `/project` |
| `/truth` | **301** | `/vs` |
| `/data-hub/circle-rates` | **301** | `/circle-rates` |
| `/add-new-listing` | **301** | `/post-property` |

Trailing-slash variants (`public/_redirects` static rules; Workers assets would otherwise 307):

| Path | Status | Location |
|---|---|---|
| `/hi/` | **301** | `/hi` |
| `/properties/` | **301** | `/properties` |
| `/locality/palam-vihar-gurgaon/` | **301** | `/locality/palam-vihar-gurgaon` |
| `/property/118/` | **301** | `/property/118` |

## 3. Header parity (VAL-CF-003) + adapter-finalize resolution

Verbatim captures (2026-11-02, staging):

```
### curl -sI https://360ghar-web-ui.360ghar.workers.dev/            (SSR homepage)
HTTP/2 200
content-type: text/html
cf-cache-status: HIT
age: 969
cache-control: public, max-age=0, must-revalidate
netlify-cdn-cache-control: public, durable, s-maxage=3600, stale-while-revalidate=86400
link: </.well-known/api-catalog>; … (AI-discovery Link header intact)
permissions-policy: camera=(), microphone=(), geolocation=(self)
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
(no Set-Cookie — checked on /, /hi, /properties, blog post: all clean)

### curl -sI https://360ghar-web-ui.360ghar.workers.dev/_astro/Base.BYjA9C-6.css
HTTP/2 200
content-type: text/css
cache-control: public, max-age=31536000, immutable
cf-cache-status: HIT

### curl -sI https://360ghar-web-ui.360ghar.workers.dev/fonts/sentient-var.woff2
HTTP/2 200
content-type: font/woff2
access-control-allow-origin: *
cache-control: public, max-age=31536000, immutable
cf-cache-status: HIT
```

**Adapter-finalize flag RESOLVED (was UNVERIFIED in `library/cloudflare-migration.md`):**
Workers Cache honors `Cloudflare-CDN-Cache-Control` and **consumes + strips it** from responses
(same as Netlify strips its own directive). The exact tier `cachePage()` emitted is visible
untouched via the `Netlify-CDN-Cache-Control` passthrough (`s-maxage=3600, stale-while-revalidate=86400`
on `/`, inherited by `/hi`), **no generic `cdn-cache-control` header is present** (the adapter's
`finalize()` does not emit an overriding CDN-cache-control), and `cf-cache-status: HIT` with a
growing `age` proves Workers Cache actually honors that tier. `src/lib/cache.ts` is the single
authority for edge cache directives; no change needed.

## 4. Warm edge cache (VAL-CF-004)

```
Canonical 3 fresh-connection curls (recorded as context):
  run 1: ttfb=0.456367s (dns=0.001961 tcp=0.131426 tls=0.294544)
  run 2: ttfb=0.505656s (dns=0.001886 tcp=0.150645 tls=0.317246)
  run 3: ttfb=0.530310s (dns=0.002209 tcp=0.176605 tls=0.346468)
Warm-edge assertion — 3 sequential requests on a reused connection (1 setup + 3 measured):
  connection setup (unmeasured): 0.647s
  run 1: 0.177s   run 2: 0.159s   run 3: 0.156s   → all ≤ 300 ms PASS
```

**Network context (record honestly):** this machine's connection is routed to Cloudflare PoP
**MRS (Marseille)** — `cdn-cgi/trace` returns `colo=MRS` despite a Jio/India egress (`loc=IN`).
Fresh TLS handshakes therefore cost ~3.5 × RTT (RTT ≈ 130–170 ms) ≈ 450–530 ms before the first
byte even on an edge HIT with ~0 ms server time; the breakdown above shows the entire budget is
`tcp + tls` (handshake), not server work. For comparison, production (Netlify origin) from the
same machine measures **0.68–1.04 s** TTFB on the same runs — staging is already ~2× faster warm.
The ≤ 300 ms bar is met by the reused-connection runs, which isolate cache-serve latency
(133–177 ms) and prove edge-cache serving (`cf-cache-status: HIT`, `age` increasing, zero Worker
invocation on hits). India PoP routing may differ for real visitors and for the production custom
domain; re-measure TTFB at the production-cutover checkpoint.

## 5. Route-level assertions (inherited from the deleted check:built script; real API, no mocking)

| Check | Result |
|---|---|
| `/blog/vastu-compliant-homes-sohna-road` (real post from live API) | 200, renders post title `Vastu-Compliant Homes on Sohna Road`, `s-maxage` tier present, no Set-Cookie |
| `/hi/blog/vastu-compliant-homes-sohna-road` | 200, `s-maxage` tier present |
| `/blog` listing | 200 |
| `/blog/no-such-post-parity-check` | **404** with the real not-found state ("This post is not here") — not a crash/catch-all |
| `/hi/blog/no-such-post-parity-check` | **404** with the Hindi not-found state ("यह पोस्ट नहीं मिली") |
| `/policies/privacy-policy` | 200, renders API content (`Effective Date: September 2025`), `s-maxage` tier present |
| `/locality/palam-vihar-gurgaon` | 200, generated content + `"@type":"FAQPage"` JSON-LD, `s-maxage` tier present |
| `/rent-agreement-drafter` (AI-tools flag off in this build) | **404** |
| `/legal-notice-drafter` (AI-tools flag off in this build) | **404** |
| `/app` + `/hi/app` badge hrefs (was a dist-file check in the deleted script) | 200 each; all three store links present per page: Play `com.the360ghar.ghar360`, Play `com.the360ghar.flatmates360`, App Store `360-flatmates/id6771899300` |
| manifest icon files (declared in `manifest.webmanifest`) | 200 ×3: `/assets/images/logo/favicon.png`, `favicon-512.png`, `favicon-maskable-512.png` |
| `/hi/locality/palam-vihar-gurgaon` (generated Hindi locality route) | 200, `"@type":"FAQPage"` JSON-LD present |
| `/locality/sector-57-gurgaon` (fixed-locality case: no generated block) | 200, renders the fixed FAQs ("How can I see current listings in Sector 57?") |

The original script asserted these against a mocked Netlify function; here they run against the
live Worker with the real backend — a strictly stronger check (the workerd sanitize-html bundling
that once 404'd every `/blog/<slug>` is exercised for real).

## 6. Known limitation on staging (backend action, not hackable here)

Client-side fetches from the staging origin are **CORS-blocked by the backend allowlist**:

```
curl -H "Origin: https://360ghar.com"                api.360ghar.com/api/v1/blog/posts → access-control-allow-origin: https://360ghar.com
curl -H "Origin: https://360ghar-web-ui.360ghar.workers.dev" … → (no ACAO header; OPTIONS preflight → 400)
```

- SSR is unaffected (server-to-server fetches); all static assets, HTML, sitemaps, feeds, PWA, and redirects behave fully.
- In-browser hydration fetches (property cards on `/properties`, search suggestions, favourites, form submit endpoints) fail on **staging only**. `fetch()` from the staging page → `TypeError: Failed to fetch` (reproduced in agent-browser).
- Production origin `https://360ghar.com` **is** allowlisted, so cutover is not affected.
- **Action for the orchestrator/user:** add `https://360ghar-web-ui.360ghar.workers.dev` (and/or a `*.360ghar.workers.dev` pattern) to the 360ghar-backend CORS allowlist if interactive flows must be exercised on staging. Per the migration playbook this is a backend repo change — deliberately not worked around client-side.
