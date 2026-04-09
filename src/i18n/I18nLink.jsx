import { Link, useNavigate } from 'react-router-dom';
import useLocaleStore from '../store/localeStore';

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
 * Prepend /hi/ to a path when locale is Hindi.
 * Handles root path, relative paths, and full URLs.
 */
export function localizePath(path, locale) {
  if (locale !== 'hi') return path;
  if (!path) return '/hi';

  // Don't modify external URLs
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }

  // Don't double-prefix
  if (path.startsWith('/hi/') || path === '/hi') {
    return path;
  }

  // Root path
  if (path === '/') {
    return '/hi';
  }

  // Relative paths (no leading /)
  if (!path.startsWith('/')) {
    return path;
  }

  return `/hi${path}`;
}

/**
 * Strip the /hi/ prefix from a path to get the canonical English path.
 */
export function stripLocalePrefix(path) {
  if (path === '/hi') return '/';
  if (path.startsWith('/hi/')) return path.slice(3);
  return path;
}
