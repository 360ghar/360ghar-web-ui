function StatCard({ label, value, icon }) {
  return (
    <div className="chatbot-stat-card">
      <span className="chatbot-stat-card__icon">{icon}</span>
      <span className="chatbot-stat-card__value">{value ?? '–'}</span>
      <span className="chatbot-stat-card__label">{label}</span>
    </div>
  );
}

export default function DashboardWidget({ data }) {
  if (!data) return null;

  const stats = [
    { label: 'Properties', value: data.total_properties ?? data.properties_count, icon: '🏠' },
    { label: 'Active Leases', value: data.active_leases ?? data.leases_count, icon: '📋' },
    { label: 'Pending Maintenance', value: data.pending_maintenance ?? data.maintenance_count, icon: '🔧' },
    { label: 'Pending Visits', value: data.pending_visits ?? data.visits_count, icon: '📅' },
  ].filter(s => s.value !== undefined && s.value !== null);

  if (stats.length === 0) return null;

  return (
    <div className="chatbot-widget chatbot-widget--dashboard">
      <div className="chatbot-widget__header">
        <span className="chatbot-widget__title">Dashboard Overview</span>
      </div>
      <div className="chatbot-stat-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
