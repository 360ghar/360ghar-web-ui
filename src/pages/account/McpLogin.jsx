import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { useAuthStore } from '../../store/authStore';
import { getSupabaseAccessToken } from '../../services/supabaseClient';

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

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectUri = useMemo(
    () => searchParams.get('redirect_uri'),
    [searchParams]
  );
  const stateParam = useMemo(
    () => searchParams.get('state') || '',
    [searchParams]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!redirectUri || submitting) return;

      setSubmitting(true);
      clearError();

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
      const url = new URL(redirectUri);
      if (stateParam) {
        url.searchParams.set('state', stateParam);
      }
      url.searchParams.set('access_token', token);
      url.searchParams.set('token_type', 'bearer');

      window.location.href = url.toString();
    },
    [redirectUri, stateParam, submitting, login, phone, password, clearError]
  );

  if (!redirectUri) {
    return (
      <>
        <SEO
          title="Connect AI Assistant | 360Ghar"
          description="Securely connect your 360Ghar account to an AI assistant."
          canonical="/mcp/login"
          noindex
        />
        <main className="body-bg">
          <Header
            headerClass="dark-header has-border"
            headerMenusClass="mx-auto"
            btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
            btnLink="/add-new-listing"
            btnText="Add Listing"
            spanClass="icon-right text-gradient"
            showContactNumber={false}
          />

          <section className="section-padding">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-6">
                  <div className="card shadow-sm p-4 text-center">
                    <h1 className="mb-3">AI assistant connection link required</h1>
                    <p className="text-muted mb-0">
                      Open this page from a valid AI assistant connection flow to finish linking your 360Ghar account.
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
        title="Connect AI Assistant | 360Ghar"
        description="Securely connect your 360Ghar account to an AI assistant."
        canonical="/mcp/login"
        noindex
      />
      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/add-new-listing"
          btnText="Add Listing"
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <section className="section-padding">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="card shadow-sm p-4">
                  <h2 className="mb-3">Sign in to connect</h2>
                  <p className="text-muted mb-4">
                    Sign in with your phone number and password to securely
                    connect your 360Ghar account to your AI assistant. You can
                    revoke access at any time by logging out or rotating your
                    token.
                  </p>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label">
                        Phone number
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
                        Password
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
                      {isLoading || submitting ? 'Signing in…' : 'Sign in & connect'}
                    </button>

                    <p className="mt-3 small text-muted">
                      By continuing, you allow 360Ghar tools to access your
                      saved properties, swipes, and visits so the AI assistant
                      can personalize recommendations for you.
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
