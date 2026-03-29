import { useState } from 'react';

/**
 * Build FAQ items that vary by entityType so that sector, society, project,
 * and other pages get distinct FAQ content instead of identical templates.
 */
const defaultFaqBuilder = (localityName, entityType) => {
    const rawEntityType = (entityType || '').toLowerCase();

    // Sector-specific FAQs
    if (rawEntityType === 'sector') {
        return [
            {
                question: `What are the circle rates in ${localityName}?`,
                answer: `Circle rates in ${localityName} are set by the Haryana government and vary by property type, floor, and usage (residential vs. commercial). Check the latest circle rates on 360Ghar's Circle Rates page or the HSVP portal for ${localityName} before finalizing any transaction.`
            },
            {
                question: `Is ${localityName} a good area for real estate investment?`,
                answer: `${localityName} is a planned sector with defined infrastructure. Investment potential depends on current pricing relative to circle rates, proximity to employment hubs, and infrastructure upgrades in the pipeline. Compare listing activity and demand signals on 360Ghar before investing.`
            },
            {
                question: `What should I check before buying property in ${localityName}?`,
                answer: `Verify the property's RERA registration, ensure the plot or unit is in an HSVP-approved sector layout, confirm circle rates vs. market rates, and check for any pending litigation or encumbrances. A 360Ghar Relationship Manager can assist with due diligence.`
            },
            {
                question: `How is the connectivity from ${localityName} to major employment hubs?`,
                answer: `Sector-based localities in Gurugram typically connect to Cyber City, Udyog Vihar, and Golf Course Road via sector roads and arterial highways. Check peak-hour commute times and metro proximity for ${localityName} before deciding.`
            }
        ];
    }

    // Society-specific FAQs
    if (rawEntityType === 'society') {
        return [
            {
                question: `What amenities does ${localityName} offer?`,
                answer: `Amenities in ${localityName} typically include gated security, parking, power backup, green spaces, and a clubhouse. The exact amenity list depends on the society's size and builder specifications. Verify delivered vs. promised amenities with the RWA or builder.`
            },
            {
                question: `What are the maintenance charges in ${localityName}?`,
                answer: `Maintenance charges in ${localityName} vary based on the size of the society, amenities provided, and whether the RWA has taken over from the builder. Typical charges in Gurugram range from Rs. 2-8 per sq. ft. per month. Request the latest maintenance break-up from the seller or RWA.`
            },
            {
                question: `Is ${localityName} a gated community?`,
                answer: `Most society-type localities in Gurugram are gated with controlled entry, security staff, and CCTV coverage. Confirm the specific security arrangements and visitor management policies for ${localityName} before finalizing.`
            },
            {
                question: `How is the resale market for properties in ${localityName}?`,
                answer: `Resale demand in ${localityName} depends on the society's reputation, maintenance quality, and location within the city. Check active listing volumes and time-on-market data on 360Ghar to gauge liquidity.`
            }
        ];
    }

    // Project-specific FAQs
    if (rawEntityType === 'project') {
        return [
            {
                question: `What is the possession status of ${localityName}?`,
                answer: `${localityName} may be in pre-launch, under-construction, or ready-to-move phase. Check the developer's latest communication and RERA registration for the committed possession date and any delay compensation clauses.`
            },
            {
                question: `Who is the builder behind ${localityName} and what is their track record?`,
                answer: `Evaluate the builder's delivery history, financial health, and RERA compliance before booking in ${localityName}. Use 360Ghar's Builder Reputation tool to check developer credentials, past project delivery timelines, and buyer reviews.`
            },
            {
                question: `Is ${localityName} RERA registered?`,
                answer: `All real estate projects in Haryana must be registered under H-RERA. Verify ${localityName}'s RERA number on the official H-RERA portal. Cross-check approved building plans, land titles, and any complaints filed against the project.`
            },
            {
                question: `What payment plans are available for ${localityName}?`,
                answer: `Developers typically offer construction-linked, possession-linked, or down-payment plans for projects like ${localityName}. Compare the total cost under each plan including PLC, EDC/IDC, club membership, and maintenance deposit before choosing.`
            }
        ];
    }

    // Phase / Township-specific FAQs
    if (rawEntityType === 'phase' || rawEntityType === 'township') {
        return [
            {
                question: `What is the development status of ${localityName}?`,
                answer: `${localityName} is part of a phased or township development. Some phases may be fully delivered while others are under construction. Verify the specific phase status, delivered amenities, and pending infrastructure before committing.`
            },
            {
                question: `Does ${localityName} have integrated commercial and retail spaces?`,
                answer: `Township-style developments typically include designated commercial zones, retail strips, and convenience stores within the project boundary. Check the master plan for ${localityName} to understand commercial allocation and operational status.`
            },
            {
                question: `Is ${localityName} suitable for families?`,
                answer: `Evaluate the availability of schools, hospitals, parks, and community facilities within ${localityName}. Phased developments often deliver amenities progressively — confirm which facilities are operational today vs. planned.`
            },
            {
                question: `How should I compare ${localityName} with other township projects in ${localityName.includes('Gurgaon') || localityName.includes('Gurugram') ? 'Gurugram' : 'the city'}?`,
                answer: `Compare carpet area pricing, maintenance charges, delivered vs. promised amenities, builder reputation, and location relative to your workplace. 360Ghar provides verified data and locality insights to help with this comparison.`
            }
        ];
    }

    // Road / corridor-specific FAQs
    if (rawEntityType === 'road') {
        return [
            {
                question: `What are the advantages of living on ${localityName}?`,
                answer: `Road-based localities like ${localityName} offer direct access to commercial establishments, transit stops, and employment corridors. The trade-off is higher traffic and noise — higher floor units or setback buildings provide better livability.`
            },
            {
                question: `How is the noise level on ${localityName}?`,
                answer: `Major road corridors in Gurugram carry significant traffic during peak hours. If noise sensitivity is a concern, look for units on higher floors, those facing away from the main road, or behind noise barriers. Visit during rush hour for a realistic assessment.`
            },
            {
                question: `Are commercial properties available on ${localityName}?`,
                answer: `Road-facing localities in Gurugram often have mixed-use zoning with ground-floor commercial spaces, showrooms, and offices. Check with the 360Ghar team for verified commercial listings on ${localityName}.`
            },
            {
                question: `What should I check before renting on ${localityName}?`,
                answer: `Verify parking availability, water supply, power backup, and building maintenance quality. Road-facing properties may have dust and noise issues — check window sealing and floor height before finalizing your rental in ${localityName}.`
            }
        ];
    }

    // Default locality / village FAQs
    return [
        {
            question: `Is ${localityName} suitable for long-term investment?`,
            answer: `${localityName} shows sustained demand based on listing activity and buyer interest trends. Evaluate entry budget, holding period, and inventory quality before investing in this ${rawEntityType}.`
        },
        {
            question: `How should I evaluate properties in ${localityName}?`,
            answer: `Compare supply quality, developer track record, transport access, and resale/rental demand. Prioritize verified listings and on-ground site visits before finalizing.`
        },
        {
            question: `What daily lifestyle factors should families check here?`,
            answer: `Check school access, healthcare distance, community safety, and grocery convenience. Also validate commute times during peak hours for practical livability.`
        },
        {
            question: `How can I shortlist the right micro-pocket in ${localityName}?`,
            answer: `Use street-level factors such as congestion, access roads, noise levels, and society maintenance quality. Shortlist 2-3 options and compare before negotiation.`
        }
    ];
};

const LocalityFaq = ({ localityName, entityType, items = [] }) => {
    const [openIndex, setOpenIndex] = useState(0);
    const faqs = items.length > 0 ? items : defaultFaqBuilder(localityName, entityType);

    const onToggle = (index) => {
        setOpenIndex((prev) => (prev === index ? -1 : index));
    };

    return (
        <section id="locality-faq" className="locality-section locality-faq-v2">
            <div className="locality-section__head locality-section__head--centered">
                <span className="locality-section__eyebrow">FAQ</span>
                <h2 className="locality-section__title">Questions About {localityName}</h2>
                <p className="locality-section__desc">Clear answers to help buyers, tenants, and investors make faster decisions.</p>
            </div>

            <div className="locality-faq-list" role="list">
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    const answerId = `locality-faq-answer-${index}`;
                    const questionId = `locality-faq-question-${index}`;

                    return (
                        <article className={`locality-faq-item ${isOpen ? 'is-open' : ''}`} role="listitem" key={faq.question}>
                            <h3 className="mb-0">
                                <button
                                    id={questionId}
                                    type="button"
                                    className="locality-faq-item__question"
                                    aria-expanded={isOpen}
                                    aria-controls={answerId}
                                    onClick={() => onToggle(index)}
                                >
                                    <span>{faq.question}</span>
                                    <span className="locality-faq-item__icon" aria-hidden="true">
                                        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                                    </span>
                                </button>
                            </h3>
                            <div
                                id={answerId}
                                className="locality-faq-item__answer"
                                role="region"
                                aria-labelledby={questionId}
                                hidden={!isOpen}
                            >
                                <p className="mb-0">{faq.answer}</p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export { defaultFaqBuilder };
export default LocalityFaq;
