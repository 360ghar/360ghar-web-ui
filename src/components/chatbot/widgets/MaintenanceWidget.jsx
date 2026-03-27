function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

const PRIORITY_CLASSES = {
  high: 'chatbot-badge--error',
  medium: 'chatbot-badge--warning',
  low: 'chatbot-badge--neutral',
  urgent: 'chatbot-badge--error',
};

export default function MaintenanceWidget({ data }) {
  if (!data) return null;

  const requests = data.requests || data.items || data.maintenance_requests || [];

  if (requests.length === 0) {
    return (
      <div className="chatbot-widget chatbot-widget--empty">
        <p>No maintenance requests found.</p>
      </div>
    );
  }

  return (
    <div className="chatbot-widget chatbot-widget--maintenance">
      <div className="chatbot-widget__header">
        <span className="chatbot-widget__title">Maintenance Requests</span>
        <span className="chatbot-widget__count">{requests.length}</span>
      </div>
      <ul className="chatbot-maintenance-list">
        {requests.slice(0, 5).map((req, i) => (
          <li key={req.id || i} className="chatbot-maintenance-item">
            <div className="chatbot-maintenance-item__main">
              <p className="chatbot-maintenance-item__title">{req.title || req.description || 'Request'}</p>
              {req.created_at && <p className="chatbot-maintenance-item__date">{formatDate(req.created_at)}</p>}
            </div>
            <div className="chatbot-maintenance-item__badges">
              {req.priority && (
                <span className={`chatbot-badge ${PRIORITY_CLASSES[req.priority] || 'chatbot-badge--neutral'}`}>
                  {req.priority}
                </span>
              )}
              {req.status && (
                <span className="chatbot-badge chatbot-badge--neutral">{req.status}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
