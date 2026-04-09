import { I18nLink } from '../../i18n/I18nLink';
import { toolFeatures } from '../../data/HomeOneData';
import './ToolShowcase.scss';

const ToolShowcase = () => {
    return (
        <section className="tool-showcase">
            {/* Decorative Background Elements */}
            <div className="tool-showcase__bg">
                <div className="tool-showcase__grid"></div>
                <div className="tool-showcase__gradient-orb tool-showcase__gradient-orb--1"></div>
                <div className="tool-showcase__gradient-orb tool-showcase__gradient-orb--2"></div>
                <div className="tool-showcase__float-shape tool-showcase__float-shape--1"></div>
                <div className="tool-showcase__float-shape tool-showcase__float-shape--2"></div>
                <div className="tool-showcase__float-shape tool-showcase__float-shape--3"></div>
            </div>

            <div className="container">
                {/* Section Header */}
                <div className="tool-showcase__header">
                    <span className="tool-showcase__badge">
                        <span className="tool-showcase__badge-dot"></span>
                        Smart Tools
                    </span>
                    <h2 className="tool-showcase__title">
                        Plan & Analyze Your
                        <span className="tool-showcase__title-gradient"> Dream Home</span>
                    </h2>
                    <p className="tool-showcase__subtitle">
                        Powerful AI-driven tools to help you design and validate your perfect living space
                    </p>
                </div>

                {/* Tool Cards */}
                <div className="tool-showcase__cards">
                    {toolFeatures.map((tool, index) => (
                        <I18nLink
                            to={tool.btnLink}
                            className="tool-card"
                            key={index}
                            style={{ '--card-index': index }}
                        >
                            {/* Card Glow Effect */}
                            <div className="tool-card__glow"></div>

                            {/* Card Border Gradient */}
                            <div className="tool-card__border"></div>

                            {/* Card Content */}
                            <div className="tool-card__inner">
                                {/* Icon Container */}
                                <div className="tool-card__icon-wrap">
                                    <div className="tool-card__icon-bg"></div>
                                    <div className="tool-card__icon">
                                        {index === 0 ? (
                                            // 3D Blueprint Icon
                                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 12L24 4L42 12V36L24 44L6 36V12Z" stroke="url(#grad1)" strokeWidth="2" strokeLinejoin="round"/>
                                                <path d="M24 4V44" stroke="url(#grad1)" strokeWidth="2"/>
                                                <path d="M6 12L24 20L42 12" stroke="url(#grad1)" strokeWidth="2" strokeLinejoin="round"/>
                                                <path d="M12 28V18L20 22" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M36 28V18L28 22" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <defs>
                                                    <linearGradient id="grad1" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#ff8c3a"/>
                                                        <stop offset="1" stopColor="#cc5500"/>
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        ) : index === 1 ? (
                                            // Vastu Compass Icon
                                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="24" cy="24" r="20" stroke="url(#grad2)" strokeWidth="2"/>
                                                <circle cx="24" cy="24" r="14" stroke="url(#grad2)" strokeWidth="1.5" strokeDasharray="4 2"/>
                                                <path d="M24 8V12" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round"/>
                                                <path d="M24 36V40" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round"/>
                                                <path d="M8 24H12" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round"/>
                                                <path d="M36 24H40" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round"/>
                                                <path d="M24 18L28 24L24 30L20 24L24 18Z" fill="url(#grad2)"/>
                                                <circle cx="24" cy="24" r="3" fill="#1a1a2e"/>
                                                <defs>
                                                    <linearGradient id="grad2" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#ff8c3a"/>
                                                        <stop offset="1" stopColor="#cc5500"/>
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        ) : (
                                            // AI Design Wand Icon
                                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M28 4L30 10L36 8L32 14L38 16L32 18L36 24L30 22L28 28L26 22L20 24L24 18L18 16L24 14L20 8L26 10L28 4Z" fill="url(#grad3)"/>
                                                <path d="M10 42L26 26" stroke="url(#grad3)" strokeWidth="3" strokeLinecap="round"/>
                                                <path d="M6 46L14 38" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round"/>
                                                <circle cx="28" cy="16" r="3" fill="#1a1a2e"/>
                                                <defs>
                                                    <linearGradient id="grad3" x1="6" y1="4" x2="44" y2="46" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#ff8c3a"/>
                                                        <stop offset="1" stopColor="#cc5500"/>
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="tool-card__icon-ring"></div>
                                </div>

                                {/* Text Content */}
                                <div className="tool-card__content">
                                    <h3 className="tool-card__title">{tool.title}</h3>
                                    <p className="tool-card__desc">{tool.desc}</p>
                                </div>

                                {/* CTA Button */}
                                <div className="tool-card__cta">
                                    <span className="tool-card__cta-text">{tool.btnText}</span>
                                    <span className="tool-card__cta-arrow">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                </div>

                                {/* Decorative Corner */}
                                <div className="tool-card__corner tool-card__corner--tl"></div>
                                <div className="tool-card__corner tool-card__corner--tr"></div>
                                <div className="tool-card__corner tool-card__corner--bl"></div>
                                <div className="tool-card__corner tool-card__corner--br"></div>
                            </div>
                        </I18nLink>
                    ))}
                </div>

                {/* Bottom Tagline */}
                <div className="tool-showcase__footer">
                    <div className="tool-showcase__footer-line"></div>
                    <span className="tool-showcase__footer-text">Trusted by 2000+ homeowners</span>
                    <div className="tool-showcase__footer-line"></div>
                </div>
            </div>
        </section>
    );
};

export default ToolShowcase;
