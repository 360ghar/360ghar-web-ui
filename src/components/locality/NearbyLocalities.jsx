import { Link } from 'react-router-dom';

const NearbyLocalities = ({ currentLocality, items = [], city = 'Gurgaon' }) => {
    if (!items.length) return null;

    return (
        <section id="locality-nearby" className="locality-section locality-nearby-v2">
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 locality-section__head locality-section__head--compact">
                <div>
                    <span className="locality-section__eyebrow">Discover More</span>
                    <h2 className="locality-section__title mb-2">Nearby Localities to {currentLocality}</h2>
                    <p className="locality-section__desc mb-0">Compare similar neighborhoods across {city} before finalizing your shortlist.</p>
                </div>
                <Link to="/localities" className="btn btn-outline-main rounded-pill">
                    Browse All Localities
                </Link>
            </div>

            <div className="row g-3 g-lg-4">
                {items.map((locality) => (
                    <div className="col-sm-6 col-lg-4" key={locality.slug}>
                        <Link to={`/locality/${locality.slug}-gurgaon`} className="locality-nearby-card text-decoration-none">
                            <span className="locality-nearby-card__type">{locality.entityType || locality.type || 'Locality'}</span>
                            <h3 className="locality-nearby-card__title">{locality.name}</h3>
                            <span className="locality-nearby-card__link">
                                Explore locality
                                <i className="fas fa-arrow-right ms-2" aria-hidden="true"></i>
                            </span>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default NearbyLocalities;
