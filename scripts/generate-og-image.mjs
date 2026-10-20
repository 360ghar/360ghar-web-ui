#!/usr/bin/env node
/**
 * Makes the 1200x630 Open Graph image from a source picture.
 * Needs the "sharp" package (pnpm add -D sharp). It is not installed yet: the script says so and exits with code 3.
 *
 * Safe default: writes to a temp file and prints the path. --write replaces public/og-image-home.jpg.
 * The old source (thumbs/banner-three.webp) is not in this project, so --src is required.
 */
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { helpText, parseArgs } from './lib/args.mjs';
import { loadSharp } from './lib/sharp.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = {
  src: { type: 'string', help: 'Source image (any format sharp reads). Required.' },
  out: { type: 'string', help: 'Output file. Default: a temp file.' },
  write: { type: 'boolean', default: false, help: 'Write to public/og-image-home.jpg (replaces the live image).' },
  position: { type: 'string', default: 'centre', help: 'Crop anchor: centre, north, south, east, west, attention.' },
  quality: { type: 'number', default: 85, help: 'JPEG quality, 1 to 100.' },
  help: { type: 'boolean', default: false, help: 'Show this text.' },
};

let args;
try {
  args = parseArgs(process.argv.slice(2), SPEC);
} catch (e) {
  console.error(e.message);
  process.exit(2);
}
if (args.help) {
  console.log(helpText('generate-og-image', 'create the 1200x630 og-image-home.jpg.', SPEC));
  process.exit(0);
}
if (!args.src) {
  console.error('generate-og-image: --src <image> is required. Use --help.');
  process.exit(2);
}
const src = resolve(args.src);
if (!existsSync(src)) {
  console.error(`generate-og-image: source not found: ${src}`);
  process.exit(1);
}

const sharp = await loadSharp();
const dest = args.write ? join(root, 'public', 'og-image-home.jpg') : resolve(args.out ?? join(tmpdir(), 'og-image-home.jpg'));
mkdirSync(dirname(dest), { recursive: true });
await sharp(src).resize(1200, 630, { fit: 'cover', position: args.position }).jpeg({ quality: args.quality, progressive: true }).toFile(dest);
console.log(`Wrote ${dest} (${Math.round(statSync(dest).size / 1024)} KB)${args.write ? '' : '. Not published: add --write to replace public/og-image-home.jpg.'}`);
