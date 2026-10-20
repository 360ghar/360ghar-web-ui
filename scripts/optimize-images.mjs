#!/usr/bin/env node
/**
 * Makes .webp and .avif twins of every PNG or JPG over 50 KB under public/assets/images,
 * plus width variants (-320w, -640w, ...) for the paths given with --responsive.
 * Needs the "sharp" package (pnpm add -D sharp). It is not installed yet: the script says so and exits with code 3.
 *
 * DRY RUN by default: lists what it would write. --write creates the files (an output that is newer than its source is skipped; --force redoes it).
 * The old site kept a hash manifest. This one compares file times instead, so there is no manifest file to keep.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { helpText, parseArgs } from './lib/args.mjs';
import { loadSharp } from './lib/sharp.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = {
  dir: { type: 'string', default: 'public/assets/images', help: 'Folder to scan, relative to the project.' },
  'min-kb': { type: 'number', default: 50, help: 'Skip sources smaller than this.' },
  responsive: { type: 'string', help: 'Comma list of paths (relative to --dir) that also get width variants.' },
  widths: { type: 'string', default: '320,640,768,1024', help: 'Widths for --responsive.' },
  write: { type: 'boolean', default: false, help: 'Create the files. Without it, only a list is printed.' },
  force: { type: 'boolean', default: false, help: 'Redo outputs that are already newer than their source.' },
  quiet: { type: 'boolean', default: false, help: 'Print only the summary.' },
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
  console.log(helpText('optimize-images', 'create webp and avif twins of large PNG and JPG images.', SPEC));
  process.exit(0);
}

const inputDir = join(root, args.dir);
if (!existsSync(inputDir)) {
  console.error(`optimize-images: folder not found: ${inputDir}`);
  process.exit(1);
}
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const sources = walk(inputDir).filter((f) => /\.(png|jpe?g)$/i.test(f) && statSync(f).size >= args['min-kb'] * 1024);
const responsive = new Set((args.responsive ?? '').split(',').map((s) => s.trim()).filter(Boolean));
const widths = args.widths.split(',').map(Number).filter((n) => n > 0);

/** Outputs for one source: [path, format, width|null]. */
const outputsFor = (file) => {
  const dir = dirname(file);
  const name = basename(file, extname(file));
  const list = [[join(dir, `${name}.webp`), 'webp', null], [join(dir, `${name}.avif`), 'avif', null]];
  if (responsive.has(relative(inputDir, file))) for (const w of widths) list.push([join(dir, `${name}-${w}w.webp`), 'webp', w], [join(dir, `${name}-${w}w.avif`), 'avif', w]);
  return list;
};
const stale = (out, src) => args.force || !existsSync(out) || statSync(out).mtimeMs < statSync(src).mtimeMs;

const todo = sources.flatMap((src) => outputsFor(src).filter(([out]) => stale(out, src)).map((o) => [src, ...o]));
if (!args.quiet) for (const [src, out] of todo) console.log(`${args.write ? 'write' : 'would write'} ${relative(root, out)}  <-  ${relative(root, src)}`);
console.log(`optimize-images: ${sources.length} source(s) over ${args['min-kb']} KB, ${todo.length} file(s) ${args.write ? 'to write' : 'would be written (dry run)'}.`);
if (!args.write || !todo.length) {
  if (!args.write && todo.length) console.log('Add --write to create them.');
  process.exit(0);
}

const sharp = await loadSharp();
let done = 0;
for (const [src, out, format, width] of todo) {
  try {
    let img = sharp(src);
    if (width) img = img.resize({ width, withoutEnlargement: true });
    await (format === 'webp' ? img.webp({ quality: 80 }) : img.avif({ quality: 50, effort: 4 })).toFile(out);
    done += 1;
  } catch (e) {
    console.error(`optimize-images: ${relative(root, out)} failed: ${e.message}`);
  }
}
console.log(`optimize-images: wrote ${done}/${todo.length}.`);
process.exit(done === todo.length ? 0 : 1);
