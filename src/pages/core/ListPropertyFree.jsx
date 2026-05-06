import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { I18nLink } from '../../i18n/I18nLink';

const ListPropertyFree = () => {
  const { t } = useTranslation();
  const [tSeo] = useTranslation('seo');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const breadcrumbs = [
    { name: 'Home', url: 'https://360ghar.com/' },
    { name: 'List Property Free', url: 'https://360ghar.com/list-property-free' },
  ];

  const faqItems = [
    {
      question: 'Is listing on 360Ghar really free?',
      answer:
        'Yes, listing your property on 360Ghar is completely free. There are zero upfront fees, no listing charges, and no hidden costs. You only pay the standard brokerage when a deal successfully closes. We earn when you earn.',
    },
    {
      question: 'Will I get spam calls after listing?',
      answer:
        'No. Unlike traditional portals that sell your phone number to multiple brokers and tele-callers, 360Ghar assigns you a dedicated Relationship Manager who handles all leads on your behalf. Your phone number is never publicly displayed or shared with third parties.',
    },
    {
      question: 'How is 360Ghar different from MagicBricks?',
      answer:
        'MagicBricks monetises by selling your contact details to brokers, resulting in relentless spam calls. 360Ghar is fundamentally different: we provide physical on-site verification, create 360° virtual tours for your listing at no cost, and assign a dedicated Relationship Manager who screens and qualifies all leads. Zero spam calls, zero upfront fees, full transparency.',
    },
    {
      question: 'What happens after I list my property?',
      answer:
        'Once you list, our team contacts you to schedule an on-site verification visit. We verify property documents, capture professional photos, and create a 360° virtual tour. Your dedicated Relationship Manager then handles all buyer inquiries, schedules visits, and manages negotiations on your behalf.',
    },
    {
      question: 'Do I need to pay brokerage?',
      answer:
        'Standard brokerage applies only when a deal successfully closes. There are no upfront charges, no listing fees, and no payment until you get results. This aligns our incentives with yours — we succeed only when you do.',
    },
    {
      question: 'How do virtual tours work on 360Ghar?',
      answer:
        'Our team creates studio-quality 360° guided walkthroughs of your property at no cost to you. Buyers can explore every room, check layouts, view amenities, and get a real feel of the space from anywhere. This significantly increases qualified inquiries and reduces casual time-wasters.',
    },
  ];

  const howToSteps = [
    {
      name: 'Create a Free Account',
      text: 'Sign up on 360Ghar in under 2 minutes with your phone number or email. No payment information needed — listing is always free.',
    },
    {
      name: 'Add Property Details and Photos',
      text: 'Fill in your property details — location, configuration, price, amenities — and upload photos. The more details you provide, the more qualified your leads will be.',
    },
    {
      name: 'Our Team Verifies On-Site',
      text: 'A 360Ghar team member visits your property to verify documents, confirm details, capture professional photos, and create a 360° virtual tour — all at no cost to you.',
    },
    {
      name: 'Dedicated RM Handles Leads',
      text: 'Your Relationship Manager qualifies every inquiry, schedules visits with genuine buyers, and manages negotiations. You never deal with spam calls — only serious, verified leads.',
    },
  ];

  const comparisonFeatures = [
    { feature: 'Spam Calls', magicbricks: 'Multiple daily', ghar: 'Zero' },
    { feature: 'Upfront Fees', magicbricks: 'Rs 1,500 - 15,000', ghar: 'Free' },
    { feature: '360° VR Tours', magicbricks: 'Not available', ghar: 'Included free' },
    { feature: 'Physical Verification', magicbricks: 'Not available', ghar: 'On-site team' },
    { feature: 'Dedicated RM', magicbricks: 'Not available', ghar: 'Assigned to you' },
    { feature: 'Brokerage', magicbricks: 'Brokerage + listing fees', ghar: 'Only on deal closure' },
  ];

  const structuredData = [
    generateBreadcrumbStructuredData(breadcrumbs),
    generateFaqStructuredData(faqItems),
    generateHowToStructuredData({
      name: 'How to List Your Property on 360Ghar for Free',
      description:
        'List your property on 360Ghar in 4 simple steps — from creating a free account to getting a dedicated Relationship Manager who handles all leads.',
      steps: howToSteps,
    }),
  ];

  return (
    <>
      <SEO
        title={tSeo('listPropertyFree.title')}
        description={tSeo('listPropertyFree.description')}
        keywords="list property free, post property free, sell property online, no spam calls property, 360Ghar vs MagicBricks, free property listing Gurgaon, virtual tour property listing"
        canonical="/list-property-free"
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
          btnText={t('common:header.postProperty')}
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        {/* Hero Section */}
        <section className="padding-y-120">
          <div className="container container-two">
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><I18nLink to="/">Home</I18nLink></li>
                <li className="breadcrumb-item active" aria-current="page">List Property Free</li>
              </ol>
            </nav>

            <div className="section-heading text-center mb-5">
              <h1 className="section-heading__title">
                Tired of MagicBricks Calling You? List on 360 Ghar for Free
              </h1>
              <p className="section-heading__desc">
                Zero spam calls. Zero upfront fees. Full transparency.
              </p>
            </div>

            <div className="row">
              <div className="col-lg-8 mx-auto">
                <article>
                  {/* Comparison Table */}
                  <h2 className="mb-4">360Ghar vs Other Portals</h2>
                  <p className="mb-3">
                    Most property portals make money by selling your contact information to brokers
                    and tele-callers. 360Ghar is built differently — we protect your privacy and
                    only earn when you successfully close a deal.
                  </p>
                  <div className="table-responsive mb-5">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Feature</th>
                          <th>Other Portals</th>
                          <th className="text-main">360Ghar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonFeatures.map((row) => (
                          <tr key={row.feature}>
                            <td className="fw-medium">{row.feature}</td>
                            <td className="text-muted">{row.magicbricks}</td>
                            <td className="fw-medium text-main">{row.ghar}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Step-by-Step Process */}
                  <h2 className="mb-4">How It Works — 4 Simple Steps</h2>
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

                  {/* USPs */}
                  <h2 className="mb-4">Why 360Ghar is Different</h2>
                  <div className="row g-3 mb-5">
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-white border h-100">
                        <h3 className="h6 mb-2">
                          <i className="fas fa-phone-slash text-gradient me-2" />
                          No Tele-Calling Harassment
                        </h3>
                        <p className="text-muted small mb-0">
                          Your number is never shared with brokers or telemarketers. Your
                          Relationship Manager handles all inquiries — you only hear from us when
                          there is a genuine, qualified lead.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-white border h-100">
                        <h3 className="h6 mb-2">
                          <i className="fas fa-check-circle text-gradient me-2" />
                          Physical Verification Included
                        </h3>
                        <p className="text-muted small mb-0">
                          Our on-site team visits your property to verify documents, confirm
                          details, and validate ownership. Verified listings get 3x more buyer
                          trust and engagement.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-white border h-100">
                        <h3 className="h6 mb-2">
                          <i className="fas fa-vr-cardboard text-gradient me-2" />
                          360° VR Tour for Free
                        </h3>
                        <p className="text-muted small mb-0">
                          We create a studio-quality 360° virtual tour of your property at no
                          cost. Buyers can walk through your property online, attracting serious
                          inquiries and reducing casual time-wasters.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-white border h-100">
                        <h3 className="h6 mb-2">
                          <i className="fas fa-handshake text-gradient me-2" />
                          Standard Brokerage Only on Deal Closure
                        </h3>
                        <p className="text-muted small mb-0">
                          No upfront fees, no listing charges, no hidden costs. You pay standard
                          brokerage only when the deal successfully closes. Our incentives are
                          aligned with yours — we succeed only when you do.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FAQ */}
                  <h2 className="mb-4">Frequently Asked Questions</h2>
                  <div className="accordion mb-5" id="listPropertyFaqAccordion">
                    {faqItems.map((faq, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div className="accordion-item border-0 border-bottom" key={faq.question}>
                          <h3 className="accordion-header" id={`listPropertyFaqHeading${idx}`}>
                            <button
                              className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
                              type="button"
                              aria-expanded={isOpen}
                              aria-controls={`listPropertyFaqCollapse${idx}`}
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
                            id={`listPropertyFaqCollapse${idx}`}
                            className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
                            aria-labelledby={`listPropertyFaqHeading${idx}`}
                          >
                            <div className="accordion-body text-muted">{faq.answer}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <I18nLink to="/post-property" className="btn btn-main me-3">
                      Post Property Free
                    </I18nLink>
                    <I18nLink to="/properties" className="btn btn-outline-main">
                      Browse Properties
                    </I18nLink>
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

export default ListPropertyFree;
