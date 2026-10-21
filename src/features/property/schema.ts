/** JSON-LD for a property page, from backend fields only. */
import type { Property } from '@/lib/api/types';
import { isPlaceholderPrice } from '@/features/search/prices';
import { askPrice, homeKind } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { canonicalFor } from '@/lib/seo/site';
import { ORGANIZATION_ID } from '@/lib/seo/siteSchemas';

const accommodationType = (t: Property['property_type']) =>
  t === 'house' || t === 'villa' ? 'SingleFamilyResidence' : ['apartment', 'builder_floor', 'condo', 'penthouse', 'studio', 'loft'].includes(t) ? 'Apartment' : 'Accommodation';

export function propertySchema(p: Property, locale: Locale) {
  const url = canonicalFor(`/property/${p.id}`, locale);
  const images = [p.main_image_url, ...(p.images ?? []).map((i) => i.image_url)].filter(Boolean).slice(0, 8);
  const rent = p.purpose !== 'buy';
  const price = askPrice(p);
  const address = {
    '@type': 'PostalAddress',
    streetAddress: p.full_address ?? undefined,
    addressLocality: p.locality ?? p.city ?? undefined,
    addressRegion: p.state ?? 'Haryana',
    postalCode: p.pincode ?? undefined,
    addressCountry: 'IN',
  };
  const place = {
    '@type': accommodationType(p.property_type),
    name: p.title,
    url,
    address,
    ...(p.latitude && p.longitude ? { geo: { '@type': 'GeoCoordinates', latitude: p.latitude, longitude: p.longitude } } : {}),
    ...(p.area_sqft ? { floorSize: { '@type': 'QuantitativeValue', value: p.area_sqft, unitCode: 'FTK' } } : {}),
    ...(p.bedrooms ? { numberOfRooms: p.bedrooms, numberOfBedrooms: p.bedrooms } : {}),
    ...(p.bathrooms ? { numberOfBathroomsTotal: p.bathrooms } : {}),
    ...(p.amenities?.length ? { amenityFeature: p.amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a.title, value: true })) } : {}),
  };
  const name = homeKind(p, locale);
  const blocks: unknown[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: p.title,
      url,
      description: p.description?.slice(0, 500) ?? undefined,
      datePosted: p.created_at,
      ...(p.updated_at ? { dateModified: p.updated_at } : {}),
      ...(images.length ? { image: images } : {}),
      about: place,
      // A stand-in ₹10 Cr price is not a real price: the offer stays, without one.
      ...(price
        ? {
            offers: {
              '@type': 'Offer',
              ...(isPlaceholderPrice(p) ? {} : { price, priceCurrency: 'INR' }),
              // 360Ghar lists and verifies the home; the Organization node is on every page.
              seller: { '@id': ORGANIZATION_ID },
              availability: p.is_available ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
              businessFunction: rent ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
              url,
            },
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: locale === 'hi' ? 'होम' : 'Home', item: canonicalFor('/', locale) },
        { '@type': 'ListItem', position: 2, name: locale === 'hi' ? 'प्रॉपर्टी' : 'Properties', item: canonicalFor('/properties', locale) },
        { '@type': 'ListItem', position: 3, name: name || p.title, item: url },
      ],
    },
  ];
  if (p.virtual_tour_url && images[0]) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${p.title} - 360° virtual tour`,
      description: `360° virtual tour of ${p.title}`,
      thumbnailUrl: images[0],
      uploadDate: p.updated_at ?? p.created_at,
      embedUrl: p.virtual_tour_url,
    });
  }
  return blocks;
}
