/**
 * Trace-level anatomy of the hero first-paint delay: what happens between
 * `load` and the first visual change on the homepage.
 *
 * Usage:
 *   node scripts/perf/trace-hero.mjs docs/perf/hero-delay/hero-run1.json
 *   (expects the sibling `hero-run1-0.trace.json` saved by `lighthouse --save-assets`)
 *
 * Prints, per run:
 *   - metric anchors (observed FCP/LCP/DCL/load, LCP render delay)
 *   - renderer-main-thread task census inside [DCL, firstPaint]
 *   - image decode + paint events with URLs
 *   - compositor/raster thread busy time in the same window
 *   - frame-pipeline events (first commits/activates/draws)
 *   - LCP candidate markers, rAF/rIC, script evaluations
 */
import { readFileSync } from 'node:fs';
import { basename, join, dirname } from 'node:path';

const reportFile = process.argv[2];
if (!reportFile) {
  console.error('usage: node scripts/perf/trace-hero.mjs <lighthouse-report.json>');
  process.exit(2);
}

const report = JSON.parse(readFileSync(reportFile, 'utf8'));
const m = report.audits.metrics.details.items[0];
const traceFile = join(dirname(reportFile), basename(reportFile).replace(/\.json$/, '-0.trace.json'));
const traceRaw = JSON.parse(readFileSync(traceFile, 'utf8'));
const trace = Array.isArray(traceRaw) ? traceRaw : traceRaw.traceEvents;
if (!Array.isArray(trace)) {
  console.error(`no traceEvents array in ${traceFile}`);
  process.exit(1);
}

const navTs = m.observedNavigationStartTs;
const ms = (ts) => Math.round((ts - navTs) / 100) / 10; // µs → ms, 0.1 precision

console.log(`\n=== ${basename(reportFile)} ===`);
console.log(
  `anchors: DCL ${m.observedDomContentLoaded}  load ${m.observedLoad}  firstPaint ${m.observedFirstPaint}  ` +
    `obsLCP ${m.observedLargestContentfulPaint}  simFCP ${m.firstContentfulPaint}  simLCP ${m.largestContentfulPaint}  simSI ${m.speedIndex}`,
);
const lcpPhases = report.audits['lcp-breakdown-insight']?.details?.items?.[0]?.items;
if (lcpPhases) {
  const rd = lcpPhases.find((x) => x.subpart === 'elementRenderDelay');
  const rl = lcpPhases.find((x) => x.subpart === 'resourceLoadDuration');
  console.log(`lcp phases: loadDuration ${rl?.duration}  renderDelay ${rd?.duration}`);
}

// --- thread map -----------------------------------------------------------
const threads = new Map(); // `${pid}:${tid}` → name
for (const e of trace) {
  if (e.ph === 'M' && e.name === 'thread_name') threads.set(`${e.pid}:${e.tid}`, e.args.name);
}
const main = [...threads].filter(([, n]) => /CrRendererMain/.test(n)).map(([k]) => k.split(':').map(Number));
const compo = [...threads].filter(([, n]) => n === 'Compositor').map(([k]) => k.split(':').map(Number));
const raster = [...threads].filter(([, n]) => /TileWorker|Raster/.test(n)).map(([k]) => k.split(':').map(Number));

// --- renderer main-thread tasks in [DCL, firstPaint+100ms] ---------------
const winStart = m.observedDomContentLoaded * 1000 + navTs;
const winEnd = m.observedFirstPaint * 1000 + navTs + 100_000;

const isOn = (e, list) => list.some(([p, t]) => e.pid === p && e.tid === t);

// Top-level tasks (RunTask) on the renderer main thread; summarize nested work by name.
const mainTasks = trace
  .filter((e) => e.name === 'RunTask' && e.ph === 'X' && isOn(e, main))
  .filter((e) => e.ts >= winStart && e.ts <= winEnd)
  .sort((a, b) => a.ts - b.ts);

const busyMain = mainTasks.reduce((s, e) => s + (e.dur ?? 0), 0) / 1000;
console.log(`\nmain-thread [${ms(winStart)} → ${ms(winEnd)}ms]: ${mainTasks.length} tasks, busy ${busyMain.toFixed(0)}ms`);

// Aggregated nested-name histogram (all depth-1 children of RunTask, bucketed).
const hist = new Map();
const findNested = (parent) =>
  trace.filter((e) => e.ts >= parent.ts && e.ts <= parent.ts + parent.dur && e !== parent && e.pid === parent.pid && e.tid === parent.tid && e.ph === 'X' && e.dur > 300);
for (const t of mainTasks.filter((x) => (x.dur ?? 0) > 1000)) {
  const names = findNested(t).map((e) => e.name);
  const key = [...new Set(names)].slice(0, 4).join('+') || '(leaf work)';
  if (!hist.has(key)) hist.set(key, { count: 0, dur: 0, at: [] });
  const h = hist.get(key);
  h.count += 1;
  h.dur += t.dur / 1000;
  h.at.push(ms(t.ts));
}
for (const [k, v] of [...hist].sort((a, b) => b[1].dur - a[1].dur).slice(0, 10)) {
  console.log(`  ${k}: n=${v.count} dur=${v.dur.toFixed(0)}ms at ${v.at.slice(0, 6).join(',')}`);
}

// --- image decode / paint events -----------------------------------------
console.log('\nimage events (decode/paint), main+compositor threads:');
const imgEvents = trace
  .filter((e) => /DecodeImage|PaintImage|ImageDecode|LazyFirstPaint/.test(e.name))
  .filter((e) => e.ts >= winStart - 500_000 && e.ts <= winEnd + 1_500_000)
  .sort((a, b) => a.ts - b.ts);
const byUrl = new Map();
for (const e of imgEvents) {
  const url = e.args?.url || e.args?.data?.url || e.args?.image_url || '(no url)';
  const key = `${e.name} ${String(url).replace(/^.*\/(diorama\/[^?]*|_astro\/[^?]*|fonts\/[^?]*).*$/, '$1…').slice(0, 40)}`;
  if (!byUrl.has(key)) byUrl.set(key, []);
  byUrl.get(key).push(e);
}
for (const [k, v] of byUrl) {
  console.log(`  ${k}: n=${v.length} first@${ms(v[0].ts)}ms`);
}

// --- raster / compositor busy time ---------------------------------------
const busyOn = (list) => {
  const tasks = trace.filter((e) => e.name === 'RunTask' && e.ph === 'X' && isOn(e, list) && e.ts >= winStart && e.ts <= winEnd + 1_000_000);
  return { n: tasks.length, ms: tasks.reduce((s, e) => s + (e.dur ?? 0), 0) / 1000 };
};
const rb = busyOn(raster);
const cb = busyOn(compo);
console.log(`\nraster threads: ${rb.n} tasks, busy ${rb.ms.toFixed(0)}ms | compositor: ${cb.n} tasks, busy ${cb.ms.toFixed(0)}ms`);
const rasterNames = trace
  .filter((e) => e.ph === 'X' && e.dur > 5000 && isOn(e, raster) && e.ts >= winStart && e.ts <= winEnd + 1_000_000)
  .sort((a, b) => b.dur - a.dur)
  .slice(0, 8);
for (const e of rasterNames) console.log(`  raster ${e.name} ${ms(e.ts)}ms dur ${e.dur / 1000}ms`);

// --- frame pipeline ------------------------------------------------------
console.log('\nframe pipeline (main thread + compositor):');
const pipe = trace
  .filter((e) => ['Commit', 'ActivateLayerTree', 'CompositeLayers', 'DrawFrame', 'BeginImplFrame', 'Layerize', 'Prepaint', 'UpdateLayerTree', 'InvalidateContentLayer'].includes(e.name))
  .filter((e) => e.ts >= winStart - 400_000 && e.ts <= winEnd)
  .sort((a, b) => a.ts - b.ts)
  .slice(0, 30);
const pipeCounts = new Map();
for (const e of pipe) pipeCounts.set(e.name, (pipeCounts.get(e.name) ?? 0) + 1);
console.log('  ' + [...pipeCounts].map(([k, v]) => `${k}×${v}`).join('  '));

// --- LCP candidates ------------------------------------------------------
console.log('\nLCP candidates:');
for (const e of trace.filter((e) => e.name === 'largestContentfulPaint::Candidate')) {
  const d = e.args?.data ?? {};
  console.log(`  @${ms(e.ts)}ms size=${d.size} tag=${d.tagName} ${d.imageUrl ? String(d.imageUrl).slice(-40) : ''}`);
}

// --- rAF / rIC / script eval --------------------------------------------
console.log('\nrAF + rIC + EvaluateScript:');
for (const e of trace.filter((e) => ['RequestIdleCallback', 'FireIdleCallback', 'EvaluateScript'].includes(e.name) && e.ts >= winStart - 400_000 && e.ts <= winEnd + 1_000_000).sort((a, b) => a.ts - b.ts)) {
  const url = e.args?.data?.url ? String(e.args.data.url).split('/').pop() : '';
  console.log(`  ${e.name} @${ms(e.ts)}ms ${e.dur ? `${(e.dur / 1000).toFixed(0)}ms` : ''} ${url}`);
}
const rafFires = trace.filter((e) => e.name === 'FireAnimationFrame' && e.ts >= winStart - 400_000 && e.ts <= winEnd).length;
console.log(`  FireAnimationFrame count in window: ${rafFires}`);

// --- dead-zone census: ALL threads, name histograms -----------------------
const zone = (t1ms, t2ms) => {
  const t1 = navTs + t1ms * 1000;
  const t2 = navTs + t2ms * 1000;
  const ev = trace.filter((e) => e.ts >= t1 && e.ts <= t2 && e.ph !== 'M' && e.ph !== 'S' && e.ph !== 'T' && e.ph !== 'F' && e.ph !== 'b' && e.ph !== 'e' && e.ph !== 'n');
  const byThread = new Map();
  for (const e of ev) {
    const th = threads.get(`${e.pid}:${e.tid}`) ?? `pid${e.pid}tid${e.tid}`;
    if (!byThread.has(th)) byThread.set(th, new Map());
    const h = byThread.get(th);
    const key = `${e.name}${e.ph === 'X' ? ` dur>${(e.dur ?? 0) >= 2000 ? '2+' : e.dur >= 500 ? '0.5+' : 'sub'}` : ` ${e.ph}`}`;
    h.set(key, (h.get(key) ?? 0) + 1);
  }
  console.log(`\ndead-zone census [${t1ms} → ${t2ms}ms] (all threads):`);
  for (const [th, h] of byThread) {
    const entries = [...h].sort((a, b) => b[1] - a[1]);
    console.log(`  ${th}:`);
    for (const [k, v] of entries.slice(0, 12)) console.log(`    ${k} ×${v}`);
    if (entries.length > 12) console.log(`    … ${entries.length - 12} more names`);
  }
};

// Timeline of the 40 events before firstPaint: what woke the pipeline?
const wake = () => {
  const t2 = navTs + m.observedFirstPaint * 1000;
  const ev = trace
    .filter((e) => (e.ts <= t2 && (e.ph === 'X' || e.ph === 'I' || e.ph === 'R') && (e.dur ?? 0) > 0) || (e.name === 'FireIdleCallback' && e.ts <= t2))
    .filter((e) => e.ts > t2 - 12_000)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 25)
    .sort((a, b) => a.ts - b.ts);
  console.log(`\nlast events before firstPaint (${ms(t2)}ms):`);
  for (const e of ev) {
    const th = (threads.get(`${e.pid}:${e.tid}`) ?? '?').padEnd(28);
    console.log(`  ${ms(e.ts).toFixed(1)}ms ${th} ${e.name} ${e.dur ? `${(e.dur / 1000).toFixed(1)}ms` : e.ph}`);
  }
};
zone(Math.round((winStart - navTs) / 1000), m.observedFirstPaint);
wake();
