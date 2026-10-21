/**
 * Post-property form model. The rules copy the backend (app/schemas/property.py):
 * - title, property_type, purpose and base_price are required;
 * - PG and flatmate listings must be for rent;
 * - rent, PG and flatmate listings need a positive monthly_rent.
 * base_price is the sale price, the monthly rent or the nightly rate.
 */
import { z } from 'zod';
import type { CardProperty } from '@/features/property/PropertyCardView';
import { FURNISHING_LEVELS, GENDER_PREFERENCES, KITCHEN_TYPES, PROPERTY_TYPES, SHARING_TYPES, VENTILATION_TYPES } from '@/lib/api/enums';
import type { PropertyCreate, PropertyType, PropertyUpdate } from '@/lib/api/types';
import { MOBILE_RE } from '@/lib/phone';

/** Every property type the backend knows (condo and loft too), checked against the generated enum. */
export const TYPES = PROPERTY_TYPES;
export const RENT_ONLY: PropertyType[] = ['pg', 'flatmate'];
/** The largest money value the backend takes, on create and on update (9999999999.99). One limit for every price field. */
export const PRICE_MAX = 9_999_999_999.99;
export const NO_ROOMS: PropertyType[] = ['plot', 'office', 'shop', 'warehouse'];

const num = (max: number) =>
  z
    .union([z.number(), z.string()])
    .transform((v) => (v === '' || v === null ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0 && v <= max), 'Enter a valid number.')
    .optional();

/** A whole number. The backend takes an integer for rooms, floors, age, windows and occupancy, so a decimal is a 422. */
const whole = (max: number) => num(max).refine((v) => v === undefined || Number.isInteger(v), 'Enter a whole number.');

/** An enum select: a backend value, or '' for "not set". */
const pick = <T extends readonly [string, ...string[]]>(values: T) => z.enum(values).optional().or(z.literal('').transform(() => undefined));

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * `edit`: the owner fields and the terms box are not asked again when editing
 * (the owner is already known).
 */
export const makeFormSchema = (edit = false) =>
  z
  .object({
    purpose: z.enum(['buy', 'rent', 'short_stay'], { message: 'Choose sell, rent out or short stay.' }),
    property_type: z.enum(TYPES, { message: 'Choose the type of property.' }),
    full_address: z.string().trim().min(5, 'Enter the address (5 characters or more).').max(300),
    locality: z.string().trim().max(120).optional(),
    city: z.string().trim().min(2, 'Enter the city.').max(80),
    pincode: z
      .string()
      .trim()
      .refine((v) => v === '' || /^\d{6}$/.test(v), 'Enter a 6-digit PIN code.')
      .optional(),
    landmark: z.string().trim().max(120).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    bedrooms: whole(20),
    bathrooms: whole(20),
    balconies: whole(10),
    parking_spaces: whole(20),
    area_sqft: num(1_000_000),
    area_type: z.string().max(40).optional(),
    floor_number: whole(200),
    total_floors: whole(200),
    age_of_property: whole(200),
    furnishing_level: pick(FURNISHING_LEVELS),
    // The backend takes YYYY-MM-DD only (a date input gives that).
    available_from: z.string().refine((x) => x === '' || DATE_ONLY.test(x), 'Enter a valid date.').optional(),
    // PG and flatmate listings.
    gender_preference: pick(GENDER_PREFERENCES),
    sharing_type: pick(SHARING_TYPES),
    kitchen_type: pick(KITCHEN_TYPES),
    ventilation_type: pick(VENTILATION_TYPES),
    windows_count: whole(100),
    max_occupancy: whole(1000),
    amenity_ids: z.array(z.number()).default([]),
    sale_price: num(PRICE_MAX),
    monthly_rent: num(PRICE_MAX),
    daily_rate: num(PRICE_MAX),
    security_deposit: num(PRICE_MAX),
    maintenance_charges: num(PRICE_MAX),
    setup_cost: num(PRICE_MAX),
    other_charges: num(PRICE_MAX),
    other_charges_description: z.string().trim().max(300).optional(),
    title: z.string().trim().min(5, 'Write a title (5 characters or more).').max(200),
    description: z.string().trim().max(5000).optional(),
    owner_name: edit ? z.string().optional() : z.string().trim().min(2, 'Enter your name.').max(120),
    owner_phone: edit ? z.string().optional() : z.string().regex(MOBILE_RE, 'Enter a 10-digit mobile number that starts with 6, 7, 8 or 9.'),
    images: z.array(z.url()).max(20).default([]),
    terms: edit ? z.boolean().optional() : z.literal(true, { message: 'Accept the terms to continue.' }),
  })
  .superRefine((v, ctx) => {
    for (const i of crossIssues(v)) ctx.addIssue({ code: 'custom', path: [i.path], message: i.message });
  });

export const formSchema = makeFormSchema(false);

type Cross = { purpose?: string; property_type?: string; monthly_rent?: number; sale_price?: number; daily_rate?: number; floor_number?: number; total_floors?: number };

/**
 * Rules that compare fields. Zod runs an object refinement only after every
 * field passes, so the wizard also calls this directly for each step.
 */
export function crossIssues(v: Cross): { path: 'purpose' | 'monthly_rent' | 'sale_price' | 'daily_rate' | 'floor_number'; message: string }[] {
  const out: ReturnType<typeof crossIssues> = [];
  const rentOnly = RENT_ONLY.includes(v.property_type as PropertyType);
  if (rentOnly && v.purpose !== 'rent') out.push({ path: 'purpose', message: 'PG and flatmate listings must be for rent.' });
  if ((v.purpose === 'rent' || rentOnly) && !(v.monthly_rent && v.monthly_rent > 0)) out.push({ path: 'monthly_rent', message: 'Enter the monthly rent.' });
  if (v.purpose === 'buy' && !(v.sale_price && v.sale_price > 0)) out.push({ path: 'sale_price', message: 'Enter the price.' });
  if (v.purpose === 'short_stay' && !(v.daily_rate && v.daily_rate > 0)) out.push({ path: 'daily_rate', message: 'Enter the price per night.' });
  if (v.floor_number !== undefined && v.total_floors !== undefined && v.floor_number > v.total_floors)
    out.push({ path: 'floor_number', message: 'The floor cannot be above the top floor.' });
  return out;
}

export type FormIn = z.input<typeof formSchema>;
export type FormOut = z.output<typeof formSchema>;

/** Fields per step, for per-step validation. */
export const STEPS: (keyof FormIn)[][] = [
  ['purpose', 'property_type'],
  ['full_address', 'locality', 'city', 'pincode', 'landmark'],
  [
    'bedrooms', 'bathrooms', 'balconies', 'parking_spaces', 'area_sqft', 'area_type', 'floor_number', 'total_floors', 'age_of_property', 'furnishing_level', 'available_from', 'amenity_ids',
    'gender_preference', 'sharing_type', 'kitchen_type', 'ventilation_type', 'windows_count', 'max_occupancy',
  ],
  ['sale_price', 'monthly_rent', 'daily_rate', 'security_deposit', 'maintenance_charges', 'setup_cost', 'other_charges', 'other_charges_description'],
  ['images'],
  ['title', 'description', 'owner_name', 'owner_phone', 'terms'],
];

/** Backend payload. Only known PropertyCreate fields; empty values are left out. */
export function toPayload(v: FormOut): PropertyCreate {
  const base = v.purpose === 'buy' ? v.sale_price! : v.purpose === 'short_stay' ? v.daily_rate! : v.monthly_rent!;
  const out: PropertyCreate = {
    title: v.title,
    property_type: v.property_type,
    purpose: v.purpose,
    base_price: base,
    full_address: v.full_address,
    city: v.city,
    owner_name: v.owner_name,
    owner_contact: `+91${v.owner_phone}`,
  };
  const pg = RENT_ONLY.includes(v.property_type);
  const optional: Partial<PropertyCreate> = {
    description: v.description || undefined,
    locality: v.locality || undefined,
    pincode: v.pincode || undefined,
    landmark: v.landmark || undefined,
    latitude: v.latitude,
    longitude: v.longitude,
    bedrooms: NO_ROOMS.includes(v.property_type) ? undefined : v.bedrooms,
    bathrooms: v.bathrooms,
    balconies: v.balconies,
    parking_spaces: v.parking_spaces,
    area_sqft: v.area_sqft,
    area_type: v.area_type || undefined,
    floor_number: v.floor_number,
    total_floors: v.total_floors,
    age_of_property: v.age_of_property,
    furnishing_level: v.furnishing_level || undefined,
    available_from: v.available_from || undefined,
    amenity_ids: v.amenity_ids.length ? v.amenity_ids : undefined,
    monthly_rent: v.purpose === 'rent' ? v.monthly_rent : undefined,
    daily_rate: v.purpose === 'short_stay' ? v.daily_rate : undefined,
    security_deposit: v.security_deposit,
    maintenance_charges: v.maintenance_charges,
    setup_cost: v.purpose === 'buy' ? undefined : v.setup_cost,
    other_charges: v.purpose === 'buy' ? undefined : v.other_charges,
    other_charges_description: v.purpose === 'buy' ? undefined : v.other_charges_description || undefined,
    // PG and flatmate preferences. The backend stores gender and sharing inside listing_preferences.
    gender_preference: pg ? v.gender_preference : undefined,
    sharing_type: pg ? v.sharing_type : undefined,
    kitchen_type: pg ? v.kitchen_type : undefined,
    ventilation_type: pg ? v.ventilation_type : undefined,
    windows_count: pg ? v.windows_count : undefined,
    max_occupancy: pg ? v.max_occupancy : undefined,
    main_image_url: v.images[0],
    image_urls: v.images.length ? v.images : undefined,
  };
  return { ...out, ...definedOnly(optional) };
}

/** The entries that hold a value: undefined, null and '' are left out. */
const definedOnly = <T extends object>(o: T): Partial<T> => Object.fromEntries(Object.entries(o).filter(([, x]) => x !== undefined && x !== null && x !== '')) as Partial<T>;

/** Nullable fields the owner can clear in the form. A cleared field is sent as null: the backend clears it, and a missing key keeps the old value. */
const CLEARABLE = [
  'description',
  'locality',
  'pincode',
  'landmark',
  'area_sqft',
  'area_type',
  'bedrooms',
  'bathrooms',
  'balconies',
  'parking_spaces',
  'floor_number',
  'total_floors',
  'age_of_property',
  'furnishing_level',
  'available_from',
  'security_deposit',
  'maintenance_charges',
  'setup_cost',
  'other_charges',
  'other_charges_description',
  'monthly_rent',
  'daily_rate',
] as const satisfies readonly (keyof PropertyUpdate)[];

/** Only PG and flatmate listings have these. Others are not touched, so no empty preference is stored on a flat. */
const CLEARABLE_PG = ['gender_preference', 'sharing_type', 'kitchen_type', 'ventilation_type', 'windows_count', 'max_occupancy'] as const satisfies readonly (keyof PropertyUpdate)[];

/**
 * Build-time guard: a key that PropertyUpdate does not take as null would be a 422 when cleared. If the spec stops
 * listing null for one of the keys above, `pnpm typecheck` fails here after `pnpm api:types`. The spec lists null for
 * every key, also for the ones the server refuses to clear at run time (`title`, `base_price`, ...): those are not in
 * these lists, and a test checks that they are never null.
 */
type NotNullable<K extends keyof PropertyUpdate> = K extends unknown ? (null extends PropertyUpdate[K] ? never : K) : never;
type Assert<T extends true> = T;
export type ClearableKeysAreNullable = Assert<[NotNullable<(typeof CLEARABLE)[number] | (typeof CLEARABLE_PG)[number]>] extends [never] ? true : false>;

/**
 * Edit payload (PUT is a patch: only the keys sent change). A field the owner emptied is sent as
 * null, no amenities is `amenity_ids: []`, and no photos is `image_urls: []`. `title`, `property_type`,
 * `purpose` and `base_price` are never null (422), and the rent of a rent, PG or flatmate listing cannot
 * be cleared. The owner fields are not asked in edit mode, so they are not sent.
 */
export function toUpdatePayload(v: FormOut): PropertyUpdate {
  const { owner_name: _n, owner_contact: _c, ...rest } = toPayload(v);
  const out: PropertyUpdate = { ...rest, amenity_ids: v.amenity_ids, image_urls: v.images, main_image_url: v.images[0] ?? null };
  const keys = RENT_ONLY.includes(v.property_type) ? [...CLEARABLE, ...CLEARABLE_PG] : CLEARABLE;
  for (const k of keys) if (out[k] === undefined) Object.assign(out, { [k]: null });
  return out;
}

/** A title suggestion from the details, e.g. "3 BHK Builder floor in Palam Vihar". */
export function suggestTitle(v: Partial<FormIn>, typeName: string): string {
  const bhk = v.bedrooms && !NO_ROOMS.includes(v.property_type as PropertyType) ? `${v.bedrooms} BHK ` : '';
  const where = v.locality || v.city || '';
  const intent = v.purpose === 'rent' ? ' for rent' : v.purpose === 'short_stay' ? ' for short stay' : ' for sale';
  return `${bhk}${typeName}${intent}${where ? ` in ${where}` : ''}`.trim();
}

/** A form number, or undefined when the field is empty or not a number. */
export const formNum = (x: unknown) => {
  if (x === '' || x === null || x === undefined) return undefined;
  const n = Number(x);
  return Number.isFinite(n) ? n : undefined;
};

/** The listing card as it will look in search results, from the form values. */
export function toCard(v: Partial<FormIn>, id: number): CardProperty | null {
  if (!v.property_type) return null;
  const purpose = v.purpose ?? 'rent';
  const price = formNum(purpose === 'buy' ? v.sale_price : purpose === 'short_stay' ? v.daily_rate : v.monthly_rent);
  const rooms = !NO_ROOMS.includes(v.property_type);
  return {
    id,
    title: v.title ?? '',
    property_type: v.property_type,
    purpose,
    base_price: price ?? 0,
    monthly_rent: purpose === 'rent' ? (price ?? null) : null,
    daily_rate: purpose === 'short_stay' ? (price ?? null) : null,
    bedrooms: rooms ? (formNum(v.bedrooms) ?? null) : null,
    bathrooms: formNum(v.bathrooms) ?? null,
    area_sqft: formNum(v.area_sqft) ?? null,
    locality: v.locality?.trim() || null,
    sub_locality: null,
    city: v.city?.trim() || null,
    main_image_url: v.images?.[0] ?? null,
    virtual_tour_url: null,
    distance_km: null,
  };
}
