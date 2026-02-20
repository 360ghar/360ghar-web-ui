import { useState } from 'react';

const defaultFaqBuilder = (localityName, entityType) => [
    {
        question: `Is ${localityName} suitable for long-term investment?`,
        answer: `${localityName} shows sustained demand based on listing activity and buyer interest trends. Evaluate entry budget, holding period, and inventory quality before investing in this ${entityType.toLowerCase()}.`
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

export default LocalityFaq;
