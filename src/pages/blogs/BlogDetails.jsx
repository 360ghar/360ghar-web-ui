import React, { useContext, useMemo } from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/ui/Cta';
import { useParams } from 'react-router-dom';
import BlogDetailsSection from '../../components/blog/BlogDetailsSection';
import { BlogDataContext } from '../../contextApi/BlogDataContext';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { generateBlogStructuredData } from '../../seo/structuredData';
import { siteMetadata } from '../../seo/siteMetadata';

const BlogDetails = () => {

    const { title } = useParams(); 

    // Blog Data Context API
    const { blogData } = useContext(BlogDataContext);
    const meta = useMemo(() => {
        const titleText = blogData?.title || 'Real Estate Blog | 360Ghar';
        const descText = blogData?.desc || 'Read insights on buying, renting, PGs, locality guides, and investment trends in Gurugram and Delhi NCR.';
        const image = blogData?.thumb || siteMetadata.defaultOgImage;
        const url = blogData?.slug ? `/blog/${blogData.slug}` : undefined;
        const ld = generateBlogStructuredData({
            title: titleText,
            description: descText,
            image,
            url: url ? `${siteMetadata.siteUrl}${url}` : undefined,
            slug: blogData?.slug,
            publishedAt: blogData?.publishedAt,
            updatedAt: blogData?.updatedAt,
        });
        return { titleText, descText, image, url, ld };
    }, [blogData]);

    return (
        <>
            <SEO
              title={`${meta.titleText}`}
              description={meta.descText}
              keywords={`real estate blog, property tips, ${meta.titleText}`}
              canonical={meta.url}
              image={meta.image}
              type="article"
              structuredData={meta.ld}
            />
            <PageTitle title={meta.titleText} />

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

            
            <BlogDetailsSection/>

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>
        </>
    );
};

export default BlogDetails;
