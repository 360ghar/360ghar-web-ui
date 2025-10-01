import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/Cta';
import BlogClassicSection from '../../components/BlogClassicSection';
import PageTitle from '../../common/PageTitle';

const BlogClassic = () => {
    return (
        <>
        <PageTitle title="360Ghar - Blog Classic" />

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