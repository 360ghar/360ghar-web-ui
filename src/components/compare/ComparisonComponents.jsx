import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import SectionHeading from '../../common/ui/SectionHeading';
import { ourAdvantages } from '../../data/competitors';

const ComparisonTable = ({ features, competitorFeatures, competitorName }) => {
  return (
    <div className="comparison-table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th className="us-column">
              <span className="brand-name">360 Ghar</span>
            </th>
            <th className="them-column">
              <span className="competitor-label">{competitorName}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => {
            const featureKey = feature.key;
            const competitorData = competitorFeatures?.[featureKey];
            
            return (
              <tr key={index}>
                <td className="feature-name">
                  <span>{featureKey}</span>
                  {feature.description && <small>{feature.description}</small>}
                </td>
                <td className="us-column">
                  <span className="check-icon">
                    <i className="fas fa-check-circle"></i>
                  </span>
                  {competitorData?.note && (
                    <span className="us-note">{competitorData.note}</span>
                  )}
                </td>
                <td className="them-column">
                  {competitorData?.them ? (
                    <span className="check-icon partial">
                      <i className="fas fa-check"></i>
                    </span>
                  ) : (
                    <span className="cross-icon">
                      <i className="fas fa-times-circle"></i>
                    </span>
                  )}
                  {competitorData?.note && !competitorData?.them && (
                    <span className="them-note">{competitorData.note}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const WhyChooseUs = ({ advantages = ourAdvantages }) => {
  return (
    <section className="why-choose-us-section padding-y-120 bg-white">
      <div className="container container-two">
        <SectionHeading
          headingClass="text-center"
          subtitle="Our Advantage"
          subtitleClass="bg-gray-100"
          title="Why Choose 360 Ghar?"
          renderDesc={true}
          desc="The smarter way to find your perfect property with verified listings and dedicated support"
        />
        
        <div className="row g-4 mt-4">
          {advantages.map((advantage, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
              <div className="advantage-card">
                <div className="advantage-icon">
                  <i className={advantage.icon}></i>
                </div>
                <h4 className="advantage-title">{advantage.title}</h4>
                <p className="advantage-desc">{advantage.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-5">
          <I18nLink to="/properties?city=Gurgaon&intent=buy" className="btn btn-main">
            Browse Verified Properties
            <span className="icon-right ms-2">
              <i className="fas fa-arrow-right"></i>
            </span>
          </I18nLink>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ text, author }) => {
  return (
    <div className="testimonial-card">
      <div className="testimonial-quote">
        <i className="fas fa-quote-left"></i>
      </div>
      <p className="testimonial-text">&ldquo;{text}&rdquo;</p>
      <span className="testimonial-author">&mdash; {author}</span>
    </div>
  );
};

const ComparisonFAQ = ({ faqs, title = 'Frequently Asked Questions', subtitle = 'Get answers to common questions' }) => {
  return (
    <section className="comparison-faq padding-y-120">
      <div className="container container-two">
        <SectionHeading
          headingClass="text-center"
          subtitle="FAQ"
          subtitleClass="bg-gray-100"
          title={title}
          renderDesc={true}
          desc={subtitle}
        />
        
        <div className="faq-wrapper mt-4">
          {faqs.map((faq, index) => (
            <div className="faq-item" key={index}>
              <h4 className="faq-question">{faq.question}</h4>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const QuickComparison = ({ features, competitorFeatures, competitorName }) => {
  return (
    <div className="quick-comparison">
      {features.slice(0, 5).map((feature, index) => {
        const featureKey = feature.key;
        const competitorData = competitorFeatures?.[featureKey];
        
        return (
          <div className="quick-compare-item" key={index}>
            <div className="feature-label">{featureKey}</div>
            <div className="comparison-bars">
              <div className="bar us-bar">
                <span className="bar-label">360 Ghar</span>
                <div className="bar-fill full"></div>
              </div>
              <div className="bar them-bar">
                <span className="bar-label">{competitorName}</span>
                <div className={`bar-fill ${competitorData?.them ? 'partial' : 'empty'}`}></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ClaimsVsReality = ({ claims }) => {
  return (
    <div className="claims-reality-wrapper">
      {claims.map((item, index) => (
        <div className="claim-item" key={index}>
          <div className="claim-col">
            <span className="claim-badge">Claim</span>
            <p className="claim-text">{item.claim}</p>
          </div>
          <div className="reality-col">
            <span className="reality-badge">Reality</span>
            <p className="reality-text">{item.reality}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const IssueCard = ({ title, description, source }) => {
  return (
    <div className="issue-card">
      <h4 className="issue-title">{title}</h4>
      <p className="issue-description">{description}</p>
      {source && <span className="issue-source">Source: {source}</span>}
    </div>
  );
};

const CompareBreadcrumb = ({ items }) => {
  return (
    <div className="compare-breadcrumb">
      <div className="container container-two">
        <ol className="compare-breadcrumb-list">
          {items.map((item, index) => (
            <li 
              key={index} 
              className={`compare-breadcrumb-item ${index === items.length - 1 ? 'compare-breadcrumb-item--active' : ''}`}
            >
              {item.url ? (
                <I18nLink to={item.url}>{item.name}</I18nLink>
              ) : (
                item.name
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export { 
  ComparisonTable, 
  WhyChooseUs, 
  TestimonialCard, 
  ComparisonFAQ,
  QuickComparison,
  ClaimsVsReality,
  IssueCard,
  CompareBreadcrumb
};
