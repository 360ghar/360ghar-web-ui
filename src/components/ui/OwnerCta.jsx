import { Link } from 'react-router-dom';

import LazyImage from '../../common/ui/LazyImage';
const OwnerCta = ({ className = '' }) => {
  return (
    <section className={`cta padding-b-120 ${className}`}>
      <div className="container container-two">
        <div className="cta-box flx-between gap-2">
          <div className="cta-content">
            <h2 className="cta-content__title">Free <span className="text-gradient">Owner Onboarding</span> + Studio-Quality Photography</h2>
            <p className="cta-content__desc">We come to your doorstep and list your property (Rent, PG, or Sale) with studio-quality 360° guided walkthroughs and physically verified details. Zero upfront fees — just serious inquiries and complete peace of mind.</p>
            <div className="d-flex gap-3 mt-3">
              <Link to="/post-property" className="btn btn-main">Post Your Property</Link>
              {/* <Link to="/add-new-listing" className="btn btn-outline-main">Add Listing</Link> */}
            </div>
          </div>
          <div className="cta-content__thumb d-xl-block d-none">
            <LazyImage src="/assets/images/thumbs/cta-img.png" alt="Owner CTA" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnerCta;
