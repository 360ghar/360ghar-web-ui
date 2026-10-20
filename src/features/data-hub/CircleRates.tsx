/** Circle rate table with sector and property-type filters (island on /circle-rates). */
import { useState } from 'react';
import { rupees } from '@/lib/format';
import type { CircleRatePage } from '@/features/data-hub/api';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Segmented } from '@/ui/react/Segmented';
import { SelectField } from '@/ui/react/Field';
import { StateBlock } from '@/ui/states/StateBlock';
import { circleRatesPage } from './api';
import { Island } from './Island';
import { CountBar, ListBody, TableSkeleton, useCursorList } from './list';
import { activeFilters, CIRCLE, type CircleFilters } from './params';
import { label, text } from './text';

type Props = { locale: Locale; initialFilters: CircleFilters; initialPage: CircleRatePage | null; sectors: string[] };

function Rates({ locale, initialFilters, initialPage, sectors }: Props) {
  const t = text(locale);
  const [filters, setFilters] = useState<CircleFilters>(initialFilters);
  const { query, items, total } = useCursorList({
    name: 'circle-rates',
    spec: CIRCLE,
    filters,
    initialFilters,
    initialPage,
    fetchPage: circleRatesPage,
    idOf: (r) => r.id,
  });
  const n = activeFilters(filters);
  const set = (patch: Partial<CircleFilters>) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <div>
      <div className="dh-toolbar">
        <SelectField label={t.crSector} value={filters.sector ?? ''} onChange={(e) => set({ sector: e.target.value || undefined })}>
          <option value="">{t.all}</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>
        <fieldset className="dh-fieldset">
          <legend className="field-label">{t.crType}</legend>
          <Segmented
            radio
            className="dh-seg"
            label={t.crType}
            value={filters.property_type}
            options={([undefined, ...CIRCLE.property_type] as const).map((pt) => [pt, pt ? label(t.types, pt) : t.all] as const)}
            onChange={(pt) => set({ property_type: pt })}
          />
        </fieldset>
      </div>

      <CountBar query={query} locale={locale} label={t.crCount(total ?? items.length)} onClear={n ? () => setFilters({}) : undefined} />

      <ListBody
        query={query}
        count={items.length}
        locale={locale}
        skeleton={<TableSkeleton cols={4} />}
        empty={<StateBlock scene="empty" title={t.crEmptyTitle} body={t.crEmptyBody} action={{ label: t.clear, onClick: () => setFilters({}) }} />}
      >
        <div className="sheet dh-sheet">
          <table className="dh-table">
            <thead>
              <tr>
                <th scope="col">{t.crSector}</th>
                <th scope="col">{t.crType}</th>
                <th scope="col" className="num">
                  ₹ {t.crPerSqyd}
                </th>
                <th scope="col" className="num wide">
                  ₹ {t.crPerSqft}
                </th>
                <th scope="col" className="num wide">
                  {locale === 'hi' ? 'वर्ष' : 'Year'}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <th scope="row" className="font-normal">
                    <a href={localizePath(`/circle-rate/${r.slug}`, locale)}>
                      {r.sector}
                      {r.colony ? `, ${r.colony}` : ''}
                      <span className="visually-hidden"> {label(t.types, r.property_type)}</span>
                    </a>
                  </th>
                  <td>{label(t.types, r.property_type)}</td>
                  <td className="num">{r.rate_per_sqyd ? rupees(r.rate_per_sqyd, locale) : t.crNoRate}</td>
                  <td className="num wide">{r.rate_per_sqft ? rupees(r.rate_per_sqft, locale) : t.crNoRate}</td>
                  <td className="num wide">{r.revision_year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ListBody>
    </div>
  );
}

export default function CircleRates(props: Props) {
  return (
    <Island locale={props.locale}>
      <Rates {...props} />
    </Island>
  );
}
