import { I18nLink } from '../../i18n/I18nLink';

const LocalityHero = ({
    localityName,
    city,
    entityType,
    description,
    heroImage,
    stats = [],
    badgeText = 'Verified Locality Guide',
    marketStatus = 'Active Demand'
}) => {
    return (
        <section className="locality-hero-v2">
            <div className="container container-two">
                <div className="locality-hero-v2__shell">
                    <div className="row g-4 align-items-center">
                        <div className="col-lg-7">
                            <nav aria-label="breadcrumb" className="mb-3">
                                <ol className="locality-breadcrumb-list">
                                    <li className="locality-breadcrumb-item">
                                        <I18nLink to="/" className="text-decoration-none">Home</I18nLink>
                                    </li>
                                    <li className="locality-breadcrumb-item">
                                        <I18nLink to="/localities" className="text-decoration-none">Localities</I18nLink>
                                    </li>
                                    <li className="locality-breadcrumb-item locality-breadcrumb-item--active" aria-current="page">
                                        {localityName}
                                    </li>
                                </ol>
                            </nav>

                            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                                <span className="locality-pill">{badgeText}</span>
                                <span className="locality-status-pill">{marketStatus}</span>
                            </div>

                            <h1 className="locality-hero-v2__title mb-3">
                                {localityName}, <span>{city}</span>
                            </h1>

                            <p className="locality-hero-v2__desc mb-4">
                                {description}
                            </p>

                            <div className="d-flex flex-wrap gap-3">
                                <a href="#locality-properties" className="btn btn-main locality-hero-v2__cta">
                                    <i className="fas fa-building me-2" aria-hidden="true"></i>
                                    Browse Properties
                                </a>
                                <I18nLink to="/contact" className="btn btn-outline-main locality-hero-v2__cta">
                                    <i className="fas fa-calendar-check me-2" aria-hidden="true"></i>
                                    Schedule Site Visit
                                </I18nLink>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="locality-hero-v2__media">
                                <img src={heroImage} alt={`${localityName}, ${city}`} loading="eager" />
                                <div className="locality-hero-v2__entity-tag">
                                    <span className="text-uppercase">Type</span>
                                    <strong>{entityType}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {stats.length > 0 && (
                        <div className="locality-hero-v2__stats">
                            <div className="row g-3">
                                {stats.map((stat) => (
                                    <div className="col-sm-6 col-lg-3" key={stat.label}>
                                        <div className="locality-stat-card">
                                            <span className="locality-stat-card__label">{stat.label}</span>
                                            <strong className="locality-stat-card__value">{stat.value}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default LocalityHero;
