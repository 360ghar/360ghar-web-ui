import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/ui/Cta';
import CartSection from '../../components/forms/CartSection';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';

const Cart = () => {
    return (
        <>
        <SEO title="Cart | 360Ghar" description="Cart page." canonical="/cart" noindex />
        <PageTitle title="360Ghar - Shopping Cart" />

        <main className="body-bg">
            
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

            
            {/* Cart Section */}
            <CartSection/>  

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>   
        </>
    );
};

export default Cart;
