import React, { useEffect } from 'react';
import Pagination from '../../common/Pagination';
import { Link } from 'react-router-dom';
import { usePropertyStore } from '../../store';

import LazyImage from '../../common/LazyImage';
const AccountMyPropertyTab = () => {
    const { userProperties, getUserProperties, isLoading, error } = usePropertyStore();

    useEffect(() => {
        getUserProperties();
    }, [getUserProperties]);

    const renderThumb = (property) => {
        const fallback = '/assets/images/thumbs/property-1.png';
        if (Array.isArray(property?.images) && property.images.length > 0) {
            const first = property.images[0];
            return first.url || first.src || first;
        }
        return property?.cover_image_url || property?.thumbnail || fallback;
    };

    const renderLocation = (property) => {
        return property?.location || property?.address || property?.city || '—';
    };

    const renderPrice = (property) => {
        if (property?.price_formatted) return property.price_formatted;
        if (property?.price) return property.price;
        return '—';
    };

    return (
        <>
            <div className="overflow-auto">
                <div className="card common-card min-w-maxContent">
                    <div className="card-body">
                        <table className="table style-two">
                            <thead>
                                <tr>
                                <th>My Properties</th>
                                <th>Date Added</th>
                                <th>Actions</th>
                                <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && (
                                    <tr>
                                        <td colSpan={4}>Loading your properties...</td>
                                    </tr>
                                )}
                                {error && !isLoading && (
                                    <tr>
                                        <td colSpan={4} className="text-danger">{error}</td>
                                    </tr>
                                )}
                                {!isLoading && !error && userProperties?.length === 0 && (
                                    <tr>
                                        <td colSpan={4}>No properties found.</td>
                                    </tr>
                                )}
                                {!isLoading && !error && userProperties?.map((property) => (
                                    <tr key={property.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="cart-item__thumb">
                                                    <LazyImage src={renderThumb(property)} alt=""/>
                                                </div>
                                                <div className="cart-item__content">
                                                    <h6 className="cart-item__title fw-500 font-18">
                                                        <Link to={`/property/${property.id}`} className="link">{property.title || property.name || `Property #${property.id}`}</Link>
                                                    </h6>
                                                    <p className="property-item__location d-flex gap-2 font-14">
                                                        <span className="icon text-gradient"><i className="fas fa-map-marker-alt"></i></span>
                                                        {renderLocation(property)}
                                                    </p>
                                                    <span className="cart-item__price">Price: <span className="fw-500 text-heading">{renderPrice(property)}</span></span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="date">{property.created_at ? new Date(property.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                        </td>
                                        <td>
                                            <button type="button" className="rounded-btn edit-btn text-info bg-info m-auto bg-opacity-10 flex-shrink-0">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        </td>
                                        <td>
                                            <button type="button" className="rounded-btn delete-btn text-danger bg-danger bg-opacity-10 flex-shrink-0">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Pagination/>
        </>
    );
};

export default AccountMyPropertyTab;