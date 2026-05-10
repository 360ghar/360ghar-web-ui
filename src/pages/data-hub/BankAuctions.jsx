import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData } from '../../seo/structuredData';
import Pagination from '../../common/ui/Pagination';
import AuctionCard from '../../components/data-hub/AuctionCard';
import AuctionAlertModal from '../../components/data-hub/AuctionAlertModal';
import { dataHubService } from '../../services/dataHubService';

const FAQS = [
  {
    question: 'What are SARFAESI auctions?',
    answer: 'SARFAESI auctions are property auctions conducted by banks and financial institutions under the Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest (SARFAESI) Act, 2002. When a borrower defaults on a loan, the bank can recover dues by auctioning the secured property without court intervention, provided the default exceeds the threshold set by the RBI.',
  },
  {
    question: 'Can I get a loan for a bank-auctioned property?',
    answer: 'Yes, most banks offer loans for auctioned properties, but the process differs from regular home loans. You typically need to arrange 20-25% as earnest money deposit (EMD) upfront to participate in the auction. After winning the bid, you can apply for a loan for the balance amount. Some banks like SBI and Bank of Baroda have specific products for auction property financing.',
  },
  {
    question: 'Are bank auction properties cheaper than market price?',
    answer: 'Bank auction properties are often listed at reserve prices that can be 10-30% below prevailing market rates, especially if the bank wants a quick recovery. However, the final price depends on bidding competition. Properties with legal disputes or unclear titles may sell at deeper discounts but carry higher risk. Always verify the title and encumbrance status before bidding.',
  },
  {
    question: 'What are the risks of buying property through bank auctions?',
    answer: 'Key risks include: (1) The property may have pending legal disputes or litigations from the previous owner. (2) Physical possession may be difficult to obtain if occupants refuse to vacate. (3) There is usually no warranty on the property condition. (4) Outstanding dues like property tax, maintenance, or utility bills may be your responsibility. Always conduct thorough due diligence before bidding.',
  },
  {
    question: 'How can I participate in a bank auction in Delhi NCR?',
    answer: 'To participate: (1) Check auction notices on bank websites or portals like IBAPI, BankEAuctions, or eAuctionsIndia. (2) Download the auction notification and read the terms carefully. (3) Submit the Earnest Money Deposit (EMD) and required documents before the deadline. (4) Attend the auction (in-person or online). (5) If you win, pay the balance within the stipulated period (usually 15-30 days). Ensure you verify the property title and possession status beforehand.',
  },
  {
    question: 'What is the difference between SARFAESI, DRT, and IBC auctions?',
    answer: 'SARFAESI auctions are conducted by banks directly under the SARFAESI Act 2002 for NPA recovery. DRT (Debt Recovery Tribunal) auctions happen through court proceedings under the RDDBFI Act. IBC (Insolvency and Bankruptcy Code) auctions occur when a company goes through corporate insolvency resolution or liquidation, managed by insolvency professionals under IBBI oversight. Each has different timelines, processes, and buyer protections.',
  },
  {
    question: 'What are HSVP (formerly HUDA) e-auctions in Haryana?',
    answer: 'Haryana Shehri Vikas Pradhikaran (HSVP), formerly known as HUDA, conducts e-auctions for residential, commercial, industrial, and institutional plots across Haryana cities including Gurugram, Faridabad, and Panchkula. These are direct government auctions with no middlemen, often offering plots at below-market reserve prices. Auctions are held periodically through the HSVP e-Auction portal or the Procure247 platform.',
  },
  {
    question: 'How do DDA e-auctions work in Delhi?',
    answer: 'The Delhi Development Authority (DDA) periodically holds e-auctions (Mega e-Auction phases) for residential, commercial, and industrial plots across Delhi sectors through the DDA Bhoomi Portal (eservices.dda.org.in). You need to register on the portal, pay the earnest money online, and participate in the online bidding. DDA auctions are transparent and the allotment is done through the highest bidder system.',
  },
  {
    question: 'What is IBAPI and why is it important for bank auction properties?',
    answer: 'IBAPI (Indian Banks Auction Properties Information) is an RBI-mandated platform where all public sector banks — SBI, PNB, Bank of Baroda, Canara Bank, Union Bank, and others — are required to list their NPA auction properties. It is the single most comprehensive source for bank auction properties in India, with filters for city, bank, and property type. Since April 2025, IBBI also mandates listing insolvency liquidation assets exclusively on BaankNet/eBKray.',
  },
];

const PROPERTY_TYPES = ['residential', 'commercial', 'plot', 'industrial'];
const PAGE_LIMIT = 12;

const CITY_LABELS = {
  '': 'All Cities',
  'Delhi': 'Delhi',
  'Gurugram': 'Gurugram',
  'Meerut': 'Meerut',
  'Greater Noida': 'Greater Noida',
  'Delhi NCR': 'Delhi NCR',
};

const BankAuctions = () => {
  const { t } = useTranslation('data-hub');
  const [tSeo] = useTranslation('seo');
  const [auctions, setAuctions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [banks, setBanks] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({
    bank_name: '',
    property_type: '',
    price_min: '',
    price_max: '',
    date_from: '',
    date_to: '',
    auction_type: '',
    city: '',
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [error, setError] = useState(null);

  const [alertModal, setAlertModal] = useState({ isOpen: false, initialData: {} });

  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const selectedCityLabel = CITY_LABELS[filters.city] || filters.city || 'Delhi NCR';

  useEffect(() => {
    dataHubService.getAuctionBanks()
      .then((data) => setBanks(Array.isArray(data) ? data : []))
      .catch(() => {});
    dataHubService.getAuctionCities()
      .then((data) => setCities(Array.isArray(data) ? data : []))
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
    if (filters.auction_type) params.type = filters.auction_type;
    if (filters.city) params.city = filters.city;

    dataHubService.getAuctions(params)
      .then((data) => {
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
    setFilters({ bank_name: '', property_type: '', price_min: '', price_max: '', date_from: '', date_to: '', auction_type: '', city: '' });
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
        title={tSeo('bankAuctions.titleTemplate', { city: selectedCityLabel })}
        description={tSeo('bankAuctions.descriptionTemplate', { city: selectedCityLabel })}
        keywords="bank auctions Delhi NCR, SARFAESI auctions, HSVP e-auction Gurgaon, DDA auction Delhi, court ordered property auction, foreclosure properties, bank auction flats, property auction Haryana"
        canonical="/bank-auctions"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Bank Auctions', url: 'https://360ghar.com/bank-auctions' },
          ]),
          {
            '@type': 'ItemList',
            name: `Bank & Govt Property Auctions — ${selectedCityLabel}`,
            description: `SARFAESI auctions, court-ordered sales, and government authority property auctions in ${selectedCityLabel}.`,
            url: 'https://360ghar.com/bank-auctions',
            numberOfItems: total,
          },
          generateFaqStructuredData(FAQS),
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
                  {t('bankAuctions.description')}{' '}
                  <I18nLink to="/auction-sources" style={{ color: '#2563eb' }}>Learn about all auction sources →</I18nLink>
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
                      {/* City filter */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('bankAuctions.city')}</label>
                        <select
                          className="form-select form-select-sm"
                          value={filters.city}
                          onChange={(e) => handleFilterChange('city', e.target.value)}
                        >
                          <option value="">{t('bankAuctions.allCities')}</option>
                          {cities.map(c => (
                            <option key={c} value={c}>{CITY_LABELS[c] || c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Auction type radio */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('bankAuctions.sourceType')}</label>
                        {SOURCE_TYPES.map(({ label, value }) => (
                          <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13, cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="auction_type"
                              value={value}
                              checked={filters.auction_type === value}
                              onChange={() => handleFilterChange('auction_type', value)}
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

        {/* FAQ Section */}
        <section className="pb-60">
          <div className="container">
            <h2 className="fs-24 fw-600 mb-20">Frequently Asked Questions</h2>
            <div className="accordion">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div className="accordion-item border-0 border-bottom" key={faq.question}>
                    <h3 className="accordion-header" id={`dhFaqHeading${idx}`}>
                      <button className={`accordion-button ${isOpen ? '' : 'collapsed'}`} type="button" aria-expanded={isOpen} onClick={() => setOpenFaqIndex(cur => cur === idx ? -1 : idx)}>{faq.question}</button>
                    </h3>
                    <div className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}><div className="accordion-body text-muted">{faq.answer}</div></div>
                  </div>
                );
              })}
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
                  <I18nLink to="/properties" className="btn btn-white btn-main">{t('bankAuctions.cta.browseProperties')}</I18nLink>
                  <I18nLink to="/auction-sources" className="btn btn-outline-white">{t('bankAuctions.cta.auctionSources')}</I18nLink>
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
