/**
 * Value lists for backend enums. Each list is checked against the generated enum
 * type at build time: a value the backend does not have, or a value it adds that
 * the list lacks, is a compile error (run `pnpm api:types` after a spec change).
 * Unknown wire values are never mapped to a real value; a reader maps them to null.
 */
import type { components } from './schema';
import type { FurnishingLevel, PropertyType } from './types';

type S = components['schemas'];
type Complete<T, L extends readonly T[]> = Exclude<T, L[number]> extends never ? unknown : never;

/** `exactEnum<T>()([...])` returns the list when it holds every member of `T` and nothing else. */
export const exactEnum =
  <T extends string>() =>
  <const L extends readonly T[]>(list: L & Complete<T, L>): L =>
    list;

/** Every property type, in the order the pickers show them. The one list for search and post-property. */
export const PROPERTY_TYPES = exactEnum<PropertyType>()([
  'apartment',
  'builder_floor',
  'house',
  'villa',
  'condo',
  'penthouse',
  'studio',
  'loft',
  'plot',
  'room',
  'pg',
  'flatmate',
  'office',
  'shop',
  'warehouse',
]);

export const FURNISHING_LEVELS = exactEnum<FurnishingLevel>()(['furnished', 'semi_furnished', 'unfurnished']);
export const KITCHEN_TYPES = exactEnum<S['KitchenType']>()(['vegetarian', 'non_vegetarian', 'eggetarian', 'any']);
export const VENTILATION_TYPES = exactEnum<S['VentilationType']>()(['good', 'average', 'poor']);
export const GENDER_PREFERENCES = exactEnum<S['ListingGenderPreference']>()(['any', 'male', 'female']);
export const SHARING_TYPES = exactEnum<S['ListingSharingType']>()(['private_room', 'shared_room', 'master_bedroom', 'entire_flat']);
export const AUCTION_PROPERTY_TYPES = exactEnum<S['AuctionPropertyType']>()(['residential', 'commercial', 'industrial', 'plot']);
export const AUCTION_KINDS = exactEnum<S['AuctionKind']>()(['bank', 'court']);
/** In the order the move-in select shows them (soonest first). */
export const MOVE_IN_TIMELINES = exactEnum<S['MoveInTimeline']>()([
  'immediate',
  'within_1_week',
  'within_2_weeks',
  'this_month',
  'within_1_month',
  'next_month',
  'within_2_months',
  'within_3_months',
  'flexible',
]);
export const GAZETTE_TYPES = exactEnum<S['GazetteType']>()(['land_acquisition', 'rate_revision', 'policy', 'clu_change']);
