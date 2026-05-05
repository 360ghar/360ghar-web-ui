import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import ProjectSection from '../../components/project/ProjectSection';
import { useTranslation } from 'react-i18next';

import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';

const Project = () => {
    const { t } = useTranslation('projects');

    return (
        <>
        <SEO
            title={t('projectPage.seoTitle')}
            description={t('projectPage.seoDescription')}
            keywords={t('projectPage.seoKeywords')}
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
                btnText={t('common:header.postProperty')}
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