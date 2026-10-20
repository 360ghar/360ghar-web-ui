/**
 * Chat widget normalizer. The agent sends `widget` events (and history rows)
 * with a widget name and the raw tool result. This module turns that payload
 * into a small typed shape the renderers can draw. It never throws: a
 * malformed or unknown payload becomes a `generic` widget (safe key/value
 * list). Everything here is plain data; the renderers escape it as text.
 *
 * Widget names and fields come from the backend widget payload models
 * (`app/mcp/chatgpt/widget_payloads.py`, the `WidgetData` union in OpenAPI).
 * Only fields the backend emits are read. A few old key names are still read
 * because stored chat history keeps the payload of the day it was written
 * (`properties`, `bookings`, `visits`, `payments`, `tenant.name`).
 */

export type WidgetProperty = {
  id: number;
  title: string | null;
  locality: string | null;
  city: string | null;
  purpose: string | null;
  propertyType: string | null;
  basePrice: number | null;
  monthlyRent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqft: number | null;
  image: string | null;
  tenantName: string | null;
};

export type WidgetPropertyDetail = WidgetProperty & {
  address: string | null;
  furnished: string | null;
  floor: number | null;
  totalFloors: number | null;
  amenities: string[];
};

export type WidgetVisit = { id: number | null; propertyId: number | null; title: string | null; place: string | null; date: string | null; status: string | null };
export type WidgetLease = {
  id: number | null;
  propertyId: number | null;
  title: string | null;
  tenant: string | null;
  start: string | null;
  end: string | null;
  rent: number | null;
  deposit: number | null;
  dueDay: number | null;
  status: string | null;
};
export type WidgetMaintenance = { id: number | null; title: string | null; category: string | null; priority: string | null; status: string | null; date: string | null };
export type WidgetCharge = { id: number | null; month: string | null; due: string | null; amountDue: number | null; amountPaid: number | null; balance: number | null; lateFee: number | null; status: string | null };
export type WidgetPayment = { id: number | null; amount: number | null; date: string | null; method: string | null };
export type StatKey = 'properties' | 'occupied' | 'vacant' | 'income' | 'leases' | 'maintenance' | 'visits';

export type NormalizedWidget =
  | { kind: 'properties'; items: WidgetProperty[]; total: number | null }
  | { kind: 'property'; item: WidgetPropertyDetail }
  | { kind: 'visits'; items: WidgetVisit[] }
  | { kind: 'dashboard'; stats: { key: StatKey; value: number }[]; items: WidgetProperty[] }
  | { kind: 'leases'; items: WidgetLease[]; activeLeases: number | null; totalRent: number | null }
  | { kind: 'maintenance'; items: WidgetMaintenance[] }
  | { kind: 'rent'; charges: WidgetCharge[]; payments: WidgetPayment[]; totals: { due: number | null; paid: number | null; overdue: number | null } }
  | { kind: 'notice'; message: string }
  | { kind: 'generic'; title: string | null; rows: { key: string; value: string }[] };

type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * A finite number. Money in a widget payload is a JSON number now. A numeric string is still read, only because
 * conversations saved before that change hold Decimal values as strings in their stored widget rows.
 */
export function num(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Trimmed text of at most `max` characters, or null. Numbers become text. */
export function str(v: unknown, max = 200): string | null {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

/**
 * The value when it is a parseable date, else null (keeps `Intl` from throwing
 * later). Timestamps are UTC with a `Z`. Stored widget rows from before that change can lack the zone;
 * they are UTC too, so a `Z` is added to those. A date without a time (`2026-10-01`) is kept as it is.
 */
export function serverDate(v: unknown): string | null {
  const s = str(v, 40);
  if (!s) return null;
  const iso = s.includes('T') && !/([zZ]|[+-]\d{2}:?\d{2})$/.test(s) ? `${s}Z` : s;
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

/** Only https image links reach an <img>. */
function image(v: unknown): string | null {
  const s = str(v, 500);
  return s && /^https:\/\//i.test(s) ? s : null;
}

const positiveInt = (v: unknown): number | null => {
  const n = num(v);
  return n !== null && Number.isInteger(n) && n > 0 ? n : null;
};

function list(...candidates: unknown[]): Rec[] | null {
  for (const c of candidates) if (Array.isArray(c)) return c.filter(isRec);
  return null;
}

function property(v: unknown): WidgetProperty | null {
  if (!isRec(v)) return null;
  const id = positiveInt(v.id);
  if (id === null) return null;
  return {
    id,
    title: str(v.title),
    locality: str(v.locality),
    city: str(v.city),
    purpose: str(v.purpose, 20),
    propertyType: str(v.property_type, 40),
    basePrice: num(v.base_price),
    monthlyRent: num(v.monthly_rent),
    bedrooms: num(v.bedrooms),
    bathrooms: num(v.bathrooms),
    areaSqft: num(v.area_sqft),
    image: image(v.main_image_url ?? v.thumbnail_url),
    tenantName: str(v.tenant_name, 80),
  };
}

const properties = (rows: Rec[]) => rows.map(property).filter((p): p is WidgetProperty => p !== null);

function propertyDetail(v: unknown): WidgetPropertyDetail | null {
  const base = property(v);
  if (!base || !isRec(v)) return null;
  const amenities = Array.isArray(v.amenities)
    ? v.amenities.map((a) => (isRec(a) ? (str(a.name, 60) ?? str(a.title, 60)) : str(a, 60))).filter((a): a is string => a !== null)
    : [];
  return {
    ...base,
    address: str(v.full_address),
    furnished: str(v.furnished_status, 40),
    floor: num(v.floor_number),
    totalFloors: num(v.total_floors),
    amenities: amenities.slice(0, 8),
  };
}

function visit(v: Rec, sibling?: unknown): WidgetVisit {
  const p = isRec(v.property) ? v.property : isRec(sibling) ? sibling : null;
  return {
    id: positiveInt(v.id),
    propertyId: positiveInt(v.property_id) ?? (p ? positiveInt(p.id) : null),
    title: str(v.property_title) ?? (p ? str(p.title) : null),
    place: p ? [str(p.locality, 60), str(p.city, 60)].filter(Boolean).join(', ') || null : null,
    date: serverDate(v.scheduled_date ?? v.check_in_date ?? v.check_in),
    status: str(v.status, 40),
  };
}

function lease(v: Rec, sibling?: unknown): WidgetLease {
  const p = isRec(v.property) ? v.property : isRec(sibling) ? sibling : null;
  // `tenant` is {id, display_name, avatar_url}; `name` is the key of older stored rows.
  const tenant = isRec(v.tenant) ? (str(v.tenant.display_name, 80) ?? str(v.tenant.name, 80)) : null;
  return {
    id: positiveInt(v.id),
    propertyId: positiveInt(v.property_id) ?? (p ? positiveInt(p.id) : null),
    title: str(v.property_title) ?? (p ? str(p.title) : null),
    tenant: tenant ?? str(v.tenant_name, 80),
    start: serverDate(v.start_date),
    end: serverDate(v.end_date),
    rent: num(v.monthly_rent ?? v.rent_amount),
    deposit: num(v.security_deposit),
    dueDay: num(v.payment_due_day),
    status: str(v.status, 40),
  };
}

function charge(v: Rec): WidgetCharge {
  return {
    id: positiveInt(v.id),
    month: serverDate(v.billing_month),
    due: serverDate(v.due_date),
    amountDue: num(v.amount_due),
    amountPaid: num(v.amount_paid),
    balance: num(v.balance),
    lateFee: num(v.late_fee),
    status: str(v.status, 40),
  };
}

const STAT_FIELDS: [StatKey, string[]][] = [
  ['properties', ['total_properties', 'properties_count']],
  ['occupied', ['occupied']],
  ['vacant', ['vacant']],
  ['income', ['total_monthly_income']],
  ['leases', ['active_leases', 'leases_count']],
  ['maintenance', ['open_maintenance_requests', 'pending_maintenance', 'maintenance_count']],
  ['visits', ['pending_visits', 'visits_count']],
];

/** "PropertySearchWidget" -> "Property Search". Only safe characters survive. */
export function widgetTitle(name: string): string | null {
  const words = name
    .replace(/Widget$/, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .slice(0, 40);
  return words || null;
}

function prettyKey(key: string): string {
  const s = key.replace(/[_-]+/g, ' ').replace(/[^\p{L}\p{N} ]/gu, '').trim().slice(0, 40);
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

/** Top-level primitives only, at most 8 rows. Nested data is not shown. */
export function genericRows(data: unknown): { key: string; value: string }[] {
  if (!isRec(data)) {
    const s = str(data, 300);
    return s ? [{ key: '', value: s }] : [];
  }
  const rows: { key: string; value: string }[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (rows.length >= 8) break;
    if (v === null || v === undefined) continue;
    const key = prettyKey(k);
    if (!key) continue;
    if (typeof v === 'boolean') rows.push({ key, value: v ? 'Yes' : 'No' });
    else {
      const text = typeof v === 'string' ? str(v, 300) : num(v) !== null ? String(num(v)) : null;
      if (text !== null) rows.push({ key, value: text });
    }
  }
  return rows;
}

function generic(name: string, data: unknown): NormalizedWidget {
  return { kind: 'generic', title: widgetTitle(name), rows: genericRows(data) };
}

function known(name: string, d: Rec): NormalizedWidget | null {
  switch (name) {
    case 'PropertySearchWidget':
    case 'PropertySwipeWidget': {
      const rows = list(d.items, d.properties);
      if (!rows) return null;
      return { kind: 'properties', items: properties(rows), total: num(d.total) };
    }
    case 'PropertyDetailsWidget': {
      const item = propertyDetail(isRec(d.property) ? d.property : d);
      return item ? { kind: 'property', item } : null;
    }
    case 'VisitListWidget':
    case 'VisitSchedulerWidget': {
      const rows = list(d.items, d.bookings, d.visits);
      if (rows) return { kind: 'visits', items: rows.map((r) => visit(r)) };
      const one = isRec(d.visit) ? d.visit : isRec(d.booking) ? d.booking : null;
      return one ? { kind: 'visits', items: [visit(one, d.property)] } : null;
    }
    case 'OwnerDashboardWidget': {
      // Owner lists nest the counters under `stats`; other dashboards use the top level.
      const merged: Rec = { ...d, ...(isRec(d.stats) ? d.stats : {}) };
      const stats: { key: StatKey; value: number }[] = [];
      for (const [key, fields] of STAT_FIELDS) {
        const value = fields.map((f) => num(merged[f])).find((n) => n !== null);
        if (value !== undefined && value !== null) stats.push({ key, value });
      }
      const rows = list(d.items, d.properties);
      if (!stats.length && !rows) return null;
      return { kind: 'dashboard', stats, items: rows ? properties(rows).slice(0, 5) : [] };
    }
    case 'LeaseDetailsWidget':
    case 'LeaseManagementWidget': {
      const rows = list(d.leases, d.items);
      const stats = isRec(d.stats) ? d.stats : {};
      const meta = { activeLeases: num(stats.active_leases), totalRent: num(stats.total_monthly_rent) };
      if (rows) return { kind: 'leases', items: rows.map((r) => lease(r)), ...meta };
      const one = isRec(d.lease) ? d.lease : null;
      return one ? { kind: 'leases', items: [lease(one)], ...meta } : null;
    }
    case 'MaintenanceWidget': {
      const rows = list(d.items, d.requests, d.maintenance_requests) ?? (isRec(d.request) ? [d.request] : null);
      if (!rows) return null;
      return {
        kind: 'maintenance',
        items: rows.map((r) => ({
          id: positiveInt(r.id),
          title: str(r.title) ?? str(r.description, 120),
          category: str(r.category, 40),
          priority: str(r.priority, 20),
          status: str(r.status, 40),
          date: serverDate(r.scheduled_date ?? r.created_at),
        })),
      };
    }
    case 'RentCollectionWidget':
    case 'TenantRentWidget': {
      // Rent lists come as `items`: charges (they have `amount_due`) or payments (`amount_paid`, `paid_at`).
      const rows = list(d.items);
      const isCharge = (r: Rec) => 'amount_due' in r || 'balance' in r;
      const charges = list(d.charges) ?? rows?.filter(isCharge) ?? null;
      const payments = list(d.payments) ?? rows?.filter((r) => !isCharge(r)) ?? null;
      if (!charges && !payments) return null;
      const t = isRec(d.totals) ? d.totals : {};
      return {
        kind: 'rent',
        charges: (charges ?? []).map(charge),
        payments: (payments ?? []).map((p) => ({
          id: positiveInt(p.id),
          amount: num(p.amount_paid ?? p.amount),
          date: serverDate(p.paid_at ?? p.payment_date),
          method: str(p.payment_method, 30),
        })),
        totals: {
          due: num(t.total_due) ?? num(d.total_due),
          paid: num(t.total_paid) ?? num(d.total_collected),
          overdue: num(t.overdue_count) ?? num(d.overdue_count),
        },
      };
    }
    default:
      return null;
  }
}

/**
 * Turns one widget payload into a renderable shape. Never throws.
 * Error payloads (`{ error: true, message }`) become a plain notice.
 * Unknown names, non-object data and payloads without the expected fields
 * become `generic`.
 */
export function normalizeWidget(name: unknown, data: unknown): NormalizedWidget {
  const widgetName = typeof name === 'string' ? name : '';
  try {
    if (!isRec(data)) return generic(widgetName, data);
    if (data.error === true) {
      const message = str(data.message, 300);
      if (message) return { kind: 'notice', message };
    }
    return known(widgetName, data) ?? generic(widgetName, data);
  } catch {
    return { kind: 'generic', title: null, rows: [] };
  }
}
