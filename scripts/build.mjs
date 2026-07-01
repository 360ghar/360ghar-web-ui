#!/usr/bin/env node
/**
 * Smart build orchestrator.
 *
 * Detects the build context and skips API/backend-calling steps for
 * non-production builds (local dev, Netlify deploy-preview, branch-deploy,
 * dev) to avoid unnecessary load on the backend and database during
 * testing and preview builds.
 *
 * Production build (Netlify CONTEXT=production, or FULL_BUILD=1):
 *   Full pipeline — entities, sitemaps, RSS, images, OG, vite, CSS purge,
 *   prerender (Puppeteer), bootstrap purge, IndexNow submission.
 *
 * Non-production build (everything else):
 *   Fast pipeline — ai-discovery, images, OG, vite, CSS purge, bootstrap
 *   purge. Skips: entities (external scraping), sitemaps (API fetches),
 *   RSS (API fetches), prerender (API data fetch + Puppeteer).
 *
 * Override: set FULL_BUILD=1 to force a full build anywhere.
 */
import { execSync } from 'node:child_process';

const cwd = process.cwd();

const isNetlifyProduction =
  process.env.NETLIFY === 'true' && process.env.CONTEXT === 'production';
const isFullBuild = process.env.FULL_BUILD === '1' || isNetlifyProduction;

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

// Steps that fetch from the backend / external sources — production only.
// Each is heavy and makes network/API calls that are wasteful during
// local testing and Netlify preview/branch deploys.
const API_DEPENDENT_PRE_VITE = [
  'npm run build:entities',   // scrapes external sitemaps (magicbricks, nobroker, ...)
  'npm run build:sitemaps',   // fetches properties, blog, projects, circle rates from API
  'npm run build:rss',        // fetches blog posts and properties from API
];

// Steps that are purely local (no network calls) — always run.
const LOCAL_PRE_VITE = [
  'npm run build:ai-discovery',
  'npm run build:images',
  'node scripts/generate-og-image.mjs',
];

// ── Pre-vite ───────────────────────────────────────────────────────────

if (isFullBuild) {
  // Puppeteer Chrome is only needed for prerendering.
  run('npx puppeteer browsers install chrome');
  for (const step of API_DEPENDENT_PRE_VITE) run(step);
} else {
  console.log('');
  console.log('=========================================================');
  console.log(' Non-production build — skipping API-dependent steps:');
  console.log('   entities, sitemaps, RSS, prerender');
  console.log(' (avoids unnecessary backend/database calls during');
  console.log('  local testing and Netlify preview/branch deploys)');
  console.log(' Set FULL_BUILD=1 to force a full production build.');
  console.log('=========================================================');
  console.log('');
}

for (const step of LOCAL_PRE_VITE) run(step);

// ── Vite build ─────────────────────────────────────────────────────────

run('vite build');

// ── Post-vite ──────────────────────────────────────────────────────────

// CSS purge scripts scan dist/**/*.html + src/**/*.{jsx,js} — they work
// with or without prerendered pages (source JSX covers all class names).
run('node scripts/purge-main-css.mjs');

if (isFullBuild) {
  run('npm run build:prerender');
}

run('node scripts/purge-bootstrap.mjs');

if (isFullBuild) {
  run('npm run build:indexnow');
}

console.log(
  isFullBuild
    ? '\nFull production build complete.'
    : '\nFast build complete (skipped API-dependent steps).',
);
