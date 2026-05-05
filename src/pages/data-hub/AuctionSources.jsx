import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData } from '../../seo/structuredData';
import Cta from '../../components/ui/Cta';

const FAQS = [
  {
    question: 'What types of property auctions exist in India?',
    answer: 'There are four main types: (1) SARFAESI auctions — conducted by banks directly for NPA recovery without court involvement. (2) DRT auctions — ordered by Debt Recovery Tribunals under the RDDBFI Act. (3) IBC/Insolvency auctions — managed by insolvency professionals under the Insolvency and Bankruptcy Code, listed on BaankNet/eBKray. (4) Government authority auctions — conducted by development authorities like DDA (Delhi), HSVP (Haryana), MDA (Meerut), and YEIDA for plots and commercial properties.',
  },
  {
    question: 'What is IBAPI and why is it the most important auction portal?',
    answer: 'IBAPI (Indian Banks Auction Properties Information) is an RBI-mandated platform at ibapi.in where all public sector banks — SBI, PNB, Bank of Baroda, Canara Bank, Union Bank, and others — are required to list their NPA auction properties. It is the single most comprehensive source for bank auction properties in India, with filters for city, bank, and property type. If you check only one portal, make it IBAPI.',
  },
  {
    question: 'How do HSVP e-auctions work in Gurugram?',
    answer: 'Haryana Shehri Vikas Pradhikaran (HSVP, formerly HUDA) conducts e-auctions for residential, commercial, industrial, and institutional plots across Haryana cities including Gurugram. Auctions are held periodically through the HSVP e-Auction portal (eauction.hsvphry.org.in) or the Procure247 platform (hsvp.procure247.com). You need to register, pay the earnest money, and participate in online bidding. These are direct government auctions with no middlemen.',
  },
  {
    question: 'What are DDA e-auctions in Delhi?',
    answer: 'The Delhi Development Authority (DDA) holds e-auctions (called Mega e-Auction phases) for residential, commercial, and industrial plots across Delhi through the DDA Bhoomi Portal at eservices.dda.org.in. Registration is online, earnest money is paid digitally, and bidding happens in real-time. DDA auctions are transparent and allotment goes to the highest bidder.',
  },
  {
    question: 'What is BaankNet/eBKray and how is it different from IBAPI?',
    answer: 'BaankNet (baanknet.com), also known as eBKray, is the IBBI-mandated e-auction platform specifically for bank NPA and insolvency liquidation assets. Since April 2025, all liquidation process assets under IBC/NCLT cases must exclusively list on BaankNet. IBAPI covers SARFAESI/NPA auctions by PSU banks, while BaankNet covers the insolvency/liquidation side. Both are important — check both for comprehensive coverage.',
  },
  {
    question: 'Can I get a loan for a bank-auctioned property?',
    answer: 'Yes, most banks offer loans for auctioned properties, but the process differs from regular home loans. You need to arrange 20-25% as earnest money deposit (EMD) upfront to participate. After winning the bid, you can apply for a loan for the balance amount. SBI and Bank of Baroda have specific products for auction property financing. Pre-approve your loan before bidding to avoid missing payment deadlines.',
  },
  {
    question: 'What are the risks of buying auction properties?',
    answer: 'Key risks include: (1) Pending legal disputes from the previous owner. (2) Physical possession may be difficult if occupants refuse to vacate. (3) No warranty on property condition. (4) Outstanding dues (property tax, maintenance, utility bills) may be your responsibility. (5) Title defects or encumbrances. Always verify title, encumbrance status, possession, and outstanding dues before bidding. Hire a property lawyer for due diligence.',
  },
  {
    question: 'How do I participate in an online property auction?',
    answer: 'Steps: (1) Find auction notices on the relevant portal (IBAPI, DDA, HSVP, etc.). (2) Download the auction notification and read all terms carefully. (3) Register on the auction platform. (4) Pay the Earnest Money Deposit (EMD) online before the deadline. (5) Participate in the live e-auction. (6) If you win, pay the balance within the stipulated period (usually 15-30 days). (7) Complete documentation and take possession. Pre-auction due diligence is critical.',
  },
  {
    question: 'Are aggregator sites like BankEAuctions reliable?',
    answer: 'Aggregator sites like BankEAuctions.com, eAuctionsIndia.com, and FindAuction.in pull listings from multiple bank and government sources, making it easier to browse auctions in one place. They are useful for discovery and alerts. However, always verify details on the official source (bank website, IBAPI, or government portal) before participating, as aggregator data may not be real-time or fully accurate.',
  },
  {
    question: 'What documents should I check before bidding on an auction property?',
    answer: 'Essential due diligence: (1) Title deed and chain of ownership. (2) Encumbrance certificate from the sub-registrar. (3) Property tax receipts. (4) Approved building plan and occupation certificate. (5) Possession status — vacant or occupied. (6) Any court orders or attachments. (7) Society/RWA NOC if applicable. (8) Loan statement from the auctioning bank showing outstanding amount. Engage a property lawyer to verify these documents.',
  },
  {
    question: 'How do DRT auctions differ from bank-conducted SARFAESI auctions?',
    answer: 'In SARFAESI auctions, the bank directly auctions the property after giving the borrower 60 days notice — no court involvement needed. In DRT auctions, the bank approaches the Debt Recovery Tribunal, which then orders the sale through a court process. DRT auctions take longer but provide more legal protection for buyers since the sale is court-ordered. DRT auctions are listed on drt.gov.in.',
  },
  {
    question: 'What are MDA and YEIDA auctions in Meerut/UP?',
    answer: 'MDA (Meerut Development Authority) auctions plots and shops in Meerut through mdameerut.in — covering EWS, LIG, MIG, HIG categories. YEIDA (Yamuna Expressway Industrial Development Authority) auctions commercial, industrial, and institutional plots along the Yamuna Expressway corridor (Greater Noida to Agra). Both are government authority auctions offering plots at reserve prices that can be significantly below market rates.',
  },
];

const HOW_TO_STEPS = [
  { name: 'Find Auction Notices', text: 'Check IBAPI, DDA, HSVP, or aggregator portals for upcoming auctions in your target city and property type.' },
  { name: 'Conduct Due Diligence', text: 'Verify title deed, encumbrance certificate, possession status, property tax receipts, and any court orders before bidding.' },
  { name: 'Pay Earnest Money Deposit', text: 'Submit the EMD (typically 10-25% of reserve price) online before the auction deadline. This is refundable if you don\'t win.' },
  { name: 'Participate in the E-Auction', text: 'Log in to the auction platform on the scheduled date and bid. Set a maximum budget and stick to it.' },
  { name: 'Pay Balance & Complete Documentation', text: 'If you win, pay the remaining amount within 15-30 days. Complete registration, stamp duty payment, and take possession.' },
];

const SOURCE_GROUPS = [
  {
    title: 'Central / Quasi-Government Portals',
    icon: 'fas fa-landmark',
    sources: [
      { name: 'IBAPI — Indian Bank\'s Auction Properties Information', url: 'https://ibapi.in', tag: 'RBI-mandated', description: 'The single most comprehensive source for bank auction properties. All PSU banks (SBI, PNB, BOB, Canara, Union, etc.) are required by RBI to list NPA auction properties here. Filter by city, bank, and property type.' },
      { name: 'IBBI — Liquidation Auction Notices', url: 'https://ibbi.gov.in/liquidation-auction-notices', tag: 'Official', description: 'Official NCLT/IBC insolvency liquidation auction notices. As of April 2025, IBBI mandates exclusive use of eBKray/BaankNet for listing these assets. Check for notice details and links to the auction platform.' },
      { name: 'BaankNet / eBKray', url: 'https://baanknet.com', tag: 'IBBI-mandated', description: 'IBBI-mandated e-auction platform for bank NPA and insolvency liquidation assets. All liquidation process assets (IBC/NCLT cases) must exclusively list here from April 2025. Covers Delhi, NCR, and Meerut regions.' },
      { name: 'MSTC e-Commerce', url: 'https://mstcecommerce.com', tag: 'Official', description: 'MSTC (Metal Scrap Trade Corporation) is a Government of India enterprise that conducts e-auctions for bank NPA properties and government assets. Works alongside IBAPI as another official channel for PSU bank auctions.' },
    ],
  },
  {
    title: 'Delhi Government Portals',
    icon: 'fas fa-building',
    sources: [
      { name: 'DDA e-Services — Bhoomi Portal', url: 'https://eservices.dda.org.in', tag: 'Official', description: 'Delhi Development Authority\'s official e-auction portal. Commercial, industrial, and residential plots in Delhi sectors. Mega e-Auction phases held periodically. Post-auction documents also issued here.' },
      { name: 'Delhi Financial Corporation', url: 'https://dfc.delhi.gov.in/dfc/public-auction', tag: 'Govt of Delhi', description: 'Government of Delhi undertaking. Auctions industrial plots, sheds, commercial land, and machinery in Narela, Jhilmil, and Nangloi areas. Niche but prime industrial and commercial assets.' },
      { name: 'DRT — Debt Recovery Tribunals', url: 'https://drt.gov.in', tag: 'Official', description: 'DRT Delhi auctions properties under RDDBFI Act and SARFAESI Act. Commercial properties attached via court orders. Check DRT-I and DRT-II Delhi benches for auction notices.' },
    ],
  },
  {
    title: 'Gurugram / Haryana Government Portals',
    icon: 'fas fa-city',
    sources: [
      { name: 'HSVP e-Auction Portal', url: 'https://eauction.hsvphry.org.in', tag: 'Official', description: 'Haryana Shehri Vikas Pradhikaran (formerly HUDA). Official portal for commercial, industrial, institutional, and residential plots in Gurugram, Faridabad, Panchkula, and other Haryana cities. Direct government auction — no middlemen.' },
      { name: 'HSVP Procure247', url: 'https://hsvp.procure247.com', tag: 'Technology backend', description: 'Technology backend for HSVP e-Auctions. Some auction cycles are hosted here rather than eauction.hsvphry.org.in — check both portals in parallel.' },
      { name: 'DTCP Haryana', url: 'https://tcpharyana.gov.in', tag: 'Official', description: 'Directorate of Town & Country Planning occasionally floats licensed colony commercial plots and institutional land parcels in Gurugram. Also useful for checking licensed colony status before buying an auctioned asset.' },
    ],
  },
  {
    title: 'Meerut / Uttar Pradesh Portals',
    icon: 'fas fa-map-marked-alt',
    sources: [
      { name: 'MDA — Meerut Development Authority', url: 'https://mdameerut.in/auctions.php', tag: 'Official', description: 'MDA\'s official e-auction page. Commercial, EWS, LIG, MIG, HIG plots and shops in Vedvyas Puri, Lohia Nagar, Shatabdi Nagar, and other Meerut sectors. Land Monetization Scheme auctions with ~974 plots. Helpline: 63546 04884.' },
      { name: 'YEIDA — Yamuna Expressway Authority', url: 'https://yamunaexpresswayauthority.com', tag: 'Official', description: 'Covers the Meerut-Noida-Agra expressway corridor. Commercial plots, industrial plots, and institutional land along the Yamuna Expressway. Relevant for Greater Noida and the expressway belt.' },
    ],
  },
  {
    title: 'Aggregator Portals',
    icon: 'fas fa-search',
    sources: [
      { name: 'BankEAuctions.com', url: 'https://bankeauctions.com', description: 'Largest NPA/bank auction aggregator in India. Pulls listings from SBI, ICICI, HDFC, Axis, PSU banks, ARCs, and NBFCs. Separate city pages for Delhi and Gurgaon. Updated daily.' },
      { name: 'eAuctionsIndia.com', url: 'https://eauctionsindia.com', description: 'Covers bank, government, MDA, DDA, and HSVP auctions in one feed. Also publishes detailed blog posts on new auction schemes. Good for tracking upcoming auctions across all sources.' },
      { name: 'AuctionBazaar.com', url: 'https://auctionbazaar.com', description: 'Bank auction aggregator with strong SBI listings in Gurgaon and Delhi NCR. Search by residential/commercial and filter by bank. Alert system for new properties in saved searches.' },
      { name: 'eAuctionDekho.com', url: 'https://eauctiondekho.com', description: 'Covers Gurgaon extensively. Lists flats, plots, commercial buildings, offices, shops, godowns, industrial, and factory land across banks. Clean location-based filter UI.' },
      { name: 'FindAuction.in', url: 'https://findauction.in', description: '229+ bank auction properties in Gurgaon as of 2025. Covers PNB, SBI, Canara Bank, Bank of Baroda, and Hinduja HF. Also covers Delhi and NCR with commercial property filter.' },
      { name: 'FindAuctionProperty.com', url: 'https://findauctionproperty.com', description: 'Delhi NCR focused portal. Vets legal status of each property. Covers Delhi, Noida, and Gurgaon commercial and residential bank auctions. Team-assisted due diligence available.' },
      { name: 'AuctionTiger.net', url: 'https://auctiontiger.net', description: 'B2B e-auction platform used by banks, ARCs, and IBC liquidators to conduct auctions. Not just a listing aggregator — NCLT liquidators use this to run the auction itself. Check for live bids.' },
    ],
  },
  {
    title: 'Individual Bank Auction Pages',
    icon: 'fas fa-university',
    sources: [
      { name: 'SBI — SARFAESI Auctions', url: 'https://www.sbi.co.in', bank: 'SBI' },
      { name: 'PNB Auction Properties', url: 'https://www.pnbindia.in', bank: 'PNB' },
      { name: 'Bank of Baroda Auctions', url: 'https://www.bankofbaroda.in', bank: 'BOB' },
      { name: 'Canara Bank Auctions', url: 'https://www.canarabank.com', bank: 'Canara' },
      { name: 'HDFC Bank Auctions', url: 'https://www.hdfcbank.com', bank: 'HDFC' },
      { name: 'ICICI Bank Auctions', url: 'https://www.icicibank.com', bank: 'ICICI' },
      { name: 'Union Bank Auctions', url: 'https://www.unionbankofindia.co.in', bank: 'Union' },
      { name: 'Yes Bank Auctions', url: 'https://www.yesbank.in', bank: 'Yes Bank' },
    ],
  },
];

const TAG_COLORS = {
  'RBI-mandated': { bg: '#dcfce7', color: '#166534' },
  'Official': { bg: '#dbeafe', color: '#1e40af' },
  'IBBI-mandated': { bg: '#dcfce7', color: '#166534' },
  'Govt of Delhi': { bg: '#ffedd5', color: '#9a3412' },
  'Technology backend': { bg: '#ede9fe', color: '#5b21b6' },
};

const AuctionSources = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <>
      <SEO
        title="Government & Bank Auction Properties in Delhi NCR — Complete Guide | 360Ghar"
        description="Complete guide to government and bank property auction portals in Delhi NCR. Covers IBAPI, DDA, HSVP, MDA, YEIDA, BaankNet, DRT, and 20+ aggregator and bank sources. Learn how to participate in SARFAESI, IBC, and government authority auctions."
        keywords="government property auctions Delhi, bank auction portals, IBAPI, DDA auction, HSVP e-auction, BaankNet, SARFAESI auction Delhi NCR, MDA auction Meerut, YEIDA auction, bank auction guide India"
        canonical="/auction-sources"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Auction Sources Guide', url: 'https://360ghar.com/auction-sources' },
          ]),
          {
            '@type': 'Article',
            headline: 'Complete Guide to Government & Bank Property Auctions in Delhi NCR',
            description: 'Comprehensive guide covering 25+ government, bank, and aggregator auction portals for property auctions in Delhi, Gurugram, Meerut, and the NCR region.',
            url: 'https://360ghar.com/auction-sources',
            datePublished: '2025-05-01',
            dateModified: '2025-05-04',
            author: { '@type': 'Organization', name: '360Ghar', url: 'https://360ghar.com' },
            publisher: { '@type': 'Organization', name: '360Ghar', url: 'https://360ghar.com', logo: { '@type': 'ImageObject', url: 'https://360ghar.com/assets/images/logo.png' } },
          },
          generateFaqStructuredData(FAQS),
          {
            '@type': 'HowTo',
            name: 'How to Participate in a Property Auction',
            description: 'Step-by-step guide to participating in bank and government property auctions in Delhi NCR.',
            step: HOW_TO_STEPS.map((s, i) => ({
              '@type': 'HowToStep',
              position: i + 1,
              name: s.name,
              text: s.text,
            })),
          },
        ]}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />

        <section className="padding-y-120">
          <div className="container container-two">
            <nav aria-label="breadcrumb" className="mb-20">
              <ol className="breadcrumb" style={{ fontSize: 13, marginBottom: 0 }}>
                <li className="breadcrumb-item"><Link to="/" style={{ color: '#6b7280' }}>Home</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Auction Sources</li>
              </ol>
            </nav>

            <div className="row">
              <div className="col-lg-8 mx-auto">
                <article className="blog-details">
                  <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Complete Guide to Government & Bank Property Auctions in Delhi NCR</h1>
                  <p style={{ fontSize: 16, color: '#4b5563', marginBottom: 32 }}>
                    Discover every portal where you can find auction properties in Delhi, Gurugram, Meerut, and the NCR region — from RBI-mandated bank auction platforms to government development authority e-auctions and the best aggregator sites.
                  </p>

                  {/* How Auctions Work */}
                  <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, marginTop: 40 }}>How Property Auctions Work in India</h2>
                  <p style={{ color: '#374151', marginBottom: 16 }}>
                    Property auctions in India primarily happen through four channels:
                  </p>
                  <ul style={{ color: '#374151', marginBottom: 24 }}>
                    <li style={{ marginBottom: 8 }}><strong>SARFAESI Auctions:</strong> Banks directly auction NPA properties under the SARFAESI Act 2002, without court involvement. These are listed on IBAPI and individual bank websites.</li>
                    <li style={{ marginBottom: 8 }}><strong>DRT Auctions:</strong> Debt Recovery Tribunals order property sales under the RDDBFI Act. These are court-driven and listed on drt.gov.in.</li>
                    <li style={{ marginBottom: 8 }}><strong>IBC/Insolvency Auctions:</strong> Under the Insolvency and Bankruptcy Code, insolvency professionals auction assets of companies under liquidation. Since April 2025, these must be listed exclusively on BaankNet/eBKray.</li>
                    <li style={{ marginBottom: 8 }}><strong>Government Authority Auctions:</strong> Development authorities like DDA (Delhi), HSVP (Haryana), MDA (Meerut), and YEIDA conduct periodic e-auctions for plots and commercial properties.</li>
                  </ul>

                  {/* Step-by-step guide */}
                  <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, marginTop: 40 }}>How to Participate in a Property Auction</h2>
                  <div style={{ marginBottom: 32 }}>
                    {HOW_TO_STEPS.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                        <div style={{ minWidth: 36, height: 36, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{step.name}</h3>
                          <p style={{ margin: 0, fontSize: 14, color: '#4b5563' }}>{step.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Source Groups */}
                  {SOURCE_GROUPS.map((group) => (
                    <div key={group.title} style={{ marginTop: 48 }}>
                      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
                        <i className={group.icon} style={{ marginRight: 10, color: '#2563eb' }}></i>
                        {group.title}
                      </h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {group.sources.map((source) => {
                          const tagColor = TAG_COLORS[source.tag] || { bg: '#f3f4f6', color: '#374151' };
                          return (
                            <div key={source.name} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                  <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, fontSize: 15, color: '#111827', textDecoration: 'none' }}>
                                    {source.name}
                                  </a>
                                  {source.tag && (
                                    <span style={{ fontSize: 10, fontWeight: 600, background: tagColor.bg, color: tagColor.color, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      {source.tag}
                                    </span>
                                  )}
                                </div>
                                <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                  Visit <i className="fas fa-external-link-alt" style={{ fontSize: 10, marginLeft: 4 }}></i>
                                </a>
                              </div>
                              {source.description && (
                                <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{source.description}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Due Diligence Checklist */}
                  <div style={{ marginTop: 48 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                      <i className="fas fa-clipboard-check" style={{ marginRight: 10, color: '#059669' }}></i>
                      Pre-Bid Due Diligence Checklist
                    </h2>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '20px 24px' }}>
                      <ul style={{ margin: 0, color: '#166534', fontSize: 14, lineHeight: 2 }}>
                        <li>Verify title deed and complete chain of ownership documents</li>
                        <li>Obtain encumbrance certificate from the sub-registrar office</li>
                        <li>Check property tax receipts for any outstanding dues</li>
                        <li>Verify approved building plan and occupation certificate</li>
                        <li>Confirm physical possession status — vacant, tenant-occupied, or disputed</li>
                        <li>Check for any court orders, attachments, or stay orders</li>
                        <li>Obtain society/RWA NOC and transfer permission if applicable</li>
                        <li>Review the bank&apos;s auction terms, especially liability clauses</li>
                        <li>Arrange pre-approved financing before participating in the auction</li>
                        <li>Set a maximum bid amount and strictly adhere to it</li>
                      </ul>
                    </div>
                  </div>

                  {/* CTA to browse auctions */}
                  <div style={{ marginTop: 48, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '24px 28px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ready to Browse Auction Properties?</h3>
                    <p style={{ color: '#4b5563', marginBottom: 16 }}>View the latest bank, court, and government authority auction listings aggregated from all these sources.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <Link to="/bank-auctions" className="btn btn-main" style={{ textDecoration: 'none' }}>Browse All Auctions</Link>
                      <Link to="/properties" className="btn btn-outline-secondary" style={{ textDecoration: 'none' }}>Browse Properties</Link>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <p style={{ marginTop: 32, fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>
                    Disclaimer: This page provides links to external government and bank portals for informational purposes. 360Ghar does not operate, control, or guarantee the accuracy of data on these external websites. Always verify auction details on the official source before participating. Listing on this page does not constitute an endorsement.
                  </p>
                </article>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="row mt-60">
              <div className="col-lg-8 mx-auto">
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Frequently Asked Questions</h2>
                <div className="accordion">
                  {FAQS.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div className="accordion-item border-0 border-bottom" key={faq.question}>
                        <h3 className="accordion-header" id={`asFaqHeading${idx}`}>
                          <button className={`accordion-button ${isOpen ? '' : 'collapsed'}`} type="button" aria-expanded={isOpen} onClick={() => setOpenFaqIndex(cur => cur === idx ? -1 : idx)}>
                            {faq.question}
                          </button>
                        </h3>
                        <div className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}>
                          <div className="accordion-body text-muted" style={{ fontSize: 14, lineHeight: 1.7 }}>{faq.answer}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Cta ctaClass="" />
        <Footer />
      </main>
    </>
  );
};

export default AuctionSources;
