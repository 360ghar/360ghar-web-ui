import { createVerify, generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { credentialsFromEnv, dateRange, fetchAccessToken, fetchSearchAnalytics, gainingPages, groupByPage, pruneCandidates, signServiceAccountJwt } from './gsc.mjs';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });

describe('signServiceAccountJwt', () => {
  it('makes a JWT that the public key verifies, with the right claims', () => {
    const jwt = signServiceAccountJwt({ email: 'svc@x.iam.gserviceaccount.com', privateKey: pem, now: 1000 });
    const [h, c, s] = jwt.split('.');
    expect(JSON.parse(Buffer.from(h, 'base64url'))).toEqual({ alg: 'RS256', typ: 'JWT' });
    expect(JSON.parse(Buffer.from(c, 'base64url'))).toEqual({ iss: 'svc@x.iam.gserviceaccount.com', scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: 1000, exp: 4600 });
    expect(createVerify('RSA-SHA256').update(`${h}.${c}`).verify(publicKey, s, 'base64url')).toBe(true);
  });
});

describe('credentialsFromEnv', () => {
  it('needs both variables and expands \\n', () => {
    expect(credentialsFromEnv({})).toBeNull();
    expect(credentialsFromEnv({ GOOGLE_SERVICE_ACCOUNT_EMAIL: 'a' })).toBeNull();
    expect(credentialsFromEnv({ GOOGLE_SERVICE_ACCOUNT_EMAIL: 'a', GOOGLE_PRIVATE_KEY: 'x\\ny' })).toEqual({ email: 'a', privateKey: 'x\ny' });
  });
});

describe('API calls (fake fetch)', () => {
  it('exchanges the JWT and queries search analytics with a bearer token', async () => {
    const calls = [];
    const f = async (url, init) => {
      calls.push({ url, init });
      return url.includes('oauth2') ? { ok: true, json: async () => ({ access_token: 'tok' }) } : { ok: true, json: async () => ({ rows: [] }) };
    };
    const token = await fetchAccessToken({ email: 'a', privateKey: pem }, f);
    expect(token).toBe('tok');
    expect(calls[0].init.body.get('grant_type')).toContain('jwt-bearer');
    await fetchSearchAnalytics(token, 'sc-domain:360ghar.com', { startDate: '2026-01-01', endDate: '2026-01-28' }, f);
    expect(calls[1].url).toBe('https://www.googleapis.com/webmasters/v3/sites/sc-domain%3A360ghar.com/searchAnalytics/query');
    expect(calls[1].init.headers.Authorization).toBe('Bearer tok');
    expect(JSON.parse(calls[1].init.body)).toMatchObject({ dimensions: ['page', 'query'], rowLimit: 5000 });
  });
  it('throws on a bad status', async () => {
    await expect(fetchSearchAnalytics('t', 's', { startDate: 'a', endDate: 'b' }, async () => ({ ok: false, status: 403, text: async () => 'no' }))).rejects.toThrow(/403/);
  });
});

describe('report helpers', () => {
  const rows = [
    { keys: ['https://360ghar.com/a', 'q1'], clicks: 2, impressions: 50 },
    { keys: ['https://360ghar.com/a', 'q2'], clicks: 9, impressions: 80 },
    { keys: ['https://360ghar.com/b', 'q3'], clicks: 0, impressions: 0 },
    { keys: ['https://360ghar.com/c'] },
  ];
  const pages = groupByPage(rows);
  it('groups by page and sorts keywords by clicks', () => {
    expect(pages.map((p) => p.page)).toEqual(['https://360ghar.com/a', 'https://360ghar.com/b']);
    expect(pages[0].keywords.map((k) => k.query)).toEqual(['q2', 'q1']);
  });
  it('finds gaining and prune pages', () => {
    expect(gainingPages(pages)).toEqual([{ page: 'https://360ghar.com/a', totalClicks: 11, totalImpressions: 130, topKeywords: ['q2', 'q1'] }]);
    expect(pruneCandidates(pages)).toEqual(['https://360ghar.com/b']);
  });
  it('ends the date range two days before today', () => {
    expect(dateRange(28, new Date('2026-03-10T12:00:00Z'))).toEqual({ startDate: '2026-02-09', endDate: '2026-03-08' });
  });
});
