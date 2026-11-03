# Cloudflare cutover rollback runbook (360ghar.com)

**Written 2026-11-02, BEFORE any DNS/DOMAIN change (VAL-CUT-002).**
Verified at write time: the zone has **zero** Worker custom domains and **zero** zone routes
(`GET /accounts/{acct}/workers/domains` → `[]`; `GET /zones/{zone}/workers/routes` → `[]`).
Production `360ghar.com` is served by **Netlify** through the Cloudflare proxy. Nothing in
this repo changes production traffic until the user explicitly says go at cutover.

---

## POST-CUTOVER STATUS (2026-11-03, production-cutover) — READ THIS FIRST

**The cutover was EXECUTED and production now serves from the Worker.** Timeline (UTC;
the 2026-11-03 heading date is IST local — the events below ran 22:38–23:58Z on
2026-11-02):

- `2026-11-02T22:38Z` — PR #31 (feat/cf-migration → main) merged (`a2951e7`).
- Between the merge and the attach: **`https://360ghar.com/` answered `404` from the
  Netlify origin through the Cloudflare proxy** (`cache-status: "Netlify Edge";
  fwd-status=404`; `x-nf-request-id` present). Netlify cannot build post-swap main (the
  Cloudflare adapter replaced `@astrojs/netlify`), and its *published* state broke — the
  pre-swap last-good deploy stopped serving.
- `2026-11-02T23:57Z` — custom domain `360ghar.com` **attached to Worker
  `360ghar-web-ui`** via API (domain id `7284e47dfa7a1c1076cc4c2a2f476843d6f71714`,
  certificate `d065c5ad-06ca-44e5-9429-7d8a4f006ad8`, environment `production`, proxy on).
  The attach first failed with `100117` (externally managed records exist); the two
  captured Netlify apex `A` records (`5723fa53…` → `75.2.60.5`, `f18ba2fc…` →
  `99.83.231.61`) were deleted, then the attach succeeded. Cloudflare created the
  Worker-owned proxied apex record (`AAAA 360ghar.com → 100::`). Email (MX/TXT) and all
  other subdomains were untouched.
- `2026-11-02T23:58Z` — **production LIVE**: `https://360ghar.com/` → `200`, homepage
  content present, `cf-cache-status: HIT` (Workers Cache), `s-maxage=3600, swr=86400`
  tier standing, no `x-nf-request-id`. Full parity suite (57 checks) passed against
  production; warm-edge TTFB 145–150 ms. `www` still 301s → apex (Netlify-issued,
  unchanged).

**Consequences for this runbook:**

1. **PRIMARY rollback is the Workers version rollback** (§ below): bad Worker version →
   roll back in the dashboard/CLI. No DNS change, instant.
2. **The "DNS flip to Netlify last-good" premise is COMPROMISED.** The published Netlify
   state is broken (404) — flipping DNS back alone would serve the outage, not a working
   site. The DNS flip is now the SECONDARY path and **requires re-publishing a known-good
   pre-swap deploy from the Netlify dashboard first** (Deploys → ⋯ on a pre-merge deploy →
   **Publish deploy**) — a user action. Only then follow the DNS-flip procedure below.
3. The workers.dev URL (`https://360ghar-web-ui.360ghar.workers.dev`) stays enabled as a
   secondary production/diagnostic URL (recommended option) — it is the same Worker as
   `360ghar.com`, so every deploy or rollback changes it too; it is not pre-production.
   Disabling it later is a one-click user action in Worker → Settings → Domains & Routes.
4. Workers Builds connection could not be confirmed via API (the token lacks the Builds
   scope — `10000 Authentication error` on `/builds/*`). Until it is connected in the
   dashboard, deploys ship via `npx wrangler deploy` with the env token.

---


## READ FIRST: the rollback artifact is Netlify's LAST GOOD deploy

> **Superseded in one respect (2026-11-03):** this section predicted "a failed Netlify
> build does not unpublish the current deploy". That did not hold: the published state
> broke anyway (404) after the merge. The Netlify artifact is only a rollback target
> after a known-good deploy is re-published from the dashboard — see POST-CUTOVER STATUS.

After `feat/cf-migration` merges to `main`, **Netlify cannot rebuild main** — the Cloudflare
adapter swap removes `@astrojs/netlify` from `package.json`, so the Netlify build fails.

- ~~A **failed Netlify build does not unpublish** the current deploy. The last good deploy
  keeps serving production untouched.~~ **Did not hold** (2026-11-03): the published state
  broke anyway (404) after the merge.
- ~~Rollback is a **DNS flip** to the last-good deploy, not a rebuild.~~ Post-cutover the
  published deploy is broken: **re-publish a known-good pre-swap deploy from the Netlify
  dashboard first**, then follow the DNS-flip procedure — see POST-CUTOVER STATUS above.
- **Never rely on a fresh Netlify build of post-swap main. It will not succeed.**
- If the published deploy is ever replaced by a broken one, re-publish an older artifact from
  the Netlify deploys list (**Deploys → ⋯ on a good deploy → Publish deploy**) — that serves
  the existing build output without rebuilding.

Snapshot at write time: `origin/main` = `67eff98` (pre-swap), `feat/cf-migration` = `c77c069`
(15 commits ahead, adapter swapped). Until the merge lands, Netlify can still build main;
after the merge it cannot. Do not let this distinction blur — the artifact freezes at merge.

---

## Pre-cutover DNS capture (2026-11-02)

Zone `360ghar.com`: status `active`, Cloudflare nameservers
`matias.ns.cloudflare.com`, `sandra.ns.cloudflare.com` (registrar original NS:
`*.ns.porkbun.com` — registrar panel untouched by this migration).
Zone ID: `CLOUDFLARE_ZONE_ID` from the out-of-repo credentials env file (path is
machine-specific — the same file supplies `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
and `CLOUDFLARE_ZONE_ID`; see `ENV_FILE` in the rollback steps below).

### Records that serve production web traffic (the rollback scope)

| Type  | Name              | Content               | Proxy  | TTL  |
|-------|-------------------|-----------------------|--------|------|
| A     | `360ghar.com`     | `75.2.60.5`           | proxied | auto |
| A     | `360ghar.com`     | `99.83.231.61`        | proxied | auto |
| CNAME | `www.360ghar.com` | `360ghar.netlify.com` | proxied | auto |

The two A values are Netlify's apex load-balancer IPs; the CNAME is the Netlify site
`360ghar.netlify.com` (site subdomain `360ghar`). The current www → apex `301` is issued by
Netlify (`x-nf-request-id` present on the www response). Only these three records are
touched by cutover or rollback.

### Live-serve evidence at capture time

```
$ curl -sI https://360ghar.com/
HTTP/2 200
netlify-vary: query
server: cloudflare          # proxy stays on; origin = Netlify
x-nf-request-id: 01M6EN0KXPCWJBFNRKN566KEBJ
cf-ray: a544de84da7cb24a-MRS

$ curl -sI https://www.360ghar.com/
HTTP/2 301
location: https://360ghar.com/
x-nf-request-id: 01M6EN0N2F10R80EMEPBSZKKPS
```

`x-nf-request-id` = Netlify answered. After cutover its absence (plus Workers headers) is
the marker that the Worker serves; after rollback its return is the success check.

### All other records — DO NOT TOUCH (cutover and rollback alike)

| Name                     | Type      | Points at / note                                  |
|--------------------------|-----------|---------------------------------------------------|
| `admin.360ghar.com`      | CNAME     | `360gharadmin.netlify.app` (separate Netlify site) |
| `flatmates.360ghar.com`  | CNAME     | `360flatmates.netlify.app` (separate site)         |
| `social-reply.360ghar.com` | CNAME   | `social-reply.netlify.app` (separate site)         |
| `tidybyte.360ghar.com`   | CNAME     | `tidybyte.netlify.app` (separate site)             |
| `tours.360ghar.com`      | CNAME     | `360ghartours.netlify.app` (separate site)         |
| `api.360ghar.com`        | CNAME     | `nmaqzdl8.up.railway.app` (backend) — the Worker's well-known proxies fetch this host |
| `api-social-reply.360ghar.com` | CNAME | `social-ai-reply-production.up.railway.app`       |
| `360ghar.com`            | MX ×2     | `mx1/mx2.forwardemail.net` (email routing)         |
| `send.360ghar.com`       | MX / TXT  | Amazon SES feedback + SPF                          |
| `360ghar.com`            | TXT ×many | SPF, DMARC, resend DKIM, google/yandex site verification, `forward-email=*` rules (values intentionally not duplicated here — unchanged, public in the zone) |
| `_acme-challenge.360ghar.com` | TXT ×2 | ACME challenge tokens (ephemeral)                |

None of these are affected by attaching or removing the Worker custom domain for
`360ghar.com`. Nobody should "clean them up" during cutover or rollback.

---

## Rollback procedure B (SECONDARY, post-cutover): DNS flip to Netlify (≈5 minutes, no rebuild)

**Prerequisite (user action in the Netlify dashboard): re-publish a known-good PRE-swap
deploy first** — Netlify → site `360ghar` → Deploys → ⋯ on a pre-merge deploy →
**Publish deploy**. Without this, the flip serves the broken 404 state (see POST-CUTOVER
STATUS). Verify the re-published artifact answers 200 with pre-swap homepage content
before touching DNS.

Trigger: cutover verification fails, or production misbehaves on the Worker and the problem
is not a single bad Worker version. For a single bad version, use the PRIMARY rollback
(Workers version rollback) instead.

Set up credentials once per shell (env does not persist between shells):

```bash
# ENV_FILE: the out-of-repo file holding CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID /
# CLOUDFLARE_ZONE_ID. Operator: set this to the credentials file's path ON YOUR MACHINE
# (never copy that file into the repo, never print or log its values).
ENV_FILE="$HOME/.secrets/360ghar-cf.env"   # ← operator: replace with the real path
set -a; . "$ENV_FILE"; set +a
```

1. **Remove the Worker custom domain** (Cloudflare dashboard → Workers & Pages →
   `360ghar-web-ui` → Settings → **Domains & Routes** → `360ghar.com` → Remove).
   API equivalent (capture `id` from a `GET` first):
   ```bash
   curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/domains"
   # then, with the domain's id:
   curl -s -X DELETE -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/domains/$DOMAIN_ID"
   ```
   Removing the custom domain does **not** restore the old DNS records — that is step 3.
2. **Delete the Worker-created custom-domain DNS record for `360ghar.com`.** Attaching the
   custom domain made Workers create its own proxied apex record; it is NOT removed by
   step 1. Recreating the Netlify records while it still exists either hits a
   duplicate-name conflict (Cloudflare rejects the second apex record) or splits traffic
   between the Worker and Netlify.
   - Dashboard: 360ghar.com → DNS → Records → delete the Worker-owned `A`/`AAAA` record
     for `360ghar.com` (leave the `www` CNAME alone until step 3).
   - API: look it up, then delete it:
   ```bash
   curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?name=360ghar.com"
   # then, with the Worker-created record's id:
   curl -s -X DELETE -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID"
   ```
3. **Re-point DNS to the captured Netlify values** (dashboard → 360ghar.com → DNS →
   Records; after the step-2 deletion, recreate exactly):
   - `A` `360ghar.com` → `75.2.60.5`, proxied, TTL auto
   - `A` `360ghar.com` → `99.83.231.61`, proxied, TTL auto
   - `CNAME` `www.360ghar.com` → `360ghar.netlify.com`, proxied, TTL auto
   API equivalent:
   ```bash
   curl -s -X POST -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
     --data '{"type":"A","name":"360ghar.com","content":"75.2.60.5","proxied":true}'
   # repeat for 99.83.231.61 and for the www CNAME above
   ```
4. **Purge the zone cache** so stale Worker-era HTML does not linger at the edge:
   dashboard → Caching → Purge Everything, or
   `POST /zones/$CLOUDFLARE_ZONE_ID/purge_cache --data '{"purge_everything":true}'`.
5. **Verify** (all four must hold):
   - `curl -sI https://360ghar.com/` → `HTTP/2 200`, `x-nf-request-id` present;
   - `curl -sI https://www.360ghar.com/` → `301` → `https://360ghar.com/`;
   - homepage HTML contains the diorama markup (pre-swap build);
   - `admin.`/`api.`/other subdomains still answer (they were never touched).
6. **Netlify side: do nothing.** The published last-good deploy serves as soon as DNS
   propagates. Do NOT retrigger a Netlify build of post-swap main (it fails; a failure does
   not unpublish, but never count on a fresh build).

The published pre-swap deploy remains reachable at `https://360ghar.netlify.com`
throughout — useful for comparing "Netlify artifact vs Worker" during diagnosis.

---

## PRIMARY rollback (post-cutover): Workers version rollback (bad deploy, DNS untouched)

When a specific Worker version is the problem (bad code reached the Worker), roll the
Worker back instead of touching DNS. **After the 2026-11-03 cutover this is the
first-line rollback** — the DNS flip to Netlify is secondary and gated on re-publishing
a good Netlify deploy (procedure B above):

- Dashboard: Workers & Pages → `360ghar-web-ui` → **Deployments** → ⋯ on the previous
  (good) version → **Rollback**. Instant; no DNS change.
- CLI: `npx wrangler versions list` then `npx wrangler rollback <VERSION_ID>` (credentials
  via the out-of-repo env file; never commit or log them).
- Note: Workers Cache is version-partitioned, so a rolled-back version starts with a cold
  edge cache (first hits re-warm it). Deploys have the same effect.

---

## Workers Builds: connect the repo (user dashboard steps)

One-time setup, done by the user in the Cloudflare dashboard (authorizes the GitHub app).
Worker credentials are auto-generated by Workers Builds — the out-of-repo env token is not
needed in CI. `wrangler` version comes from the repo's devDependency (`^4.156.1`).

1. Dashboard → **Workers & Pages** → `360ghar-web-ui` → **Settings** → **Builds** → **Connect**.
2. Authorize the Cloudflare GitHub App for the `360ghar/360ghar-web-ui` repository.
3. Configure:
   - **Production branch:** `main` — connect **after `feat/cf-migration` merges to main**.
     (main today has no `wrangler.jsonc` and the Netlify adapter; a build of it would fail.
     Post-merge, a main build deploys to the Worker — which is still staging-only and
     touches NO production traffic until the custom domain is attached.)
   - **Build command:** `corepack pnpm install --frozen-lockfile && pnpm run build`
     (explicit install; the image's auto-install/pnpm behavior is undocumented).
   - **Deploy command:** `npx wrangler deploy`
   - **Preview command:** leave the dashboard default (`npx wrangler preview`) — pushes to
     non-production branches build Preview URLs without promoting to production.
   - **Root directory:** repository root (not a monorepo).
4. **Build variables** (Settings → Builds → Build variables; names only here — copy values
   from the Netlify site's environment variables or the local `.env`):
   `PUBLIC_API_BASE` (**absolute** `https://api.360ghar.com` — never empty, there is no
   /api proxy on Workers), `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `PUBLIC_GOOGLE_MAPS_API_KEY`, `PUBLIC_GA_ID`, `PUBLIC_POSTHOG_KEY` (**required** —
   `src/lib/analytics/index.ts` gates `posthog.init` on it; omitting it silently disables
   PostHog in production), `PUBLIC_POSTHOG_HOST`,
   `PUBLIC_AI_OWNER_TOOLS=true`, `OG_FROM_API=true`, `API_ORIGIN=https://api.360ghar.com`.
   Do **NOT** set `NODE_VERSION=22` (the Netlify value): the preinstalled 22.x in the build
   image is 22.23.2, **below** astro 7.4.4's `>= 22.23.4` floor. Leave Node at the image
   default (24.x), or set `NODE_VERSION` to a 24.x value explicitly.
5. First build → check the Deployments tab (build logs retained 90 days).
6. Fallback if Workers Builds is not used: the same deploy ships from local/CI via
   `npx wrangler deploy` with `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` env vars
   (exactly how the staging deploys in this mission were done). Workers Builds is
   convenience, not a dependency.

⚠️ **Now that the custom domain is attached (2026-11-03)**, every push to `main`
auto-deploys **production** (via Workers Builds once connected; until then any `wrangler
deploy` with the env token updates the same production Worker). Gate main pushes and
deploys accordingly.

---

## Custom-domain route config — APPLIED 2026-11-03 (via API; NOT via wrangler.jsonc)

Applied at cutover on the recorded GO, via the API below. Record: domain
`7284e47dfa7a1c1076cc4c2a2f476843d6f71714`, certificate `d065c5ad-06ca-44e5-9429-7d8a4f006ad8`.
The two Netlify apex `A` records had to be deleted first (error `100117`, externally
managed records exist); Cloudflare then created the Worker-owned proxied apex record
(`AAAA 360ghar.com → 100::`). `wrangler.jsonc` still carries **no** routes — an
API-attached custom domain persists across `wrangler deploy`s, so Workers Builds deploys
will not detach or re-attach it. Adding the `routes` block is optional and would be a
no-op today; if it is ever added, keep in mind a deploy applies it as config.

The now-applied config (kept for reference):

```jsonc
// wrangler.jsonc — cutover only
"routes": [{ "pattern": "360ghar.com", "custom_domain": true }]
```

API equivalent (CF creates/updates the DNS record + certificate; proxy stays on):
```bash
curl -s -X PUT -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/domains" \
  --data '{"zone_id":"'"$CLOUDFLARE_ZONE_ID"'","hostname":"360ghar.com","service":"360ghar-web-ui","environment":"production"}'
```

`www` stays pointed at Netlify (`360ghar.netlify.com`, proxied): it still answers
`301 → https://360ghar.com/` after the cutover (the redirect is Netlify's domain-level
one, unchanged) — the pre-cutover convention is preserved. If Netlify is ever fully
decommissioned, replicate this as a zone Redirect Rule before deleting the site.

## Decision recorded at cutover

- **workers.dev exposure: KEPT.** `https://360ghar-web-ui.360ghar.workers.dev` remains
  enabled as a secondary production/diagnostic URL (zero cost, keeps parity checks easy;
  same Worker as `360ghar.com` — every deploy changes it too). Disabling
  it later is a one-click user action (Worker → Settings → Domains & Routes → workers.dev
  → Disable).
