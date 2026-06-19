import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { ToolFaq, ToolRelatedLinks } from '../../components/tools/ToolContentSections';

const KNOWN_PORTALS = {
  '99acres.com': { name: '99acres', risk: 'high', issues: ['No physical verification of listings', 'Agent-listed properties often lack owner consent', 'Duplicate and outdated listings common'] },
  'magicbricks.com': { name: 'MagicBricks', risk: 'high', issues: ['Tele-calling and spam complaints', 'Listings not physically verified', 'Paid priority listings may misrepresent availability'] },
  'housing.com': { name: 'Housing.com', risk: 'medium', issues: ['Some listings lack verification badges', 'Agent contact info may not match actual owner', 'Pricing may not reflect current market'] },
  'nobroker.in': { name: 'NoBroker', risk: 'medium', issues: ['Owner verification inconsistent', 'Some listings are agent-posted despite "no broker" claim', 'Contact reveal limits may restrict communication'] },
  'commonfloor.com': { name: 'CommonFloor', risk: 'medium', issues: ['Reduced activity, many outdated listings', 'Verification badges not present on all listings'] },
};

const FAKE_LISTING_FAQS = [
  { question: 'How do I know if a property listing is fake?', answer: 'Warning signs include: no verification badge, stock/low-quality photos, price significantly below market rate, agent refusing video call, demand for advance payment before visit, and inability to provide property documents. On 360Ghar, every listing is physically verified with 360° virtual tours so you can see the actual property before visiting.' },
  { question: 'Are 99acres listings verified?', answer: '99acres does not physically verify most listings. Properties are posted by agents or owners without on-site inspection. This means fake, duplicate, and outdated listings exist. 360Ghar physically verifies every listing before it goes live, including ownership documents, photos, and 360° virtual tours.' },
  { question: 'Why are there so many fake listings on real estate portals?', answer: 'Most portals operate on a listing-fee model — they make money from agents paying to list, not from verified transactions. This incentivizes quantity over quality. Agents post duplicate, inflated, or non-existent listings to capture leads. 360Ghar uses a verification-first model: our team visits the property before publishing.' },
  { question: 'What happens after I paste a URL in the checker?', answer: 'The checker extracts the portal domain and shows known issues for that platform, along with red flags to watch for. It then recommends verified alternatives on 360Ghar where every listing has been physically inspected with 360° virtual tours.' },
  { question: 'Is this fake listing checker free?', answer: 'Yes, the fake listing checker is completely free to use. Our goal is to help property seekers avoid scams and find genuinely verified listings on 360Ghar.' },
  { question: 'How is 360Ghar different from other property portals?', answer: '360Ghar is India\'s first VR-first real estate platform. Every listing is physically verified by our on-site team with 360° virtual tours. We do not allow unverified listings, there are no spam calls, and brokerage is charged only when a deal closes — not upfront.' },
];

const HOW_TO_STEPS = [
  { name: 'Copy the listing URL', text: 'Copy the full URL of the property listing from 99acres, MagicBricks, or any other portal.' },
  { name: 'Paste the URL in the checker', text: 'Paste the URL in the input field below and click "Check Listing".' },
  { name: 'Review the analysis', text: 'See known issues for that platform and red flags to watch for in the listing.' },
  { name: 'Browse verified alternatives', text: 'Search 360Ghar for physically verified properties with 360° virtual tours in the same area.' },
];

const FakeListingChecker = () => {
  const { t } = useTranslation();
  const [tSeo] = useTranslation('seo');
  const [url, setUrl] = useState('');
  const [checked, setChecked] = useState(false);
  const [portalInfo, setPortalInfo] = useState(null);
  // UX FIX (audit 3.9): add a brief loading state so users get feedback that
  // an analysis is running, even though the check is fast client-side work.
  const [checking, setChecking] = useState(false);

  const handleCheck = () => {
    if (!url.trim() || checking) return;
    setChecking(true);
    // Small delay for UX feedback; the actual hostname check is instant.
    setTimeout(() => {
    // CRITICAL FIX (audit 3.7): `url.includes(p)` matched partial strings,
    // so a query param containing "nobroker.in" on another site would
    // falsely match. Extract the hostname and compare against the curated
    // list of trusted portal domains.
    let hostname = '';
    try {
      hostname = new URL(url).hostname.toLowerCase();
    } catch {
      // Not a valid absolute URL; fall back to the raw string so the user
      // still gets a useful "unknown portal" result instead of a crash.
      hostname = url.toLowerCase();
    }
    const domain = Object.keys(KNOWN_PORTALS).find((p) => {
      const candidate = p.toLowerCase();
      return hostname === candidate || hostname.endsWith(`.${candidate}`);
    });
    setPortalInfo(domain ? KNOWN_PORTALS[domain] : null);
    setChecked(true);
    setChecking(false);
    }, 400);
  };

  const riskColor = portalInfo?.risk === 'high' ? '#dc2626' : portalInfo?.risk === 'medium' ? '#d97706' : '#16a34a';

  return (
    <>
      <SEO
        title={tSeo('fakeListingChecker.title')}
        description={tSeo('fakeListingChecker.description')}
        keywords="fake property listing check, verify property listing, 99acres fake listing, MagicBricks fraud, property scam detector, real estate listing verification India"
        canonical="/check-fake-listing"
        structuredData={[
          generateToolSchema(toolSchemas.fakeListingChecker),
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Tools', url: 'https://360ghar.com/tools' },
            { name: 'Fake Listing Checker', url: 'https://360ghar.com/check-fake-listing' },
          ]),
          generateFaqStructuredData(FAKE_LISTING_FAQS),
          generateHowToStructuredData({
            name: 'How to Check if a Property Listing is Fake',
            description: 'Step-by-step guide to verifying property listings from real estate portals.',
            steps: HOW_TO_STEPS,
          }),
        ]}
      />
      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/post-property"
          btnText={t('common:header.postProperty')}
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        {/* Hero */}
        <section className="padding-y-60">
          <div className="container container-two">
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">Check if a Property Listing is Fake</h1>
              <p className="section-heading__desc">
                Paste a listing URL from 99acres, MagicBricks, or any portal. We&apos;ll show you known issues and red flags.
              </p>
            </div>

            {/* Input */}
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="input-group mb-3">
                  <input
                    type="url"
                    className="form-control form-control-lg"
                    placeholder="Paste listing URL (e.g., https://www.99acres.com/...)"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setChecked(false); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                  />
                  <button className="btn btn-main px-4" onClick={handleCheck} disabled={checking}>
                    {checking ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Analyzing...
                      </>
                    ) : 'Check Listing'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {checked && (
              <div className="row justify-content-center mt-4">
                <div className="col-lg-8">
                  {portalInfo ? (
                    <div className="p-4 rounded-3 border" style={{ background: '#fef9f3' }}>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <span className="badge" style={{ background: riskColor, color: '#fff', fontSize: '0.875rem', padding: '6px 14px' }}>
                          {portalInfo.risk === 'high' ? 'High Risk' : portalInfo.risk === 'medium' ? 'Medium Risk' : 'Low Risk'}
                        </span>
                        <h2 className="h5 mb-0">{portalInfo.name} — Known Issues</h2>
                      </div>
                      <ul className="mb-3">
                        {portalInfo.issues.map((issue, i) => (
                          <li key={i} className="mb-2"><i className="fas fa-exclamation-triangle text-warning me-2" />{issue}</li>
                        ))}
                      </ul>
                      <div className="p-3 bg-white rounded-3 border mt-3">
                        <h3 className="h6 mb-2">Red Flags to Watch For</h3>
                        <ul className="mb-0" style={{ fontSize: '0.875rem' }}>
                          <li>Price significantly below market rate</li>
                          <li>Stock or low-quality photos (not actual property)</li>
                          <li>Agent refuses video call or live walkthrough</li>
                          <li>Demand for advance payment before site visit</li>
                          <li>Cannot provide property documents or RERA number</li>
                          <li>Listing older than 60 days with no price reduction</li>
                        </ul>
                      </div>
                      <div className="mt-3 p-3 rounded-3" style={{ background: '#f0fdf4' }}>
                        <strong className="d-block mb-1">Prefer verified listings?</strong>
                        <p className="mb-2 text-muted" style={{ fontSize: '0.875rem' }}>
                          Every listing on 360Ghar is physically verified by our on-site team with 360° virtual tours. No fake listings, no spam calls.
                        </p>
                        <I18nLink to="/properties?city=Gurgaon" className="btn btn-sm btn-main">Browse Verified Properties</I18nLink>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-3 border bg-light text-center">
                      <i className="fas fa-check-circle text-success fa-2x mb-3" />
                      <h3 className="h6">URL Not from a Known Problem Portal</h3>
                      <p className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>
                        This URL doesn&apos;t match known portals with verification gaps. However, always verify property documents and ownership before any transaction.
                      </p>
                      <I18nLink to="/properties?city=Gurgaon" className="btn btn-sm btn-outline-main">Browse 360Ghar Verified Listings</I18nLink>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 360Ghar Verification Guarantee */}
            <div className="row justify-content-center mt-5">
              <div className="col-lg-8">
                <div className="p-4 rounded-3 bg-white border">
                  <h2 className="h5 mb-3">Why 360Ghar Listings Are Verified</h2>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="text-center p-3">
                        <i className="fas fa-shield-alt text-main fa-2x mb-2" />
                        <h3 className="h6">Physical Verification</h3>
                        <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Our team visits every property before listing</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3">
                        <i className="fas fa-vr-cardboard text-main fa-2x mb-2" />
                        <h3 className="h6">360° Virtual Tours</h3>
                        <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>See the actual property from anywhere</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3">
                        <i className="fas fa-phone-slash text-main fa-2x mb-2" />
                        <h3 className="h6">No Spam Calls</h3>
                        <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Dedicated Relationship Manager, no tele-callers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="row justify-content-center mt-5">
              <div className="col-lg-8">
                <ToolFaq faqs={FAKE_LISTING_FAQS} />
              </div>
            </div>

            {/* Related Tools */}
            <div className="row justify-content-center mt-5">
              <div className="col-lg-8">
                <ToolRelatedLinks />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default FakeListingChecker;
