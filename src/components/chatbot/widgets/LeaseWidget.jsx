function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatAmount(amount) {
  if (!amount) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export default function LeaseWidget({ data }) {
  if (!data) return null;

  const lease = data.lease || data;
  const { property_title, tenant_name, start_date, end_date, rent_amount, status } = lease;

  return (
    <div className="chatbot-widget chatbot-widget--lease">
      <div className="chatbot-widget__header">
        <span className="chatbot-widget__title">Lease Details</span>
        {status && <span className={`chatbot-badge chatbot-badge--${status === 'active' ? 'success' : 'neutral'}`}>{status}</span>}
      </div>
      <div className="chatbot-widget__body">
        {property_title && <p><strong>Property:</strong> {property_title}</p>}
        {tenant_name && <p><strong>Tenant:</strong> {tenant_name}</p>}
        {rent_amount && <p><strong>Rent:</strong> {formatAmount(rent_amount)}/mo</p>}
        {(start_date || end_date) && (
          <p><strong>Period:</strong> {formatDate(start_date)} – {formatDate(end_date)}</p>
        )}
      </div>
    </div>
  );
}
