import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ensureSupabaseClient } from '../../services/supabaseClient';
import { useAuthStore } from '../../store';
import { AUTH_METHODS } from '../../services/lastAuthMethod';
import PageLoader from '../../common/PageLoader';

// Only allow same-site, single-leading-slash redirect targets.
function sanitizeNext(next) {
  if (!next || typeof next !== 'string') return '/';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const syncAfterExternalAuth = useAuthStore((s) => s.syncAfterExternalAuth);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const code = searchParams.get('code');
    const next = sanitizeNext(searchParams.get('next'));

    async function handleCallback() {
      if (!code) {
        navigate('/login?error=auth', { replace: true });
        return;
      }

      let sessionEstablished = false;
      try {
        await authService.exchangeCodeForSession(code);
        sessionEstablished = true;

        // Persist + mirror the last-used method (Google).
        authService.afterAuthSuccess(AUTH_METHODS.GOOGLE);

        // Sync the auth store / backend profile.
        await syncAfterExternalAuth();

        // Passwordless Google sign-ups should be prompted (skippably) to add a
        // verified phone when none is attached to the Supabase user.
        let hasPhone = true;
        try {
          const client = await ensureSupabaseClient();
          const { data } = await client.auth.getUser();
          hasPhone = Boolean(data?.user?.phone);
        } catch {
          hasPhone = true; // On error, don't block the user on the add-phone step.
        }

        if (!hasPhone) {
          const params = new URLSearchParams();
          if (next && next !== '/') params.set('next', next);
          const query = params.toString();
          navigate(`/add-phone${query ? `?${query}` : ''}`, { replace: true });
          return;
        }

        navigate(next, { replace: true });
      } catch {
        if (sessionEstablished) {
          // The Supabase session was established but the sync/profile step
          // failed. The user is authenticated — navigate to the intended
          // destination. The SIGNED_IN event will fire in the background and
          // the route guard will handle profile-completion routing if needed.
          navigate(next, { replace: true });
        } else {
          // The code exchange itself failed — the user is not authenticated.
          navigate('/login?error=auth', { replace: true });
        }
      }
    }

    handleCallback();
  }, [searchParams, navigate, syncAfterExternalAuth]);

  return <PageLoader />;
};

export default AuthCallbackPage;
