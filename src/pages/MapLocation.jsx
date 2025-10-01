import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Cta from '../components/Cta';
import MapLocationSection from '../components/MapLocationSection';
import PageTitle from '../common/PageTitle';

const MapLocation = () => {
    return (
        <>
        <PageTitle title="360Ghar - Map Location" />

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

            
            {/* Map Location  */}
            <MapLocationSection/>

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>   
        </>
    );
};

export default MapLocation;