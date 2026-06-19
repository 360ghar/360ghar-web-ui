function formatDate(dateStr) {
  if (!dateStr) return 'Date TBD';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

const STATUS_LABELS = {
  pending: { label: 'Pending', cls: 'chatbot-badge--warning' },
  confirmed: { label: 'Confirmed', cls: 'chatbot-badge--success' },
  completed: { label: 'Completed', cls: 'chatbot-badge--neutral' },
  cancelled: { label: 'Cancelled', cls: 'chatbot-badge--error' },
  scheduled: { label: 'Scheduled', cls: 'chatbot-badge--info' },
};

export default function VisitListWidget({ data }) {
  if (!data) return null;

  const visits = Array.isArray(data?.items) ? data.items : [];

  if (visits.length === 0) {
    return (
      <div className="chatbot-widget chatbot-widget--empty">
        <p>No visits scheduled.</p>
      </div>
    );
  }

  return (
    <div className="chatbot-widget chatbot-widget--visits">
      <div className="chatbot-widget__header">
        <span className="chatbot-widget__title">Visits</span>
        <span className="chatbot-widget__count">{visits.length}</span>
      </div>
      <ul className="chatbot-visit-list">
        {visits.slice(0, 5).map((visit, i) => {
          const status = STATUS_LABELS[visit.status] || { label: visit.status || 'Unknown', cls: 'chatbot-badge--neutral' };
          return (
            <li key={visit.id || i} className="chatbot-visit-item">
              <div className="chatbot-visit-item__main">
                <p className="chatbot-visit-item__property">{visit.property_title || visit.property?.title || 'Property'}</p>
                <p className="chatbot-visit-item__date">{formatDate(visit.scheduled_date || visit.check_in)}</p>
              </div>
              <span className={`chatbot-badge ${status.cls}`}>{status.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
