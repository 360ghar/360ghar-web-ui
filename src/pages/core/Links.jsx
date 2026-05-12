import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Breadcrumb from '../../common/layout/Breadcrumb';
import Logo from '../../common/Logo';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import socialLinks from '../../data/socialLinksData';

const PlatformIcon = ({ icon, iconSvg, color }) => {
  if (icon) {
    return <i className={icon} style={{ color }} />;
  }

  const svgs = {
    threads: (
      <svg width="18" height="18" viewBox="0 0 192 192" fill="currentColor" style={{ color }}>
        <path d="M141.6 88.2c-1.4-7.2-4.4-13-9-17.2-5.6-5.1-13.2-7.9-22.6-8.3-.8 0-1.6 0-2.4 0-13.2 0-23.2 5.2-29.2 14.8-3.4 5.5-5.2 12-5.6 19.4 2.8-4 6.2-7.2 10.4-9.4 5.6-3 12-4.2 18.8-3.6 8.4.8 15 4 19.4 9.2 4 4.6 6.2 10.2 6.2 16.4 0 6.6-2.2 12.4-6.4 17.2-4.4 5-10.2 8-17.2 8.6-.6 0-1.2.1-1.8.1-5.2 0-10-1.4-14-4.2-5.2-3.6-8.6-8.8-10.2-15.2-1-4-1.4-8.6-1.2-13.6.4-10 3-18.6 8-25.4 5.4-7.4 13.2-11.6 23-12.2 7.4-.4 14 1 19.4 4.2 4.8 2.8 8.4 7 10.8 12.2z" />
      </svg>
    ),
    sharechat: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
    moj: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
      </svg>
    ),
    josh: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color }}>
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
    koo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color }}>
        <path d="M16 4H8c-2.2 0-4 1.8-4 4v8c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4zm-1.5 12.5L12 13.5 9.5 16.5 8 15l3-3.5L8 8l1.5-1.5L12 9.5l2.5-3L16 8l-3 3.5 3 3.5-1.5 1.5z" />
      </svg>
    ),
  };

  return svgs[iconSvg] || <i className="fas fa-link" style={{ color }} />;
};

const SECTION_META = {
  follow: { label: 'Follow Us', description: null },
  review: { label: 'Review Us', description: 'Your reviews help others find us — thank you!' },
  app: { label: 'Our App', description: 'Get 360Ghar on your phone for the best experience.' },
};

const Links = () => {
  const { t } = useTranslation('policies');
  const [tSeo] = useTranslation('seo');
  const [copied, setCopied] = useState(false);

  const verifiedFollow = socialLinks.filter((l) => l.verified && (l.category || 'follow') === 'follow');
  const verifiedReview = socialLinks.filter((l) => l.verified && l.category === 'review');
  const verifiedApp = socialLinks.filter((l) => l.verified && l.category === 'app');
  const comingSoonLinks = socialLinks.filter((l) => !l.verified);

  const sections = [
    { key: 'follow', links: verifiedFollow },
    { key: 'review', links: verifiedReview },
    { key: 'app', links: verifiedApp },
  ].filter((s) => s.links.length > 0);

  const allVerifiedUrls = socialLinks.filter((l) => l.verified && l.url).map((l) => l.url);

  const pageUrl = `${siteMetadata.siteUrl}/links`;

  const structuredData = [
    {
      '@type': 'WebPage',
      name: '360Ghar - Find Us Everywhere',
      url: pageUrl,
      description: 'All official 360Ghar social media profiles, review pages, and app download links in one place.',
      isPartOf: { '@type': 'WebSite', name: siteMetadata.siteName, url: siteMetadata.siteUrl },
    },
    {
      '@type': 'Organization',
      name: siteMetadata.siteName,
      url: siteMetadata.siteUrl,
      sameAs: allVerifiedUrls,
    },
    generateBreadcrumbStructuredData([
      { name: 'Home', url: 'https://360ghar.com/' },
      { name: 'Links', url: 'https://360ghar.com/links' },
    ]),
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = pageUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <SEO
        title={tSeo('links.title', 'Find Us Everywhere - 360Ghar Social Links')}
        description={tSeo('links.description', 'All official 360Ghar social media profiles, review pages, and app download links in one place. Follow, review, and stay connected with 360Ghar.')}
        keywords="360Ghar social media, 360Ghar Instagram, 360Ghar Facebook, 360Ghar YouTube, 360Ghar LinkedIn, 360Ghar links, 360Ghar review, 360Ghar Google review, 360Ghar Play Store, 360Ghar app download"
        canonical="/links"
        image={siteMetadata.defaultOgImage}
        type="website"
        structuredData={structuredData}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/post-property"
          btnText={t('common:header.postProperty')}
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <Breadcrumb
          pageTitle="Links"
          pageName="Links"
          variant="compact"
        />

        <section className="links-page padding-y-60">
          <div className="container">
            <div className="links-page__wrapper">
              {/* Hero Card */}
              <div className="links-page__hero">
                <div className="links-page__logo">
                  <Logo />
                </div>
                <h1 className="links-page__title">Find Us Everywhere</h1>
                <p className="links-page__subtitle">
                  Follow, review, and stay connected with 360Ghar across all platforms.
                </p>
                <button
                  className={`links-page__share-btn ${copied ? 'links-page__share-btn--copied' : ''}`}
                  onClick={handleCopyLink}
                  type="button"
                >
                  <i className={copied ? 'fas fa-check' : 'fas fa-link'} />
                  <span>{copied ? 'Link Copied!' : 'Share This Page'}</span>
                </button>
              </div>

              {/* Grouped Sections: Follow Us, Review Us, Our App */}
              {sections.map((section) => {
                const meta = SECTION_META[section.key];
                return (
                  <div key={section.key}>
                    <div className="links-page__divider">
                      <span>{meta.label}</span>
                    </div>
                    {meta.description && (
                      <p className="links-page__section-desc">{meta.description}</p>
                    )}
                    <div className="links-page__list">
                      {section.links.map((link) => (
                        <a
                          key={link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`links-page__link${section.key === 'review' ? ' links-page__link--review' : ''}${section.key === 'app' ? ' links-page__link--app' : ''}`}
                        >
                          <span
                            className="links-page__link-icon"
                            style={{ '--platform-color': link.color }}
                          >
                            <PlatformIcon icon={link.icon} iconSvg={link.iconSvg} color={link.color} />
                          </span>
                          <span className="links-page__link-info">
                            <span className="links-page__link-platform">
                              {link.platform}
                              {section.key === 'review' && (
                                <span className="links-page__badge links-page__badge--star">
                                  <i className="fas fa-star" /> Review
                                </span>
                              )}
                            </span>
                            <span className="links-page__link-username">{link.username}</span>
                          </span>
                          <i className="fas fa-arrow-right links-page__link-arrow" />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Coming Soon Links */}
              {comingSoonLinks.length > 0 && (
                <>
                  <div className="links-page__divider">
                    <span>Coming Soon</span>
                  </div>
                  <div className="links-page__list links-page__list--coming-soon">
                    {comingSoonLinks.map((link) => (
                      <div
                        key={link.platform}
                        className="links-page__link links-page__link--coming-soon"
                      >
                        <span
                          className="links-page__link-icon"
                          style={{ '--platform-color': link.color }}
                        >
                          <PlatformIcon icon={link.icon} iconSvg={link.iconSvg} color={link.color} />
                        </span>
                        <span className="links-page__link-info">
                          <span className="links-page__link-platform">
                            {link.platform}
                            <span className="links-page__badge">Coming Soon</span>
                          </span>
                          <span className="links-page__link-username">{link.username}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Links;
