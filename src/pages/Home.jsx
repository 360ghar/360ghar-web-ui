import React from 'react';

import Header from '../common/Header';
import Footer from '../common/Footer';
import MobileMenu from '../common/MobileMenu';
import OffCanvas from '../common/OffCanvas';
import BannerThree from '../components/BannerThree';
import AboutThree from '../components/AboutThree';
import PropertyType from '../components/PropertyType';
import PropertyTwo from '../components/PropertyTwo';
import MessageThree from '../components/MessageThree';
import AreasWeCover from '../components/AreasWeCover';
import Newsletter from '../components/Newsletter';
import TestimonialThree from '../components/TestimonialThree';
import CounterThree from '../components/CounterThree';
import Faq from '../components/Faq';
import BlogThree from '../components/BlogThree';
import PageTitle from '../common/PageTitle';

const Home = () => {
    return (
        <>
        
        <PageTitle title="360Ghar - Home Three" />
            <OffCanvas/>
            <MobileMenu/>
            
            <main className="body-bg">

                {/* Header */}
                <Header />

                {/* Banner Three */}
                <BannerThree/>

                {/* About Three */}
                <AboutThree/>

                {/* Property Type */}
                <PropertyType/>

                {/* Property Two */}
                <PropertyTwo/>
                
                {/* Message Three */}
                <MessageThree/>


                {/* Newsletter */}
                <Newsletter/>

                {/* Testimonial Three */}
                <TestimonialThree/>

                {/* Counter Three */}
                <CounterThree/>

                {/* Faq */}
                <Faq/>

                {/* Blog Three */}
                <BlogThree/>

                {/* Footer */}
                <Footer/>
                
            </main>   
        </>
    );
};

export default Home;