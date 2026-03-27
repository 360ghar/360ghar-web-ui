import React from 'react';

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

const AuctionCard = ({ auction, onSetAlert }) => {
  const isBank = !auction.case_number;
  const sourceBadge = isBank ? (auction.source || 'SARFAESI').toUpperCase() : 'Court Order';
  const reservePrice = auction.reserve_price;
  const auctionDate = auction.auction_date
    ? new Date(auction.auction_date).toLocaleDateString('en-IN')
    : 'TBD';

  return (
    <div className="auction-card" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, background: isBank ? '#dbeafe' : '#fef3c7', color: isBank ? '#1e40af' : '#92400e', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
          {sourceBadge}
        </span>
        {(auction.bank_name || auction.court_name) && (
          <span style={{ fontSize: 11, color: '#6b7280' }}>{auction.bank_name || auction.court_name}</span>
        )}
      </div>
      <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14, color: '#111827' }}>
        {auction.property_description || auction.property_type || 'Property'}
      </p>
      {auction.full_address && (
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>{auction.full_address}</p>
      )}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Reserve Price</span>
          <p style={{ margin: 0, fontWeight: 700, color: '#111827' }}>{fmt(reservePrice)}</p>
        </div>
        {auction.emd_amount && (
          <div>
            <span style={{ fontSize: 11, color: '#6b7280' }}>EMD</span>
            <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{fmt(auction.emd_amount)}</p>
          </div>
        )}
        <div>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Auction Date</span>
          <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{auctionDate}</p>
        </div>
      </div>
      {onSetAlert && (
        <button onClick={() => onSetAlert(auction)} style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          🔔 Set Alert
        </button>
      )}
    </div>
  );
};

export default AuctionCard;
