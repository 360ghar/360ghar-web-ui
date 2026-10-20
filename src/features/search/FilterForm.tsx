import { useState } from 'react';
import { PROPERTY_TYPES } from '@/lib/api/enums';
import type { AmenityOption } from './listingItem';
import type { Locale } from '@/lib/i18n/locale';
import { compactPrice, formatNum, typeLabel } from '@/lib/format';
import { Check, TextField } from '@/ui/react/Field';
import { Segmented } from '@/ui/react/Segmented';
import { FURNISHING, MOVE_IN, type Filters } from './filters';

const T = {
  en: {
    purpose: 'Looking to',
    any: 'Any',
    type: 'Property type',
    budget: 'Budget (₹)',
    min: 'Min',
    max: 'Max',
    bhk: 'Bedrooms',
    baths: 'Bathrooms',
    area: 'Area (sq ft)',
    furnishing: 'Furnishing',
    furnished: 'Furnished',
    semi_furnished: 'Semi-furnished',
    unfurnished: 'Unfurnished',
    amenities: 'Amenities',
    more: 'More amenities',
    less: 'Show fewer',
    pg: 'PG and flatmates',
    gender: 'For',
    genderAny: 'Anyone',
    male: 'Men',
    female: 'Women',
    sharing: 'Room',
    private_room: 'Private room',
    shared_room: 'Shared room',
    master_bedroom: 'Master bedroom',
    entire_flat: 'Entire flat',
    stay: 'Stay dates',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    more2: 'More filters',
    parking: 'Parking (min)',
    lift: 'Has a lift',
    age: 'Max age (years)',
    floorMin: 'Floor from',
    floorMax: 'Floor to',
    moveIn: 'Move in',
    immediate: 'Now',
    within_1_week: 'Within 1 week',
    within_2_weeks: 'Within 2 weeks',
    this_month: 'This month',
    within_1_month: 'Within 1 month',
    next_month: 'Next month',
    within_2_months: 'Within 2 months',
    within_3_months: 'Within 3 months',
    flexible: 'Flexible',
  },
  hi: {
    purpose: 'आप क्या चाहते हैं',
    any: 'कोई भी',
    type: 'प्रॉपर्टी का प्रकार',
    budget: 'बजट (₹)',
    min: 'न्यूनतम',
    max: 'अधिकतम',
    bhk: 'बेडरूम',
    baths: 'बाथरूम',
    area: 'एरिया (वर्ग फ़ुट)',
    furnishing: 'फ़र्निशिंग',
    furnished: 'फ़र्निश्ड',
    semi_furnished: 'सेमी-फ़र्निश्ड',
    unfurnished: 'अनफ़र्निश्ड',
    amenities: 'सुविधाएँ',
    more: 'और सुविधाएँ',
    less: 'कम दिखाएँ',
    pg: 'पीजी और फ़्लैटमेट',
    gender: 'किसके लिए',
    genderAny: 'कोई भी',
    male: 'पुरुष',
    female: 'महिला',
    sharing: 'कमरा',
    private_room: 'निजी कमरा',
    shared_room: 'शेयर्ड कमरा',
    master_bedroom: 'मास्टर बेडरूम',
    entire_flat: 'पूरा फ़्लैट',
    stay: 'ठहरने की तारीख',
    checkIn: 'चेक-इन',
    checkOut: 'चेक-आउट',
    guests: 'मेहमान',
    more2: 'और फ़िल्टर',
    parking: 'पार्किंग (कम से कम)',
    lift: 'लिफ़्ट हो',
    age: 'अधिकतम उम्र (साल)',
    floorMin: 'फ़्लोर से',
    floorMax: 'फ़्लोर तक',
    moveIn: 'शिफ़्ट होना',
    immediate: 'अभी',
    within_1_week: '1 हफ़्ते के अंदर',
    within_2_weeks: '2 हफ़्ते के अंदर',
    this_month: 'इस महीने',
    within_1_month: '1 महीने के अंदर',
    next_month: 'अगले महीने',
    within_2_months: '2 महीने के अंदर',
    within_3_months: '3 महीने के अंदर',
    flexible: 'कभी भी',
  },
};

/** Purpose names for the filter and its chips. */
export const PURPOSE_LABEL: Record<Locale, Record<NonNullable<Filters['purpose']>, string>> = {
  en: { buy: 'Buy', rent: 'Rent', short_stay: 'Short stay' },
  hi: { buy: 'खरीदना', rent: 'किराया', short_stay: 'कम समय' },
};

const BHK = [
  { label: '1', min: 1, max: 1 },
  { label: '2', min: 2, max: 2 },
  { label: '3', min: 3, max: 3 },
  { label: '4+', min: 4, max: undefined },
] as const;
const RENT_PRESETS = [10_000, 15_000, 20_000, 30_000, 50_000];
const BUY_PRESETS = [5_000_000, 8_000_000, 10_000_000, 20_000_000, 50_000_000];
const STAY_PRESETS = [1_500, 2_500, 4_000];

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
  amenities: AmenityOption[];
  locale: Locale;
  /** Facets fixed by the page (landing pages); shown but not editable. */
  locked?: Partial<Record<keyof Filters, true>>;
};

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="filter-group @container">
      <legend className="field-label">{title}</legend>
      {children}
    </fieldset>
  );
}

const numOrUndef = (v: string) => (v.trim() === '' || Number.isNaN(Number(v)) ? undefined : Math.max(0, Number(v)));

export function FilterForm({ value: f, onChange, amenities, locale, locked = {} }: Props) {
  const t = T[locale];
  const [allAmenities, setAllAmenities] = useState(false);
  const [more, setMore] = useState(false);
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch });
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const pgLike = f.property_type.some((x) => x === 'pg' || x === 'flatmate');
  // With no purpose picked, the sale presets show (most homes are for sale) and pick "Buy" too.
  const presets = f.purpose === 'rent' ? RENT_PRESETS : f.purpose === 'short_stay' ? STAY_PRESETS : BUY_PRESETS;
  const fmt = (n: number) => (n >= 1e7 ? `${n / 1e7} Cr` : n >= 1e5 ? `${n / 1e5} L` : n >= 10_000 ? `${n / 1000}k` : formatNum(n, 'en'));
  const readable = (n: number | undefined) => (n ? compactPrice(n, locale) : undefined);
  // The first 8, plus any picked further down, so a checked box never hides.
  const FIRST = 8;
  const shown = allAmenities ? amenities : amenities.filter((a, i) => i < FIRST || f.amenities.includes(a.title));

  return (
    <div className="filter-form">
      {/* Facets fixed by a landing page are in its heading, so their groups are left out. */}
      {!locked.purpose ? (
        <Group title={t.purpose}>
          <Segmented
            radio
            className="filter-row"
            label={t.purpose}
            value={f.purpose}
            options={([undefined, 'buy', 'rent', 'short_stay'] as const).map((p) => [p, p ? PURPOSE_LABEL[locale][p] : t.any] as const)}
            onChange={(p) => set({ purpose: p, price_min: undefined, price_max: undefined })}
          />
        </Group>
      ) : null}

      {!locked.property_type ? (
        <Group title={t.type}>
          <div className="filter-row">
            {PROPERTY_TYPES.map((pt) => (
              <button key={pt} type="button" aria-pressed={f.property_type.includes(pt)} className="toggle" onClick={() => set({ property_type: toggle(f.property_type, pt) })}>
                {typeLabel(pt, locale)}
              </button>
            ))}
          </div>
        </Group>
      ) : null}

      <Group title={t.budget}>
        <div className="grid grid-cols-2 gap-3">
          <TextField label={t.min} inputMode="numeric" value={f.price_min ?? ''} hint={readable(f.price_min)} onChange={(e) => set({ price_min: numOrUndef(e.target.value) })} />
          <TextField
            label={t.max}
            inputMode="numeric"
            value={f.price_max ?? ''}
            hint={readable(f.price_max)}
            disabled={locked.price_max}
            onChange={(e) => set({ price_max: numOrUndef(e.target.value) })}
          />
        </div>
        <div className="filter-row mt-2">
          {presets.map((n) => (
            <button
              key={n}
              type="button"
              className="toggle"
              aria-pressed={f.price_max === n}
              disabled={locked.price_max}
              onClick={() =>
                set({
                  price_max: f.price_max === n ? undefined : n,
                  ...(f.purpose ? {} : { purpose: 'buy' }),
                })
              }
            >
              ≤ ₹{fmt(n)}
            </button>
          ))}
        </div>
      </Group>

      {!locked.bedrooms_min ? (
        <Group title={t.bhk}>
          <Segmented
            radio
            className="filter-row"
            label={t.bhk}
            // 'other' is a range from the URL that no button matches: nothing is checked.
            value={f.bedrooms_min === undefined ? 'any' : (BHK.find((b) => b.min === f.bedrooms_min && b.max === f.bedrooms_max)?.label ?? 'other')}
            options={[['any', t.any] as const, ...BHK.map((b) => [b.label, `${b.label} BHK`] as const)]}
            onChange={(label) => {
              const b = BHK.find((x) => x.label === label);
              set({ bedrooms_min: b?.min, bedrooms_max: b?.max });
            }}
          />
        </Group>
      ) : null}

      <Group title={t.furnishing}>
        <div className="filter-row">
          {FURNISHING.map((x) => (
            <button key={x} type="button" className="toggle" aria-pressed={f.furnishing.includes(x)} onClick={() => set({ furnishing: toggle(f.furnishing, x) })}>
              {t[x]}
            </button>
          ))}
        </div>
      </Group>

      {pgLike ? (
        <Group title={t.pg}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="field">
              <span className="field-label">{t.gender}</span>
              <select
                className="select"
                value={f.gender_preference ?? ''}
                onChange={(e) =>
                  set({
                    gender_preference: (e.target.value || undefined) as Filters['gender_preference'],
                  })
                }
              >
                <option value="">{t.genderAny}</option>
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">{t.sharing}</span>
              <select
                className="select"
                value={f.sharing_type ?? ''}
                onChange={(e) =>
                  set({
                    sharing_type: (e.target.value || undefined) as Filters['sharing_type'],
                  })
                }
              >
                <option value="">{t.any}</option>
                {(['private_room', 'shared_room', 'master_bedroom', 'entire_flat'] as const).map((s) => (
                  <option key={s} value={s}>
                    {t[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Group>
      ) : null}

      {f.purpose === 'short_stay' ? (
        <Group title={t.stay}>
          <div className="grid grid-cols-2 gap-3">
            <TextField label={t.checkIn} type="date" value={f.check_in ?? ''} onChange={(e) => set({ check_in: e.target.value || undefined })} />
            <TextField label={t.checkOut} type="date" value={f.check_out ?? ''} min={f.check_in} onChange={(e) => set({ check_out: e.target.value || undefined })} />
            <TextField label={t.guests} type="number" min={1} max={20} value={f.guests ?? ''} onChange={(e) => set({ guests: numOrUndef(e.target.value) })} />
          </div>
        </Group>
      ) : null}

      {amenities.length ? (
        <Group title={t.amenities}>
          {/* Two columns only where each label fits on one line (the wide sheet), one in the sidebar. */}
          <div className="grid grid-cols-1 gap-x-4 @md:grid-cols-2">
            {shown.map((a) => (
              <Check key={a.id} label={a.title} checked={f.amenities.includes(a.title)} onChange={() => set({ amenities: toggle(f.amenities, a.title) })} />
            ))}
          </div>
          {amenities.length > FIRST ? (
            <button type="button" className="btn btn-quiet mt-1 -ml-3" onClick={() => setAllAmenities((v) => !v)} aria-expanded={allAmenities}>
              {allAmenities ? t.less : `${t.more} (${amenities.length - FIRST})`}
            </button>
          ) : null}
        </Group>
      ) : null}

      <details className="filter-more" open={more} onToggle={(e) => setMore((e.target as HTMLDetailsElement).open)}>
        <summary className="btn btn-quiet -ml-3">{t.more2}</summary>
        <div className="grid gap-4 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <TextField label={`${t.area} · ${t.min}`} inputMode="numeric" value={f.area_min ?? ''} onChange={(e) => set({ area_min: numOrUndef(e.target.value) })} />
            <TextField label={`${t.area} · ${t.max}`} inputMode="numeric" value={f.area_max ?? ''} onChange={(e) => set({ area_max: numOrUndef(e.target.value) })} />
          </div>
          <div className="filter-row" role="radiogroup" aria-label={t.baths}>
            <span className="field-label w-full">{t.baths}</span>
            {[undefined, 1, 2, 3].map((n) => (
              <button key={n ?? 'any'} type="button" role="radio" aria-checked={f.bathrooms_min === n} className="toggle" onClick={() => set({ bathrooms_min: n })}>
                {n ? `${n}+` : t.any}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label={t.parking} type="number" min={0} max={10} value={f.parking_spaces_min ?? ''} onChange={(e) => set({ parking_spaces_min: numOrUndef(e.target.value) })} />
            <TextField label={t.age} type="number" min={0} max={100} value={f.age_max ?? ''} onChange={(e) => set({ age_max: numOrUndef(e.target.value) })} />
            <TextField label={t.floorMin} type="number" min={0} max={100} value={f.floor_number_min ?? ''} onChange={(e) => set({ floor_number_min: numOrUndef(e.target.value) })} />
            <TextField label={t.floorMax} type="number" min={0} max={100} value={f.floor_number_max ?? ''} onChange={(e) => set({ floor_number_max: numOrUndef(e.target.value) })} />
          </div>
          <label className="field">
            <span className="field-label">{t.moveIn}</span>
            <select
              className="select"
              value={f.move_in ?? ''}
              onChange={(e) =>
                set({
                  move_in: (e.target.value || undefined) as Filters['move_in'],
                })
              }
            >
              <option value="">{t.any}</option>
              {MOVE_IN.map((m) => (
                <option key={m} value={m}>
                  {t[m]}
                </option>
              ))}
            </select>
          </label>
          <Check label={t.lift} checked={Boolean(f.has_lift)} onChange={(e) => set({ has_lift: e.target.checked || undefined })} />
        </div>
      </details>
    </div>
  );
}
