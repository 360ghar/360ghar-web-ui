import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AUCTION_KINDS,
  AUCTION_PROPERTY_TYPES,
  FURNISHING_LEVELS,
  GAZETTE_TYPES,
  GENDER_PREFERENCES,
  KITCHEN_TYPES,
  MOVE_IN_TIMELINES,
  PROPERTY_TYPES,
  SHARING_TYPES,
  VENTILATION_TYPES,
} from './enums';

const spec = JSON.parse(readFileSync('openapi/openapi.json', 'utf8')) as { components: { schemas: Record<string, { enum?: string[] }> } };
const wire = (name: string) => [...(spec.components.schemas[name]?.enum ?? [])].sort();

describe('enum value lists match the backend spec', () => {
  it.each([
    ['PropertyType', PROPERTY_TYPES],
    ['FurnishingLevel', FURNISHING_LEVELS],
    ['ListingGenderPreference', GENDER_PREFERENCES],
    ['ListingSharingType', SHARING_TYPES],
    ['AuctionPropertyType', AUCTION_PROPERTY_TYPES],
    ['AuctionKind', AUCTION_KINDS],
    ['KitchenType', KITCHEN_TYPES],
    ['VentilationType', VENTILATION_TYPES],
    ['MoveInTimeline', MOVE_IN_TIMELINES],
    ['GazetteType', GAZETTE_TYPES],
  ] as const)('%s', (name, list) => {
    expect([...list].sort()).toEqual(wire(name));
  });
});
