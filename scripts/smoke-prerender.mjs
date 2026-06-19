// Puppeteer probe: load the home page with the prerender flag set and
// verify both:
//   1. The page renders (the LocationFallbackNotifier loop is fixed)
//   2. No API/Supabase network traffic is fired (the short-circuit works)
import net from 'node:net';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const puppeteer = require('puppeteer');
const VITE_BIN = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
const PREVIEW_HOST = '127.0.0.1';

const tryPort = (port) => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.unref();
  server.once('error', reject);
  server.listen(port, PREVIEW_HOST, () => {
    const addr = server.address();
    const actual = typeof addr === 'object' && addr ? addr.port : port;
    server.close((err) => err ? reject(err) : resolve(actual));
  });
});

const port = await tryPort(4322).catch(async () => tryPort(0));
const child = spawn(process.execPath, [VITE_BIN, 'preview', '--host', PREVIEW_HOST, '--port', String(port), '--strictPort'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
});

const baseUrl = `http://${PREVIEW_HOST}:${port}`;
const waitForServer = async () => {
  for (let i = 0; i < 80; i += 1) {
    if (child.exitCode !== null) throw new Error(`vite preview exited with code ${child.exitCode}`);
    try {
      const r = await fetch(baseUrl);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Timed out waiting for vite preview');
};

const collectLogs = async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const shortCircuitLogs = [];
  const networkRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') consoleErrors.push(text);
    if (text.includes('prerender:short-circuit')) shortCircuitLogs.push(text);
  });
  page.on('request', (req) => {
    const url = req.url();
    const isBackendApi = url.includes('api.360ghar.com/api/') || url.includes('/api/v1/');
    const isSupabase = url.includes('supabase.co') || url.includes('supabase.io');
    if (isBackendApi || isSupabase) {
      networkRequests.push(`${req.method()} ${url}`);
    }
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.evaluateOnNewDocument(() => {
    window.__PRERENDER_INJECTED = { isPrerendering: true };
  });

  try {
    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    pageErrors.push(`goto: ${e.message}`);
  }

  // Settle: wait for any in-flight lazy chunks + fetches to complete
  await new Promise((r) => setTimeout(r, 6000));

  const rootHtml = await page.evaluate(() => document.querySelector('#root')?.innerHTML?.length || 0).catch(() => 0);
  const title = await page.title().catch(() => '');

  // Check the prerender flag AFTER the page is loaded.
  const prerenderFlagPresent = await page.evaluate(() => Boolean(window.__PRERENDER_INJECTED?.isPrerendering)).catch((e) => `error: ${e.message}`);

  await browser.close();
  return { shortCircuitLogs, networkRequests, pageErrors, consoleErrors, rootHtml, title, prerenderFlagPresent };
};

try {
  await waitForServer();
  const { shortCircuitLogs, networkRequests, pageErrors, consoleErrors, rootHtml, title, prerenderFlagPresent } = await collectLogs();

  console.log(`\n=== Prerender smoke test (with short-circuit) ===`);
  console.log(`Prerender flag present on window: ${prerenderFlagPresent}`);
  console.log(`Title: ${title}`);
  console.log(`#root innerHTML length: ${rootHtml}`);
  console.log(`[prerender:short-circuit] log lines: ${shortCircuitLogs.length}`);
  for (const l of shortCircuitLogs.slice(0, 10)) console.log('  ', l);
  if (shortCircuitLogs.length > 10) console.log(`  ...and ${shortCircuitLogs.length - 10} more`);

  console.log(`\nAPI/Supabase data requests fired: ${networkRequests.length}`);
  for (const r of networkRequests.slice(0, 10)) console.log('  ', r);
  if (networkRequests.length > 10) console.log(`  ...and ${networkRequests.length - 10} more`);

  if (pageErrors.length) {
    console.log(`\nPage errors (${pageErrors.length}):`);
    for (const e of pageErrors.slice(0, 3)) console.log('  ', e.slice(0, 200));
  }
  if (consoleErrors.length) {
    console.log(`\nConsole errors (${consoleErrors.length}):`);
    for (const e of consoleErrors.slice(0, 3)) console.log('  ', e.slice(0, 200));
  }

  const rendered = rootHtml > 1000;
  const gated = networkRequests.length === 0;
  const noLoops = !pageErrors.some((e) => e.includes('Maximum update depth') || e.includes('Minified React error #185'));
  const flagOk = prerenderFlagPresent === true;

  console.log(`\n[flag]    __PRERENDER_INJECTED set on window:    ${flagOk ? 'PASS' : 'FAIL'}`);
  console.log(`[render]  page rendered (rootLen > 1000):       ${rendered ? 'PASS' : 'FAIL'}`);
  console.log(`[gate]    zero backend API/Supabase traffic:    ${gated ? 'PASS' : 'FAIL'}`);
  console.log(`[loop]    no infinite-loop errors:              ${noLoops ? 'PASS' : 'FAIL'}`);

  if (flagOk && rendered && gated && noLoops) {
    console.log('\nALL PASS: prerender captures the page without backend traffic.');
    process.exitCode = 0;
  } else {
    console.log('\nFAIL: see diagnostics above.');
    process.exitCode = 1;
  }
} finally {
  child.kill('SIGTERM');
  await new Promise((r) => setTimeout(r, 500));
}
