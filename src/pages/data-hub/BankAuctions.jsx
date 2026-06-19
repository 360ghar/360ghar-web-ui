import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { ToolFaq, ToolRelatedLinks } from '../../components/tools/ToolContentSections';
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

const HOW_TO_STEPS = [
  {
    name: 'Browse Available Auctions',
    text: 'Search through current bank auction properties across India. Filter by location, property type, price range, and auctioning bank to find properties that match your criteria.',
  },
  {
    name: 'Review Property Details',
    text: 'Check the property description, reserve price, auction date, and bank contact details. Note the EMD (Earnest Money Deposit) amount and any inspection dates available.',
  },
  {
    name: 'Register for the Auction',
    text: 'Contact the auctioning bank or visit their e-auction portal to register. You\'ll need to submit KYC documents and pay the EMD (typically 10% of reserve price) before the auction date.',
  },
  {
    name: 'Participate and Bid',
    text: 'Attend the auction (online or physical) on the scheduled date. Place your bids starting from the reserve price. The highest bidder wins and must complete payment within the stipulated timeline (usually 30-90 days).',
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
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
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
  const [error, setError] = useState(null);

  const [alertModal, setAlertModal] = useState({ isOpen: false, initialData: {} });

  const selectedCityLabel = CITY_LABELS[filters.city] || filters.city || 'Delhi NCR';

  // Sort auction items by auction_date ascending (nulls last). Applied to the
  // full accumulated list so ordering stays consistent across appended pages.
  const sortAuctions = (items) => [...items].sort((a, b) => {
    if (!a.auction_date) return 1;
    if (!b.auction_date) return -1;
    return new Date(a.auction_date) - new Date(b.auction_date);
  });

  // Build the request params (excluding cursor) for the current filter set.
  const buildFilterParams = () => {
    const params = {};
    if (filters.bank_name) params.bank = filters.bank_name;
    if (filters.property_type) params.property_type = filters.property_type;
    if (filters.price_min) params.min_price = Number(filters.price_min);
    if (filters.price_max) params.max_price = Number(filters.price_max);
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.auction_type) params.type = filters.auction_type;
    if (filters.city) params.city = filters.city;
    return params;
  };

  useEffect(() => {
    dataHubService.getAuctionBanks()
      .then((data) => setBanks(Array.isArray(data) ? data : []))
      .catch(() => {});
    dataHubService.getAuctionCities()
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Fetch the first page (cursor=null) whenever filters change.
  useEffect(() => {
    const params = { limit: PAGE_LIMIT, ...buildFilterParams() };

    // CRITICAL FIX (audit 3.8): reset error/loading at the start of every
    // fetch so a previous failure doesn't persist after a successful retry.
    setLoading(true);
    setError(null);
    dataHubService.getAuctions(params)
      .then((data) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        setAuctions(sortAuctions(items));
        setNextCursor(data?.next_cursor ?? null);
        setHasMore(Boolean(data?.has_more));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- buildFilterParams depends only on filters
  }, [filters]);

  // Cursor "Load more": fetch the next page using the opaque cursor token.
  const handleLoadMore = async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = { limit: PAGE_LIMIT, cursor: nextCursor, ...buildFilterParams() };
      const data = await dataHubService.getAuctions(params);
      const items = Array.isArray(data?.items) ? data.items : [];
      setAuctions(prev => sortAuctions([...prev, ...items]));
      setNextCursor(data?.next_cursor ?? null);
      setHasMore(Boolean(data?.has_more));
    } catch {
      // Silently ignore; user can retry via Load More.
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ bank_name: '', property_type: '', price_min: '', price_max: '', date_from: '', date_to: '', auction_type: '', city: '' });
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
          generateToolSchema(toolSchemas.bankAuctions),
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Bank Auctions', url: 'https://360ghar.com/bank-auctions' },
          ]),
          {
            '@type': 'ItemList',
            name: `Bank & Govt Property Auctions — ${selectedCityLabel}`,
            description: `SARFAESI auctions, court-ordered sales, and government authority property auctions in ${selectedCityLabel}.`,
            url: 'https://360ghar.com/bank-auctions',
            numberOfItems: auctions.length,
          },
          generateFaqStructuredData(FAQS),
          generateHowToStructuredData({
            name: 'How to Buy Property at Bank Auction in India',
            description: 'Step-by-step guide to finding and purchasing bank auction properties including SARFAESI, DRT, and government e-auctions.',
            steps: HOW_TO_STEPS,
          }),
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
                {/* AUDIT FIX (imp 3.19): consistent breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-20">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><I18nLink to="/">Home</I18nLink></li>
                    <li className="breadcrumb-item"><I18nLink to="/bank-auctions">Data Hub</I18nLink></li>
                    <li className="breadcrumb-item active">Bank Auctions</li>
                  </ol>
                </nav>
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
                    <p className="mb-20 fs-14 color-text-3">{t('bankAuctions.auctionsFound', { count: auctions.length, suffix: auctions.length !== 1 ? 's' : '' })}</p>
                    <div className="row g-3 mb-30">
                      {auctions.map((auction) => (
                        <div key={auction.id} className="col-md-6 col-12">
                          <AuctionCard auction={auction} onSetAlert={openAlert} />
                        </div>
                      ))}
                    </div>
                    {/* Cursor-based Load more */}
                    {hasMore && (
                      <div className="text-center mt-3">
                        <button
                          type="button"
                          className="btn btn-outline-main"
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                        >
                          {loadingMore ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Loading...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-plus me-1"></i> Load More
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <ToolFaq faqs={FAQS} heading="Bank Auction FAQs" />

        {/* Educational Content Sections */}
        <section className="pb-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">

                {/* Section 1: What Are Bank Auction Properties? */}
                <div className="mb-5">
                  <h2 className="fs-24 fw-600 mb-3">What Are Bank Auction Properties?</h2>
                  <p>
                    Bank auction properties are real estate assets seized by banks and financial institutions when borrowers default on their loans. Under the SARFAESI Act (Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest Act, 2002), banks can recover outstanding dues by auctioning the secured property without court intervention, provided the loan amount exceeds the threshold set by the RBI.
                  </p>
                  <p>
                    These properties are sold through various channels including SARFAESI auctions, DRT (Debt Recovery Tribunal) proceedings, and IBC (Insolvency and Bankruptcy Code) liquidation. They can be residential, commercial, or industrial in nature and are typically priced 20-40% below prevailing market rates, making them attractive opportunities for buyers looking for below-market deals.
                  </p>
                  <p>
                    Major banks like SBI, HDFC, ICICI, PNB, Bank of Baroda, and Canara Bank regularly list their NPA (Non-Performing Asset) properties on platforms like IBAPI (Indian Banks Auction Properties Information) and their individual e-auction portals. Government authorities like HSVP (Haryana Shehri Vikas Pradhikaran) and DDA (Delhi Development Authority) also conduct periodic e-auctions for residential, commercial, and institutional plots.
                  </p>
                </div>

                {/* Section 2: Benefits and Risks */}
                <div className="mb-5">
                  <h2 className="fs-24 fw-600 mb-3">Benefits and Risks of Buying at Auction</h2>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="p-4 rounded-3 h-100" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <h3 className="fs-18 fw-600 mb-3" style={{ color: '#15803d' }}>
                          <i className="fas fa-check-circle me-2"></i>Benefits
                        </h3>
                        <ul className="mb-0" style={{ paddingLeft: '1.2em' }}>
                          <li className="mb-2">Significantly below-market prices — reserve prices can be 10-30% lower than market rates</li>
                          <li className="mb-2">Clear title verification by the bank before listing, reducing ownership risk</li>
                          <li className="mb-2">No middlemen or brokerage fees — direct transaction with the bank</li>
                          <li className="mb-2">Financing options available — most banks offer home loans for auctioned properties</li>
                          <li>Transparent process with defined timelines and legal framework under SARFAESI Act</li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-4 rounded-3 h-100" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                        <h3 className="fs-18 fw-600 mb-3" style={{ color: '#dc2626' }}>
                          <i className="fas fa-exclamation-triangle me-2"></i>Risks
                        </h3>
                        <ul className="mb-0" style={{ paddingLeft: '1.2em' }}>
                          <li className="mb-2">Existing occupants may refuse to vacate, requiring lengthy legal proceedings</li>
                          <li className="mb-2">Hidden encumbrances, pending litigations, or legal disputes from previous owners</li>
                          <li className="mb-2">Limited or no inspection time — property sold on &quot;as is where is&quot; basis</li>
                          <li className="mb-2">Outstanding dues like property tax, maintenance, or utility bills may transfer to buyer</li>
                          <li>Strict payment timelines (usually 15-90 days) with forfeiture of EMD on default</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-3" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <h3 className="fs-16 fw-600 mb-2" style={{ color: '#1d4ed8' }}>
                      <i className="fas fa-clipboard-list me-2"></i>Due Diligence Checklist Before Bidding
                    </h3>
                    <div className="row">
                      <div className="col-md-6">
                        <ul className="mb-0" style={{ paddingLeft: '1.2em', fontSize: 14 }}>
                          <li>Verify title documents and encumbrance certificate</li>
                          <li>Check for pending legal disputes or court orders</li>
                          <li>Inspect the property physically (if allowed)</li>
                          <li>Confirm possession status — occupied or vacant</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="mb-0" style={{ paddingLeft: '1.2em', fontSize: 14 }}>
                          <li>Verify outstanding property tax and utility bills</li>
                          <li>Check society NOC and maintenance dues</li>
                          <li>Confirm the bank&apos;s reserve price vs market rate</li>
                          <li>Understand the EMD forfeiture and refund terms</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: How to Participate */}
                <div className="mb-5">
                  <h2 className="fs-24 fw-600 mb-3">How to Participate in Bank Auctions in India</h2>
                  <p>
                    Participating in bank auctions requires preparation and understanding of the process. Here is a step-by-step guide for both online and offline auctions:
                  </p>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6 col-lg-3">
                      <div className="p-3 rounded-3 text-center h-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div className="mb-2" style={{ width: 40, height: 40, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</div>
                        <h4 className="fs-14 fw-600 mb-1">Find Auctions</h4>
                        <p className="fs-13 mb-0 text-muted">Check IBAPI, bank websites, or our portal for upcoming auctions in your area.</p>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <div className="p-3 rounded-3 text-center h-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div className="mb-2" style={{ width: 40, height: 40, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>2</div>
                        <h4 className="fs-14 fw-600 mb-1">Register & Pay EMD</h4>
                        <p className="fs-13 mb-0 text-muted">Submit KYC documents and pay the Earnest Money Deposit (typically 10% of reserve price).</p>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <div className="p-3 rounded-3 text-center h-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div className="mb-2" style={{ width: 40, height: 40, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</div>
                        <h4 className="fs-14 fw-600 mb-1">Attend Auction</h4>
                        <p className="fs-13 mb-0 text-muted">Participate in the auction online or at the designated venue on the scheduled date.</p>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <div className="p-3 rounded-3 text-center h-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div className="mb-2" style={{ width: 40, height: 40, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>4</div>
                        <h4 className="fs-14 fw-600 mb-1">Complete Payment</h4>
                        <p className="fs-13 mb-0 text-muted">Pay the balance amount within 15-90 days and complete the transfer process.</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="fs-18 fw-600 mb-2">Required Documents</h3>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <ul style={{ paddingLeft: '1.2em', fontSize: 14 }}>
                        <li>PAN Card (mandatory for EMD payment and property registration)</li>
                        <li>Aadhaar Card or other government-issued photo ID</li>
                        <li>Address proof (utility bill, bank statement, or passport)</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul style={{ paddingLeft: '1.2em', fontSize: 14 }}>
                        <li>Income proof / ITR for loan processing (if applicable)</li>
                        <li>Recent passport-size photographs</li>
                        <li>EMD payment receipt / bank challan</li>
                      </ul>
                    </div>
                  </div>

                  <h3 className="fs-18 fw-600 mb-2">EMD Payment Process</h3>
                  <p className="mb-3">
                    The Earnest Money Deposit (EMD) is typically 5-10% of the reserve price and must be deposited via demand draft, pay order, or online transfer to the bank&apos;s designated account before the auction deadline. The EMD is refundable if you do not win the auction, but is forfeited if you win and fail to complete the payment within the stipulated timeline.
                  </p>

                  <h3 className="fs-18 fw-600 mb-2">Post-Auction Payment Timeline</h3>
                  <p className="mb-0">
                    After winning a bank auction, you are typically required to pay 25% of the bid amount immediately (including the EMD already paid). The remaining 75% must be paid within 15-90 days depending on the bank&apos;s terms. Failure to pay within the deadline results in EMD forfeiture and cancellation of the allotment. Some banks allow loan financing for the balance amount — check with the auctioning bank for specific terms.
                  </p>
                </div>

                {/* ToolRelatedLinks */}
                <ToolRelatedLinks
                  heading="Related Tools"
                  links={[
                    { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fas fa-calculator' },
                    { to: '/stamp-duty-calculator', label: 'Stamp Duty Calculator', icon: 'fas fa-file-invoice-dollar' },
                    { to: '/loan-eligibility-calculator', label: 'Loan Eligibility', icon: 'fas fa-clipboard-check' },
                    { to: '/area-calculator', label: 'Carpet Area Calculator', icon: 'fas fa-ruler-combined' },
                  ]}
                />
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
