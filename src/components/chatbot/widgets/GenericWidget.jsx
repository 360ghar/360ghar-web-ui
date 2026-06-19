import { useTranslation } from 'react-i18next';

function formatValue(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString('en-IN');
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function formatKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function GenericWidget({ data, widgetName }) {
  const { t } = useTranslation('common');
  if (!data) return null;

  const title = widgetName?.replace(/Widget$/, '') || t('chatbot.widgets.resultTitle');

  // Get only primitive/simple values from the top level to avoid nested mess
  const entries = Object.entries(data).filter(([, v]) =>
    v !== null && v !== undefined && typeof v !== 'object' || Array.isArray(v) && v.length === 0
  );

  if (entries.length === 0 && typeof data === 'object') {
    return (
      <div className="chatbot-widget chatbot-widget--generic">
        <div className="chatbot-widget__header">
          <span className="chatbot-widget__title">{title}</span>
        </div>
        <p className="chatbot-widget__empty">{t('chatbot.widgets.resultReceived')}</p>
      </div>
    );
  }

  return (
    <div className="chatbot-widget chatbot-widget--generic">
      <div className="chatbot-widget__header">
        <span className="chatbot-widget__title">{title}</span>
      </div>
      <dl className="chatbot-widget__kv">
        {entries.slice(0, 8).map(([key, value]) => (
          <div key={key} className="chatbot-widget__kv-row">
            <dt className="chatbot-widget__kv-key">{formatKey(key)}</dt>
            <dd className="chatbot-widget__kv-value">{formatValue(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
