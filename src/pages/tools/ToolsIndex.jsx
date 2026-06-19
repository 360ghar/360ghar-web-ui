import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { I18nLink } from '../../i18n/I18nLink';
import Cta from '../../components/ui/Cta';

const TOOL_CATEGORIES = [
  {
    key: 'finance',
    tools: [
      { key: 'emiCalculator', icon: 'fas fa-calculator', route: '/emi-calculator' },
      { key: 'loanEligibility', icon: 'fas fa-university', route: '/loan-eligibility-calculator' },
      { key: 'capitalGains', icon: 'fas fa-receipt', route: '/capital-gains-tax-calculator' },
      { key: 'stampDuty', icon: 'fas fa-stamp', route: '/stamp-duty-calculator' },
      { key: 'rentReceipt', icon: 'fas fa-file-invoice', route: '/rent-receipt' },
    ],
  },
  {
    key: 'utilities',
    tools: [
      { key: 'areaConverter', icon: 'fas fa-exchange-alt', route: '/area-converter' },
      { key: 'areaCalculator', icon: 'fas fa-ruler-combined', route: '/area-calculator' },
      { key: 'fakeListingChecker', icon: 'fas fa-shield-alt', route: '/check-fake-listing' },
      { key: 'verifyOwnership', icon: 'fas fa-search', route: '/verify-ownership' },
    ],
  },
  {
    key: 'planning',
    tools: [
      { key: 'propertyChecklist', icon: 'fas fa-clipboard-check', route: '/property-document-checklist' },
    ],
  },
  {
    key: 'design',
    tools: [
      { key: 'aiDesignStudio', icon: 'fas fa-wand-magic-sparkles', route: '/ai-design-studio' },
      { key: 'designBlueprint', icon: 'fas fa-drafting-compass', route: '/design-blueprint' },
      { key: 'vastuChecker', icon: 'fas fa-compass', route: '/vastu-checker' },
    ],
  },
];

const ToolsIndex = () => {
  const { t } = useTranslation('tools');
  // AUDIT FIX (3.20): search/filter for the tools collection.
  const [query, setQuery] = useState('');

  // Flatten all tools for search and ItemList schema.
  const allTools = useMemo(
    () => TOOL_CATEGORIES.flatMap((c) => c.tools.map((tool) => ({ ...tool, category: c.key }))),
    []
  );

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOL_CATEGORIES;
    return TOOL_CATEGORIES.map((category) => ({
      ...category,
      tools: category.tools.filter((tool) => {
        const name = t(`toolsIndex.tool${tool.key}`).toLowerCase();
        const desc = t(`toolsIndex.tool${tool.key}Desc`).toLowerCase();
        return name.includes(q) || desc.includes(q) || tool.route.toLowerCase().includes(q);
      }),
    })).filter((category) => category.tools.length > 0);
  }, [query, t]);

  // AUDIT FIX (3.18): ItemList structured data for the tools collection.
  const itemListSchema = {
    '@type': 'ItemList',
    name: t('toolsIndex.headingTitle'),
    description: t('toolsIndex.headingDesc'),
    url: 'https://360ghar.com/tools',
    numberOfItems: allTools.length,
    itemListElement: allTools.map((tool, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: t(`toolsIndex.tool${tool.key}`),
      url: `https://360ghar.com${tool.route}`,
    })),
  };

  return (
    <>
      <SEO
        title={t('toolsIndex.title')}
        description={t('toolsIndex.description')}
        keywords={t('toolsIndex.keywords')}
        canonical="/tools"
        image={siteMetadata.defaultOgImage}
        type="website"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Tools', url: 'https://360ghar.com/tools' },
          ]),
          itemListSchema,
        ]}
      />
      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header />

        <section className="tools-index-hero padding-y-60">
          <div className="container">
            <div className="section-heading text-center mb-5">
              <h2 className="section-title">{t('toolsIndex.headingTitle')}</h2>
              <p className="section-desc">{t('toolsIndex.headingDesc')}</p>
            </div>

            {/* AUDIT FIX (3.20): search bar to filter tools */}
            <div className="row justify-content-center mb-4">
              <div className="col-lg-6 col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="fas fa-search color-text-3"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t('toolsIndex.searchPlaceholder', 'Search tools...')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search tools"
                  />
                  {query && (
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setQuery('')} aria-label="Clear search">
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="text-center py-40">
                <i className="fas fa-search fs-40 color-text-3 mb-15"></i>
                <p className="color-text-3">{t('toolsIndex.noResults', 'No tools match your search.')}</p>
              </div>
            ) : (
              filteredCategories.map((category) => (
              <div key={category.key} className="mb-5">
                <h3 className="tools-category-title mb-4">
                  <i className={`fas ${category.key === 'finance' ? 'fa-coins' : category.key === 'utilities' ? 'fa-tools' : category.key === 'planning' ? 'fa-tasks' : 'fa-palette'} me-2`} />
                  {t(`toolsIndex.category${category.key.charAt(0).toUpperCase() + category.key.slice(1)}`)}
                </h3>
                <div className="row g-4">
                  {category.tools.map((tool) => (
                    <div key={tool.key} className="col-md-6 col-lg-4 col-xl-3">
                      <I18nLink to={tool.route} className="tools-card-link">
                        <div className="tools-card">
                          <div className="tools-card__icon">
                            <i className={tool.icon} />
                          </div>
                          <h4 className="tools-card__title">{t(`toolsIndex.tool${tool.key}`)}</h4>
                          <p className="tools-card__desc">{t(`toolsIndex.tool${tool.key}Desc`)}</p>
                          <span className="tools-card__cta">
                            {t('toolsIndex.tryNow')} <i className="fas fa-arrow-right ms-1" />
                          </span>
                        </div>
                      </I18nLink>
                    </div>
                  ))}
                </div>
              </div>
            ))
            )}
          </div>
        </section>

        <section className="tools-why-section padding-y-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="section-heading text-center mb-5">
                  <h2 className="section-title">{t('toolsIndex.whyTitle')}</h2>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="tools-why-card">
                      <i className="fas fa-check-circle text-success me-2" />
                      <span>{t('toolsIndex.whyFree')}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="tools-why-card">
                      <i className="fas fa-check-circle text-success me-2" />
                      <span>{t('toolsIndex.whyIndian')}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="tools-why-card">
                      <i className="fas fa-check-circle text-success me-2" />
                      <span>{t('toolsIndex.whyAccurate')}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="tools-why-card">
                      <i className="fas fa-check-circle text-success me-2" />
                      <span>{t('toolsIndex.whyPrivacy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Cta />
        <Footer />
      </main>
    </>
  );
};

export default ToolsIndex;
