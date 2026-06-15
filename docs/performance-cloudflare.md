# Cloudflare Edge Caching — Performance Playbook

**Target:** Reduce TTFB from ~2.3 s to < 0.5 s (edge-cache hit) and FCP/LCP by 2–3 s.

> These are the exact Cloudflare Dashboard paths to follow. All changes are
> non-destructive — Cloudflare caches are always purgeable.

---

## 1. Cache Rules — HTML at the edge

**Dashboard:** Caching → Cache Rules → Create Rule

| Field | Value |
|-------|-------|
| Rule name | `Cache prerendered HTML` |
| When incoming requests match | `(http.request.uri.path contains "/locality/" OR http.request.uri.path contains "/buy/" OR http.request.uri.path contains "/rent/" OR http.request.uri.path contains "/blog/" OR http.request.uri.path eq "/" OR http.request.uri.path eq "/hi" OR http.request.uri.path eq "/about" OR http.request.uri.path eq "/contact" OR http.request.uri.path eq "/localities" OR http.request.uri.path eq "/emi-calculator" OR http.request.uri.path contains "/tools/" OR http.request.uri.path contains "/circle-rates" OR http.request.uri.path contains "/stamp-duty" OR http.request.uri.path contains "/vs/" OR http.request.uri.path contains "/careers") AND NOT http.request.uri.path contains "/api/" AND NOT http.request.uri.path contains "/account"` |
| Cache status | **Eligible for cache** |
| Edge TTL | **10 minutes** (`s-maxage=600`) |
| Browser TTL | **Respect origin** |

This covers all prerendered / static pages while bypassing `/api/*` (your
backend) and `/account` (requires auth). The 10-minute edge TTL means Cloudflare
serves HTML directly from the nearest edge POP — TTFB drops to the POP's
round-trip latency (~50–150 ms).

---

## 2. Cache Rules — Long-cache hashed assets

**Dashboard:** Caching → Cache Rules → Create Rule

| Field | Value |
|-------|-------|
| Rule name | `Long-cache hashed assets` |
| When incoming requests match | `http.request.uri.path contains "/assets/"` |
| Cache status | **Eligible for cache** |
| Edge TTL | **1 year** |
| Browser TTL | **Override → 1 year** |

Vite hashes every file under `/assets/` in the filename (`index-Bx4k2H.css`),
so content changes → new filename → new cache entry. This is safe.

---

## 3. Cache Rules — Bypass API + auth paths

**Dashboard:** Caching → Cache Rules → Create Rule (highest priority)

| Field | Value |
|-------|-------|
| Rule name | `Bypass API and auth` |
| When incoming requests match | `http.request.uri.path contains "/api/" OR http.request.uri.path contains "/account" OR http.request.uri.path contains "/login" OR http.request.uri.path contains "/register"` |
| Cache status | **Bypass** |

---

## 4. Brotli at the edge

**Dashboard:** Speed → Optimization → Content Optimization

- **Brotli**: ON (Cloudflare compresses responses at the edge with Brotli when
  the client advertises `Accept-Encoding: br`). This supersedes the `.br` files
  you already emit, but having both is belt-and-suspenders.
- **Auto Minify**: OFF for JS, CSS, HTML. Vite + terser already minify; enabling
  Auto Minify risks double-minification or mangling.

---

## 5. Early Hints (103)

**Dashboard:** Speed → Optimization → Content Optimization → Early Hints

- **Early Hints**: ON for the main zone.

Cloudflare reads the `<link rel="preload">` / `<link rel="preconnect">` tags
from your HTML response and sends them as `103 Early Hints` headers *before*
the origin body arrives. The browser starts fetching fonts, hero image, and
gtag while the HTML is still in transit. Directly shaves 200–400 ms off FCP/LCP.

Your `index.html` already has excellent `<link rel="preload">` tags, so Early
Hints activates them automatically — no code changes needed.

---

## 6. Polish (image optimization at the edge)

**Dashboard:** Speed → Optimization → Image Optimization → Polish

- **Polish**: ON (Lossless or Lossy — Lossy gives better savings, Lossless is
  zero visual difference). Polish automatically converts images to WebP/AVIF at
  the edge when the client supports it, even for images still served as PNG.
- **Mirage** (Pro+ only): ON. Serves low-res placeholders on slow connections
  and lazy-loads images below the fold — complementary to your `LazyImage`
  component.

> **Note:** Since WS1 already swaps component references to WebP, Polish acts as
> a safety net for any remaining PNGs and for user-uploaded content (property
> images, profile photos) served from `api.360ghar.com`.

---

## 7. HTTP/2 & HTTP/3 (QUIC)

**Dashboard:** Network → HTTP/2 to Origin: ON, HTTP/3 (with QUIC): ON

Both should already be enabled by default. HTTP/3 improves performance on
mobile networks with high packet loss.

---

## 8. HSTS header

Add `Strict-Transport-Security` so the browser skips the HTTP→HTTPS redirect
on repeat visits:

**Dashboard:** SSL/TLS → Edge Certificates → HSTS → Enable

- Max Age: 12 months
- Include subdomains: ON
- Preload: ON (submit to hstspreload.org after confirming all subdomains are HTTPS)

---

## 9. Cache-Control headers for prerendered HTML

Your prerendered pages live in `dist/` and are served statically. Ensure the
origin sends the right `Cache-Control` header so Cloudflare respects the
edge TTL from Rule #1:

```nginx
# Nginx example (add to your server block for prerendered HTML)
location ~* \.html$ {
    add_header Cache-Control "public, s-maxage=600, stale-while-revalidate=31536000";
}
```

For static assets under `/assets/`, add:

```nginx
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

---

## 10. Purging

When you deploy a new build, purge the HTML cache:

```bash
# Via Cloudflare API (add to your CI/CD pipeline)
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer {CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

Or in the Dashboard: Caching → Configuration → Purge Everything.

> Hashed `/assets/*` files don't need purging — the filename changes on each build.

---

## Expected TTFB improvement

| Scenario | Before | After |
|----------|--------|-------|
| Cold edge (first visit to POP) | ~2.3 s | ~0.8–1.2 s |
| Warm edge (repeat visit, cache hit) | ~2.3 s | **50–150 ms** |
| API calls (`/api/*`) | ~2.3 s | unchanged (bypassed) |

The CrUX field data will update over 28 days. After edge caching + the frontend
bundle improvements, expect:
- **TTFB:** 2.3 s → < 0.5 s (p75)
- **FCP:** 4.0 s → ~1.5 s
- **LCP:** 4.8 s → ~2.0 s
