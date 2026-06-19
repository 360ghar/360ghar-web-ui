import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * AUDIT FIX (imp 5.9): shows a non-blocking banner when the browser is offline
 * so users understand why the chatbot, search, or property results may fail.
 * The banner auto-hides when connectivity is restored.
 */
const OfflineIndicator = () => {
  const { t } = useTranslation('common');
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="offline-indicator"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10001,
        background: 'var(--danger-color, #dc3545)',
        color: '#fff',
        padding: '10px 16px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 600,
      }}
    >
      <i className="fas fa-wifi me-2" aria-hidden="true"></i>
      {t('offlineIndicator.message', 'You are offline. Some features may be unavailable.')}
    </div>
  );
};

export default OfflineIndicator;
