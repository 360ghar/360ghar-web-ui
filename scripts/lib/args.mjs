/** Tiny flag parser for the ops scripts: --flag, --key value, --key=value. No dependencies. */
export function parseArgs(argv, spec) {
  const out = {};
  for (const [name, def] of Object.entries(spec)) out[name] = def.default;
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      rest.push(arg);
      continue;
    }
    const [rawKey, inline] = arg.slice(2).split(/=(.*)/s);
    const def = spec[rawKey];
    if (!def) throw new Error(`Unknown option --${rawKey}. Use --help.`);
    if (def.type === 'boolean') {
      if (inline !== undefined && inline !== 'true' && inline !== 'false') throw new Error(`Option --${rawKey} takes true or false.`);
      out[rawKey] = inline !== 'false';
    } else {
      const next = argv[i + 1];
      if (inline === undefined && (next === undefined || next.startsWith('--'))) throw new Error(`Option --${rawKey} needs a value.`);
      const value = inline ?? argv[++i];
      if (def.type === 'number') {
        out[rawKey] = value.trim() === '' ? Number.NaN : Number(value);
        if (!Number.isFinite(out[rawKey])) throw new Error(`Option --${rawKey} needs a number.`);
      } else out[rawKey] = value;
    }
  }
  return { ...out, _: rest };
}

export function helpText(name, summary, spec, notes = []) {
  const lines = [`${name}: ${summary}`, '', 'Options:'];
  for (const [key, def] of Object.entries(spec)) {
    const flag = def.type === 'boolean' ? `--${key}` : `--${key} <${def.type}>`;
    const dflt = def.default === undefined || def.default === false ? '' : ` (default: ${def.default})`;
    lines.push(`  ${flag.padEnd(24)}${def.help}${dflt}`);
  }
  if (notes.length) lines.push('', ...notes);
  return lines.join('\n');
}
