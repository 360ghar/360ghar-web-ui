import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import Pagination from '../../common/ui/Pagination';
import AuctionCard from '../../components/data-hub/AuctionCard';
import AuctionAlertModal from '../../components/data-hub/AuctionAlertModal';
import { dataHubService } from '../../services/dataHubService';

const PROPERTY_TYPES = ['residential', 'commercial', 'plot', 'industrial'];
const PAGE_LIMIT = 12;

const BankAuctions = () => {
  const { t } = useTranslation('data-hub');
  const [auctions, setAuctions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [banks, setBanks] = useState([]);
  const [filters, setFilters] = useState({
    bank_name: '',
    property_type: '',
    price_min: '',
    price_max: '',
    date_from: '',
    date_to: '',
    source_type: '',
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Alert modal state
  const [alertModal, setAlertModal] = useState({ isOpen: false, initialData: {} });

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  // Fetch bank list once
  useEffect(() => {
    dataHubService.getAuctionBanks()
      .then((data) => setBanks(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = { page, limit: PAGE_LIMIT };
    if (filters.bank_name) params.bank = filters.bank_name;
    if (filters.property_type) params.property_type = filters.property_type;
    if (filters.price_min) params.min_price = Number(filters.price_min);
    if (filters.price_max) params.max_price = Number(filters.price_max);
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.source_type) params.type = filters.source_type;

    dataHubService.getAuctions(params)
      .then((data) => {
        // Sort by auction_date ascending
        const items = data?.items || [];
        items.sort((a, b) => {
          if (!a.auction_date) return 1;
          if (!b.auction_date) return -1;
          return new Date(a.auction_date) - new Date(b.auction_date);
        });
        setAuctions(items);
        setTotal(data?.total || 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ bank_name: '', property_type: '', price_min: '', price_max: '', date_from: '', date_to: '', source_type: '' });
    setPage(1);
  };

  const openAlert = (auction) => {
    setAlertModal({
      isOpen: true,
      initialData: {
        bank_name: auction.bank_name || '',
        property_type: auction.property_type || '',
      },
    });
  };

  const SOURCE_TYPES = [
    { label: t('bankAuctions.sourceTypes.all'), value: '' },
    { label: t('bankAuctions.sourceTypes.bank'), value: 'bank' },
    { label: t('bankAuctions.sourceTypes.court'), value: 'court' },
  ];

  return (
    <>
      <SEO
        title="Bank & Court Auctions Gurugram | Property Auctions | 360Ghar"
        description="Browse bank auctions (SARFAESI) and court-ordered property auctions in Gurugram. Find foreclosed properties from SBI, HDFC, ICICI and other lenders at reserve prices."
        keywords="bank auctions Gurugram, SARFAESI auctions, court ordered property auction, foreclosure properties Gurgaon, bank auction flats, property auction Haryana"
        canonical="/bank-auctions"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Bank Auctions', url: 'https://360ghar.com/bank-auctions' },
          ]),
          {
            '@type': 'ItemList',
            name: 'Bank & Court Property Auctions — Gurugram',
            description: 'SARFAESI auctions and court-ordered property sales in Gurugram.',
            url: 'https://360ghar.com/bank-auctions',
            numberOfItems: total,
          },
        ]}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />

        <section className="pt-60 pb-60">
          <div className="container">
            <div className="row mb-20">
              <div className="col-12">
                <h1 className="fs-28 fw-600 mb-10">{t('bankAuctions.title')}</h1>
                <p className="mb-0 color-text-3">
                  {t('bankAuctions.description')}
                </p>
              </div>
            </div>

            <div className="row">
              {/* Sidebar Filters */}
              <div className="col-lg-3 col-md-4 col-12 mb-30">
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                  <button
                    onClick={() => setSidebarOpen(o => !o)}
                    style={{ width: '100%', background: '#f8fafc', border: 'none', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    {t('bankAuctions.filters')}
                    <i className={`fas fa-chevron-${sidebarOpen ? 'up' : 'down'}`} style={{ fontSize: 12 }}></i>
                  </button>

                  {sidebarOpen && (
                    <div style={{ padding: 16 }}>
                      {/* Source type radio */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('bankAuctions.sourceType')}</label>
                        {SOURCE_TYPES.map(({ label, value }) => (
                          <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13, cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="source_type"
                              value={value}
                              checked={filters.source_type === value}
                              onChange={() => handleFilterChange('source_type', value)}
                            />
                            {label}
                          </label>
                        ))}
                      </div>

                      {/* Bank dropdown */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('bankAuctions.bankSource')}</label>
                        <select
                          className="form-select form-select-sm"
                          value={filters.bank_name}
                          onChange={(e) => handleFilterChange('bank_name', e.target.value)}
                        >
                          <option value="">{t('bankAuctions.allBanks')}</option>
                          {banks.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>

                      {/* Property type */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('bankAuctions.propertyType')}</label>
                        <select
                          className="form-select form-select-sm"
                          value={filters.property_type}
                          onChange={(e) => handleFilterChange('property_type', e.target.value)}
                        >
                          <option value="">{t('bankAuctions.allTypes')}</option>
                          {PROPERTY_TYPES.map(pt => (
                            <option key={pt} value={pt} style={{ textTransform: 'capitalize' }}>{pt.charAt(0).toUpperCase() + pt.slice(1)}</option>
                          ))}
                        </select>
                      </div>

                      {/* Price range */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('bankAuctions.priceRange')}</label>
                        <div className="d-flex gap-2">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder={t('bankAuctions.min')}
                            value={filters.price_min}
                            onChange={(e) => handleFilterChange('price_min', e.target.value)}
                            min="0"
                          />
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder={t('bankAuctions.max')}
                            value={filters.price_max}
                            onChange={(e) => handleFilterChange('price_max', e.target.value)}
                            min="0"
                          />
                        </div>
                      </div>

                      {/* Date range */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('bankAuctions.auctionDate')}</label>
                        <div className="d-flex flex-column gap-2">
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            placeholder="From"
                            value={filters.date_from}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                          />
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            placeholder="To"
                            value={filters.date_to}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        className="btn btn-sm btn-outline-secondary w-100"
                        onClick={clearFilters}
                      >
                        {t('bankAuctions.clearFilters')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Main content */}
              <div className="col-lg-9 col-md-8 col-12">
                {loading ? (
                  <div className="row g-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="col-md-6 col-12">
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
                          <div style={{ height: 14, background: '#e5e7eb', borderRadius: 4, marginBottom: 10, width: '40%' }}></div>
                          <div style={{ height: 16, background: '#e5e7eb', borderRadius: 4, marginBottom: 8, width: '80%' }}></div>
                          <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, width: '60%' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-40">
                    <p className="color-danger fs-16">{t('bankAuctions.error')}</p>
                  </div>
                ) : auctions.length === 0 ? (
                  <div className="text-center py-40">
                    <i className="fas fa-gavel" style={{ fontSize: 48, color: '#d1d5db', display: 'block', marginBottom: 16 }}></i>
                    <p className="fs-16 color-text-3">{t('bankAuctions.noResults')}</p>
                    <button className="btn btn-sm btn-outline-secondary mt-10" onClick={clearFilters}>{t('bankAuctions.clearFilters')}</button>
                  </div>
                ) : (
                  <>
                    <p className="mb-20 fs-14 color-text-3">{t('bankAuctions.auctionsFound', { count: total, suffix: total !== 1 ? 's' : '' })}</p>
                    <div className="row g-3 mb-30">
                      {auctions.map((auction) => (
                        <div key={auction.id} className="col-md-6 col-12">
                          <AuctionCard auction={auction} onSetAlert={openAlert} />
                        </div>
                      ))}
                    </div>
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section bg-main text-white padding-y-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="cta-title mb-3">{t('bankAuctions.cta.title')}</h2>
                <p className="mb-4">{t('bankAuctions.cta.description')}</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <a href="/properties" className="btn btn-white btn-main">{t('bankAuctions.cta.browseProperties')}</a>
                  <a href="/contact" className="btn btn-outline-white">{t('bankAuctions.cta.contactUs')}</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <AuctionAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, initialData: {} })}
        initialData={alertModal.initialData}
      />
    </>
  );
};

export default BankAuctions;
