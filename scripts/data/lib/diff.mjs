/** Row-level diff of two JSON arrays keyed by `keyOf`, for the "diff before --write" step. */

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function diffRows(current, next, keyOf) {
  const cur = new Map(current.map((r) => [keyOf(r), r]));
  const nxt = new Map(next.map((r) => [keyOf(r), r]));
  const added = [...nxt.keys()].filter((k) => !cur.has(k));
  const removed = [...cur.keys()].filter((k) => !nxt.has(k));
  const changedFields = {};
  let changed = 0;
  for (const [k, row] of nxt) {
    const old = cur.get(k);
    if (!old) continue;
    let touched = false;
    for (const f of new Set([...Object.keys(old), ...Object.keys(row)])) {
      if (!same(old[f], row[f])) {
        changedFields[f] = (changedFields[f] ?? 0) + 1;
        touched = true;
      }
    }
    if (touched) changed++;
  }
  // Same rows in a different order still change the file.
  const reordered = !added.length && !removed.length && !changed && !same(current.map(keyOf), next.map(keyOf));
  return { current: current.length, next: next.length, added, removed, changed, changedFields, reordered, identical: !added.length && !removed.length && !changed && !reordered };
}

export function describeDiff(name, d) {
  if (d.identical) return `${name}: identical (${d.next} rows)`;
  const parts = [`${name}: ${d.current} -> ${d.next} rows`, `added ${d.added.length}`, `removed ${d.removed.length}`, `changed ${d.changed}`];
  if (d.reordered) parts.push('order differs');
  const fields = Object.entries(d.changedFields).map(([f, n]) => `${f} x${n}`).join(', ');
  return `${parts.join(', ')}${fields ? ` (fields: ${fields})` : ''}`;
}
