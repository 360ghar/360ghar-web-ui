
import { useParams } from 'react-router-dom';
import { I18nLink } from '../../i18n/I18nLink';
import { challengeLists, projectSidebarLists, projectItems } from '../../data/OthersPageData';
import { socialLists } from '../../data/CommonData';

import LazyImage from '../../common/ui/LazyImage';

/**
 * Resolve project data from the URL slug.
 * Looks up the project in the static projectItems array by matching
 * the explicit route slug used by ProjectSection and the sitemap.
 */
const resolveProjectFromSlug = (slug) => {
    if (!slug) return null;

    const match = projectItems.find((item) => item.slug === slug);
    if (match) {
        return {
            title: match.title,
            desc: match.desc || '',
            thumb: match.thumb || '/assets/images/thumbs/project-img1.webp',
            city: 'Gurugram',
        };
    }

    return null;
};

const ProjectDetailsSection = () => {
    const { title: slug } = useParams();

    const project = resolveProjectFromSlug(slug);

    // Get formatted current date
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })}`;

    // --- Not found state ---
    if (!project) {
        return (
            <section className="project-details padding-y-120">
                <div className="container container-two">
                    <div className="text-center py-5">
                        <h2 className="project-details__title mb-3">Project Not Found</h2>
                        <p className="font-18 mb-4">
                            The project you are looking for does not exist or has been removed.
                        </p>
                        <I18nLink to="/project" className="btn btn-main">
                            Browse All Projects
                        </I18nLink>
                    </div>
                </div>
            </section>
        );
    }

    // Safely split description into two paragraphs
    const desc = project.desc || '';
    const descFirst = desc.slice(0, 250);
    const descSecond = desc.slice(251, 900);

    return (
        <>
            <section className="project-details padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4">
                        <div className="col-lg-8">
                            <div className="project-details__thumb">
                                <LazyImage
                                    src={project.thumb}
                                    alt={project.title || 'Project details'}
                                    className="cover-img"
                                    width={800}
                                    height={500}
                                    priority
                                />
                            </div>
                            <div className="project-details__content">
                                <h2 className="project-details__title">{project.title}</h2>
                                {descFirst && (
                                    <p className="project-details__desc font-18">{descFirst}</p>
                                )}
                                {descSecond && (
                                    <p className="project-details__desc font-18">{descSecond}</p>
                                )}

                                <h6 className="border-title">Project Challenges</h6>
                                <p className="project-details__desc font-18">Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis viverra laoreet augue mattis ferment ullamcorer viverra laoreet Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper ere viverra .Aliquam eros justo, posuere lobortis non, viverra Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere </p>

                                <ul className="text-list-two">
                                    {challengeLists.map((challengeList, challengeListIndex) => (
                                        <li className="text-list-two__item font-18" key={challengeListIndex}>
                                            {challengeList.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="project-sidebar__box mt-0">
                                <ul className="project-sidebar">
                                    {projectSidebarLists.map((projectSidebarList, projectSidebarListIndex) => (
                                        <li className="project-sidebar__item" key={projectSidebarListIndex}>
                                            <span className="project-sidebar__text font-12">
                                                {projectSidebarList.text}
                                            </span>
                                            <h6 className="project-sidebar__title font-16 fw-semibold mb-0">
                                                {projectSidebarList.title}
                                            </h6>
                                        </li>
                                    ))}
                                    {project.city && (
                                        <li className="project-sidebar__item">
                                            <span className="project-sidebar__text font-12">City</span>
                                            <h6 className="project-sidebar__title font-16 fw-semibold mb-0">
                                                {project.city}
                                            </h6>
                                        </li>
                                    )}
                                    <li className="project-sidebar__item">
                                        <span className="project-sidebar__text font-12">Date</span>
                                        <h6 className="project-sidebar__title font-16 fw-semibold mb-0">
                                            {formattedDate}
                                        </h6>
                                    </li>
                                </ul>
                                <ul className="social-share-list style-two mt-lg-5 mt-4">
                                    {socialLists.map((socialList, socialListIndex) => (
                                        <li className="social-share-list__item" key={socialListIndex}>
                                            <I18nLink to={socialList.link} className="social-share-list__link">
                                                {socialList.icon}
                                            </I18nLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProjectDetailsSection;
