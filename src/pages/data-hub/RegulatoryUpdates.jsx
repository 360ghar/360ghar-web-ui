import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData } from '../../seo/structuredData';
import Pagination from '../../common/ui/Pagination';
import GazetteItem from '../../components/data-hub/GazetteItem';
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
  const [activeTab, setActiveTab] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const TABS = [
    { key: '', label: t('regulatoryUpdates.tabs.all') },
    { key: 'land_acquisition', label: t('regulatoryUpdates.tabs.landAcquisition') },
    { key: 'rate_revision', label: t('regulatoryUpdates.tabs.rateRevision') },
    { key: 'policy', label: t('regulatoryUpdates.tabs.policy') },
    { key: 'clu_change', label: t('regulatoryUpdates.tabs.cluChange') },
  ];

  useEffect(() => {
    const params = { page, limit: PAGE_LIMIT };
    if (activeTab) params.type = activeTab;

    dataHubService.getGazetteNotifications(params)
      .then((data) => {
        setNotifications(data?.items || []);
        setTotal(data?.total || 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [activeTab, page]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
  };

  const activeTabLabel = TABS.find(tab => tab.key === activeTab)?.label || t('regulatoryUpdates.tabs.all');

  return (
    <>
      <SEO
        title="Regulatory Updates Gurugram | Haryana Gazette Notifications | 360Ghar"
        description="Stay updated with official Haryana Gazette notifications affecting Gurugram real estate. Land acquisition notices, circle rate revisions, policy changes, and CLU updates."
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
                  {t('regulatoryUpdates.notificationsFound', { count: total, suffix: total !== 1 ? 's' : '' })}
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

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
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

        {/* CTA */}
        <section className="cta-section bg-main text-white padding-y-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="cta-title mb-3">{t('regulatoryUpdates.cta.title')}</h2>
                <p className="mb-4">{t('regulatoryUpdates.cta.description')}</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <a href="/contact" className="btn btn-white btn-main">{t('regulatoryUpdates.cta.talkToExpert')}</a>
                  <a href="/properties" className="btn btn-outline-white">{t('regulatoryUpdates.cta.browseProperties')}</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default RegulatoryUpdates;
