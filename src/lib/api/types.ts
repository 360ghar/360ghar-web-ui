/**
 * Aliases for generated backend types. Do not write DTOs by hand: run
 * `pnpm api:sync && pnpm api:types` after the backend spec changes.
 */
import type { components, operations } from './schema';

type S = components['schemas'];

/** A listing in a list, search or write response. */
export type Property = S['Property'];
/** `GET /api/v1/properties/{id}`: adds `agent` and the signed-in user's visit fields. */
export type PropertyDetail = S['PropertyDetail'];
export type PropertyImage = S['PropertyImage'];
export type PropertyType = S['PropertyType'];
export type PropertyPurpose = S['PropertyPurpose'];
export type PropertyCreate = S['PropertyCreate'];
export type PropertyUpdate = S['PropertyUpdate'];
export type FurnishingLevel = S['FurnishingLevel'];
export type SortBy = S['SortBy'];
/** An amenity of the catalog (`GET /api/v1/amenities`). */
export type Amenity = S['Amenity'];
/** An amenity of one listing: `id` is the catalog amenity id, the value `amenity_ids` takes. */
export type PropertyAmenity = S['PropertyAmenityResponse'];
export type BlogPost = S['BlogPost'];
export type AuthGateState = S['AuthGateState'];
export type SelfUser = S['SelfUser'];

export type PropertySearchQuery = NonNullable<operations['get_properties_list_api_v1_properties_get']['parameters']['query']>;

export type PropertyPage = S['CursorPage_Property_'];
export type BlogPostPage = S['CursorPage_BlogPost_'];
/** The keys every generated `CursorPage_*` schema has. Bound for helpers that work on any list. */
export type PageShape = Omit<S['CursorPage_str_'], 'items'> & { items: readonly unknown[] };
export type ItemOf<P extends PageShape> = P['items'][number];
