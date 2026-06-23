import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import { useI18nNavigate, stripLocalePrefix } from '../i18n/I18nLink';
import { getRedirectPathForStage } from '../utils/authStage';
import PageLoader from './PageLoader';

/**
 * Auth-flow pages where the guard must NOT redirect authenticated users.
 * /auth/callback and /add-phone own their own navigation and would race or
 * loop if the guard intervened. /profile-completion is the destination for
 * the profile-completion stage — redirecting to it from itself is a no-op.
 *
 * NOTE: /login and /register are intentionally NOT in this set. If a user
 * reaches them while already authenticated (e.g. the async login callback
 * didn't navigate, or they bookmarked /login), the guard should bounce them
 * to the appropriate page so they are never stranded on an auth page.
 */
const EXEMPT_CANONICAL_PATHS = new Set([
  '/profile-completion',
  '/auth/callback',
  '/add-phone',
]);

// Auth pages where an authenticated user should be redirected away from.
// /register is intentionally excluded: the register flow creates a Supabase
// session during OTP verification (step 2) but the user must still complete
// the password setup (step 3) before being fully registered. Redirecting
// at that point would strand them without a password.
const AUTH_PAGE_PATHS = new Set(['/login']);

/**
 * Global route guard with two responsibilities:
 *
 * 1. **Profile-completion gate**: sends authenticated users whose backend auth
 *    gate reports `profile_completion` to /profile-completion.
 *
 * 2. **Authenticated-on-auth-page redirect**: if an authenticated user is on
 *    /login or /register, redirects them to the appropriate page. This handles
 *    the case where the async login callback's navigate() was silently dropped
 *    by React Router (a known timing issue with navigation from async callbacks
 *    that complete after a state update triggers a re-render).
 *
 * Design constraints:
 *  - Waits for `isInitializing === false` so the store's `authStage` is settled.
 *  - Exempts auth-flow routes (/auth/callback, /add-phone, /profile-completion)
 *    to prevent redirect loops.
 *  - Renders <Outlet /> for everyone except a user who is about to be redirected.
 */
const ProfileCompletionRouteGuard = () => {
  const { pathname } = useLocation();
  const navigate = useI18nNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const authStage = useAuthStore((s) => s.authStage);

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) return;

    const canonical = stripLocalePrefix(pathname) || '/';

    // Never redirect away from exempt routes.
    if (EXEMPT_CANONICAL_PATHS.has(canonical)) return;

    // 1. Profile-completion gate: redirect to /profile-completion.
    if (authStage === 'profile_completion') {
      navigate('/profile-completion', { replace: true });
      return;
    }

    // 2. Authenticated user on an auth page: redirect to the appropriate page.
    //    This is the safety net for when login/register async callbacks fail to
    //    navigate (React Router can silently drop navigate() calls from async
    //    callbacks that complete after a state-triggered re-render).
    if (AUTH_PAGE_PATHS.has(canonical)) {
      navigate(getRedirectPathForStage(authStage), { replace: true });
    }
  }, [isInitializing, isAuthenticated, authStage, pathname, navigate]);

  // Suppress page content while a redirect is imminent.
  const canonical = stripLocalePrefix(pathname) || '/';
  const redirecting =
    !isInitializing &&
    isAuthenticated &&
    !EXEMPT_CANONICAL_PATHS.has(canonical) &&
    (authStage === 'profile_completion' || AUTH_PAGE_PATHS.has(canonical));

  return redirecting ? <PageLoader /> : <Outlet />;
};

export default ProfileCompletionRouteGuard;
