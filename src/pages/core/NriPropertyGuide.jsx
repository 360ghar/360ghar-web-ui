import { useState } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import {
  generateBreadcrumbStructuredData,
  generateFaqStructuredData,
  generateHowToStructuredData,
} from '../../seo/structuredData';
import { Link } from 'react-router-dom';

const NriPropertyGuide = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const breadcrumbs = [
    { name: 'Home', url: 'https://360ghar.com/' },
    { name: 'NRI Property Guide', url: 'https://360ghar.com/nri-property-guide' },
  ];

  const faqItems = [
    {
      question: 'Can an NRI buy agricultural land in India?',
      answer:
        'No. Under FEMA regulations, NRIs and OCIs cannot purchase agricultural land, plantation property, or farmhouses in India. They can only buy residential and commercial properties. However, if an NRI inherits agricultural land, they can hold it but cannot purchase it afresh.',
    },
    {
      question: 'Is Power of Attorney mandatory for NRI property purchase?',
      answer:
        'Power of Attorney (PoA) is not legally mandatory if the NRI can travel to India for registration. However, it is strongly recommended and practically essential for most NRIs, as property registration, agreement execution, and possession handover often require in-person presence. A specific PoA (not general) registered with the Indian consulate allows a trusted representative to execute documents on your behalf.',
    },
    {
      question: 'What is the TDS rate on NRI property sale?',
      answer:
        'The buyer must deduct TDS at 20% (plus applicable surcharge and cess) on the capital gains when purchasing property from an NRI seller. For long-term capital gains (property held over 24 months), the rate is 20% with indexation benefits. For short-term gains, the rate is as per the NRI\'s income tax slab. The buyer must obtain a TDS certificate and the NRI can claim credit while filing returns.',
    },
    {
      question: 'How can an NRI get a home loan in India?',
      answer:
        'NRIs can avail home loans from most major Indian banks and NBFCs including SBI, HDFC, ICICI, and Axis Bank. The NRI must have an NRO or NRE account, a valid Indian PAN card, and income proof (salary slips, bank statements from the foreign bank). The loan is disbursed only to an NRO account. Most banks fund up to 80% of the property value. The loan must be repaid in INR through the NRO account.',
    },
    {
      question: 'Which banks offer NRI home loans in India?',
      answer:
        'Major banks offering NRI home loans include State Bank of India (SBI), HDFC Ltd, ICICI Bank, Axis Bank, Kotak Mahindra Bank, Bank of Baroda, and Punjab National Bank. Each bank has specific eligibility criteria regarding minimum income abroad, country of residence, and employment type. SBI and HDFC typically offer the most NRI-friendly terms with competitive interest rates.',
    },
    {
      question: 'What documents does an NRI need to buy property in India?',
      answer:
        'Key documents include: Valid Indian Passport or OCI card, PAN card (mandatory for property transactions), Power of Attorney (if not registering in person), NRO/NRE bank account statements, address proof (both Indian and overseas), income proof (salary slips, tax returns of the foreign country), and passport-size photographs. For registration: sale deed, encumbrance certificate, property tax receipts, and society NOC.',
    },
    {
      question: 'Can an NRI sell inherited property in India?',
      answer:
        'Yes. An NRI can sell inherited residential or commercial property in India. The sale proceeds can be repatriated up to USD 1 million per financial year under the Liberalised Remittance Scheme, subject to RBI guidelines. If the inherited property is agricultural land or a farmhouse (which NRIs cannot buy but can inherit), the NRI can sell it only to a resident Indian. TDS at 20% + surcharge applies on sale.',
    },
    {
      question: 'What are FEMA rules for NRI property transactions?',
      answer:
        'Under FEMA (Foreign Exchange Management Act, 1999), NRIs and OCIs can purchase any residential or commercial property in India without prior RBI permission. They cannot buy agricultural land, plantations, or farmhouses. Sale proceeds can be repatriated up to the amount originally brought in through banking channels (for purchased properties) or up to USD 1 million per year (for inherited properties). All transactions must be routed through NRO/NRE accounts and comply with FEMA declaration requirements.',
    },
  ];

  const howToSteps = [
    {
      name: 'Research Localities Online with VR Tours',
      text: 'Browse 360Ghar\'s verified listings with 360° virtual tours to explore Gurgaon localities, property types, and price ranges from abroad. Shortlist properties that match your budget and preferences without needing to visit India.',
    },
    {
      name: 'Appoint Power of Attorney',
      text: 'Execute a Special Power of Attorney at the Indian Consulate in your country of residence. This authorises a trusted relative or lawyer in India to sign sale agreements, complete documentation, and register the property on your behalf.',
    },
    {
      name: 'Shortlist Properties with Virtual Tours',
      text: 'Use 360° VR walkthroughs on 360Ghar to inspect every room, check layouts, view amenities, and evaluate the property as if you were there. Your dedicated Relationship Manager arranges video calls with sellers and shares detailed reports.',
    },
    {
      name: 'Execute Sale Agreement via PoA',
      text: 'Your PoA holder executes the sale agreement, pays the token amount from your NRO account, and coordinates with the seller. Ensure the agreement includes payment schedule, possession date, penalty clauses, and specification commitments.',
    },
    {
      name: 'Register Property and Complete TDS Formalities',
      text: 'Register the sale deed at the Sub-Registrar office within 4 months of execution. Pay stamp duty (5-7% in Haryana). Ensure the buyer (or seller, if you are selling) deducts TDS at 20% + surcharge and files Form 27Q. File your Indian ITR to claim TDS credit or refunds.',
    },
  ];

  const structuredData = [
    generateBreadcrumbStructuredData(breadcrumbs),
    generateFaqStructuredData(faqItems),
    generateHowToStructuredData({
      name: 'How to Buy Property in Gurgaon as an NRI',
      description:
        'Step-by-step guide for Non-Resident Indians to purchase property in Gurgaon, India — from virtual research to registration and TDS compliance.',
      steps: howToSteps,
    }),
  ];

  return (
    <>
      <SEO
        title="NRI Buy Property Gurgaon | Legal Guide & VR Tours | 360 Ghar"
        description="Complete guide for NRIs buying property in Gurgaon. Legal requirements, FEMA compliance, Power of Attorney, TDS rules, and 360° virtual tours for remote property viewing."
        keywords="NRI buy property Gurgaon, NRI property guide, FEMA NRI property, Power of Attorney NRI, TDS NRI property sale, NRI home loan India, virtual tour property Gurgaon, NRI real estate investment"
        canonical="/nri-property-guide"
        structuredData={structuredData}
      />

      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/post-property"
          btnText="Post Property"
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        {/* Hero Section */}
        <section className="padding-y-120">
          <div className="container container-two">
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><a href="/">Home</a></li>
                <li className="breadcrumb-item active" aria-current="page">NRI Property Guide</li>
              </ol>
            </nav>

            <div className="section-heading text-center mb-5">
              <h1 className="section-heading__title">
                NRI Property Guide: Buy Property in Gurgaon from Abroad
              </h1>
              <p className="section-heading__desc">
                Everything you need to know about buying property in Gurgaon as a Non-Resident Indian
                — legal requirements, FEMA compliance, tax implications, and 360° virtual tours
                for remote property viewing.
              </p>
            </div>

            <div className="row">
              <div className="col-lg-8 mx-auto">
                <article>
                  {/* Legal Checklist */}
                  <h2 className="mb-4">Legal Checklist for NRI Property Purchase</h2>
                  <p>
                    Before buying property in Gurgaon, NRIs must comply with specific legal and
                    regulatory requirements under FEMA and Indian tax law. Here is a comprehensive
                    checklist:
                  </p>
                  <div className="row g-3 mb-5">
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-white border h-100">
                        <h3 className="h6 mb-2">
                          <i className="fas fa-file-signature text-gradient me-2" />
                          Power of Attorney
                        </h3>
                        <p className="text-muted small mb-0">
                          Execute a Special PoA at the Indian Consulate to authorise a trusted
                          representative in India for agreement execution, registration, and
                          possession handover.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-white border h-100">
                        <h3 className="h6 mb-2">
                          <i className="fas fa-landmark text-gradient me-2" />
                          RBI Guidelines (FEMA)
                        </h3>
                        <p className="text-muted small mb-0">
                          NRIs can buy residential and commercial properties without prior RBI
                          approval under FEMA. Agricultural land, plantations, and farmhouses are
                          not permitted.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-white border h-100">
                        <h3 className="h6 mb-2">
                          <i className="fas fa-id-card text-gradient me-2" />
                          PAN Card Requirement
                        </h3>
                        <p className="text-muted small mb-0">
                          A valid Indian PAN card is mandatory for all property transactions. It is
                          required for TDS deduction, registration, and filing income tax returns in
                          India.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-white border h-100">
                        <h3 className="h6 mb-2">
                          <i className="fas fa-percent text-gradient me-2" />
                          TDS on NRI Property Sales
                        </h3>
                        <p className="text-muted small mb-0">
                          When an NRI sells property, the buyer must deduct TDS at 20% plus
                          applicable surcharge and cess. File Form 27Q and obtain a TDS certificate
                          for claiming credit.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-white border h-100">
                        <h3 className="h6 mb-2">
                          <i className="fas fa-university text-gradient me-2" />
                          NRO Account
                        </h3>
                        <p className="text-muted small mb-0">
                          Non-Resident Ordinary account is used for all India-based income, rent
                          collection, and property-related payments. Sale proceeds are credited to
                          the NRO account first.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-white border h-100">
                        <h3 className="h6 mb-2">
                          <i className="fas fa-exchange-alt text-gradient me-2" />
                          NRE Account
                        </h3>
                        <p className="text-muted small mb-0">
                          Non-Resident External account holds foreign earnings repatriated to India.
                          Funds from NRE accounts can be used to purchase property. Fully
                          repatriable (principal + interest).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* VR Tour USP */}
                  <div className="p-4 rounded-3 bg-light border mb-5">
                    <h2 className="h5 mb-3">
                      <i className="fas fa-vr-cardboard text-gradient me-2" />
                      Visit Properties Virtually from Abroad
                    </h2>
                    <p className="mb-0">
                      With 360Ghar&apos;s 360° virtual tours, you can explore every corner of a
                      property from anywhere in the world. Walk through rooms, check layouts, inspect
                      finishes, and view amenities — no need to travel to India for initial
                      shortlisting. Our studio-quality guided walkthroughs let you make confident
                      decisions remotely, and your dedicated Relationship Manager provides detailed
                      video reports for every shortlisted property.
                    </p>
                  </div>

                  {/* Step-by-Step Buying Process */}
                  <h2 className="mb-4">Step-by-Step NRI Property Buying Process</h2>
                  <div className="mb-5">
                    {howToSteps.map((step, idx) => (
                      <div className="d-flex align-items-start mb-3" key={step.name}>
                        <div
                          className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle bg-main text-white fw-bold me-3"
                          style={{ width: 40, height: 40, fontSize: '0.9rem' }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="h6 mb-1">{step.name}</h3>
                          <p className="text-muted small mb-0">{step.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tax Implications */}
                  <h2 className="mb-4">Tax Implications for NRI Property Transactions</h2>
                  <div className="table-responsive mb-5">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Tax Aspect</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>TDS on Sale</td>
                          <td>
                            Buyer deducts 20% plus surcharge (15% if income exceeds ₹50L, 25% above
                            ₹1Cr) and 4% health &amp; education cess on NRI property sales. File
                            Form 27Q.
                          </td>
                        </tr>
                        <tr>
                          <td>Indexation Benefits</td>
                          <td>
                            For long-term capital gains (held &gt; 24 months), the cost of
                            acquisition is indexed using the Cost Inflation Index (CII) published by
                            CBDT, significantly reducing taxable gains.
                          </td>
                        </tr>
                        <tr>
                          <td>DTAA (Double Taxation Avoidance Agreement)</td>
                          <td>
                            India has DTAA with over 90 countries including the USA, UK, Canada,
                            Australia, UAE, and Singapore. NRIs can claim foreign tax credit in
                            their country of residence to avoid being taxed twice on the same income.
                          </td>
                        </tr>
                        <tr>
                          <td>Capital Gains Exemptions</td>
                          <td>
                            Under Sections 54 and 54EC, NRIs can claim exemption by reinvesting
                            capital gains in another residential property (Section 54) or in
                            specified bonds like NHAI/REC (Section 54EC, up to ₹50L).
                          </td>
                        </tr>
                        <tr>
                          <td>Repatriation Limits</td>
                          <td>
                            Sale proceeds of up to USD 1 million per financial year can be
                            repatriated from NRO account, subject to CA certificate and undertaking
                            to RBI. No limit for NRE-sourced purchases.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* FAQ */}
                  <h2 className="mb-4">Frequently Asked Questions</h2>
                  <div className="accordion mb-5" id="nriFaqAccordion">
                    {faqItems.map((faq, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div className="accordion-item border-0 border-bottom" key={faq.question}>
                          <h3 className="accordion-header" id={`nriFaqHeading${idx}`}>
                            <button
                              className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
                              type="button"
                              aria-expanded={isOpen}
                              aria-controls={`nriFaqCollapse${idx}`}
                              onClick={() =>
                                setOpenFaqIndex((currentIndex) =>
                                  currentIndex === idx ? -1 : idx
                                )
                              }
                            >
                              {faq.question}
                            </button>
                          </h3>
                          <div
                            id={`nriFaqCollapse${idx}`}
                            className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
                            aria-labelledby={`nriFaqHeading${idx}`}
                          >
                            <div className="accordion-body text-muted">{faq.answer}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <Link to="/properties" className="btn btn-main me-3">
                      Browse Properties
                    </Link>
                    <Link to="/contact" className="btn btn-outline-main">
                      Contact Us
                    </Link>
                  </div>
                </article>
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

export default NriPropertyGuide;
