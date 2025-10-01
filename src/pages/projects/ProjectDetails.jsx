import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/Cta';
import ProjectDetailsSection from '../../components/ProjectDetailsSection';
import { useParams } from 'react-router-dom';
import PageTitle from '../../common/PageTitle';

const ProjectDetails = () => {

    const {title} = useParams(); 

    return (
        <>
        <PageTitle title="360Ghar - Project Details" />

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

            
            {/* Project Details Section */}
            <ProjectDetailsSection/>

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>   
        </>
    );
};

export default ProjectDetails;