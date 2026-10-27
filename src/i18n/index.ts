/**
 * Translations. The JSON files come from the old site (13 namespaces, en + hi,
 * same keys). Keys are "namespace:path.to.key". Values use {{name}} slots.
 * A missing Hindi value falls back to English; a missing key returns the key
 * in development and an empty string in production, so users never see raw keys.
 */
import type { Locale } from '@/lib/i18n/locale';
import { fill, lookup, walk, type Dict, type Vars } from './tFrom';

export { tFrom } from './tFrom';

const files = import.meta.glob<Dict>('./locales/*/*.json', { eager: true, import: 'default' });

const dicts: Record<Locale, Record<string, Dict>> = { en: {}, hi: {} };
for (const [path, dict] of Object.entries(files)) {
  const m = path.match(/\.\/locales\/(en|hi)\/(.+)\.json$/);
  if (m) dicts[m[1] as Locale][m[2]!] = dict;
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
