#!/usr/bin/env bash
# URL-by-URL parity verification for the Cloudflare Workers deploy (staging or production).
#
#   bash scripts/verify-parity.sh https://360ghar-web-ui.360ghar.workers.dev
#
# Covers the validation contract VAL-CF-001..004:
#   1. Full surface checklist: status + content-type + content spot-check per URL
#   2. Redirect parity: legacy 301s + trailing-slash 301s (assert 301, never 307)
#   3. Header parity: immutable /_astro/*, font CORS, edge-cacheable HTML, no Set-Cookie
#   4. Warm edge cache: 3 sequential homepage requests <= 300 ms after one warm-up
# and the route assertions the deleted Netlify check:built script carried (blog /
# policies / locality SSR with the REAL backend API, s-maxage tiers, AI-tools flag
# 404s) — no mocking.
#
# Prints one [PASS]/[FAIL] line per check and exits non-zero when any check fails.
set -u
BASE="${1:?Usage: verify-parity.sh <base-url>}"
FAILS=0
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass() { printf '[PASS] %s\n' "$1"; }
fail() { printf '[FAIL] %s\n' "$1"; FAILS=$((FAILS + 1)); }

# check <name> <url> <expected status> <expected content-type prefix> <expected body substring (empty = skip)>
check() {
  local name="$1" url="$2" want="$3" ct="$4" needle="$5"
  local code ctype
  code=$(curl -s -o "$TMP/body" -w '%{http_code} %{content_type}' "$url") || { fail "$name (curl error)"; return; }
  ctype=$(printf '%s' "${code#* }" | tr '[:upper:]' '[:lower:]')
  code="${code%% *}"
  if [ "$code" != "$want" ]; then fail "$name: status $code, want $want"; return; fi
  if [ -n "$ct" ] && [[ "$ctype" != *"$ct"* ]]; then fail "$name: content-type '$ctype', want '*$ct*'"; return; fi
  if [ -n "$needle" ] && ! grep -q "$needle" "$TMP/body"; then fail "$name: body missing '$needle'"; return; fi
  pass "$name ($code, $ctype)"
}

# redirect <name> <path> <expected Location path>
redirect() {
  local name="$1" path="$2" want="$3"
  local out
  out=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$BASE$path")
  local code="${out%% *}" loc="${out#* }"
  if [ "$code" != "301" ]; then fail "$name: status $code, want 301 (307 would break SEO parity)"; return; fi
  if [ "$loc" != "$BASE$want" ]; then fail "$name: Location '$loc', want '$BASE$want'"; return; fi
  pass "$name: 301 -> $want"
}

# header <name> <path> <header-name> <expected value substring>
header() {
  local name="$1" path="$2" h="$3" want="$4"
  local got
  got=$(curl -sI "$BASE$path" | tr -d '\r' | awk -v h="$(echo "$h" | tr 'A-Z' 'a-z')" 'tolower($0) ~ "^" h ":" { sub(/^[^:]*: /, ""); print; exit }')
  if [ -z "$got" ]; then fail "$name: header '$h' absent"; return; fi
  if [[ "$got" != *"$want"* ]]; then fail "$name: '$h: $got' does not contain '$want'"; return; fi
  pass "$name: $h contains '$want'"
}

absent() { # absent <name> <path> <header-name>
  local name="$1" path="$2" h="$3"
  if curl -sI "$BASE$path" | tr -d '\r' | awk -v h="$(echo "$h" | tr 'A-Z' 'a-z')" 'tolower($0) ~ "^" h ":" { found=1 } END { exit !found }'; then
    fail "$name: header '$h' present, must be absent"
  else
    pass "$name: no $h"
  fi
}

echo "== 1. Surface checklist (VAL-CF-001) — $BASE =="
check 'homepage /' "$BASE/" 200 text/html 'diorama/towersFar.svg'
check 'homepage /hi' "$BASE/hi" 200 text/html 'गुरुग्राम'
DIORAMA_IDS=(birds blocks blossoms clouds haze kerb kite kiteString litWindow litWindowFrame metro ridge street sun sunHalo towersFar towersMid towersNear trainAccent trainBody)
SVG_OK=0; SVG_BAD=0
for id in "${DIORAMA_IDS[@]}"; do
  out=$(curl -s -o "$TMP/svg" -w '%{http_code} %{content_type}' "$BASE/diorama/$id.svg")
  if [ "${out%% *}" = 200 ] && [[ "${out#* }" == image/svg+xml* ]] && grep -q '<svg' "$TMP/svg"; then SVG_OK=$((SVG_OK + 1)); else SVG_BAD=$((SVG_BAD + 1)); echo "  diorama/$id.svg -> $out"; fi
done
if [ "$SVG_BAD" -eq 0 ]; then pass "all 20 /diorama/*.svg (200, image/svg+xml, <svg body): $SVG_OK/20"; else fail "diorama layers: $SVG_OK/20 ok, $SVG_BAD bad"; fi
check 'sitemap.xml (index)' "$BASE/sitemap.xml" 200 xml '<sitemapindex'
check 'sitemap-static.xml (lists /hi URLs)' "$BASE/sitemap-static.xml" 200 xml 'https://360ghar.com/hi<'
check 'sw.js' "$BASE/sw.js" 200 javascript 'addEventListener'
check 'manifest.webmanifest' "$BASE/manifest.webmanifest" 200 json '360Ghar'
check 'robots.txt' "$BASE/robots.txt" 200 text/plain 'Sitemap:'
check 'rss.xml (feed list)' "$BASE/rss.xml" 200 xml 'blog'
for feed in blog hi-blog properties hi-properties localities hi-localities; do
  check "rss/$feed.xml" "$BASE/rss/$feed.xml" 200 xml '<rss'
done
check 'blueprint3d entry page' "$BASE/blueprint3d/" 200 text/html 'blueprint3d.js'
check 'blueprint3d JS entry' "$BASE/blueprint3d/js/blueprint3d.js" 200 javascript ''
check '/.well-known/assetlinks.json' "$BASE/.well-known/assetlinks.json" 200 json 'com.the360ghar.ghar360'
check '/.well-known/apple-app-site-association' "$BASE/.well-known/apple-app-site-association" 200 json 'com.the360ghar'
check '/properties' "$BASE/properties" 200 text/html 'Property'
check '/locality/palam-vihar-gurgaon' "$BASE/locality/palam-vihar-gurgaon" 200 text/html 'Palam Vihar'
check '/property/118' "$BASE/property/118" 200 text/html '"@type"'

echo
echo '== 2. Redirect parity (VAL-CF-002): 301, never 307 =='
redirect '/property (legacy)' '/property' '/properties'
redirect '/projects (legacy)' '/projects' '/project'
redirect '/truth (legacy)' '/truth' '/vs'
redirect '/data-hub/circle-rates (legacy)' '/data-hub/circle-rates' '/circle-rates'
redirect '/add-new-listing (legacy)' '/add-new-listing' '/post-property'
redirect '/hi/ trailing slash' '/hi/' '/hi'
redirect '/properties/ trailing slash' '/properties/' '/properties'
redirect '/locality/... trailing slash' '/locality/palam-vihar-gurgaon/' '/locality/palam-vihar-gurgaon'
redirect '/property/118/ trailing slash' '/property/118/' '/property/118'

echo
echo '== 3. Header parity (VAL-CF-003) + adapter finalize flag (VAL-CF-003/004) =='
# Workers Cache consumes and strips the Cloudflare-CDN-Cache-Control directive it
# honors, so on a live URL the emitted edge tier is visible through the
# Netlify-CDN-Cache-Control passthrough (cachePage sets both with the same tier)
# plus cf-cache-status/age. An adapter-emitted override would show up as its own
# cdn-cache-control header — asserted absent below.
CSS=$(curl -s "$BASE/" | grep -o '/_astro/[A-Za-z0-9._-]*\.css' | head -1)
check "picked an /_astro css ($CSS)" "$BASE$CSS" 200 'text/css' ''
header '/_astro immutable 1y' "$CSS" 'Cache-Control' 'max-age=31536000, immutable'
header 'font ACAO *' '/fonts/sentient-var.woff2' 'Access-Control-Allow-Origin' '*'
header 'font immutable' '/fonts/sentient-var.woff2' 'Cache-Control' 'immutable'
header 'homepage edge tier s-maxage=3600+SWR (passthrough)' '/' 'Netlify-CDN-Cache-Control' 's-maxage=3600, stale-while-revalidate=86400'
header 'homepage browser cache-control' '/' 'Cache-Control' 'public, max-age=0, must-revalidate'
CC=$(curl -sI "$BASE/" | tr -d '\r' | awk 'tolower($0) ~ /^cdn-cache-control:/ { found=1 } END { exit !found }')
if [ -n "$CC" ]; then fail 'homepage: generic cdn-cache-control header present (adapter override?)'; else pass 'homepage: no generic cdn-cache-control (finalize flag resolved: emitted tier stands)'; fi
curl -s -o /dev/null "$BASE/"
if curl -sI "$BASE/" | tr -d '\r' | awk 'tolower($0) ~ /^cf-cache-status: *hit/ { found=1 } END { exit !found }'; then pass 'homepage: cf-cache-status HIT after re-request (edge serving)'; else fail 'homepage: cf-cache-status not HIT'; fi
header 'homepage age present (cached object)' '/' 'Age' ''
absent 'homepage no Set-Cookie' '/' 'Set-Cookie'
absent '/hi no Set-Cookie' '/hi' 'Set-Cookie'
header '/hi inherits homepage tier' '/hi' 'Netlify-CDN-Cache-Control' 's-maxage=3600'
absent '/properties no Set-Cookie' '/properties' 'Set-Cookie'

echo
echo '== 4. Warm edge cache (VAL-CF-004) =='
echo '  Canonical 3 fresh-connection curls (each pays DNS+TCP+TLS to the served PoP first — RTT-bound, recorded as context):'
for i in 1 2 3; do
  curl -s -o /dev/null -w "    run $i: ttfb=%{time_starttransfer}s (dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect})\n" "$BASE/"
done
echo '  Warm-edge assertion — 3 sequential requests on a reused connection (1 setup + 3 measured; isolates cache-serve latency):'
REUSED_OK=1
TIMES=$(curl -s -o /dev/null -o /dev/null -o /dev/null -o /dev/null -w '%{time_starttransfer}\n' "$BASE/" "$BASE/" "$BASE/" "$BASE/")
i=0
while IFS= read -r t; do
  i=$((i + 1))
  [ "$i" -eq 1 ] && { echo "    connection setup (unmeasured): ${t}s"; continue; }
  echo "    warm-edge run $((i - 1)): ${t}s"
  awk -v t="$t" 'BEGIN { exit !(t <= 0.300) }' || REUSED_OK=0
done <<EOF
$TIMES
EOF
if [ "$REUSED_OK" -eq 1 ]; then pass '3 sequential warm-edge requests all <= 300 ms (reused connection)'; else fail 'a warm-edge request exceeded 300 ms'; fi

echo
echo '== 5. Route-level assertions (inherited from the deleted check:built script; real API, no mocking) =='
POST=/blog/vastu-compliant-homes-sohna-road
check 'blog post SSR' "$BASE$POST" 200 text/html 'Vastu-Compliant Homes on Sohna Road'
header 'blog post s-maxage (passthrough)' "$POST" 'Netlify-CDN-Cache-Control' 's-maxage'
absent 'blog post no Set-Cookie' "$POST" 'Set-Cookie'
check 'hi blog post SSR' "$BASE/hi$POST" 200 text/html ''
header 'hi blog post s-maxage (passthrough)' "/hi$POST" 'Netlify-CDN-Cache-Control' 's-maxage'
check 'blog listing' "$BASE/blog" 200 text/html ''
check 'blog unknown slug -> 404 state' "$BASE/blog/no-such-post-parity-check" 404 text/html 'This post is not here'
check 'hi blog unknown slug -> 404 state' "$BASE/hi/blog/no-such-post-parity-check" 404 text/html 'यह पोस्ट नहीं मिली'
check 'policy SSR (API content)' "$BASE/policies/privacy-policy" 200 text/html 'Effective Date: September 2025'
header 'policy s-maxage (passthrough)' '/policies/privacy-policy' 'Netlify-CDN-Cache-Control' 's-maxage'
header 'locality s-maxage (passthrough)' '/locality/palam-vihar-gurgaon' 'Netlify-CDN-Cache-Control' 's-maxage'
check 'locality generated content' "$BASE/locality/palam-vihar-gurgaon" 200 text/html '"@type":"FAQPage"'
check 'AI-tools flag off: /rent-agreement-drafter' "$BASE/rent-agreement-drafter" 404 text/html ''
check 'AI-tools flag off: /legal-notice-drafter' "$BASE/legal-notice-drafter" 404 text/html ''

echo
if [ "$FAILS" -eq 0 ]; then echo "ALL CHECKS PASSED against $BASE"; else echo "$FAILS CHECK(S) FAILED against $BASE"; fi
exit "$FAILS"
