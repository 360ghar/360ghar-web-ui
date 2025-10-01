import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/Cta';
import CheckoutSection from '../../components/CheckoutSection';
import PageTitle from '../../common/PageTitle';

const Checkout = () => {
    return (
        <>
        <PageTitle title="360Ghar - Checkout" />

            {/* Header */}
            <Header 
                headerClass="dark-header has-border" 
                logoBlack={false}
                logoWhite={true}
                headerMenusClass="mx-auto"
                btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                btnLink="/add-new-listing"
                btnText="Add Listing"
                spanClass="icon-right text-gradient" 
                showHeaderBtn={true}
                showOffCanvasBtn={false}
                offCanvasBtnClass=""
                showContactNumber={false}
            />

                        
            {/* Checkout Section */}
            <CheckoutSection/>

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>
        </>
    );
};

export default Checkout;