import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData } from '../../seo/structuredData';
import GazetteItem from '../../components/data-hub/GazetteItem';
import Cta from '../../components/ui/Cta';
import { dataHubService } from '../../services/dataHubService';

const PAGE_LIMIT = 20;

const FAQS = [
  {
    question: 'What are Haryana gazette notifications for real estate?',
    answer: 'Haryana gazette notifications are official government publications that announce changes in laws, rules, and policies affecting real estate. These include circle rate revisions, land acquisition notices, CLU (Change of Land Use) policy changes, building code amendments, and RERA rule modifications. Once published in the gazette, these changes have legal force and must be followed by all stakeholders.',
  },
  {
    question: 'How does a CLU notification affect property value?',
    answer: 'A CLU (Change of Land Use) notification can significantly affect property value. When agricultural or institutional land is approved for residential or commercial use, property values typically increase substantially because the land can now be developed for higher-value purposes. Conversely, if a CLU is denied or revoked, it can decrease property value. Investors and developers closely monitor CLU notifications for investment opportunities.',
  },
  {
    question: 'What recent policy changes have affected Gurugram real estate?',
    answer: 'Recent policy changes affecting Gurugram real estate include revisions to the Haryana Building Code, updates to the Affordable Housing Policy, amendments to the Deen Dayal Jan Awas Yojna (DDJAY) plot sizes, and changes in the licensing fee structure for commercial and mixed-use developments. The government has also eased conversion norms for commercial activities along designated roads. Check our regulatory updates above for the latest notifications.',
  },
  {
    question: 'Where can I find official Haryana real estate regulations?',
    answer: 'Official Haryana real estate regulations can be found on the Department of Town and Country Planning (DTCP) website (tcpharyana.gov.in), the HRERA website (hrera.org.in), the Haryana Revenue Department for stamp duty and circle rates, and the India E-Gazette portal (egazette.nic.in). You can also check our Regulatory Updates page for curated notifications specific to Gurugram real estate.',
  },
  {
    question: 'How can I stay updated on Haryana real estate regulatory changes?',
    answer: 'To stay updated: (1) Bookmark the HRERA and DTCP websites for project and zoning updates. (2) Subscribe to the India E-Gazette for official notifications. (3) Follow our Regulatory Updates page on 360Ghar, where we curate and explain notifications relevant to Gurugram real estate. (4) Set up Google Alerts for key terms like "HRERA notification" or "Gurugram circle rate revision". (5) Consult a real estate lawyer for significant regulatory changes affecting your property.',
  },
];

const RegulatoryUpdates = () => {
  const { t } = useTranslation('data-hub');
  const [tSeo] = useTranslation('seo');
  const [activeTab, setActiveTab] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const TABS = [
    { key: '', label: t('regulatoryUpdates.tabs.all') },
    { key: 'land_acquisition', label: t('regulatoryUpdates.tabs.landAcquisition') },
    { key: 'rate_revision', label: t('regulatoryUpdates.tabs.rateRevision') },
    { key: 'policy', label: t('regulatoryUpdates.tabs.policy') },
    { key: 'clu_change', label: t('regulatoryUpdates.tabs.cluChange') },
  ];

  // Fetch the first page (cursor=null) whenever the active tab changes.
  useEffect(() => {
    const params = { limit: PAGE_LIMIT };
    if (activeTab) params.type = activeTab;

    dataHubService.getGazetteNotifications(params)
      .then((data) => {
        setNotifications(Array.isArray(data?.items) ? data.items : []);
        setNextCursor(data?.next_cursor ?? null);
        setHasMore(Boolean(data?.has_more));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [activeTab]);

  // Cursor "Load more": fetch the next page using the opaque cursor token.
  const handleLoadMore = async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = { limit: PAGE_LIMIT, cursor: nextCursor };
      if (activeTab) params.type = activeTab;
      const data = await dataHubService.getGazetteNotifications(params);
      const items = Array.isArray(data?.items) ? data.items : [];
      setNotifications(prev => [...prev, ...items]);
      setNextCursor(data?.next_cursor ?? null);
      setHasMore(Boolean(data?.has_more));
    } catch {
      // Silently ignore; user can retry via Load More.
    } finally {
      setLoadingMore(false);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const activeTabLabel = TABS.find(tab => tab.key === activeTab)?.label || t('regulatoryUpdates.tabs.all');

  return (
    <>
      <SEO
        title={tSeo('regulatoryUpdates.title')}
        description={tSeo('regulatoryUpdates.description')}
        keywords="Haryana Gazette notifications, Gurugram regulatory updates, land acquisition notices, circle rate revision, CLU change Gurgaon, HRERA policy update, 360Ghar data hub"
        canonical="/regulatory-updates"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Regulatory Updates', url: 'https://360ghar.com/regulatory-updates' },
          ]),
          {
            '@type': 'CollectionPage',
            name: 'Regulatory Updates — Haryana Gazette',
            description: 'Official notifications from the Haryana Government affecting real estate in Gurugram.',
            url: 'https://360ghar.com/regulatory-updates',
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
                {/* AUDIT FIX (imp 3.19): consistent breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-20">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><I18nLink to="/">Home</I18nLink></li>
                    <li className="breadcrumb-item"><I18nLink to="/regulatory-updates">Data Hub</I18nLink></li>
                    <li className="breadcrumb-item active">Regulatory Updates</li>
                  </ol>
                </nav>
                <h1 className="fs-28 fw-600 mb-10">{t('regulatoryUpdates.title')}</h1>
                <p className="mb-0 color-text-3">
                  {t('regulatoryUpdates.description')}
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="row mb-30">
              <div className="col-12">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #e5e7eb', paddingBottom: 0 }}>
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
                      style={{
                        padding: '8px 18px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === tab.key ? 700 : 500,
                        color: activeTab === tab.key ? 'var(--main-color, #2563eb)' : '#6b7280',
                        borderBottom: activeTab === tab.key ? '2px solid var(--main-color, #2563eb)' : '2px solid transparent',
                        marginBottom: -1,
                        fontSize: 14,
                        transition: 'color 0.15s',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="row g-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="col-12">
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
                      <div style={{ height: 14, background: '#e5e7eb', borderRadius: 4, marginBottom: 10, width: '60%' }}></div>
                      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, marginBottom: 8, width: '80%' }}></div>
                      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, width: '50%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-40">
                <p className="color-danger fs-16">{t('regulatoryUpdates.error')}</p>
              </div>
            ) : (
              <>
                <p className="mb-20 fs-14 color-text-3">
                  {t('regulatoryUpdates.notificationsFound', { count: notifications.length, suffix: notifications.length !== 1 ? 's' : '' })}
                </p>

                {notifications.length === 0 ? (
                  <div className="text-center py-40">
                    <p className="fs-16 color-text-3">{t('regulatoryUpdates.noNotifications', { tab: activeTabLabel })}</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3 mb-30">
                    {notifications.map((item) => (
                      <GazetteItem key={item.id} item={item} />
                    ))}
                  </div>
                )}

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

        {/* AUDIT FIX (3.17): use the shared Cta component for consistency */}
        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default RegulatoryUpdates;
