import React, { useEffect, useState } from 'react';
import { blogService } from '../services/blogService';
import { Link } from 'react-router-dom';

const SidebarCategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await blogService.getCategories();
                const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
                if (mounted) setCategories(items);
            } catch (err) {
                if (mounted) setError(err?.response?.data?.detail || err?.message || 'Failed to load categories');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchCategories();
        return () => { mounted = false; };
    }, []);
    return (
        <>
            <ul className="category-list">
                {loading && <li className="category-list__item">Loading...</li>}
                {error && !loading && <li className="category-list__item text-danger">{error}</li>}
                {!loading && !error && categories.map((c, i) => (
                    <li className="category-list__item" key={c.id || i}>
                        <Link to={`/blog?category=${c.slug || c.id}`} className="category-list__link flx-between">
                            <span className="text">{c.name || c.title}</span>
                            {c.count !== undefined && <span className="number">({c.count})</span>}
                        </Link>
                    </li>
                ))}
            </ul>   
        </>
    );
};

export default SidebarCategoryList;