import { Link } from 'react-router-dom';
import { useState, useId } from 'react';

export const ToolFaq = ({ faqs, heading = 'Frequently Asked Questions' }) => {
  const [openIndex, setOpenIndex] = useState(0);
  const accordionId = useId();
  return (
    <div className="mt-5">
      <h2 className="h4 mb-3">{heading}</h2>
      <div className="accordion" id={accordionId}>
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div className="accordion-item border-0 border-bottom" key={faq.question}>
              <h3 className="accordion-header" id={`toolFaqHeading-${accordionId}-${idx}`}>
                <button
                  className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`toolFaqCollapse-${accordionId}-${idx}`}
                  onClick={() => setOpenIndex((current) => (current === idx ? -1 : idx))}
                >
                  {faq.question}
                </button>
              </h3>
              <div
                id={`toolFaqCollapse-${accordionId}-${idx}`}
                className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
                aria-labelledby={`toolFaqHeading-${accordionId}-${idx}`}
              >
                <div className="accordion-body text-muted">{faq.answer}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ToolRelatedLinks = ({ links, heading = 'Related Tools & Resources' }) => (
  <div className="mt-5">
    <h2 className="h4 mb-3">{heading}</h2>
    <div className="d-flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="btn btn-sm btn-outline-main rounded-pill"
        >
          {link.icon && <i className={`${link.icon} me-1`} />}
          {link.label}
        </Link>
      ))}
    </div>
  </div>
);

export const ToolInfoCard = ({ title, children }) => (
  <div className="mt-4 p-4 bg-light rounded-3 border">
    <h2 className="h5 mb-2">{title}</h2>
    {children}
  </div>
);

export const ToolComparisonTable = ({ title, headers, rows }) => (
  <div className="mt-4">
    <h2 className="h5 mb-3">{title}</h2>
    <div className="table-responsive">
      <table className="table table-bordered table-sm">
        <thead className="table-light">
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cidx) => (
                <td key={cidx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
