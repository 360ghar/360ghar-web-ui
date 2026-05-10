import { Component } from 'react';

export default class ErrorBoundary extends Component {
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
            Something went wrong
          </h2>
          <p style={{
            color: 'var(--text-secondary, #777777)',
            fontSize: '16px',
            maxWidth: '480px',
            marginBottom: '24px',
          }}>
            An unexpected error occurred. Please try again or navigate back to the home page.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: 'var(--main-color, #ff6b00)',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Go Home
            </a>
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
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
