import React, { useContext } from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/Cta';
import { useParams } from 'react-router-dom';
import BlogDetailsSection from '../../components/BlogDetailsSection';
import { BlogDataContext } from '../../contextApi/BlogDataContext';
import PageTitle from '../../common/PageTitle';

const BlogDetails = () => {

    const { title } = useParams(); 

    // Blog Data Context API
    const { blogData } = useContext(BlogDataContext); 

    return (
        <>
            <PageTitle title="360Ghar - Blog Details" />

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

