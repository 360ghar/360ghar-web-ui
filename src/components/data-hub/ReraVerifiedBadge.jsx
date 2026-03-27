import React from 'react';

const ReraVerifiedBadge = ({ reraNumber, small = false }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: '#dcfce7', color: '#166534',
    padding: small ? '2px 6px' : '4px 10px',
    borderRadius: 4, fontSize: small ? 11 : 13, fontWeight: 600,
  }}>
    ✓ RERA Verified
    {reraNumber && !small && <span style={{ fontWeight: 400, marginLeft: 4 }}>({reraNumber})</span>}
  </span>
);

export default ReraVerifiedBadge;
