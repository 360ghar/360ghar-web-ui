import React, { useEffect, useState } from 'react';
import SidebarCategoryList from './SidebarCategoryList';
import SidebarRecentPost from './SidebarRecentPost';
import SidebarProperty from './SidebarProperty';
import { Link } from 'react-router-dom';
import { blogService } from '../services/blogService';

const CommonSidebar = ({ renderProperties, renderSearch, renderTags }) => {
    const [tags, setTags] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [tagsError, setTagsError] = useState(null);

    useEffect(() => {
        if (!renderTags) return;
        let mounted = true;
        const fetchTags = async () => {
            try {
                setTagsLoading(true);
                setTagsError(null);
                const data = await blogService.getTags();
                const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
                if (mounted) setTags(items);
            } catch (err) {
                if (mounted) setTagsError(err?.response?.data?.detail || err?.message || 'Failed to load tags');
            } finally {
                if (mounted) setTagsLoading(false);
            }
        };
        fetchTags();
        return () => { mounted = false; };
    }, [renderTags]);
    return (
        <>
            <div className="common-sidebar-wrapper">
                {
                    renderSearch && (
                        <div className="common-sidebar p-0">
                            <form action="#" autoComplete="off">
                                <div className="search-box style-two w-100">
                                    <input type="text" className="common-input" placeholder="Type here..."/>
                                    <button type="submit" className="icon"><i className="fas fa-search"></i></button>
                                </div>
                            </form>
                        </div>
                    )
                }

                <div className="common-sidebar">
                    <h6 className="common-sidebar__title"> Category </h6>
                    <SidebarCategoryList/>
                </div>

                <div className="common-sidebar">
                    <h6 className="common-sidebar__title"> Recent Post </h6>
                    <SidebarRecentPost/>
                </div>

                {
                    renderProperties && (
                        <div className="common-sidebar">
                            <h6 className="common-sidebar__title"> Properties </h6>
                            <SidebarProperty/>
                        </div>  
                    )
                }

                {
                    renderTags && (
                        <div className="common-sidebar">
                            <h6 className="common-sidebar__title"> Tags </h6>
                            <ul className="tag-list">
                                {tagsLoading && <li className="tag-list__item">Loading...</li>}
                                {tagsError && !tagsLoading && <li className="tag-list__item text-danger">{tagsError}</li>}
                                {!tagsLoading && !tagsError && tags.map((tag, i) => (
                                    <li className="tag-list__item" key={tag.id || i}>
                                        <Link to={`/blog?tag=${tag.slug || tag.id}`} className="tag-list__link">{tag.name || tag.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                }
            </div>   
        </>
    );
};

export default CommonSidebar;