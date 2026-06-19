import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { useAuthStore } from '../../store/authStore';
import { getSupabaseAccessToken } from '../../services/supabaseClient';

const ALLOWED_MCP_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://claude.ai',
  'https://chatgpt.com',
  'https://chat.openai.com',
  'https://cursor.sh',
  'https://app.factory.ai',
];

function isAllowedRedirect(uri) {
  try {
    const { origin } = new URL(uri);
    return ALLOWED_MCP_ORIGINS.includes(origin);
  } catch {
    return false;
  }
}

/**
 * MCP-specific login flow.
 *
 * This page is intended to be opened by MCP clients (e.g. Claude) as part of a
 * browser-based OAuth-style flow. It reuses the existing phone+password login
 * logic and, on success, redirects back to the client's redirect_uri with an
 * access token in the URL so the client can complete its flow.
 */
const McpLogin = () => {
  const [searchParams] = useSearchParams();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { t } = useTranslation('account');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redirectError, setRedirectError] = useState(false);

  const redirectUri = useMemo(
    () => searchParams.get('redirect_uri'),
    [searchParams]
  );
  const stateParam = useMemo(
    () => searchParams.get('state') || '',
    [searchParams]
  );

  const isRedirectAllowed = useMemo(
    () => !redirectUri || isAllowedRedirect(redirectUri),
    [redirectUri]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!redirectUri || submitting) return;

      // CRITICAL FIX (audit 1.2 / 1.11): Use the memoized allowlist check and
      // never leak the access token in a URL query parameter. Query params are
      // captured by server logs, browser history, Referer headers, and
      // analytics. Use the URL fragment (#) instead, which is never sent to
      // the server.
      if (!isRedirectAllowed) {
        setRedirectError(true);
        setSubmitting(false);
        return;
      }

      setSubmitting(true);
      clearError();
      setRedirectError(false);

      const ok = await login(phone, password);
      if (!ok) {
        setSubmitting(false);
        return;
      }

      const token = await getSupabaseAccessToken();
      if (!token) {
        setSubmitting(false);
        return;
      }

      // Build final redirect URL for the MCP client, preserving its `state`.
      // Token goes in the fragment so it never reaches a server log or Referer.
      const url = new URL(redirectUri);
      if (stateParam) {
        url.searchParams.set('state', stateParam);
      }
      url.hash = `access_token=${encodeURIComponent(token)}&token_type=bearer`;

      window.location.href = url.toString();
    },
    [redirectUri, stateParam, submitting, login, phone, password, clearError, isRedirectAllowed]
  );

  if (!redirectUri) {
    return (
      <>
        <SEO
          title={t('mcp.title')}
          description={t('mcp.description')}
          canonical="/mcp/login"
          noindex
        />
        <main className="body-bg">
          <Header
            headerClass="dark-header has-border"
            headerMenusClass="mx-auto"
            btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
            btnLink="/add-new-listing"
            btnText={t('common.postProperty')}
            spanClass="icon-right text-gradient"
            showContactNumber={false}
          />

          <section className="section-padding">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-6">
                  <div className="card shadow-sm p-4 text-center">
                    <h1 className="mb-3">{t('mcp.linkRequired')}</h1>
                    <p className="text-muted mb-0">
                      {t('mcp.linkRequiredDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (!isRedirectAllowed) {
    return (
      <>
        <SEO
          title={t('mcp.title')}
          description={t('mcp.description')}
          canonical="/mcp/login"
          noindex
        />
        <main className="body-bg">
          <Header
            headerClass="dark-header has-border"
            headerMenusClass="mx-auto"
            btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
            btnLink="/add-new-listing"
            btnText={t('common.postProperty')}
            spanClass="icon-right text-gradient"
            showContactNumber={false}
          />

          <section className="section-padding">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-6">
                  <div className="card shadow-sm p-4 text-center">
                    <h1 className="mb-3">{t('mcp.invalidRedirect')}</h1>
                    <p className="text-muted mb-0">
                      {t('mcp.invalidRedirectDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO
        title={t('mcp.title')}
        description={t('mcp.description')}
        canonical="/mcp/login"
        noindex
      />
      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/add-new-listing"
          btnText={t('common.postProperty')}
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <section className="section-padding">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="card shadow-sm p-4">
                  <h2 className="mb-3">{t('mcp.signInToConnect')}</h2>
                  <p className="text-muted mb-4">
                    {t('mcp.signInToConnectDesc')}
                  </p>

                  {(error || redirectError) && (
                    <div className="alert alert-danger" role="alert">
                      {redirectError ? t('mcp.invalidRedirect') : error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label">
                        {t('mcp.phoneNumber')}
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className="form-control"
                        placeholder="+919876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        {t('mcp.password')}
                      </label>
                      <input
                        id="password"
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-main w-100"
                      disabled={isLoading || submitting}
                    >
                      {isLoading || submitting ? t('mcp.signingIn') : t('mcp.signInConnect')}
                    </button>

                    <p className="mt-3 small text-muted">
                      {t('mcp.consent')}
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Cta ctaClass="" />
        <Footer />
      </main>
    </>
  );
};

export default McpLogin;
