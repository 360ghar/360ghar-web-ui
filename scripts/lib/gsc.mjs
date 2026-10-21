/** Google Search Console helpers. No dependencies: the service-account JWT is signed with node:crypto. */
import { createSign } from 'node:crypto';

const b64url = (input) => Buffer.from(input).toString('base64url');

/** Signed RS256 JWT for the OAuth service-account flow (scope: read-only Search Console). */
export function signServiceAccountJwt({ email, privateKey, now = Math.floor(Date.now() / 1000), scope = 'https://www.googleapis.com/auth/webmasters.readonly' }) {
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({ iss: email, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const signature = createSign('RSA-SHA256').update(`${head}.${claims}`).sign(privateKey, 'base64url');
  return `${head}.${claims}.${signature}`;
}

/** Credentials from the environment. GOOGLE_PRIVATE_KEY may hold literal "\n" pairs (as CI secrets often do). */
export function credentialsFromEnv(env = process.env) {
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  return email && privateKey ? { email, privateKey } : null;
}

export async function fetchAccessToken(creds, fetchImpl = fetch) {
  const res = await fetchImpl('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: signServiceAccountJwt(creds) }),
  });
  if (!res.ok) throw new Error(`token request failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

/** POST searchAnalytics/query. Read-only: it reads data, it changes nothing. */
export async function fetchSearchAnalytics(token, site, { startDate, endDate, dimensions = ['page', 'query'], rowLimit = 5000 }, fetchImpl = fetch) {
  const res = await fetchImpl(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
  });
  if (!res.ok) throw new Error(`search analytics failed: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Rows keyed [page, query] into one entry per page, keywords sorted by clicks. */
export function groupByPage(rows = []) {
  const pages = new Map();
  for (const row of rows) {
    const [page, query] = row.keys ?? [];
    if (!page || !query) continue;
    if (!pages.has(page)) pages.set(page, { page, keywords: [] });
    pages.get(page).keywords.push({ query, clicks: row.clicks ?? 0, impressions: row.impressions ?? 0, ctr: row.ctr ?? 0, position: row.position ?? 0 });
  }
  for (const p of pages.values()) p.keywords.sort((a, b) => b.clicks - a.clicks);
  return [...pages.values()];
}

const sum = (p, key) => p.keywords.reduce((n, k) => n + k[key], 0);

/** Pages in the report with at most `maxImpressions` impressions. Pages with no row at all are not in the report. */
export const pruneCandidates = (pages, maxImpressions = 0) => pages.filter((p) => sum(p, 'impressions') <= maxImpressions).map((p) => p.page);

/** Pages with at least `minClicks` clicks. */
export const gainingPages = (pages, minClicks = 5) =>
  pages
    .filter((p) => sum(p, 'clicks') >= minClicks)
    .map((p) => ({ page: p.page, totalClicks: sum(p, 'clicks'), totalImpressions: sum(p, 'impressions'), topKeywords: p.keywords.slice(0, 5).map((k) => k.query) }));

/** GSC data lags about two days. The default window ends two days ago. */
export function dateRange(days = 28, today = new Date()) {
  const day = (d) => d.toISOString().slice(0, 10);
  const end = new Date(today.getTime() - 2 * 86_400_000);
  return { startDate: day(new Date(end.getTime() - (days - 1) * 86_400_000)), endDate: day(end) };
}
