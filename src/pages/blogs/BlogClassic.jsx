import { useEffect, useState } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import BlogClassicSection from '../../components/blog/BlogClassicSection';
import SEO from '../../common/SEO';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import { I18nLink, stripLocalePrefix } from '../../i18n/I18nLink';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { blogService } from '../../services/blogService';

const BlogClassic = () => {
    const { t } = useTranslation('blog');
    const [tC] = useTranslation('common');
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Category / tag awareness (cursor pagination — no page count)
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const isFiltered = Boolean(category || tag);

    const POSTS_PER_PAGE = 10;
    // AUDIT FIX (4.5 / 4.4): popular posts for the blog listing + keyword
    // search box that redirects to the property search when no blog match.
    const [popularPosts, setPopularPosts] = useState([]);
    const [blogSearch, setBlogSearch] = useState('');

    useEffect(() => {
        const params = { limit: POSTS_PER_PAGE };
        if (category) params.category = category;
        if (tag) params.tag = tag;
        blogService.getPosts(params)
            .then(data => {
                const posts = Array.isArray(data?.items) ? data.items : [];
                setPopularPosts(Array.isArray(posts) ? posts.slice(0, 4) : []);
            })
            .catch(() => setPopularPosts([]));
    }, [category, tag]);

    // AUDIT FIX (4.5): fetch a few popular/recent posts for cross-linking.
    useEffect(() => {
        blogService.getPosts({ limit: 4 })
            .then(data => {
                const posts = Array.isArray(data?.items) ? data.items : [];
                setPopularPosts(Array.isArray(posts) ? posts.slice(0, 4) : []);
            })
            .catch(() => setPopularPosts([]));
    }, []);

    const barePath = stripLocalePrefix(location.pathname);

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

    // Canonical: the blog listing is a cursor-paginated "Load more" stream,
    // so there is no page N to canonicalize — use the bare path.
    const canonical = barePath;

    // Prev/next pagination links don't apply to an opaque-cursor stream.

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
          type="website"
          noindex={isFiltered}
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
                btnText={t('common:header.postProperty')}
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
                            {/* AUDIT FIX (4.4): blog keyword search box */}
                            <form
                                className="mt-4 d-flex gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (blogSearch.trim()) {
                                        // Redirect to the property search as the app-wide
                                        // search experience when looking up a keyword.
                                        window.location.href = `/properties?q=${encodeURIComponent(blogSearch.trim())}&city=Gurgaon`;
                                    }
                                }}
                            >
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={tC('contentSeo.searchPlaceholder')}
                                    value={blogSearch}
                                    onChange={(e) => setBlogSearch(e.target.value)}
                                    aria-label={tC('contentSeo.searchPlaceholder')}
                                />
                                <button type="submit" className="btn btn-outline-main">
                                    <i className="fas fa-search" />
                                </button>
                            </form>
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

            {/* AUDIT FIX (4.5): popular / recent posts cross-linking section */}
            {popularPosts.length > 0 && (
                <section className="padding-y-60 bg-light">
                    <div className="container container-two">
                        <div className="section-heading mb-4">
                            <h2 className="section-heading__title">{tC('contentSeo.relatedPosts')}</h2>
                            <p className="section-heading__desc">{tC('contentSeo.relatedPostsDesc')}</p>
                        </div>
                        <div className="row g-4">
                            {popularPosts.map((post) => {
                                const postTitle = post.title || 'Untitled';
                                const postSlug = post.slug;
                                const postThumb = post.thumbnail_url || post.cover_image_url || post.featured_image || post.image_url;
                                const postExcerpt = post.excerpt || post.summary || '';
                                return (
                                    <div className="col-lg-3 col-md-6" key={postSlug || postTitle}>
                                        <div className="locality-stat-card h-100">
                                            {postThumb && (
                                                <I18nLink to={`/blog/${postSlug}`} className="d-block mb-3">
                                                    <img src={postThumb} alt={postTitle} className="img-fluid rounded-3" loading="lazy" />
                                                </I18nLink>
                                            )}
                                            <h3 className="h6 mb-2">
                                                <I18nLink to={`/blog/${postSlug}`} className="text-decoration-none text-dark">
                                                    {postTitle}
                                                </I18nLink>
                                            </h3>
                                            {postExcerpt && (
                                                <p className="text-muted small mb-0">{postExcerpt.length > 100 ? `${postExcerpt.slice(0, 97)}...` : postExcerpt}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            <Cta ctaClass=""/>
            <Footer/>
        </main>
        </>
    );
};

export default BlogClassic;
