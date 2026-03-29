import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPIService } from '../../services/propertyAPIService';

import LazyImage from '../ui/LazyImage';
const PROPERTY_IMAGE_FALLBACK = '/assets/images/thumbs/property-1.png';

const isUsableImageUrl = (value) =>
    typeof value === 'string' && value.trim() !== '' && !/kuula\.co/i.test(value);
const SidebarProperty = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await propertyAPIService.getRecommendations(6);
                const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
                if (mounted) setItems(list);
            } catch (err) {
                if (mounted) setError(err?.response?.data?.detail || err?.message || 'Failed to load properties');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchRecommendations();
        return () => { mounted = false; };
    }, []);

    const getThumb = (p) => {
        const images = Array.isArray(p?.images) ? p.images : [];
        const firstImage = images.find((img) => isUsableImageUrl(img?.image_url))?.image_url;
        return firstImage || p.main_image_url || PROPERTY_IMAGE_FALLBACK;
    };
    return (
        <>
            <div className="row gy-4">
                {loading && <div className="col-12">Loading...</div>}
                {error && !loading && <div className="col-12 text-danger">{error}</div>}
                {!loading && !error && items.map((p, idx) => (
                    <div className="col-lg-6 col-sm-4 col-6" key={p.id || idx}>
                        <Link to={`/property/${p.id}`} className="properties-item d-block w-100">
                            <LazyImage src={getThumb(p)} fallbackSrc={PROPERTY_IMAGE_FALLBACK} alt="Property Image" className="cover-img"/>
                            <span className="properties-item__text">{p.title || 'Property'}</span>
                        </Link>
                    </div>
                ))}
            </div>   
        </>
    );
};

export default SidebarProperty;
