import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import SEO from '../../common/SEO';
import { 
    aiAgentShowcaseContent, 
    aiAgentHowItWorks, 
    aiAgentCapabilities, 
    aiAgentMCPTools,
    aiAgentUseCases,
    aiAgentFAQs,
    aiAgentStats,
    aiAgentCTASection
} from '../../data/AIAgentData';
import { siteMetadata } from '../../seo/siteMetadata';
import './AIAgent.scss';

const AIAgent = () => {
    const structuredData = [
        {
            '@type': 'Service',
            name: 'AI-Powered Real Estate Assistant',
            description: 'Intelligent AI assistant that helps find properties, book visits, and manage rentals through natural conversation. Powered by MCP server integration.',
            provider: {
                '@type': 'Organization',
                name: '360Ghar',
                url: siteMetadata.siteUrl
            },
            areaServed: 'Gurgaon, Delhi NCR, India',
            serviceType: 'AI Real Estate Assistant'
        },
        {
            '@type': 'SoftwareApplication',
            name: '360Ghar MCP Server',
            description: 'Model Context Protocol server enabling AI assistants like Claude and ChatGPT to access 360Ghar real estate services.',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web-based',
            url: aiAgentShowcaseContent.mcpUrl,
            provider: {
                '@type': 'Organization',
                name: '360Ghar'
            }
        },
        {
            '@type': 'FAQPage',
            mainEntity: aiAgentFAQs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer
                }
            }))
        }
    ];

    return (
        <>
            <SEO
                title="AI Real Estate Assistant | 360Ghar - Smart Property Search & Management"
                description="Meet your AI-powered real estate assistant. Find properties, book visits, and manage rentals through natural conversation. Connect via MCP server with Claude, ChatGPT, and more."
                keywords="AI real estate assistant, MCP server, ChatGPT real estate, AI property search, smart property management, AI landlord assistant, conversational property search"
                canonical="/ai-agent"
                image={siteMetadata.defaultOgImage}
                structuredData={structuredData}
            />
            <Header headerClass="dark-header has-border" />

            <main className="body-bg">
                {/* Hero Section */}
                <section className="ai-hero">
                    <div className="ai-hero__bg">
                        <div className="ai-hero__grid"></div>
                        <div className="ai-hero__gradient-orb ai-hero__gradient-orb--1"></div>
                        <div className="ai-hero__gradient-orb ai-hero__gradient-orb--2"></div>
                    </div>
                    <div className="container">
                        <div className="ai-hero__content">
                            <span className="ai-hero__badge">
                                <span className="ai-hero__badge-dot"></span>
                                {aiAgentShowcaseContent.badge}
                            </span>
                            <h1 className="ai-hero__title">
                                Your AI-Powered<br />
                                <span className="ai-hero__title-gradient">Real Estate Partner</span>
                            </h1>
                            <p className="ai-hero__desc">
                                Find properties, book visits, and manage your rentals — all through natural conversation. 
                                No apps to navigate, no forms to fill. Just ask.
                            </p>
                            <div className="ai-hero__cta">
                                <I18nLink to="/mcp/login" className="btn btn-main">
                                    Connect AI Assistant
                                    <span className="icon-right"><i className="fas fa-arrow-right"></i></span>
                                </I18nLink>
                                <a href="#how-it-works" className="btn btn-outline-main bg-white">
                                    See How It Works
                                </a>
                            </div>
                            <div className="ai-hero__mcp">
                                <span className="ai-hero__mcp-label">MCP Server:</span>
                                <code className="ai-hero__mcp-url">{aiAgentShowcaseContent.mcpUrl}</code>
                            </div>
                        </div>
                        <div className="ai-hero__visual">
                            <div className="ai-hero__chat">
                                <div className="ai-hero__chat-header">
                                    <span className="ai-hero__chat-dot"></span>
                                    <span className="ai-hero__chat-dot"></span>
                                    <span className="ai-hero__chat-dot"></span>
                                </div>
                                <div className="ai-hero__chat-body">
                                    <div className="ai-hero__chat-message ai-hero__chat-message--user">
                                        Find a 2BHK furnished apartment in DLF Phase 3 under 35k
                                    </div>
                                    <div className="ai-hero__chat-message ai-hero__chat-message--ai">
                                        <p>Found 12 matching properties in DLF Phase 3:</p>
                                        <ul>
                                            <li><strong>₹32,000</strong> - 2BHK Furnished, DLF Phase 3</li>
                                            <li><strong>₹34,500</strong> - 2BHK Semi-Furnished, DLF Phase 3</li>
                                            <li><strong>₹30,000</strong> - 2BHK Furnished, DLF Phase 2</li>
                                        </ul>
                                        <p>Would you like me to schedule a visit?</p>
                                    </div>
                                    <div className="ai-hero__chat-message ai-hero__chat-message--user">
                                        Yes, this Saturday afternoon
                                    </div>
                                    <div className="ai-hero__chat-message ai-hero__chat-message--ai">
                                        ✓ Visit scheduled for Saturday, 2:00 PM at DLF Phase 3 property (₹32,000). You&apos;ll receive a confirmation shortly.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="ai-stats">
                    <div className="container">
                        <div className="ai-stats__grid">
                            <div className="ai-stats__item">
                                <span className="ai-stats__number">{aiAgentStats.propertiesSearched}</span>
                                <span className="ai-stats__label">Properties Searched</span>
                            </div>
                            <div className="ai-stats__item">
                                <span className="ai-stats__number">{aiAgentStats.visitsScheduled}</span>
                                <span className="ai-stats__label">Visits Scheduled</span>
                            </div>
                            <div className="ai-stats__item">
                                <span className="ai-stats__number">{aiAgentStats.queriesHandled}</span>
                                <span className="ai-stats__label">AI Availability</span>
                            </div>
                            <div className="ai-stats__item">
                                <span className="ai-stats__number">{aiAgentStats.accuracy}</span>
                                <span className="ai-stats__label">Match Accuracy</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="ai-how-it-works" id="how-it-works">
                    <div className="container">
                        <div className="ai-section-header">
                            <span className="ai-section-header__badge">How It Works</span>
                            <h2 className="ai-section-header__title">Three Simple Steps to AI-Powered Real Estate</h2>
                            <p className="ai-section-header__desc">Connect once, then just ask. Your AI assistant handles the rest.</p>
                        </div>
                        <div className="ai-how-it-works__grid">
                            {aiAgentHowItWorks.map((item, index) => (
                                <div className="ai-how-it-works__card" key={index}>
                                    <span className="ai-how-it-works__step">{item.step}</span>
                                    <h3 className="ai-how-it-works__title">{item.title}</h3>
                                    <p className="ai-how-it-works__desc">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Capabilities */}
                <section className="ai-capabilities">
                    <div className="container">
                        <div className="ai-section-header">
                            <span className="ai-section-header__badge">Capabilities</span>
                            <h2 className="ai-section-header__title">Everything You Can Do With AI</h2>
                            <p className="ai-section-header__desc">From property search to rent collection — manage it all through conversation</p>
                        </div>
                        <div className="ai-capabilities__grid">
                            {aiAgentCapabilities.map((capability, index) => (
                                <div className="ai-capabilities__card" key={index}>
                                    <h3 className="ai-capabilities__title">{capability.title}</h3>
                                    <ul className="ai-capabilities__list">
                                        {capability.items.map((item, i) => (
                                            <li key={i}>
                                                <i className="fas fa-check"></i>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* MCP Integration */}
                <section className="ai-mcp">
                    <div className="container">
                        <div className="ai-section-header">
                            <span className="ai-section-header__badge">MCP Integration</span>
                            <h2 className="ai-section-header__title">Connect Any AI Assistant</h2>
                            <p className="ai-section-header__desc">Our Model Context Protocol server integrates with Claude, ChatGPT, and more</p>
                        </div>
                        <div className="ai-mcp__content">
                            <div className="ai-mcp__info">
                                <div className="ai-mcp__url-box">
                                    <span className="ai-mcp__url-label">Server URL</span>
                                    <code className="ai-mcp__url">{aiAgentShowcaseContent.mcpUrl}</code>
                                </div>
                                <p className="ai-mcp__info-text">
                                    The MCP (Model Context Protocol) server enables any AI assistant to access 360Ghar services. 
                                    Connect once, and your AI gains permanent access to property search, visit scheduling, and management tools.
                                </p>
                                <div className="ai-mcp__supported">
                                    <span>Supported Assistants:</span>
                                    <div className="ai-mcp__assistants">
                                        <span className="ai-mcp__assistant">Claude</span>
                                        <span className="ai-mcp__assistant">ChatGPT</span>
                                        <span className="ai-mcp__assistant">Custom AI</span>
                                    </div>
                                </div>
                            </div>
                            <div className="ai-mcp__tools">
                                <h4 className="ai-mcp__tools-title">Available Tools</h4>
                                <div className="ai-mcp__tools-grid">
                                    {aiAgentMCPTools.map((tool, index) => (
                                        <div className="ai-mcp__tool" key={index}>
                                            <code>{tool.name}</code>
                                            <span>{tool.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases */}
                <section className="ai-use-cases">
                    <div className="container">
                        <div className="ai-section-header">
                            <span className="ai-section-header__badge">Use Cases</span>
                            <h2 className="ai-section-header__title">Real Scenarios, Real Results</h2>
                            <p className="ai-section-header__desc">See how different users benefit from AI-powered real estate</p>
                        </div>
                        <div className="ai-use-cases__grid">
                            {aiAgentUseCases.map((useCase, index) => (
                                <div className="ai-use-cases__card" key={index}>
                                    <span className="ai-use-cases__role">{useCase.role}</span>
                                    <div className="ai-use-cases__scenario">
                                        <strong>Need:</strong> {useCase.scenario}
                                    </div>
                                    <div className="ai-use-cases__conversation">
                                        <strong>You say:</strong>
                                        <code>{useCase.conversation}</code>
                                    </div>
                                    <div className="ai-use-cases__result">
                                        <strong>Result:</strong> {useCase.result}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="ai-faq">
                    <div className="container">
                        <div className="ai-section-header">
                            <span className="ai-section-header__badge">FAQ</span>
                            <h2 className="ai-section-header__title">Frequently Asked Questions</h2>
                            <p className="ai-section-header__desc">Everything you need to know about 360Ghar&apos;s AI Agent</p>
                        </div>
                        <div className="ai-faq__grid">
                            {aiAgentFAQs.map((faq, index) => (
                                <div className="ai-faq__item" key={index}>
                                    <h4 className="ai-faq__question">{faq.question}</h4>
                                    <p className="ai-faq__answer">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="ai-cta">
                    <div className="ai-cta__bg">
                        <div className="ai-cta__gradient-orb"></div>
                    </div>
                    <div className="container">
                        <div className="ai-cta__content">
                            <span className="ai-cta__badge">{aiAgentCTASection.badge}</span>
                            <h2 className="ai-cta__title">{aiAgentCTASection.title}</h2>
                            <p className="ai-cta__desc">{aiAgentCTASection.subtitle}</p>
                            <div className="ai-cta__buttons">
                                <I18nLink to={aiAgentCTASection.primaryLink} className="btn btn-main btn-lg">
                                    {aiAgentCTASection.primaryCTA}
                                    <span className="icon-right"><i className="fas fa-arrow-right"></i></span>
                                </I18nLink>
                                <I18nLink to={aiAgentCTASection.secondaryLink} className="btn btn-outline-light btn-lg">
                                    {aiAgentCTASection.secondaryCTA}
                                </I18nLink>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};

export default AIAgent;
