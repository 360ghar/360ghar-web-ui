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
    if (def.type === 'boolean') out[rawKey] = true;
    else {
      const value = inline ?? argv[++i];
      if (value === undefined) throw new Error(`Option --${rawKey} needs a value.`);
      out[rawKey] = def.type === 'number' ? Number(value) : value;
      if (def.type === 'number' && Number.isNaN(out[rawKey])) throw new Error(`Option --${rawKey} needs a number.`);
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
