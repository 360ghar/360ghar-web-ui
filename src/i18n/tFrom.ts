/**
 * Translator over a picked subtree, for islands. Kept apart from index.ts,
 * which loads every dictionary: importing that from a client module ships all
 * of them to the browser.
 */
export type Dict = { [k: string]: string | Dict };
export type Vars = Record<string, string | number>;

export function walk(dict: Dict | undefined, path: string): string | Dict | undefined {
  let cur: string | Dict | undefined = dict;
  for (const part of path.split('.')) {
    if (!cur || typeof cur === 'string') return undefined;
    cur = cur[part];
  }
  return cur;
}

export function lookup(dict: Dict | undefined, path: string): string | undefined {
  const v = walk(dict, path);
  return typeof v === 'string' ? v : undefined;
}

export function fill(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => (vars[k] === undefined ? '' : String(vars[k])));
}

/** Translator over a picked subtree (used inside islands). */
export function tFrom(dict: Dict) {
  return (path: string, vars?: Vars) => fill(lookup(dict, path) ?? '', vars);
}
