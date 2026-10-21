/**
 * Translations. The JSON files come from the old site (13 namespaces, en + hi,
 * same keys). Keys are "namespace:path.to.key". Values use {{name}} slots.
 * A missing Hindi value falls back to English; a missing key returns the key
 * in development and an empty string in production, so users never see raw keys.
 */
import type { Locale } from '@/lib/i18n/locale';

type Dict = { [k: string]: string | Dict };

const files = import.meta.glob<Dict>('./locales/*/*.json', { eager: true, import: 'default' });

const dicts: Record<Locale, Record<string, Dict>> = { en: {}, hi: {} };
for (const [path, dict] of Object.entries(files)) {
  const m = path.match(/\.\/locales\/(en|hi)\/(.+)\.json$/);
  if (m) dicts[m[1] as Locale][m[2]!] = dict;
}

function walk(dict: Dict | undefined, path: string): string | Dict | undefined {
  let cur: string | Dict | undefined = dict;
  for (const part of path.split('.')) {
    if (!cur || typeof cur === 'string') return undefined;
    cur = cur[part];
  }
  return cur;
}

function lookup(dict: Dict | undefined, path: string): string | undefined {
  const v = walk(dict, path);
  return typeof v === 'string' ? v : undefined;
}

type Vars = Record<string, string | number>;

function fill(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => (vars[k] === undefined ? '' : String(vars[k])));
}

export function translate(locale: Locale, key: string, vars?: Vars): string {
  const [ns, path] = key.includes(':') ? (key.split(':', 2) as [string, string]) : ['common', key];
  let text = lookup(dicts[locale][ns], path) ?? lookup(dicts.en[ns], path);
  if (text === undefined && vars && typeof vars.count === 'number') {
    text = lookup(dicts[locale][ns], `${path}_${vars.count === 1 ? 'one' : 'other'}`) ?? lookup(dicts.en[ns], `${path}_other`);
  }
  if (text === undefined) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing key ${key}`);
    return import.meta.env.DEV ? key : '';
  }
  return fill(text, vars);
}

/** Bound translator: `const t = useT(locale); t('home:hero.title')`. */
export function getT(locale: Locale) {
  return (key: string, vars?: Vars) => translate(locale, key, vars);
}

/**
 * Picks a subtree of one namespace for an island, so the island ships only the
 * strings it uses (as a prop), not the whole dictionary.
 */
export function pick(locale: Locale, key: string): Dict {
  const [ns, path] = key.split(':', 2) as [string, string];
  const get = (l: Locale) => {
    const v = walk(dicts[l][ns], path);
    return v && typeof v !== 'string' ? v : {};
  };
  return locale === 'en' ? get('en') : deepMerge(get('en'), get('hi'));
}

function deepMerge(base: Dict, over: Dict): Dict {
  const out: Dict = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const b = out[k];
    out[k] = typeof v !== 'string' && b && typeof b !== 'string' ? deepMerge(b, v) : v;
  }
  return out;
}

/** Translator over a picked subtree (used inside islands). */
export function tFrom(dict: Dict) {
  return (path: string, vars?: Vars) => fill(lookup(dict, path) ?? '', vars);
}
