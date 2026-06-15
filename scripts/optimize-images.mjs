#!/usr/bin/env node
/**
 * Image Optimization Script
 *
 * Generates next-gen image variants for every PNG/JPG under
 * `public/assets/images`:
 *   - `<name>.webp`   — WebP twin (quality 80)
 *   - `<name>.avif`   — AVIF twin (quality 50) — best modern compression
 * And for "responsive" images (large hero / section / banner art), also emits
 * width-constrained variants at 320 / 640 / 768 / 1024 px in BOTH WebP + AVIF:
 *   - `<name>-<width>w.webp` / `<name>-<width>w.avif`
 *
 * The script is idempotent: an output file is skipped if it already exists and
 * is newer than its source. Safe (and fast) to run on every build.
 *
 * Usage:
 *   node scripts/optimize-images.mjs            # default run
 *   node scripts/optimize-images.mjs --force    # regenerate everything
 *   node scripts/optimize-images.mjs --quiet    # only print summary
 *
 * Wired into `npm run build` via the `build:images` script.
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const QUIET = args.has('--quiet');

const log = (...a) => { if (!QUIET) console.log(...a); };
const logErr = (...a) => console.error(...a);

const CONFIG = {
  inputDir: path.join(rootDir, 'public/assets/images'),
  // Skip small images — they cost more in HTTP requests than they save in bytes.
  minSizeBytes: 50 * 1024, // 50 KB
  webpQuality: 80,
  avifQuality: 50,
  responsiveSizes: [320, 640, 768, 1024],
  // Large hero / section / banner art that benefits from responsive variants.
  // Anything here also gets the standard .webp + .avif twins. Paths are relative
  // to `public/assets/images`. Add new hero images here as they land.
  responsiveImages: [
    'thumbs/banner-three.png',
    'thumbs/banner-two-filter-bg.png',
    'thumbs/newsletter-bg.png',
    'thumbs/banner-four-image.png',
    'thumbs/banner-five-img.png',
    'thumbs/about-three-img.png',
    'thumbs/video-popup.png',
    'thumbs/faq-img.png',
    'thumbs/property-details-1.png',
    'thumbs/project-details.png',
    'thumbs/blog3.png',
    'thumbs/blog-details.png',
    'thumbs/portfolio1.png',
    'thumbs/portfolio2.png',
    'thumbs/portfolio4.png',
    'thumbs/gallery-img2.png',
    'thumbs/gallery-img3.png',
    'thumbs/project-img4.png',
    'thumbs/testimonial-img.png',
    'thumbs/message-img.png',
    'thumbs/team1.png',
    'thumbs/team2.png',
    'thumbs/team3.png',
    'thumbs/user-img1.png',
    'thumbs/user-img2.png',
    'logo/logo.png',
  ],
};

async function isSharpReady() {
  try {
    await sharp({ create: { width: 1, height: 1, channels: 3, background: '#fff' } })
      .webp().toBuffer();
    return true;
  } catch {
    return false;
  }
}

async function getImageFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getImageFiles(fullPath));
    } else if (/\.(png|jpg|jpeg)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Skip an output if it exists and is newer than the source (unless --force).
 */
async function shouldSkip(inputPath, outputPath) {
  if (FORCE) return false;
  try {
    const [inStat, outStat] = await Promise.all([fs.stat(inputPath), fs.stat(outputPath)]);
    return outStat.mtime > inStat.mtime;
  } catch {
    return false; // output missing → regenerate
  }
}

async function ensureWebp(inputPath, outPath) {
  if (await shouldSkip(inputPath, outPath)) return { skipped: true };
  await sharp(inputPath).webp({ quality: CONFIG.webpQuality }).toFile(outPath);
  return { skipped: false };
}

async function ensureAvif(inputPath, outPath) {
  if (await shouldSkip(inputPath, outPath)) return { skipped: true };
  // AVIF is slower to encode; cap effort to keep build times sane.
  await sharp(inputPath)
    .avif({ quality: CONFIG.avifQuality, effort: 4 })
    .toFile(outPath);
  return { skipped: false };
}

async function ensureResponsive(inputPath, dir, name, ext) {
  const results = [];
  for (const width of CONFIG.responsiveSizes) {
    const base = path.join(dir, `${name}-${width}w`);
    const webpPath = `${base}.webp`;
    const avifPath = `${base}.avif`;

    if (!(await shouldSkip(inputPath, webpPath))) {
      await sharp(inputPath).resize({ width, withoutEnlargement: true })
        .webp({ quality: CONFIG.webpQuality }).toFile(webpPath);
    }
    if (!(await shouldSkip(inputPath, avifPath))) {
      await sharp(inputPath).resize({ width, withoutEnlargement: true })
        .avif({ quality: CONFIG.avifQuality, effort: 4 }).toFile(avifPath);
    }
    results.push(width);
  }
  return results;
}

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + 'MB';
  return Math.round(bytes / 1024) + 'KB';
}

async function main() {
  log('Image Optimization');
  log('='.repeat(50));

  if (!(await isSharpReady())) {
    logErr('Error: sharp is not available. Run: npm install sharp');
    process.exit(1);
  }

  const imageFiles = await getImageFiles(CONFIG.inputDir);
  log(`Scanning ${imageFiles.length} images under ${path.relative(rootDir, CONFIG.inputDir)}…`);

  const stats = {
    webpCreated: 0, webpSkipped: 0, webpErrors: 0,
    avifCreated: 0, avifSkipped: 0, avifErrors: 0,
    responsiveImages: 0, responsiveVariants: 0,
    savedBytes: 0,
  };
  const responsiveSet = new Set(CONFIG.responsiveImages);

  for (const inputPath of imageFiles) {
    const relativePath = path.relative(CONFIG.inputDir, inputPath);
    const dir = path.dirname(inputPath);
    const ext = path.extname(inputPath);
    const name = path.basename(inputPath, ext);
    const webpPath = path.join(dir, `${name}.webp`);
    const avifPath = path.join(dir, `${name}.avif`);

    let sourceStat;
    try { sourceStat = await fs.stat(inputPath); }
    catch { continue; }
    if (sourceStat.size < CONFIG.minSizeBytes) {
      // Still create AVIF/WebP twins below threshold is wasteful; skip tiny images.
      continue;
    }

    // WebP twin
    try {
      const before = await fs.stat(webpPath).then(s => s.size).catch(() => sourceStat.size);
      const r = await ensureWebp(inputPath, webpPath);
      if (r.skipped) { stats.webpSkipped++; }
      else {
        stats.webpCreated++;
        const after = await fs.stat(webpPath).then(s => s.size).catch(() => before);
        stats.savedBytes += Math.max(0, before - after);
        log(`  ${relativePath}: ${fmt(sourceStat.size)} → webp ${fmt(after)}`);
      }
    } catch (e) {
      stats.webpErrors++;
      logErr(`  ERROR webp ${relativePath}: ${e.message}`);
    }

    // AVIF twin
    try {
      const r = await ensureAvif(inputPath, avifPath);
      if (r.skipped) { stats.avifSkipped++; }
      else {
        stats.avifCreated++;
        const after = await fs.stat(avifPath).then(s => s.size).catch(() => 0);
        log(`  ${relativePath}: ${fmt(sourceStat.size)} → avif ${fmt(after)}`);
      }
    } catch (e) {
      stats.avifErrors++;
      logErr(`  ERROR avif ${relativePath}: ${e.message}`);
    }

    // Responsive variants for large art
    if (responsiveSet.has(relativePath)) {
      try {
        const widths = await ensureResponsive(inputPath, dir, name, ext);
        stats.responsiveImages++;
        stats.responsiveVariants += widths.length;
        log(`  ${relativePath}: responsive ${widths.join('/')}w (webp+avif)`);
      } catch (e) {
        logErr(`  ERROR responsive ${relativePath}: ${e.message}`);
      }
    }
  }

  log('\n' + '='.repeat(50));
  log(`Summary:`);
  log(`  WebP:      ${stats.webpCreated} created, ${stats.webpSkipped} skipped, ${stats.webpErrors} errors`);
  log(`  AVIF:      ${stats.avifCreated} created, ${stats.avifSkipped} skipped, ${stats.avifErrors} errors`);
  log(`  Responsive:${stats.responsiveImages} images × ${CONFIG.responsiveSizes.length} widths = ${stats.responsiveVariants} variant pairs`);
  log(`  Bytes saved (webp vs source, this run): ~${fmt(stats.savedBytes)}`);
}

main().catch((e) => { logErr(e); process.exit(1); });
