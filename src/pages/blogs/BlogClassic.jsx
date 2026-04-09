import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import BlogClassicSection from '../../components/blog/BlogClassicSection';
import SEO from '../../common/SEO';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { I18nLink } from '../../i18n/I18nLink';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';

const BlogClassic = () => {
    const { t } = useTranslation('blog');
    const [searchParams] = useSearchParams();

    // Category / tag / page awareness
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const isFiltered = Boolean(category || tag);

    // Featured guides derived from translation keys
    const featuredGuides = [
        {
            title: t('featuredGuides.marketReports.title'),
            description: t('featuredGuides.marketReports.description'),
            links: [
                { label: t('featuredGuides.marketReports.guideLabel'), to: '/gurugram-real-estate-guide' },
                { label: t('featuredGuides.marketReports.investmentLabel'), to: '/property-investment-gurugram' },
            ],
        },
        {
            title: t('featuredGuides.localityResearch.title'),
            description: t('featuredGuides.localityResearch.description'),
            links: [
                { label: t('featuredGuides.localityResearch.directoryLabel'), to: '/localities' },
                { label: t('featuredGuides.localityResearch.searchLabel'), to: '/properties' },
            ],
        },
        {
            title: t('featuredGuides.planningTools.title'),
            description: t('featuredGuides.planningTools.description'),
            links: [
                { label: t('featuredGuides.planningTools.emiLabel'), to: '/emi-calculator' },
                { label: t('featuredGuides.planningTools.checklistLabel'), to: '/property-document-checklist' },
            ],
        },
    ];

    // Build dynamic title and description
    const baseTitle = t('blogClassicPage.baseTitle');
    const seoTitle = category
        ? `${category} | ${baseTitle}`
        : tag
            ? `${tag} | ${baseTitle}`
            : baseTitle;

    const baseDescription = t('blogClassicPage.baseDescription');
    const seoDescription = category
        ? t('blogClassicPage.categoryArticles', { category, baseDescription })
        : tag
            ? t('blogClassicPage.taggedPosts', { tag, baseDescription })
            : baseDescription;

    // Canonical: /blog for page 1, /blog?page=N for page > 1
    const canonical = page > 1 ? `/blog?page=${page}` : '/blog';

    // Prev/next for pagination
    const prevUrl = page > 1 ? (page === 2 ? '/blog' : `/blog?page=${page - 1}`) : undefined;
    const nextUrl = page > 1 ? `/blog?page=${page + 1}` : undefined;

    // Generate CollectionPage schema for blog listings
    const blogCollectionSchema = {
        '@type': 'CollectionPage',
        name: seoTitle,
        description: seoDescription,
        url: 'https://360ghar.com/blog',
        about: {
            '@type': 'Thing',
            name: 'Real Estate in Gurugram'
        },
        mainEntity: {
            '@type': 'ItemList',
            name: t('blogClassicPage.collectionName'),
            description: t('blogClassicPage.collectionDesc')
        }
    };

    return (
        <>
        <SEO
          title={seoTitle}
          description={seoDescription}
          keywords="real estate blog, property tips, buying guide, renting guide, PG accommodation advice, investment in real estate, Gurgaon property market, Gurugram property market, Delhi NCR real estate, price trends, locality guides"
          canonical={canonical}
          image={siteMetadata.defaultOgImage}
          type="blog"
          noindex={isFiltered}
          prevUrl={prevUrl}
          nextUrl={nextUrl}
          structuredData={[
            blogCollectionSchema,
            generateBreadcrumbStructuredData([
              { name: t('blogClassicPage.breadcrumbHome'), url: 'https://360ghar.com/' },
              { name: t('blogClassicPage.breadcrumbBlog'), url: 'https://360ghar.com/blog' }
            ])
          ]}
        />
        <OffCanvas />
        <MobileMenu />

        <main className="body-bg">
            <Header
                headerClass="dark-header has-border"
                headerMenusClass="mx-auto"
                btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                btnLink="/post-property"
                btnText="Post Property"
                spanClass="icon-right text-gradient"
                showContactNumber={false}
            />

            <section className="padding-y-60 bg-white">
                <div className="container container-two">
                    <div className="row g-4 align-items-start">
                        <div className="col-lg-7">
                            <span className="subtitle bg-gray-100 px-3 py-2 rounded-pill d-inline-block mb-3">{t('blogClassic.subtitle')}</span>
                            <h1 className="mb-3">{t('blogClassic.title')}</h1>
                            <p className="text-muted mb-4">
                                {t('blogClassic.desc')}
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                                <a href="#latest-posts" className="btn btn-main">{t('blogClassic.browseLatest')}</a>
                                <I18nLink to="/localities" className="btn btn-outline-main">{t('blogClassic.exploreLocalities')}</I18nLink>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="row g-3">
                                {featuredGuides.map((group) => (
                                    <div className="col-12" key={group.title}>
                                        <div className="locality-stat-card h-100">
                                            <span className="locality-stat-card__label">{group.title}</span>
                                            <p className="text-muted mb-3">{group.description}</p>
                                            <div className="d-flex flex-wrap gap-2">
                                                {group.links.map((link) => (
                                                    <I18nLink key={link.to} to={link.to} className="btn btn-outline-main btn-sm">
                                                        {link.label}
                                                    </I18nLink>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="latest-posts">
                <BlogClassicSection/>
            </section>

            <Cta ctaClass=""/>
            <Footer/>
        </main>
        </>
    );
};

export default BlogClassic;
