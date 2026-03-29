import { useMemo } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import ProjectDetailsSection from '../../components/project/ProjectDetailsSection';
import { useParams } from 'react-router-dom';

import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { projectItems } from '../../data/OthersPageData';

/**
 * Resolve project metadata from the URL slug for SEO purposes.
 * Matches against the same explicit project slugs used by ProjectSection.
 */
const resolveProjectMeta = (slug) => {
    if (!slug) return null;
    const match = projectItems.find((item) => item.slug === slug);
    if (match) {
        return {
            title: match.title,
            desc: match.desc,
            city: 'Gurugram',
        };
    }
    return null;
};

const ProjectDetails = () => {
    const { title } = useParams();

    const projectMeta = useMemo(() => resolveProjectMeta(title), [title]);
    const isNotFound = !projectMeta;

    // Dynamic SEO
    const seoTitle = projectMeta
        ? `${projectMeta.title} in ${projectMeta.city} | 360Ghar`
        : 'Project Not Found | 360Ghar';
    const seoDescription = projectMeta?.desc
        || 'View detailed information about this real estate project including amenities, floor plans, and virtual tours.';
    const seoKeywords = projectMeta
        ? `${projectMeta.title} ${projectMeta.city}, real estate project, floor plans, amenities`
        : 'real estate project, floor plans, amenities';

    // Structured data: BreadcrumbList
    const breadcrumbData = generateBreadcrumbStructuredData([
        { name: 'Home', url: siteMetadata.siteUrl },
        { name: 'Projects', url: `${siteMetadata.siteUrl}/project` },
        ...(projectMeta
            ? [{ name: projectMeta.title, url: `${siteMetadata.siteUrl}/project/${title}` }]
            : []),
    ]);

    return (
        <>
            <SEO
                title={seoTitle}
                description={seoDescription}
                keywords={seoKeywords}
                canonical={`/project/${title}`}
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={breadcrumbData}
                noindex={isNotFound}
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

                {/* Project Details Section */}
                <ProjectDetailsSection />

                {/* Cta */}
                <Cta ctaClass="" />

                {/* Footer */}
                <Footer />

            </main>
        </>
    );
};

export default ProjectDetails;
