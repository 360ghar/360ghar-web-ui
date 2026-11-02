/**
 * Repeatable Lighthouse runner: the canonical mobile performance command
 * (local Lighthouse 13.6.0, headless Chrome) against one URL, N times,
 * writing one JSON per run plus a median summary.
 *
 * Usage:
 *   node scripts/perf/lighthouse.mjs <URL> [options]
 * Options:
 *   --runs <n>       Number of runs (default 3; median of 3 is the score contract)
 *   --out <dir>      Output directory (default docs/perf/baseline)
 *   --label <name>   File label (default "run"; e.g. home, properties, locality)
 *   --screen <mode>  `faithful` (default) | `canonical-mobile`.
 *                    faithful: no screen-metrics override; the headless window is
 *                    pre-sized 412x823 CSS px and the mobile UA still applies.
 *                    canonical-mobile: the pre-2026-11-02 protocol
 *                    (`--screenEmulation.mobile`). KEEP for comparisons with the
 *                    baseline/early-mission tables. On this machine it triggers a
 *                    nondeterministic presentation blackout in headless Chrome that
 *                    delays first paint by ~0.7-1.8 s with an idle CPU (trace proof
 *                    and the isolation matrix: docs/perf/hero-delay.md). SI/LCP
 *                    medians from that mode are inflated whenever the blackout
 *                    fires (6 of 9 runs on 2026-11-02).
 *   --resummarize    Re-read existing run JSONs and rewrite the summary only
 *                    (no browser, no Lighthouse run)
 *
 * Files written: <out>/<label>.run<i>.json and <out>/<label>.summary.json.
 * perRun.file paths in the summary are recorded repo-relative (no /Users/... leakage
 * in committed summaries). Prints a metrics table and the median to stdout. Runs are
 * serial: never launch two of these at once (concurrent Chrome skews the metrics).
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LH_VERSION = '13.6.0';
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const url = process.argv[2];
if (!url || !/^https?:\/\//.test(url)) {
  console.error('usage: node scripts/perf/lighthouse.mjs <URL> [--runs 3] [--out docs/perf/baseline] [--label run]');
  process.exit(2);
}
if (!/^[\w./:&#%?=-]+$/.test(url)) {
  console.error(`refusing odd URL: ${url}`);
  process.exit(2);
}

const runsArg = arg('--runs');
const runs = runsArg === undefined ? 3 : Number(runsArg);
if (!Number.isInteger(runs) || runs < 1) {
  console.error(`--runs must be a finite positive integer (got ${runsArg})`);
  process.exit(2);
}
const outDir = resolve(arg('--out') ?? 'docs/perf/baseline');
const label = arg('--label') ?? 'run';
const screenArg = arg('--screen');
const screen = screenArg ?? 'faithful';
if (!['faithful', 'canonical-mobile'].includes(screen)) {
  console.error(`--screen must be "faithful" or "canonical-mobile" (got ${screen})`);
  process.exit(2);
}
const screenFlags = screen === 'faithful'
  ? ['--screenEmulation.disabled', '--chrome-flags=--headless=new --window-size=412,823']
  : ['--screenEmulation.mobile', '--chrome-flags=--headless=new'];
const resummarize = process.argv.includes('--resummarize');
mkdirSync(outDir, { recursive: true });

const runFiles = [];
if (resummarize) {
  for (let i = 1; i <= runs; i++) runFiles.push(resolve(outDir, `${label}.run${i}.json`));
} else {
  for (let i = 1; i <= runs; i++) {
    const file = resolve(outDir, `${label}.run${i}.json`);
    runFiles.push(file);
    process.stdout.write(`[${label}] run ${i}/${runs} ... `);
    const res = spawnSync(
      'npx',
      [
        '--yes',
        `lighthouse@${LH_VERSION}`,
        url,
        '--only-categories=performance',
        '--form-factor=mobile',
        ...screenFlags,
        '--output=json',
        `--output-path=${file}`,
        '--quiet',
      ],
      { stdio: ['ignore', 'ignore', 'pipe'], env: { ...process.env, CHROME_PATH: CHROME }, timeout: 180_000 },
    );
    if (res.error || res.status !== 0 || !readFileSync(file, 'utf8').startsWith('{')) {
      console.log(`failed\n${res.stderr?.toString().trim().split('\n').slice(-4).join('\n')}`);
      process.exit(1);
    }
    console.log('ok');
  }
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/** First `node.snippet` inside an audit's details (audit ids moved in Lighthouse 13: insights). */
const lcpSnippet = (report) => {
  for (const id of ['largest-contentful-paint-element', 'lcp-breakdown-insight', 'lcp-discovery-insight']) {
    const details = report.audits[id]?.details;
    if (!details) continue;
    const found = (function walk(v) {
      if (Array.isArray(v)) { for (const x of v) { const f = walk(x); if (f) return f; } return null; }
      if (v && typeof v === 'object') {
        if (typeof v.snippet === 'string' && v.snippet) return v.snippet;
        for (const x of Object.values(v)) { const f = walk(x); if (f) return f; }
      }
      return null;
    })(details);
    if (found) return found;
  }
  return null;
};

/** The screen mode a report actually ran under, from its own config. */
const screenModeOf = (report) => {
  const se = report.configSettings?.screenEmulation;
  if (!se) return null;
  if (se.disabled) return 'faithful';
  if (se.mobile) return 'canonical-mobile';
  return null;
};

const reports = runFiles.map((file) => JSON.parse(readFileSync(file, 'utf8')));

// Resummarize labels runs by their recorded provenance, never the current default:
// an operator resummarizing canonical-mobile-era reports without --screen must not
// get them relabeled faithful.
let screenLabel = screen;
if (resummarize) {
  const modes = [...new Set(reports.map(screenModeOf))];
  if (modes.length === 1 && modes[0]) screenLabel = modes[0];
  else if (!screenArg) {
    console.error('--resummarize: screen mode not derivable from the reports (configSettings.screenEmulation); pass --screen explicitly.');
    process.exit(2);
  }
}

const runsData = reports.map((report, i) => {
  const n = (audit) => report.audits[audit]?.numericValue;
  return {
    file: relative(REPO_ROOT, runFiles[i]),
    score: Math.round((report.categories?.performance?.score ?? 0) * 100),
    fcp_ms: Math.round(n('first-contentful-paint') ?? 0),
    lcp_ms: Math.round(n('largest-contentful-paint') ?? 0),
    si_ms: Math.round(n('speed-index') ?? 0),
    tbt_ms: Math.round(n('total-blocking-time') ?? 0),
    cls: Math.round((n('cumulative-layout-shift') ?? 0) * 1000) / 1000,
    lcpElement: lcpSnippet(report),
    lcpDiscoveryScore: report.audits['lcp-discovery-insight']?.score ?? null,
  };
});

const summary = {
  url,
  engine: `lighthouse@${LH_VERSION}, mobile UA emulation, headless Chrome, screen=${screenLabel}`,
  runs: runsData.length,
  median: Object.fromEntries(
    ['score', 'fcp_ms', 'lcp_ms', 'si_ms', 'tbt_ms', 'cls'].map((k) => [k, median(runsData.map((r) => r[k]))]),
  ),
  perRun: runsData,
};

const summaryFile = resolve(outDir, `${label}.summary.json`);
writeFileSync(summaryFile, `${JSON.stringify(summary, null, 2)}\n`);

console.log(`\n${url} — ${runs} run(s), median of ${summary.runs}`);
console.log('run   score  FCP     LCP     SI      TBT    CLS');
for (const [i, r] of runsData.entries()) {
  console.log(
    `${i + 1}     ${r.score}     ${r.fcp_ms}ms  ${r.lcp_ms}ms  ${r.si_ms}ms  ${r.tbt_ms}ms  ${r.cls}`,
  );
}
const m = summary.median;
console.log(
  `med   ${m.score}     ${m.fcp_ms}ms  ${m.lcp_ms}ms  ${m.si_ms}ms  ${m.tbt_ms}ms  ${m.cls}`,
);
console.log(`summary: ${summaryFile}`);
if (runsData[0].lcpElement) console.log(`LCP element: ${runsData[0].lcpElement}`);
