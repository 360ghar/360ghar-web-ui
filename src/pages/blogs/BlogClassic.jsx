import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import BlogClassicSection from '../../components/blog/BlogClassicSection';
import SEO from '../../common/SEO';
import { Link, useSearchParams } from 'react-router-dom';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';

const featuredGuides = [
    {
        title: 'Market reports',
        description: 'Track Gurugram buying, renting, and locality trends before you shortlist.',
        links: [
            { label: 'Gurugram Real Estate Guide', to: '/gurugram-real-estate-guide' },
            { label: 'Property Investment in Gurugram', to: '/property-investment-gurugram' },
        ],
    },
    {
        title: 'Locality research',
        description: 'Move from broad city search into locality-level intelligence and price context.',
        links: [
            { label: 'Localities Directory', to: '/localities' },
            { label: 'Properties Search', to: '/properties' },
        ],
    },
    {
        title: 'Planning tools',
        description: 'Use calculators and checklists while reading guides so decisions stay grounded.',
        links: [
            { label: 'EMI Calculator', to: '/emi-calculator' },
            { label: 'Property Checklist', to: '/property-document-checklist' },
        ],
    },
];

const BlogClassic = () => {
    const [searchParams] = useSearchParams();

    // Category / tag / page awareness
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const isFiltered = Boolean(category || tag);

    // Build dynamic title and description
    const baseTitle = 'Real Estate Blog | 360Ghar Insights';
    const seoTitle = category
        ? `${category} | Real Estate Blog | 360Ghar`
        : tag
            ? `${tag} | Real Estate Blog | 360Ghar`
            : baseTitle;

    const baseDescription = 'Guides and insights on buying, renting, PGs, investment trends, locality deep-dives, and market updates across Gurugram and Delhi NCR.';
    const seoDescription = category
        ? `Browse ${category} articles. ${baseDescription}`
        : tag
            ? `Posts tagged "${tag}". ${baseDescription}`
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
            name: 'Real Estate Articles',
            description: 'Latest insights on property buying, renting, and investment in Gurugram'
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
              { name: 'Home', url: 'https://360ghar.com/' },
              { name: 'Blog', url: 'https://360ghar.com/blog' }
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
                            <span className="subtitle bg-gray-100 px-3 py-2 rounded-pill d-inline-block mb-3">Research Hub</span>
                            <h1 className="mb-3">Real Estate Guides for Gurugram and Delhi NCR</h1>
                            <p className="text-muted mb-4">
                                Use this hub for buying guides, rental checklists, locality research, investment notes, and property-planning tools. The latest posts load dynamically, but this page always keeps key research paths crawlable and easy to reach.
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                                <a href="#latest-posts" className="btn btn-main">Browse Latest Posts</a>
                                <Link to="/localities" className="btn btn-outline-main">Explore Localities</Link>
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
                                                    <Link key={link.to} to={link.to} className="btn btn-outline-main btn-sm">
                                                        {link.label}
                                                    </Link>
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
