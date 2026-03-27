import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dataHubService } from '../../services/dataHubService';

const CircleRateBanner = ({ sector }) => {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    if (!sector) return;
    dataHubService.getCircleRates({ sector, limit: 3 })
      .then((data) => setRates(data?.items || []))
      .catch(() => {});
  }, [sector]);

  if (!rates.length) return null;

  const latest = rates[0];
  const rateDisplay = latest.rate_per_sqyd
    ? `₹${Number(latest.rate_per_sqyd).toLocaleString('en-IN')}/sq yd`
    : latest.rate_per_sqft
    ? `₹${Number(latest.rate_per_sqft).toLocaleString('en-IN')}/sq ft`
    : null;

  if (!rateDisplay) return null;

  return (
    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
      <span>
        <strong>Circle Rate ({sector}): {rateDisplay}</strong>
        {latest.property_type && <span style={{ color: '#6b7280', marginLeft: 6 }}>({latest.property_type})</span>}
      </span>
      <Link to="/circle-rates" style={{ color: '#2563eb', fontWeight: 600 }}>View All →</Link>
    </div>
  );
};

export default CircleRateBanner;
