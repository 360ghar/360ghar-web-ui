import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import { useI18nNavigate, stripLocalePrefix } from '../i18n/I18nLink';
import PageLoader from './PageLoader';

/**
 * Routes that must NEVER be intercepted by the profile-completion gate.
 *
 * - The auth-flow pages own their own navigation and would race or loop if
 *   the guard redirected away mid-flow (/auth/callback, /add-phone).
 * - /profile-completion is the destination itself — redirecting to it from
 *   itself is a no-op, and ProfileCompletion needs to navigate AWAY (its
 *   loop-prevention sends users home after a successful update).
 * - /login and /register are pre-auth pages; bouncing authenticated users off
 *   them would break Google-redirect-back-to-login flows.
 */
const EXEMPT_CANONICAL_PATHS = new Set([
  '/profile-completion',
  '/auth/callback',
  '/add-phone',
  '/login',
  '/register',
]);

/**
 * Global route guard that sends authenticated users whose backend auth gate
 * reports `profile_completion` to /profile-completion.
 *
 * Design constraints (see review notes):
 *  - Waits for `isInitializing === false` so the store's `authStage` is settled
 *    (especially during the Google OAuth callback, which flips init back on).
 *  - Only redirects authenticated users with `authStage === 'profile_completion'`.
 *  - Exempts the auth-flow routes listed above (and their /hi/* variants).
 *  - Relies on ProfileCompletion to write the refreshed stage into the store
 *    before navigating, so the guard never re-bounces a user who just finished.
 *
 * Renders <Outlet /> for everyone except a user who is about to be redirected,
 * so logged-out and settled users see no extra loader flash.
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
    if (authStage !== 'profile_completion') return;

    const canonical = stripLocalePrefix(pathname) || '/';
    if (EXEMPT_CANONICAL_PATHS.has(canonical)) return;

    navigate('/profile-completion', { replace: true });
  }, [isInitializing, isAuthenticated, authStage, pathname, navigate]);

  // Only suppress page content while a redirect is actually imminent: the user
  // is authenticated, the gate says profile_completion, init is settled, and
  // they're not already on an exempt route. Everyone else renders normally.
  const redirecting =
    !isInitializing &&
    isAuthenticated &&
    authStage === 'profile_completion' &&
    !EXEMPT_CANONICAL_PATHS.has(stripLocalePrefix(pathname) || '/');

  return redirecting ? <PageLoader /> : <Outlet />;
};

export default ProfileCompletionRouteGuard;
