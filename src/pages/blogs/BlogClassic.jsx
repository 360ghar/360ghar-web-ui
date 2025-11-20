import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/ui/Cta';
import BlogClassicSection from '../../components/blog/BlogClassicSection';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';

const BlogClassic = () => {
    return (
        <>
        <SEO
          title="Real Estate Blog | 360Ghar Insights"
          description="Guides and insights on buying, renting, PGs, investment trends, locality deep-dives, and market updates across Gurugram and Delhi NCR."
          keywords="real estate blog, property tips, buying guide, renting guide, PG accommodation advice, investment in real estate, Gurugram property market, Delhi NCR real estate, price trends, locality guides"
          canonical="/blog"
          image={siteMetadata.defaultOgImage}
          type="blog"
        />
        <PageTitle title="Real Estate Blog | 360Ghar" />

            {/* Header */}
            <Header
                headerClass="dark-header has-border"
                headerMenusClass="mx-auto"
                btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                btnLink="/add-new-listing"
                btnText="Add Listing"
                spanClass="icon-right text-gradient"
                showContactNumber={false}
            />

            
            <BlogClassicSection/> 

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>
        </>
    );
};

export default BlogClassic;
