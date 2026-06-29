import { Component } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import i18n from '../i18n';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  // CRITICAL FIX (audit 5.6): reset the error state when the route changes
  // (via the `resetKey` prop wired by the wrapper below) so navigating away
  // from a crashed page recovers automatically instead of staying stuck on
  // the error screen.
  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-primary, #181616)',
            marginBottom: '12px',
            fontFamily: 'var(--font-heading, Cinzel, serif)',
          }}>
            {i18n.t('errorBoundary.title', { ns: 'common' })}
          </h2>
          <p style={{
            color: 'var(--text-secondary, #777777)',
            fontSize: '16px',
            maxWidth: '480px',
            marginBottom: '24px',
          }}>
            {i18n.t('errorBoundary.description', { ns: 'common' })}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => this.props.navigate ? this.props.navigate('/') : (window.location.href = '/')}
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: 'var(--main-color, #ff6b00)',
                color: '#fff',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {i18n.t('errorBoundary.goHome', { ns: 'common' })}
            </button>
            <button
              onClick={this.handleReset}
              type="button"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: 'transparent',
                color: 'var(--main-color, #ff6b00)',
                border: '1px solid var(--main-color, #ff6b00)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {i18n.t('errorBoundary.tryAgain', { ns: 'common' })}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper that binds the ErrorBoundary to the current route so it auto-resets
 * on navigation. Use this as the default export in the app tree.
 */
function ErrorBoundaryWithRoute(props) {
  const location = useLocation();
  const navigate = useNavigate();
  return <ErrorBoundary resetKey={location.pathname} navigate={navigate} {...props} />;
}

export default ErrorBoundaryWithRoute;
export { ErrorBoundary };
