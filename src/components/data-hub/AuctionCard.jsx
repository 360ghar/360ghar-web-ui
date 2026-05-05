const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

const SOURCE_META = {
  // Central / Quasi-Govt — teal
  ibapi: { label: 'IBAPI', bg: '#ccfbf1', color: '#0f766e' },
  ibbi: { label: 'IBBI', bg: '#ccfbf1', color: '#0f766e' },
  baanknet: { label: 'BaankNet', bg: '#ccfbf1', color: '#0f766e' },
  mstc: { label: 'MSTC', bg: '#ccfbf1', color: '#0f766e' },
  // Delhi govt — orange
  dda: { label: 'DDA', bg: '#ffedd5', color: '#9a3412' },
  dfc_delhi: { label: 'DFC Delhi', bg: '#ffedd5', color: '#9a3412' },
  drt: { label: 'DRT', bg: '#ffedd5', color: '#9a3412' },
  ecourts: { label: 'eCourts', bg: '#ffedd5', color: '#9a3412' },
  // Gurugram/Haryana govt — green
  hsvp: { label: 'HSVP', bg: '#dcfce7', color: '#166534' },
  hsvp_procure247: { label: 'HSVP', bg: '#dcfce7', color: '#166534' },
  dtcp: { label: 'DTCP', bg: '#dcfce7', color: '#166534' },
  // Meerut/UP govt — emerald
  mda: { label: 'MDA', bg: '#d1fae5', color: '#065f46' },
  yeida: { label: 'YEIDA', bg: '#d1fae5', color: '#065f46' },
  // Aggregators — purple
  bank_eauctions: { label: 'BankEAuctions', bg: '#ede9fe', color: '#5b21b6' },
  eauctions_india: { label: 'eAuctionsIndia', bg: '#ede9fe', color: '#5b21b6' },
  auction_bazaar: { label: 'AuctionBazaar', bg: '#ede9fe', color: '#5b21b6' },
  eauction_dekho: { label: 'eAuctionDekho', bg: '#ede9fe', color: '#5b21b6' },
  findauction: { label: 'FindAuction', bg: '#ede9fe', color: '#5b21b6' },
  findauction_prop: { label: 'FindAuctionProp', bg: '#ede9fe', color: '#5b21b6' },
  auction_tiger: { label: 'AuctionTiger', bg: '#ede9fe', color: '#5b21b6' },
  // Individual banks — blue
  sarfaesi: { label: 'SARFAESI', bg: '#dbeafe', color: '#1e40af' },
  sbi: { label: 'SBI', bg: '#dbeafe', color: '#1e40af' },
  pnb: { label: 'PNB', bg: '#dbeafe', color: '#1e40af' },
  bob: { label: 'BOB', bg: '#dbeafe', color: '#1e40af' },
  canara: { label: 'Canara', bg: '#dbeafe', color: '#1e40af' },
  hdfc: { label: 'HDFC', bg: '#dbeafe', color: '#1e40af' },
  icici: { label: 'ICICI', bg: '#dbeafe', color: '#1e40af' },
  union: { label: 'Union', bg: '#dbeafe', color: '#1e40af' },
  yes_bank: { label: 'Yes Bank', bg: '#dbeafe', color: '#1e40af' },
};

const COURT_BADGE = { label: 'Court Order', bg: '#fef3c7', color: '#92400e' };

const getSourceBadge = (auction) => {
  if (auction.case_number) return COURT_BADGE;
  const source = auction.source || 'sarfaesi';
  return SOURCE_META[source] || { label: source.toUpperCase(), bg: '#f3f4f6', color: '#374151' };
};

const AuctionCard = ({ auction, onSetAlert }) => {
  const badge = getSourceBadge(auction);
  const reservePrice = auction.reserve_price;
  const auctionDate = auction.auction_date
    ? new Date(auction.auction_date).toLocaleDateString('en-IN')
    : 'TBD';
  const address = auction.full_address || auction.address || auction.locality;

  return (
    <div className="auction-card" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, background: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
          {badge.label}
        </span>
        {(auction.bank_name || auction.court_name) && (
          <span style={{ fontSize: 11, color: '#6b7280' }}>{auction.bank_name || auction.court_name}</span>
        )}
      </div>
      <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14, color: '#111827' }}>
        {auction.property_description || auction.property_type || 'Property'}
      </p>
      {address && (
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>{address}</p>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {onSetAlert && (
          <button onClick={() => onSetAlert(auction)} style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Set Alert
          </button>
        )}
        {auction.source_url && (
          <a href={auction.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'none' }}>
            View on source
          </a>
        )}
      </div>
    </div>
  );
};

export default AuctionCard;
export { SOURCE_META };
