const fallbackConnectivity = [
    {
        icon: 'fa-subway',
        name: 'Metro Access',
        details: 'Access to major metro corridors supporting city-wide travel.'
    },
    {
        icon: 'fa-road',
        name: 'Road Network',
        details: 'Quick links to arterial roads, business districts, and expressways.'
    },
    {
        icon: 'fa-plane-departure',
        name: 'Airport Reach',
        details: 'Airport connectivity suited for frequent business and personal travel.'
    },
    {
        icon: 'fa-briefcase',
        name: 'Employment Hubs',
        details: 'Commute-friendly access to office clusters and enterprise zones.'
    }
];

const ConnectivitySection = ({ localityName, summary, items = [] }) => {
    const connectivityItems = items.length > 0 ? items : fallbackConnectivity;

    return (
        <section id="locality-connectivity" className="locality-section locality-connectivity-v2">
            <div className="locality-section__head">
                <span className="locality-section__eyebrow">Connectivity</span>
                <h2 className="locality-section__title">How {localityName} Connects to Gurugram</h2>
                <p className="locality-section__desc">
                    {summary || `This locality offers practical access to transport routes, employment nodes, and essential city infrastructure.`}
                </p>
            </div>

            <div className="locality-connectivity-grid">
                {connectivityItems.map((item) => (
                    <article className="locality-connectivity-card" key={item.name}>
                        <div className="locality-connectivity-card__icon" aria-hidden="true">
                            <i className={`fas ${item.icon}`}></i>
                        </div>
                        <div>
                            <h3 className="locality-connectivity-card__title">{item.name}</h3>
                            <p className="locality-connectivity-card__desc mb-0">{item.details}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default ConnectivitySection;
