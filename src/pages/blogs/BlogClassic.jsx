import Header from '../../common/Header';
import Footer from '../../common/Footer';
import MobileMenu from '../../common/MobileMenu';
import OffCanvas from '../../common/OffCanvas';
import Cta from '../../components/ui/Cta';
import BlogClassicSection from '../../components/blog/BlogClassicSection';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';

const BlogClassic = () => {
    // Generate CollectionPage schema for blog listings
    const blogCollectionSchema = {
        '@type': 'CollectionPage',
        name: 'Real Estate Blog | 360Ghar Insights',
        description: 'Guides and insights on buying, renting, PGs, investment trends, locality deep-dives, and market updates across Gurgaon and Delhi NCR.',
        url: 'https://360ghar.com/blog',
        about: {
            '@type': 'Thing',
            name: 'Real Estate in Gurgaon'
        },
        mainEntity: {
            '@type': 'ItemList',
            name: 'Real Estate Articles',
            description: 'Latest insights on property buying, renting, and investment in Gurgaon',
            numberOfItems: 25 // Will be dynamic when blog posts are fetched
        }
    };

    return (
        <>
        <SEO
          title="Real Estate Blog | 360Ghar Insights"
          description="Guides and insights on buying, renting, PGs, investment trends, locality deep-dives, and market updates across Gurgaon and Delhi NCR."
          keywords="real estate blog, property tips, buying guide, renting guide, PG accommodation advice, investment in real estate, Gurgaon property market, Delhi NCR real estate, price trends, locality guides"
          canonical="/blog"
          image={siteMetadata.defaultOgImage}
          type="blog"
          structuredData={blogCollectionSchema}
        />
        <PageTitle title="Real Estate Blog | 360Ghar" />

        <OffCanvas />
        <MobileMenu />

        <main className="body-bg">
            {/* Header */}
            <Header
                headerClass="dark-header has-border"
                headerMenusClass="mx-auto"
                btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                btnLink="/post-property"
                btnText="Post Property"
                spanClass="icon-right text-gradient"
                showContactNumber={false}
            />
            
            <BlogClassicSection/> 

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>
        </main>
        </>
    );
};

export default BlogClassic;
