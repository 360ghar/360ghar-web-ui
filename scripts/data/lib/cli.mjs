/** Tiny flag parser and output helpers shared by the data scripts. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** `--flag`, `--key value`, `--key=value`. Repeated keys keep the last value. */
export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      out._.push(a);
      continue;
    }
    const [k, inline] = a.slice(2).split(/=(.*)/s);
    if (inline !== undefined) out[k] = inline;
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) out[k] = argv[++i];
    else out[k] = true;
  }
  return out;
}

/** Output directory. Default is a temp dir, never src/data. */
export function outDir(args) {
  const dir = path.resolve(String(args.out || process.env.DATA_OUT || path.join(os.tmpdir(), '360ghar-data-out')));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export const srcData = (name) => path.join(process.cwd(), 'src', 'data', name);

export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
export const writeJson = (file, data) => fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
