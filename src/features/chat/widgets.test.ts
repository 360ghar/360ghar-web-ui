import { describe, expect, it } from 'vitest';
import { genericRows, normalizeWidget, num, serverDate, str, widgetTitle } from './widgets';

const property = { id: 12, title: '2 BHK in Sector 57', locality: 'Sector 57', city: 'Gurugram', purpose: 'rent', property_type: 'apartment', base_price: 0, monthly_rent: '32000', bedrooms: 2, bathrooms: 2, area_sqft: 1100, main_image_url: 'https://res.cloudinary.com/x/image/upload/a.jpg' };

describe('normalizeWidget: known kinds', () => {
  it('property search reads `properties` and skips rows without an integer id', () => {
    const w = normalizeWidget('PropertySearchWidget', { properties: [property, { id: 'x' }, { title: 'no id' }, null, 7], total: 9, has_more: true });
    expect(w.kind).toBe('properties');
    if (w.kind !== 'properties') return;
    expect(w.items).toHaveLength(1);
    expect(w.total).toBe(9);
    expect(w.items[0]).toMatchObject({ id: 12, monthlyRent: 32000, bedrooms: 2, image: property.main_image_url });
  });

  it('property search accepts `items` and an empty list', () => {
    expect(normalizeWidget('PropertySwipeWidget', { properties: [], count: 0 })).toMatchObject({ kind: 'properties', items: [] });
    expect(normalizeWidget('PropertySearchWidget', { items: [property] })).toMatchObject({ kind: 'properties' });
  });

  it('drops non-https images', () => {
    const w = normalizeWidget('PropertySearchWidget', { properties: [{ ...property, main_image_url: 'javascript:alert(1)' }, { ...property, id: 13, main_image_url: 'http://x/a.jpg' }] });
    expect(w.kind === 'properties' && w.items.map((p) => p.image)).toEqual([null, null]);
  });

  it('property details reads the nested property and amenity names', () => {
    const w = normalizeWidget('PropertyDetailsWidget', { property: { ...property, full_address: 'Sector 57, Gurugram', furnished_status: 'semi_furnished', floor_number: 4, total_floors: 12, amenities: [{ id: 1, name: 'Lift' }, { id: 2 }, 'Gym'] } });
    expect(w).toMatchObject({ kind: 'property', item: { id: 12, address: 'Sector 57, Gurugram', floor: 4, totalFloors: 12, amenities: ['Lift', 'Gym'] } });
  });

  it('property details reads an amenity `title` (REST rows) when there is no `name`', () => {
    const w = normalizeWidget('PropertyDetailsWidget', { property: { ...property, amenities: [{ id: 1, title: 'Gym' }, { id: 2, name: 'Lift', title: 'Elevator' }] } });
    expect(w).toMatchObject({ kind: 'property', item: { amenities: ['Gym', 'Lift'] } });
  });

  it('visit list reads `bookings`, `visits` and `items`; the scheduler reads one visit or booking', () => {
    const v = { id: 3, property_id: 12, scheduled_date: '2026-10-01T09:30:00', status: 'requested', property: { id: 12, title: 'Flat', locality: 'Sector 57', city: 'Gurugram' } };
    for (const key of ['bookings', 'visits', 'items']) {
      const w = normalizeWidget('VisitListWidget', { [key]: [v] });
      expect(w).toMatchObject({ kind: 'visits', items: [{ id: 3, propertyId: 12, title: 'Flat', place: 'Sector 57, Gurugram', status: 'requested' }] });
    }
    expect(normalizeWidget('VisitSchedulerWidget', { visit: v })).toMatchObject({ kind: 'visits', items: [{ id: 3 }] });
    const booking = normalizeWidget('VisitSchedulerWidget', { booking: { id: 4, property_id: 12, scheduled_date: '2026-10-02', status: 'confirmed' }, property: { id: 12, title: 'Sibling' } });
    expect(booking).toMatchObject({ kind: 'visits', items: [{ id: 4, title: 'Sibling', date: '2026-10-02' }] });
  });

  it('adds Z to a timestamp without a zone (the backend sends UTC) and keeps date-only values', () => {
    expect(serverDate('2026-10-01T09:30:00')).toBe('2026-10-01T09:30:00Z');
    expect(serverDate('2026-10-01T09:30:00+05:30')).toBe('2026-10-01T09:30:00+05:30');
    expect(serverDate('2026-10-01')).toBe('2026-10-01');
    expect(serverDate('not a date')).toBeNull();
    expect(serverDate(null)).toBeNull();
  });

  it('dashboard merges `stats` over the top level and keeps up to five properties', () => {
    const w = normalizeWidget('OwnerDashboardWidget', {
      stats: { total_properties: 4, occupied: 3, vacant: 1, total_monthly_income: '90000' },
      pending_visits: 2,
      items: Array.from({ length: 8 }, (_, i) => ({ ...property, id: i + 1, tenant_name: 'Asha' })),
    });
    expect(w.kind).toBe('dashboard');
    if (w.kind !== 'dashboard') return;
    expect(w.stats).toEqual([
      { key: 'properties', value: 4 },
      { key: 'occupied', value: 3 },
      { key: 'vacant', value: 1 },
      { key: 'income', value: 90000 },
      { key: 'visits', value: 2 },
    ]);
    expect(w.items).toHaveLength(5);
    expect(w.items[0]?.tenantName).toBe('Asha');
  });

  it('dashboard counts open maintenance requests and reads the stats block of the agent overview', () => {
    const w = normalizeWidget('OwnerDashboardWidget', { stats: { total_properties: 5, occupied: 4, vacant: 1, occupancy_rate: 80, total_monthly_income: 120000, monthly_rent_expected: 150000, open_maintenance_requests: 3 } });
    expect(w.kind === 'dashboard' && w.stats).toEqual([
      { key: 'properties', value: 5 },
      { key: 'occupied', value: 4 },
      { key: 'vacant', value: 1 },
      { key: 'income', value: 120000 },
      { key: 'maintenance', value: 3 },
    ]);
  });

  it('lease details (one lease) and lease management (a list with stats)', () => {
    const lease = { id: 1, property_id: 12, property: { id: 12, title: 'Flat' }, start_date: '2026-01-01', end_date: '2026-12-31', monthly_rent: 32000, security_deposit: 64000, payment_due_day: 5, status: 'active', tenant: { id: 9, display_name: 'Asha', avatar_url: null } };
    expect(normalizeWidget('LeaseDetailsWidget', { lease })).toMatchObject({ kind: 'leases', items: [{ title: 'Flat', rent: 32000, deposit: 64000, dueDay: 5, tenant: 'Asha', status: 'active' }] });
    // Rows stored before the `name` -> `display_name` rename still show the tenant.
    expect(normalizeWidget('LeaseDetailsWidget', { lease: { ...lease, tenant: { id: 9, name: 'Old' } } })).toMatchObject({ items: [{ tenant: 'Old' }] });
    const list = normalizeWidget('LeaseManagementWidget', { leases: [lease, lease], stats: { active_leases: 2, total_monthly_rent: 64000 } });
    expect(list).toMatchObject({ kind: 'leases', activeLeases: 2, totalRent: 64000 });
    expect(list.kind === 'leases' && list.items).toHaveLength(2);
  });

  it('maintenance reads a list or one created request', () => {
    const req = { id: 1, title: 'Leaking tap', category: 'plumbing', priority: 'high', status: 'open', created_at: '2026-09-01T10:00:00Z' };
    expect(normalizeWidget('MaintenanceWidget', { items: [req] })).toMatchObject({ kind: 'maintenance', items: [{ title: 'Leaking tap', priority: 'high' }] });
    expect(normalizeWidget('MaintenanceWidget', { request: req })).toMatchObject({ kind: 'maintenance', items: [{ id: 1 }] });
  });

  it('rent reads charges, payments and totals from either widget shape', () => {
    const charge = { id: 1, lease_id: 1, billing_month: '2026-09-01', due_date: '2026-09-05', amount_due: 32000, amount_paid: 0, balance: 32000, status: 'overdue', late_fee: 500 };
    expect(normalizeWidget('RentCollectionWidget', { charges: [charge], totals: { total_due: 32000, total_paid: 0, overdue_count: 1, charges_count: 1 } })).toMatchObject({
      kind: 'rent',
      totals: { due: 32000, paid: 0, overdue: 1 },
      charges: [{ amountDue: 32000, lateFee: 500, status: 'overdue' }],
    });
    expect(normalizeWidget('TenantRentWidget', { charges: [], payments: [{ id: 2, amount: 100, payment_date: '2026-09-02', payment_method: 'upi' }], total_due: 10, total_collected: 100, overdue_count: 0 })).toMatchObject({
      kind: 'rent',
      totals: { due: 10, paid: 100, overdue: 0 },
      payments: [{ amount: 100, method: 'upi' }],
    });
  });

  it('rent reads `items` as charges (agent rent due) or payments (rent history, `paid_at`)', () => {
    const charge = { id: 1, lease_id: 1, due_date: '2026-09-05', amount_due: 100, amount_paid: 0, balance: 100, status: 'overdue', late_fee: 0 };
    const payment = { id: 7, charge_id: 1, lease_id: 1, amount_paid: 250, paid_at: '2026-09-02T10:00:00Z', payment_method: 'upi', status: 'settled' };
    expect(normalizeWidget('RentCollectionWidget', { items: [charge], totals: { total_due: 100, overdue_count: 1 } })).toMatchObject({ charges: [{ amountDue: 100 }], payments: [], totals: { due: 100, overdue: 1 } });
    expect(normalizeWidget('TenantRentWidget', { items: [payment], total_collected: 250 })).toMatchObject({
      charges: [],
      payments: [{ id: 7, amount: 250, date: '2026-09-02T10:00:00Z', method: 'upi' }],
      totals: { paid: 250 },
    });
  });

  it('an error payload becomes a plain notice', () => {
    expect(normalizeWidget('VisitListWidget', { error: true, message: 'Sign in to see visits', requires_auth: true })).toEqual({ kind: 'notice', message: 'Sign in to see visits' });
  });
});

describe('normalizeWidget: unknown and malformed payloads degrade to generic and never throw', () => {
  it('unknown widget name', () => {
    const w = normalizeWidget('SomethingNewWidget', { total_count: 3, name: 'x', nested: { a: 1 }, list: [1, 2], flag: true });
    expect(w).toEqual({
      kind: 'generic',
      title: 'Something New',
      rows: [
        { key: 'Total count', value: '3' },
        { key: 'Name', value: 'x' },
        { key: 'Flag', value: 'Yes' },
      ],
    });
  });

  it('known name with the wrong shape', () => {
    for (const [name, data] of [
      ['PropertySearchWidget', { properties: 'nope' }],
      ['PropertyDetailsWidget', { property: { title: 'no id' } }],
      ['VisitListWidget', { visits: null }],
      ['OwnerDashboardWidget', { hello: 'world' }],
      ['LeaseDetailsWidget', {}],
      ['MaintenanceWidget', { items: {} }],
      ['RentCollectionWidget', { charges: 5 }],
    ] as const) {
      expect(normalizeWidget(name, data).kind, name).toBe('generic');
    }
  });

  it('non-object data, missing name, hostile values', () => {
    for (const data of [null, undefined, 42, 'text', [], [1, 2], true, () => 1, Symbol('x')]) {
      expect(() => normalizeWidget('PropertySearchWidget', data)).not.toThrow();
      expect(normalizeWidget('PropertySearchWidget', data).kind).toBe('generic');
    }
    expect(normalizeWidget(undefined, { a: 1 })).toMatchObject({ kind: 'generic', title: null });
    expect(normalizeWidget({ toString: () => 'x' }, { a: 1 }).kind).toBe('generic');
    const circular: Record<string, unknown> = { a: 1 };
    circular.self = circular;
    expect(() => normalizeWidget('X', circular)).not.toThrow();
    const proxy = new Proxy({}, { get: () => { throw new Error('boom'); }, ownKeys: () => { throw new Error('boom'); } });
    expect(() => normalizeWidget('PropertySearchWidget', proxy)).not.toThrow();
  });

  it('bad numbers and dates become null instead of NaN or Invalid Date', () => {
    const w = normalizeWidget('LeaseManagementWidget', { leases: [{ id: 1, start_date: 'soon', end_date: {}, monthly_rent: 'abc', payment_due_day: Infinity }] });
    expect(w).toMatchObject({ kind: 'leases', items: [{ start: null, end: null, rent: null, dueDay: null }] });
  });

  it('keeps hostile text as plain strings (the renderer escapes it) and bounds its length', () => {
    const w = normalizeWidget('Whatever', { '<img src=x onerror=alert(1)>': 'v', note: '<script>alert(1)</script>'.padEnd(1000, 'x') });
    expect(w.kind).toBe('generic');
    if (w.kind !== 'generic') return;
    // The odd key is cleaned to letters and digits; the value is capped.
    expect(w.rows.every((r) => !/[<>]/.test(r.key))).toBe(true);
    expect(w.rows.find((r) => r.key === 'Note')?.value.length).toBe(300);
  });

  it('generic rows are capped at eight and skip empty values', () => {
    const data = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`k${i}`, i]));
    expect(genericRows({ ...data, none: null, empty: '' })).toHaveLength(8);
    expect(genericRows('plain')).toEqual([{ key: '', value: 'plain' }]);
    expect(genericRows(null)).toEqual([]);
  });
});

describe('helpers', () => {
  it('num and str', () => {
    expect(num('12.5')).toBe(12.5);
    expect(num('')).toBeNull();
    expect(num(NaN)).toBeNull();
    expect(num({})).toBeNull();
    expect(str('  hi  ')).toBe('hi');
    expect(str(5)).toBe('5');
    expect(str('   ')).toBeNull();
    expect(str('abcdef', 3)).toBe('abc');
  });

  it('widgetTitle', () => {
    expect(widgetTitle('PropertySearchWidget')).toBe('Property Search');
    expect(widgetTitle('Widget')).toBeNull();
    expect(widgetTitle('<b>Bold</b>Widget')).toBe('b Bold b');
    expect(widgetTitle('')).toBeNull();
  });
});
