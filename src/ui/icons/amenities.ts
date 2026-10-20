/**
 * Maps the backend's amenity icon keys (GET /api/v1/amenities, field `icon`)
 * to knife-cut icons. Keys without a good match fall back to `check`.
 *
 *   <Icon name={amenityIcon(a.icon)} />
 */
import type { IconName } from './paths';

const MAP: Record<string, IconName> = {
  'shield-check': 'shield',
  clock: 'shield',
  gate: 'shield',
  camera: 'camera',
  phone: 'phone',
  garage: 'parking',
  car: 'parking',
  elevator: 'lift',
  fitness: 'gym',
  dumbbell: 'gym',
  pool: 'pool',
  tree: 'tree',
  'tree-pine': 'tree',
  park: 'tree',
  battery: 'power',
  generator: 'power',
  water: 'water',
  droplets: 'water',
  wifi: 'wifi',
  internet: 'wifi',
  train: 'metro',
  building: 'building',
  trash: 'trash',
  playground: 'playground',
  running: 'track',
};

export function amenityIcon(key: string | null | undefined): IconName {
  return (key && MAP[key]) || 'check';
}

/** True when the key has a real icon, so a list can leave out the generic check mark. */
export const hasAmenityIcon = (key: string | null | undefined) => Boolean(key && MAP[key]);

/** Icons for the fixed facts of a home. */
export const FACT_ICONS = {
  bedrooms: 'bed',
  bathrooms: 'bath',
  area: 'area',
  floor: 'floor',
  parking: 'parking',
  lift: 'lift',
  powerBackup: 'power',
  gym: 'gym',
  pool: 'pool',
  security: 'shield',
  garden: 'tree',
  furnishing: 'sofa',
  facing: 'compass',
  tour: 'tour',
  floorPlan: 'floor-plan',
  video: 'video',
  age: 'age',
  balcony: 'balcony',
  minimumStay: 'moon',
  guests: 'guests',
} as const satisfies Record<string, IconName>;
