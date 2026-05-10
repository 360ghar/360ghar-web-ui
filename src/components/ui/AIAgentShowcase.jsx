import { I18nLink } from '../../i18n/I18nLink';
import { aiAgentShowcaseContent, aiAgentFeatures } from '../../data/AIAgentData';
import './AIAgentShowcase.scss';

const FeatureIcon = ({ type }) => {
    switch (type) {
        case 'search':
            return (
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="22" cy="22" r="14" stroke="url(#aiGrad1)" strokeWidth="2"/>
                    <path d="M32 32L42 42" stroke="url(#aiGrad1)" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="22" cy="22" r="3" fill="url(#aiGrad1)"/>
                    <path d="M16 22H20M22 18V26" stroke="url(#aiGrad1)" strokeWidth="1.5" strokeLinecap="round"/>
                    <defs>
                        <linearGradient id="aiGrad1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ff8c3a"/>
                            <stop offset="1" stopColor="#cc5500"/>
                        </linearGradient>
                    </defs>
                </svg>
            );
        case 'calendar':
            return (
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="10" width="36" height="32" rx="4" stroke="url(#aiGrad2)" strokeWidth="2"/>
                    <path d="M6 18H42" stroke="url(#aiGrad2)" strokeWidth="2"/>
                    <path d="M16 6V14M32 6V14" stroke="url(#aiGrad2)" strokeWidth="2" strokeLinecap="round"/>
                    <rect x="14" y="26" width="6" height="6" rx="1" fill="url(#aiGrad2)"/>
                    <rect x="28" y="26" width="6" height="6" rx="1" fill="url(#aiGrad2)"/>
                    <path d="M18 32H30" stroke="url(#aiGrad2)" strokeWidth="2" strokeLinecap="round"/>
                    <defs>
                        <linearGradient id="aiGrad2" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ff8c3a"/>
                            <stop offset="1" stopColor="#cc5500"/>
                        </linearGradient>
                    </defs>
                </svg>
            );
        case 'home':
            return (
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 20L24 6L40 20V42H30V32H18V42H8V20Z" stroke="url(#aiGrad3)" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M18 42V26H30V42" stroke="url(#aiGrad3)" strokeWidth="2"/>
                    <circle cx="24" cy="18" r="2" fill="url(#aiGrad3)"/>
                    <defs>
                        <linearGradient id="aiGrad3" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ff8c3a"/>
                            <stop offset="1" stopColor="#cc5500"/>
                        </linearGradient>
                    </defs>
                </svg>
            );
        case 'plug':
            return (
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="18" width="32" height="18" rx="4" stroke="url(#aiGrad4)" strokeWidth="2"/>
                    <path d="M16 18V14C16 11.79 17.79 10 20 10H28C30.21 10 32 11.79 32 14V18" stroke="url(#aiGrad4)" strokeWidth="2"/>
                    <path d="M18 28V36M30 28V36" stroke="url(#aiGrad4)" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="24" cy="27" r="2" fill="url(#aiGrad4)"/>
                    <path d="M20 24H28" stroke="url(#aiGrad4)" strokeWidth="1.5" strokeLinecap="round"/>
                    <defs>
                        <linearGradient id="aiGrad4" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
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

const AIAgentShowcase = () => {
    return (
        <section className="ai-agent-showcase">
            <div className="ai-agent-showcase__bg">
                <div className="ai-agent-showcase__grid"></div>
                <div className="ai-agent-showcase__gradient-orb ai-agent-showcase__gradient-orb--1"></div>
                <div className="ai-agent-showcase__gradient-orb ai-agent-showcase__gradient-orb--2"></div>
                <div className="ai-agent-showcase__float-shape ai-agent-showcase__float-shape--1"></div>
                <div className="ai-agent-showcase__float-shape ai-agent-showcase__float-shape--2"></div>
            </div>

            <div className="container">
                <div className="ai-agent-showcase__header">
                    <span className="ai-agent-showcase__badge">
                        <span className="ai-agent-showcase__badge-dot"></span>
                        {aiAgentShowcaseContent.badge}
                    </span>
                    <h2 className="ai-agent-showcase__title">
                        {aiAgentShowcaseContent.title}
                    </h2>
                    <p className="ai-agent-showcase__subtitle">
                        {aiAgentShowcaseContent.subtitle}
                        <span className="ai-agent-showcase__subtitle-highlight"> {aiAgentShowcaseContent.subtitleHighlight}</span>
                    </p>
                </div>

                <div className="ai-agent-showcase__cards">
                    {aiAgentFeatures.map((feature, index) => (
                        <div
                            className="ai-agent-card"
                            key={index}
                            style={{ '--card-index': index }}
                        >
                            <div className="ai-agent-card__glow"></div>
                            <div className="ai-agent-card__border"></div>
                            <div className="ai-agent-card__inner">
                                <div className="ai-agent-card__icon-wrap">
                                    <div className="ai-agent-card__icon-bg"></div>
                                    <div className="ai-agent-card__icon">
                                        <FeatureIcon type={feature.icon} />
                                    </div>
                                    <div className="ai-agent-card__icon-ring"></div>
                                </div>

                                <div className="ai-agent-card__content">
                                    <h3 className="ai-agent-card__title">{feature.title}</h3>
                                    <p className="ai-agent-card__desc">{feature.description}</p>
                                </div>

                                <div className="ai-agent-card__example">
                                    <span className="ai-agent-card__example-label">Try:</span>
                                    <span className="ai-agent-card__example-text">{feature.example}</span>
                                </div>

                                <div className="ai-agent-card__corner ai-agent-card__corner--tl"></div>
                                <div className="ai-agent-card__corner ai-agent-card__corner--tr"></div>
                                <div className="ai-agent-card__corner ai-agent-card__corner--bl"></div>
                                <div className="ai-agent-card__corner ai-agent-card__corner--br"></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="ai-agent-showcase__cta">
                    <I18nLink to="/ai-agent" className="ai-agent-showcase__cta-btn ai-agent-showcase__cta-btn--primary">
                        <span>Learn More</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </I18nLink>
                    <a 
                        href={aiAgentShowcaseContent.mcpUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ai-agent-showcase__cta-btn ai-agent-showcase__cta-btn--secondary"
                    >
                        <span>Connect via MCP</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </a>
                </div>

                <div className="ai-agent-showcase__mcp-url">
                    <span className="ai-agent-showcase__mcp-url-label">MCP Server:</span>
                    <code className="ai-agent-showcase__mcp-url-link">{aiAgentShowcaseContent.mcpUrl}</code>
                </div>
            </div>
        </section>
    );
};

export default AIAgentShowcase;
