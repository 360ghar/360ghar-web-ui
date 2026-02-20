const fallbackAmenities = [
    {
        icon: 'fa-route',
        title: 'Road Connectivity',
        description: 'Smooth access to key Gurgaon corridors for everyday commute.'
    },
    {
        icon: 'fa-school',
        title: 'Education Access',
        description: 'Well-connected to schools, coaching hubs, and childcare options.'
    },
    {
        icon: 'fa-hospital',
        title: 'Healthcare Network',
        description: 'Convenient reach to clinics, diagnostics, and multispecialty hospitals.'
    },
    {
        icon: 'fa-shopping-bag',
        title: 'Retail and Essentials',
        description: 'Daily essentials, shopping, and dining zones available nearby.'
    },
    {
        icon: 'fa-tree',
        title: 'Open Spaces',
        description: 'Neighborhood parks and recreation spaces support family lifestyle.'
    },
    {
        icon: 'fa-shield-alt',
        title: 'Community Living',
        description: 'Gated pockets and active resident communities across the area.'
    }
];

const LocalityAmenities = ({ localityName, items = [] }) => {
    const amenities = items.length > 0 ? items : fallbackAmenities;

    return (
        <section id="locality-amenities" className="locality-section locality-amenities-v2">
            <div className="locality-section__head">
                <span className="locality-section__eyebrow">Living Experience</span>
                <h2 className="locality-section__title">Amenities Around {localityName}</h2>
                <p className="locality-section__desc">
                    Core infrastructure and everyday lifestyle conveniences that define resident experience in this locality.
                </p>
            </div>

            <div className="row g-3 g-lg-4">
                {amenities.map((amenity) => (
                    <div className="col-sm-6 col-xl-4" key={amenity.title}>
                        <article className="locality-feature-card h-100">
                            <div className="locality-feature-card__icon" aria-hidden="true">
                                <i className={`fas ${amenity.icon}`}></i>
                            </div>
                            <h3 className="locality-feature-card__title">{amenity.title}</h3>
                            <p className="locality-feature-card__desc mb-0">{amenity.description}</p>
                        </article>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default LocalityAmenities;
