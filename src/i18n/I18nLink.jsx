import { Link, useNavigate } from 'react-router-dom';
import useLocaleStore from '../store/localeStore';

function splitPathSuffix(path) {
  const suffixStart = path.search(/[?#]/);

  if (suffixStart === -1) {
    return { pathname: path, suffix: '' };
  }

  return {
    pathname: path.slice(0, suffixStart),
    suffix: path.slice(suffixStart),
  };
}

/**
 * Language-aware <Link> wrapper.
 * Automatically prepends /hi/ to paths when the current locale is Hindi.
 */
export function I18nLink({ to, ...rest }) {
  const locale = useLocaleStore((s) => s.locale);
  const localizedTo = localizePath(to, locale);
  return <Link to={localizedTo} {...rest} />;
}

/**
 * Language-aware navigate() hook.
 * Returns a navigate function that prepends /hi/ when locale is Hindi.
 */
export function useI18nNavigate() {
  const navigate = useNavigate();
  const locale = useLocaleStore((s) => s.locale);

  return (to, options) => {
    navigate(localizePath(to, locale), options);
  };
}

/**
 * Deprecated alias for useI18nNavigate.
 * @deprecated Use useI18nNavigate instead.
 */
export const useLocaleNavigate = useI18nNavigate;

/**
 * Prepend /hi/ to a path when locale is Hindi.
 * Handles root path, relative paths, and full URLs.
 */
export function localizePath(path, locale) {
  if (typeof path !== 'string') return path;
  if (locale !== 'hi') return path;
  if (!path) return '/hi';

  // Don't modify external URLs
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }

  const { pathname, suffix } = splitPathSuffix(path);

  // Don't double-prefix
  if (pathname.startsWith('/hi/') || pathname === '/hi') {
    return path;
  }

  // Root path
  if (pathname === '/') {
    return `/hi${suffix}`;
  }

  // Relative paths (no leading /)
  if (!pathname.startsWith('/')) {
    return path;
  }

  return `/hi${pathname}${suffix}`;
}

/**
 * Strip the /hi/ prefix from a path to get the canonical English path.
 */
export function stripLocalePrefix(path) {
  if (typeof path !== 'string') return path;

  const { pathname, suffix } = splitPathSuffix(path);

  if (pathname === '/hi') return `/${suffix}`;
  if (pathname.startsWith('/hi/')) return `${pathname.slice(3)}${suffix}`;
  return path;
}
