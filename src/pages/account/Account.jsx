import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/Cta';
import AccountSection from '../../components/AccountSection';
import PageTitle from '../../common/PageTitle';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

const Account = () => {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
        <PageTitle title="360Ghar - Account Page" />

        <main className="body-bg">
            
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

  
            {/* Account Section */}
            <AccountSection/>    

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>   
        </>
    );
};

export default Account;