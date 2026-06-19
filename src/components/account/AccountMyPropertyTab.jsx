import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import { usePropertyStore } from '../../store';

import LazyImage from '../../common/ui/LazyImage';
const PROPERTY_IMAGE_FALLBACK = '/assets/images/thumbs/property-1.webp';
const isUsableImageUrl = (value) =>
    typeof value === 'string' && value.trim() !== '' && !/kuula\.co/i.test(value);

function formatCurrency(value) {
    if (value === null || value === undefined) return '\u2014';
    try {
        const num = Number(value);
        if (!Number.isFinite(num)) return String(value);
        return `\u20B9${num.toLocaleString('en-IN')}`;
    } catch {
        return String(value);
    }
}

const AccountMyPropertyTab = () => {
    const { userProperties, getUserProperties, isLoading, error } = usePropertyStore();
    const { t } = useTranslation('account');

    useEffect(() => {
        getUserProperties();
    }, [getUserProperties]);

    const renderThumb = (property) => {
        if (Array.isArray(property?.images) && property.images.length > 0) {
            const firstImage = property.images.find((img) => isUsableImageUrl(img?.image_url)) || property.images[0];
            return firstImage?.image_url || firstImage?.url || firstImage?.src || firstImage;
        }
        return property?.main_image_url || property?.cover_image_url || property?.thumbnail || PROPERTY_IMAGE_FALLBACK;
    };

    const renderLocation = (property) => {
        const parts = [property?.locality, property?.city, property?.state].filter(Boolean);
        return property?.full_address || (parts.length ? parts.join(', ') : (property?.address || property?.city || '\u2014'));
    };

    const renderPrice = (property) => {
        if (property?.price_formatted) return property.price_formatted;
        if (property?.price) return property.price;
        const purpose = property?.purpose || property?.price_type;
        const priceValue = purpose === 'rent'
            ? (property?.monthly_rent || property?.daily_rate || property?.base_price)
            : (property?.base_price || property?.monthly_rent || property?.daily_rate);
        return priceValue !== null && priceValue !== undefined ? formatCurrency(priceValue) : '\u2014';
    };

    return (
        <>
            <div className="overflow-auto">
                <div className="card common-card min-w-maxContent">
                    <div className="card-body">
                        <table className="table style-two">
                            <caption className="visually-hidden">{t('tabs.myProperties.caption')}</caption>
                            <thead>
                                <tr>
                                <th scope="col">{t('tabs.myProperties.colProperty')}</th>
                                <th scope="col">{t('tabs.myProperties.colDate')}</th>
                                <th scope="col">{t('tabs.myProperties.colActions')}</th>
                                <th scope="col">{t('tabs.myProperties.colDelete')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && (
                                    <tr>
                                        <td colSpan={4}>{t('tabs.myProperties.loading')}</td>
                                    </tr>
                                )}
                                {error && !isLoading && (
                                    <tr>
                                        <td colSpan={4} className="text-danger">{error}</td>
                                    </tr>
                                )}
                                {!isLoading && !error && userProperties?.length === 0 && (
                                    <tr>
                                        <td colSpan={4}>{t('tabs.myProperties.noProperties')}</td>
                                    </tr>
                                )}
                                {!isLoading && !error && userProperties?.map((property) => (
                                    <tr key={property.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="cart-item__thumb">
                                                    <LazyImage src={renderThumb(property)} fallbackSrc={PROPERTY_IMAGE_FALLBACK} alt={property.title || property.name || `Property #${property.id}`} width={80} height={60}/>
                                                </div>
                                                <div className="cart-item__content">
                                                    <h6 className="cart-item__title fw-500 font-18">
                                                        <I18nLink to={`/property/${property.id}`} className="link">{property.title || property.name || `Property #${property.id}`}</I18nLink>
                                                    </h6>
                                                    <p className="property-item__location d-flex gap-2 font-14">
                                                        <span className="icon text-gradient"><i className="fas fa-map-marker-alt"></i></span>
                                                        {renderLocation(property)}
                                                    </p>
                                                    <span className="cart-item__price">{t('tabs.myProperties.price')} <span className="fw-500 text-heading">{renderPrice(property)}</span></span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="date">{property.created_at ? new Date(property.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="rounded-btn edit-btn text-info bg-info m-auto bg-opacity-10 flex-shrink-0"
                                                aria-label={`Edit property ${property.title || property.id}`}
                                            >
                                                <i className="fas fa-edit" aria-hidden="true"></i>
                                            </button>
                                        </td>
                                        <td>
                                            <button type="button" className="rounded-btn delete-btn text-danger bg-danger bg-opacity-10 flex-shrink-0" aria-label={`Delete property ${property.title || property.id}`}>
                                                <i className="fas fa-trash-alt" aria-hidden="true"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountMyPropertyTab;
