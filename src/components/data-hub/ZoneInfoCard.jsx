import React, { useEffect, useState } from 'react';
import { I18nLink } from '../../i18n/I18nLink';
import { dataHubService } from '../../services/dataHubService';

const ZoneInfoCard = ({ sector }) => {
  const [zone, setZone] = useState(null);

  useEffect(() => {
    if (!sector) return;
    dataHubService.getZoningData({ sector, limit: 1 })
      .then((data) => setZone(data?.items?.[0] || null))
      .catch(() => {});
  }, [sector]);

  if (!zone) return null;

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#f9fafb' }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#111827' }}>Zone Information</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          ['Land Use', zone.land_use],
          ['FAR Limit', zone.far],
          ['Max Height', zone.max_height_m ? `${zone.max_height_m}m` : null],
          ['Coverage', zone.ground_coverage_pct ? `${zone.ground_coverage_pct}%` : null],
        ].map(([label, val]) => val ? (
          <div key={label}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{label}</span>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{val}</p>
          </div>
        ) : null)}
      </div>
      <I18nLink to={`/zone-checker/${zone.slug}`} style={{ fontSize: 12, color: '#2563eb', display: 'block', marginTop: 8 }}>
        Full zone details →
      </I18nLink>
    </div>
  );
};

export default ZoneInfoCard;
