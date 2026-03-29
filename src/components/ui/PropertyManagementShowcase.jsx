import { pmShowcaseContent, pmFeatures, pmStats } from '../../data/PropertyManagementData';
import './PropertyManagementShowcase.scss';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.the360ghar.ghar360';

// SVG Icons for each feature
const FeatureIcon = ({ type }) => {
    switch (type) {
        case 'chart':
            return (
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="32" width="8" height="12" rx="1" stroke="url(#pmGrad1)" strokeWidth="2"/>
                    <rect x="20" y="20" width="8" height="24" rx="1" stroke="url(#pmGrad1)" strokeWidth="2"/>
                    <rect x="34" y="8" width="8" height="36" rx="1" stroke="url(#pmGrad1)" strokeWidth="2"/>
                    <path d="M10 28L24 16L38 4" stroke="url(#pmGrad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="38" cy="4" r="2" fill="url(#pmGrad1)"/>
                    <defs>
                        <linearGradient id="pmGrad1" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ff8c3a"/>
                            <stop offset="1" stopColor="#cc5500"/>
                        </linearGradient>
                    </defs>
                </svg>
            );
        case 'users':
            return (
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="14" r="8" stroke="url(#pmGrad2)" strokeWidth="2"/>
                    <path d="M8 42C8 34.268 15.164 28 24 28C32.836 28 40 34.268 40 42" stroke="url(#pmGrad2)" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="38" cy="12" r="5" stroke="url(#pmGrad2)" strokeWidth="1.5"/>
                    <path d="M44 30C44 25.5 40.5 22 38 22" stroke="url(#pmGrad2)" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="10" cy="12" r="5" stroke="url(#pmGrad2)" strokeWidth="1.5"/>
                    <path d="M4 30C4 25.5 7.5 22 10 22" stroke="url(#pmGrad2)" strokeWidth="1.5" strokeLinecap="round"/>
                    <defs>
                        <linearGradient id="pmGrad2" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ff8c3a"/>
                            <stop offset="1" stopColor="#cc5500"/>
                        </linearGradient>
                    </defs>
                </svg>
            );
        case 'wrench':
            return (
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M28 8C28 8 32 4 38 4C38 10 34 14 34 14L28 20L20 28L8 40C6 42 4 42 4 40C4 38 12 28 12 28L20 20L28 8Z" stroke="url(#pmGrad3)" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M38 4L44 10" stroke="url(#pmGrad3)" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M20 28L28 36" stroke="url(#pmGrad3)" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="38" cy="38" r="6" stroke="url(#pmGrad3)" strokeWidth="2"/>
                    <path d="M38 34V42" stroke="url(#pmGrad3)" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M34 38H42" stroke="url(#pmGrad3)" strokeWidth="2" strokeLinecap="round"/>
                    <defs>
                        <linearGradient id="pmGrad3" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ff8c3a"/>
                            <stop offset="1" stopColor="#cc5500"/>
                        </linearGradient>
                    </defs>
                </svg>
            );
        case 'folder':
            return (
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 14C6 12 8 10 10 10H18L22 14H38C40 14 42 16 42 18V38C42 40 40 42 38 42H10C8 42 6 40 6 38V14Z" stroke="url(#pmGrad4)" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M6 18H42" stroke="url(#pmGrad4)" strokeWidth="2"/>
                    <circle cx="24" cy="30" r="6" stroke="url(#pmGrad4)" strokeWidth="2"/>
                    <path d="M24 27V33" stroke="url(#pmGrad4)" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M21 30H27" stroke="url(#pmGrad4)" strokeWidth="2" strokeLinecap="round"/>
                    <defs>
                        <linearGradient id="pmGrad4" x1="6" y1="10" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ff8c3a"/>
                            <stop offset="1" stopColor="#cc5500"/>
                        </linearGradient>
                    </defs>
                </svg>
            );
        default:
            return null;
    }
};

const PropertyManagementShowcase = () => {
    return (
        <section className="pm-showcase">
            {/* Decorative Background Elements */}
            <div className="pm-showcase__bg">
                <div className="pm-showcase__grid"></div>
                <div className="pm-showcase__gradient-orb pm-showcase__gradient-orb--1"></div>
                <div className="pm-showcase__gradient-orb pm-showcase__gradient-orb--2"></div>
                <div className="pm-showcase__float-shape pm-showcase__float-shape--1"></div>
                <div className="pm-showcase__float-shape pm-showcase__float-shape--2"></div>
                <div className="pm-showcase__float-shape pm-showcase__float-shape--3"></div>
            </div>

            <div className="container">
                {/* Section Header */}
                <div className="pm-showcase__header">
                    <span className="pm-showcase__badge">
                        <span className="pm-showcase__badge-dot"></span>
                        {pmShowcaseContent.badge}
                    </span>
                    <h2 className="pm-showcase__title">
                        {pmShowcaseContent.title}
                        <span className="pm-showcase__title-gradient"> {pmShowcaseContent.titleGradient}</span>
                    </h2>
                    <p className="pm-showcase__subtitle">
                        {pmShowcaseContent.subtitle}
                    </p>
                </div>

                {/* Feature Cards - 2x2 Grid */}
                <div className="pm-showcase__cards">
                    {pmFeatures.map((feature, index) => (
                        <div
                            className="pm-card"
                            key={index}
                            style={{ '--card-index': index }}
                        >
                            {/* Card Glow Effect */}
                            <div className="pm-card__glow"></div>

                            {/* Card Border Gradient */}
                            <div className="pm-card__border"></div>

                            {/* Card Content */}
                            <div className="pm-card__inner">
                                {/* Icon Container */}
                                <div className="pm-card__icon-wrap">
                                    <div className="pm-card__icon-bg"></div>
                                    <div className="pm-card__icon">
                                        <FeatureIcon type={feature.icon} />
                                    </div>
                                    <div className="pm-card__icon-ring"></div>
                                </div>

                                {/* Text Content */}
                                <div className="pm-card__content">
                                    <h3 className="pm-card__title">{feature.title}</h3>
                                    <p className="pm-card__desc">{feature.description}</p>
                                </div>

                                {/* Highlight Badge */}
                                <div className="pm-card__highlight">
                                    <span>{feature.highlight}</span>
                                </div>

                                {/* Decorative Corners */}
                                <div className="pm-card__corner pm-card__corner--tl"></div>
                                <div className="pm-card__corner pm-card__corner--tr"></div>
                                <div className="pm-card__corner pm-card__corner--bl"></div>
                                <div className="pm-card__corner pm-card__corner--br"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer with CTA */}
                <div className="pm-showcase__footer">
                    <div className="pm-showcase__footer-line"></div>
                    <span className="pm-showcase__footer-text">{pmStats.footerText}</span>
                    <div className="pm-showcase__footer-line"></div>
                </div>

                {/* CTA Button */}
                <div className="pm-showcase__cta">
                    <a
                        href={PLAY_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pm-showcase__cta-btn"
                    >
                        <svg className="pm-showcase__cta-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z"/>
                        </svg>
                        <span className="pm-showcase__cta-text">
                            <span className="pm-showcase__cta-label">Get it on</span>
                            <span className="pm-showcase__cta-store">Google Play</span>
                        </span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default PropertyManagementShowcase;
