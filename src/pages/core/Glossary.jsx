import { useMemo, useState } from 'react';
import { I18nLink } from '../../i18n/I18nLink';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData } from '../../seo/structuredData';

const GLOSSARY_ENTRIES = [
  { term: 'Brokerage', question: 'What is brokerage in real estate and who pays it?', answer: 'Brokerage is the fee charged by a real estate agent or platform for facilitating a property transaction. In India, brokerage is typically 1-2% of the sale price for buying/selling and 1-2 months rent for rentals. At 360Ghar, brokerage is charged only when a deal closes — no upfront fees.' },
  { term: 'Carpet Area', question: 'What is carpet area and how is it different from super built-up area?', answer: 'Carpet area is the actual usable floor space inside your apartment — the area you can cover with a carpet. Super built-up area adds walls, balconies, and a proportionate share of common areas (lobby, lift, club). In Gurugram, loading is typically 25-35%, so a 1,500 sq ft super area flat has about 1,050 sq ft carpet area.' },
  { term: 'Circle Rate', question: 'What is circle rate and how does it affect property purchase?', answer: 'Circle rate (also called collector rate or guidance value) is the minimum property price set by the state government for registration purposes. In Gurugram, circle rates vary by sector and property type. Stamp duty is calculated on the higher of circle rate or actual transaction price.' },
  { term: 'CLU', question: 'What is CLU (Change of Land Use) in Gurgaon?', answer: 'CLU is the government permission to change land from agricultural to commercial or residential use. Without CLU, construction on agricultural land is illegal. CLU is granted by DTCP (Directorate of Town and Country Planning) in Haryana and significantly affects property value.' },
  { term: 'EMI', question: 'What is EMI and how is it calculated for home loans?', answer: 'EMI (Equated Monthly Installment) is the fixed monthly payment you make to repay a home loan. It is calculated using the formula: EMI = [P × R × (1+R)^N] / [(1+R)^N - 1], where P = principal, R = monthly interest rate, N = tenure in months. Use 360Ghar\'s free EMI calculator to plan your payments.' },
  { term: 'FEMA', question: 'What are FEMA rules for NRI property purchase in India?', answer: 'Under FEMA, NRIs and OCIs can buy residential and commercial property in India without RBI permission. They cannot buy agricultural land, farmhouses, or plantations. Repatriation of sale proceeds is allowed up to 2 residential properties. NRO account is mandatory for property transactions.' },
  { term: 'Jamabandi', question: 'What is Jamabandi and how to check property ownership in Haryana?', answer: 'Jamabandi is the Haryana government\'s land records register that records ownership, cultivation rights, and revenue details. You can verify ownership online at the Haryana Jamabandi portal by selecting district, tehsil, village, and khasra number. 360Ghar provides a free ownership verification tool.' },
  { term: 'Loading Factor', question: 'What is loading factor in real estate?', answer: 'Loading factor is the percentage difference between super built-up area and carpet area. If a builder quotes 1,500 sq ft super area with 30% loading, the actual carpet area is about 1,050 sq ft. RERA mandates that builders disclose carpet area, but many markets still quote super built-up area.' },
  { term: 'Power of Attorney', question: 'What is Power of Attorney for NRI property purchase?', answer: 'A Power of Attorney (PoA) allows an NRI to authorize someone in India to execute property transactions on their behalf. It must be notarized and attested by the Indian consulate. A specific PoA for property purchase is safer than a general PoA. NRIs commonly use PoA to sign sale deeds without traveling to India.' },
  { term: 'RERA', question: 'What is RERA and how does it protect property buyers?', answer: 'RERA (Real Estate Regulatory Authority) is a government body established under the Real Estate (Regulation and Development) Act, 2016. It mandates project registration, enforces timely delivery, requires escrow accounts for buyer funds (70% of collections), and provides a complaint resolution mechanism. In Haryana, check RERA registration at HRERA website.' },
  { term: 'Stamp Duty', question: 'What is stamp duty and how much is it in Haryana?', answer: 'Stamp duty is a government tax on property transactions, paid by the buyer. In Haryana: 7% for male buyers, 5% for female buyers, 6% for joint ownership. Registration fee is an additional 1%. Stamp duty is calculated on the higher of circle rate or actual sale price. Use 360Ghar\'s stamp duty calculator for instant estimates.' },
  { term: 'TDS on Property', question: 'What is TDS on property sale and who deducts it?', answer: 'TDS (Tax Deducted at Source) on property sale is 1% for resident sellers and 20% (+ surcharge + cess) for NRI sellers. The buyer must deduct TDS and deposit it with the government within 30 days. For properties above ₹50 lakh, 1% TDS is mandatory regardless of seller type. Form 26QB is filed for resident sellers, Form 27Q for NRI sellers.' },
  { term: 'Virtual Tour', question: 'What is a 360° virtual tour for real estate?', answer: 'A 360° virtual tour is an immersive digital walkthrough of a property that lets you explore every room from your phone or computer. On 360Ghar, every verified listing includes a virtual tour so you can shortlist properties without visiting in person — especially useful for NRIs, busy professionals, and those exploring multiple localities.' },
  { term: 'Verification', question: 'How does 360Ghar verify property listings?', answer: '360Ghar physically verifies every listing before it goes live. Our on-site team visits the property, confirms ownership documents, captures authentic photos and 360° virtual tours, validates the exact location, and checks amenities. This eliminates fake listings, outdated inventory, and misleading descriptions that plague unverified portals.' },
  { term: 'Zero Brokerage Upfront', question: 'What does zero upfront brokerage mean?', answer: 'Zero upfront brokerage means you don\'t pay any fees until a deal is successfully completed. Unlike many platforms that charge listing fees or subscription costs upfront, 360Ghar only charges standard market brokerage after a transaction closes. This aligns our incentives with yours — we succeed when you find the right property.' },
  { term: 'Escrow Account', question: 'What is an escrow account in RERA projects?', answer: 'Under RERA, builders must deposit 70% of buyer collections into a separate escrow account. This money can only be withdrawn for construction and land costs, preventing diversion of funds to other projects. This protects buyers from the common problem of builders launching new projects instead of completing existing ones.' },
  { term: 'Sale Deed', question: 'What is a sale deed and why is it important?', answer: 'A sale deed is the primary legal document that transfers property ownership from seller to buyer. It must be executed on non-judicial stamp paper, registered at the sub-registrar office, and is the most critical document in any property transaction. Without a registered sale deed, ownership transfer is not legally valid.' },
  { term: 'Encumbrance Certificate', question: 'What is an encumbrance certificate?', answer: 'An encumbrance certificate (EC) certifies that a property is free from any monetary or legal liabilities — mortgages, liens, or pending litigation. It is issued by the sub-registrar and covers a specified period (typically 13-30 years). Banks require an EC before approving home loans. Always verify EC before buying any property.' },
  { term: 'Occupancy Certificate', question: 'What is an occupancy certificate (OC)?', answer: 'An occupancy certificate is issued by the local authority (MCG in Gurgaon) certifying that a building is complete and fit for occupation. It confirms compliance with approved plans, fire safety, and building codes. Buying in a project without OC is risky — you may face utility disconnections and cannot legally occupy the premises.' },
  { term: 'Ready to Move', question: 'What does ready-to-move property mean?', answer: 'A ready-to-move property is one that has received its occupancy certificate and is available for immediate possession. The advantage over under-construction: you can physically inspect the property, get immediate possession, and avoid construction delays. 360Ghar\'s 360° virtual tours let you inspect ready-to-move properties remotely.' },
];

const GLOSSARY_FAQS = GLOSSARY_ENTRIES.map(e => ({
  question: e.question,
  answer: e.answer,
}));

const Glossary = () => {
  const { t } = useTranslation();
  const [tSeo] = useTranslation('seo');
  const [tC] = useTranslation('common');
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(-1);
  // AUDIT FIX (4.10): active letter filter for A-Z quick jump navigation.
  // "ALL" shows every entry; a single letter shows only entries whose term
  // starts with that letter (case-insensitive).
  const [activeLetter, setActiveLetter] = useState('ALL');

  // AUDIT FIX (4.10): build the A-Z navigation from the available first letters.
  const availableLetters = useMemo(() => {
    const letters = new Set(GLOSSARY_ENTRIES.map((entry) => entry.term.charAt(0).toUpperCase()));
    return ['ALL', ...Array.from(letters).sort()];
  }, []);

  const filtered = useMemo(() => GLOSSARY_ENTRIES.filter((entry) => {
    const matchesSearch = entry.term.toLowerCase().includes(search.toLowerCase())
      || entry.question.toLowerCase().includes(search.toLowerCase());
    const matchesLetter = activeLetter === 'ALL' || entry.term.charAt(0).toUpperCase() === activeLetter;
    return matchesSearch && matchesLetter;
  }), [search, activeLetter]);

  return (
    <>
      <SEO
        title={tSeo('glossary.title')}
        description={tSeo('glossary.description')}
        keywords="real estate glossary India, property terms explained, Gurgaon real estate FAQ, RERA meaning, carpet area meaning, stamp duty Haryana, NRI property guide, virtual tour real estate"
        canonical="/glossary"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Glossary', url: 'https://360ghar.com/glossary' },
          ]),
          generateFaqStructuredData(GLOSSARY_FAQS),
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

        <section className="padding-y-60">
          <div className="container container-two">
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">Real Estate Glossary & Knowledge Base</h1>
              <p className="section-heading__desc">
                Direct answers to common real estate questions for Gurgaon property buyers, sellers, and NRIs.
              </p>
            </div>

            {/* Search */}
            <div className="row justify-content-center mb-4">
              <div className="col-lg-8">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Search terms... (e.g., RERA, stamp duty, carpet area)"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setOpenIndex(-1); }}
                />
              </div>
            </div>

            {/* AUDIT FIX (4.10): A-Z quick jump navigation */}
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8">
                <nav aria-label={tC('contentSeo.glossaryAzNav')} className="d-flex flex-wrap gap-1 justify-content-center">
                  {availableLetters.map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => { setActiveLetter(letter); setOpenIndex(-1); }}
                      className={`btn btn-sm ${activeLetter === letter ? 'btn-main' : 'btn-outline-main'}`}
                      aria-pressed={activeLetter === letter}
                    >
                      {letter === 'ALL' ? tC('contentSeo.glossaryAll') : letter}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Entries */}
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="accordion" id="glossaryAccordion">
                  {filtered.map((entry, idx) => {
                    const isOpen = openIndex === idx;
                    return (
                      <div className="accordion-item border-0 border-bottom" key={entry.term}>
                        <h3 className="accordion-header" id={`glossaryHeading${idx}`}>
                          <button
                            className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => setOpenIndex((cur) => (cur === idx ? -1 : idx))}
                          >
                            <span className="text-gradient me-2">{entry.term}</span>
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>{entry.question}</span>
                          </button>
                        </h3>
                        <div className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}>
                          <div className="accordion-body text-muted">{entry.answer}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {filtered.length === 0 && (
                  <p className="text-center text-muted py-4">{tC('contentSeo.noResults')}</p>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="row justify-content-center mt-5">
              <div className="col-lg-8 text-center">
                <h2 className="h5 mb-3">Ready to explore verified properties?</h2>
                <I18nLink to="/properties?city=Gurgaon" className="btn btn-main me-2">Browse Listings</I18nLink>
                <I18nLink to="/emi-calculator" className="btn btn-outline-main">EMI Calculator</I18nLink>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIT FIX (4.3): add CTA section to glossary page */}
        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default Glossary;
