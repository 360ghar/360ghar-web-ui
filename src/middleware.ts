import { defineMiddleware } from 'astro:middleware';
import { localeFromPath } from '@/lib/i18n/locale';
import { redirectLocation } from '@/lib/redirects';

export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = context.url;
  if (!context.isPrerendered && !pathname.startsWith('/_') && !pathname.startsWith('/api/')) {
    const location = redirectLocation(pathname, search);
    if (location) return context.redirect(location, 301);
  }
  context.locals.locale = localeFromPath(pathname);
  return next();
});
