import React from 'react';

const TYPE_COLORS = {
  land_acquisition: { bg: '#fef2f2', color: '#991b1b', label: 'Land Acquisition' },
  rate_revision: { bg: '#eff6ff', color: '#1d4ed8', label: 'Rate Revision' },
  policy: { bg: '#f0fdf4', color: '#166534', label: 'Policy' },
  clu_change: { bg: '#fefce8', color: '#854d0e', label: 'CLU Change' },
};

const GazetteItem = ({ item }) => {
  const typeInfo = TYPE_COLORS[item.notification_type] || { bg: '#f9fafb', color: '#374151', label: item.notification_type || 'Notification' };
  const date = item.notification_date ? new Date(item.notification_date).toLocaleDateString('en-IN') : null;

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff', display: 'flex', gap: 12 }}>
      <div style={{ flexShrink: 0 }}>
        {date && <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'center' }}>
          {date.split('/')[0]}<br />
          <span style={{ fontSize: 9 }}>{date.split('/').slice(1).join('/')}</span>
        </div>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, background: typeInfo.bg, color: typeInfo.color, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
            {typeInfo.label}
          </span>
          {item.department && <span style={{ fontSize: 11, color: '#6b7280' }}>{item.department}</span>}
        </div>
        <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.title}</p>
        {item.summary && <p style={{ margin: '0 0 6px', fontSize: 13, color: '#4b5563' }}>{item.summary}</p>}
        {item.pdf_url && (
          <a href={item.pdf_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#2563eb', display: 'inline-block', marginTop: 4 }}>
            📄 Download PDF
          </a>
        )}
      </div>
    </div>
  );
};

export default GazetteItem;
