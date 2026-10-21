/**
 * What the results island (SearchResults) reads of a listing: the card, the
 * map tags, the favourite and the compare buttons. Page 1 is written into the
 * HTML as island props, so the server sends this instead of the full API object
 * (about a sixth of the size): only the photos the card strip shows, plus the
 * photo count. Later pages come from the API in full; both shapes fit this type.
 */
import type { Amenity, Property, PropertyPage } from '@/lib/api/types';
import { cardPhotos, type CardProperty } from '@/features/property/PropertyCardView';
import { galleryPhotos } from '@/features/property/photos';

export type ListingItem = CardProperty & Pick<Property, 'latitude' | 'longitude' | 'liked'>;
/** A results page whose rows are mapped to [ListingItem]. */
export type ListingPage = Omit<PropertyPage, 'items'> & { items: ListingItem[] };

/** The filter form and the chips read only these. */
export type AmenityOption = Pick<Amenity, 'id' | 'title'>;

export function toListingItem(p: Property): ListingItem {
  const main = p.main_image_url;
  // Photos 2 to 4 of the card strip, in strip order: cardPhotos() picks the same ones again.
  const images = cardPhotos(p)
    .filter((url) => url !== main)
    .map((url) => ({ image_url: url, image_category: p.images?.find((i) => i.image_url === url)?.image_category }));
  return {
    id: p.id,
    title: p.title,
    property_type: p.property_type,
    purpose: p.purpose,
    base_price: p.base_price,
    monthly_rent: p.monthly_rent,
    daily_rate: p.daily_rate,
    price_per_sqft: p.price_per_sqft,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area_sqft: p.area_sqft,
    furnishing_level: p.furnishing_level,
    locality: p.locality,
    sub_locality: p.sub_locality,
    city: p.city,
    latitude: p.latitude,
    longitude: p.longitude,
    distance_km: p.distance_km,
    main_image_url: main,
    virtual_tour_url: p.virtual_tour_url,
    liked: p.liked,
    images,
    photo_count: galleryPhotos(p).length,
  };
}

export const toAmenityOption = ({ id, title }: Amenity): AmenityOption => ({ id, title });
