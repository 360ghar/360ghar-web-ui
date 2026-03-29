import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import ProjectSection from '../../components/project/ProjectSection';

import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';

const Project = () => {
    return (
        <>
        <SEO
            title="Real Estate Projects in Gurugram | 360Ghar"
            description="Explore new and upcoming real estate projects in Gurugram. Find residential and commercial developments with virtual tours."
            keywords="real estate projects, new projects Gurugram, upcoming developments, residential projects, commercial projects"
            canonical="/projects"
            image={siteMetadata.defaultOgImage}
            type="website"
        />
        <OffCanvas />
        <MobileMenu />

        <main className="body-bg">
            
            {/* Header */}
            <Header
                headerClass="dark-header has-border"
                headerMenusClass="mx-auto"
                btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                btnLink="/post-property"
                btnText="Post Property"
                spanClass="icon-right text-gradient"
                showContactNumber={false}
            />

            
            {/* Project Section */}
            <ProjectSection/>     

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>   
        </>
    );
};

export default Project;