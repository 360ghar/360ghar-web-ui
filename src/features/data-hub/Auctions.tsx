/**
 * Auction list (island on /bank-auctions). Filters sit in a sidebar from
 * 1024 px and in a bottom sheet below it. Page 1 comes from the server.
 */
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { compactPrice, parseNumber, rupees } from '@/lib/format';
import type { AuctionPage } from '@/features/data-hub/api';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { Segmented } from '@/ui/react/Segmented';
import { SelectField, TextField } from '@/ui/react/Field';
import { Sheet } from '@/ui/react/Sheet';
import { Toaster } from '@/ui/react/Toaster';
import { StateBlock } from '@/ui/states/StateBlock';
import { auctionsPage, isCourt, type Auction } from './api';
import { AuctionAlert } from './AuctionAlert';
import { fmtDate } from './format';
import { Island } from './Island';
import { CountBar, ListBody, useCursorList } from './list';
import { activeFilters, AUCTION, writeParams, type AuctionFilters } from './params';
import { label, text } from './text';

type Props = {
  locale: Locale;
  initialFilters: AuctionFilters;
  initialPage: AuctionPage | null;
  banks: string[];
  cities: string[];
  /** Today in IST from the server, so both renders agree on "ended". */
  today: string;
};

function Filters({ value, onChange, banks, cities, locale }: { value: AuctionFilters; onChange: (f: AuctionFilters) => void; banks: string[]; cities: string[]; locale: Locale }) {
  const t = text(locale);
  const set = (patch: Partial<AuctionFilters>) => onChange({ ...value, ...patch });
  // Price fields commit on blur or Enter, so typing does not refetch on every key.
  const commit = (key: 'min_price' | 'max_price') => (text: string) => {
    const n = parseNumber(text);
    set({ [key]: n !== null && n >= 0 ? n : undefined });
  };
  return (
    <div className="dh-form">
      {cities.length ? (
        <SelectField label={t.auCity} value={value.city ?? ''} onChange={(e) => set({ city: e.target.value || undefined })}>
          <option value="">{t.auAnyCity}</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectField>
      ) : null}
      <fieldset className="dh-fieldset">
        <legend className="field-label">{t.auType}</legend>
        <Segmented
          radio
          className="dh-seg"
          label={t.auType}
          value={value.type}
          options={([undefined, ...AUCTION.type] as const).map((k) => [k, k ? t.auTypes[k] : t.all] as const)}
          onChange={(k) => set({ type: k, ...(k === 'court' ? { bank: undefined } : {}) })}
        />
      </fieldset>
      {value.type !== 'court' && banks.length ? (
        <SelectField label={t.auBank} value={value.bank ?? ''} onChange={(e) => set({ bank: e.target.value || undefined })}>
          <option value="">{t.auAnyBank}</option>
          {banks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </SelectField>
      ) : null}
      <fieldset className="dh-fieldset">
        <legend className="field-label">{t.auPropertyType}</legend>
        <Segmented
          radio
          className="dh-seg"
          label={t.auPropertyType}
          value={value.property_type}
          options={([undefined, ...AUCTION.property_type] as const).map((k) => [k, k ? label(t.types, k) : t.all] as const)}
          onChange={(k) => set({ property_type: k })}
        />
      </fieldset>
      <TextField label={t.auMin} inputMode="numeric" autoComplete="off" value={value.min_price ?? ''} onCommit={commit('min_price')} />
      <TextField label={t.auMax} inputMode="numeric" autoComplete="off" value={value.max_price ?? ''} onCommit={commit('max_price')} />
      <TextField label={t.auFrom} type="date" value={value.date_from ?? ''} max={value.date_to} onChange={(e) => set({ date_from: e.target.value || undefined })} />
      <TextField label={t.auTo} type="date" value={value.date_to ?? ''} min={value.date_from} onChange={(e) => set({ date_to: e.target.value || undefined })} />
    </div>
  );
}

function AuctionCard({ a, locale, today }: { a: Auction; locale: Locale; today: string }) {
  const t = text(locale);
  const court = isCourt(a);
  const ended = a.auction_date ? a.auction_date < today : false;
  // Bank and court rows have separate id spaces, so a court row links to its own route.
  const href = localizePath(court ? `/bank-auctions/court/${a.id}` : `/bank-auctions/${a.id}`, locale);
  return (
    <article className="sheet dh-card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="dh-price">{a.reserve_price ? compactPrice(a.reserve_price, locale) : '–'}</span>
        {ended ? (
          <span className="dh-status is-plain">
            <Icon name="clock" size={16} />
            {t.auEnded}
          </span>
        ) : null}
      </div>
      <span className="visually-hidden">{t.auReserve}</span>
      <h3 className="dh-row-title">
        <a className="dh-card-link" href={href}>
          {a.property_description || label(t.types, a.property_type) || t.auH1}
        </a>
      </h3>
      <p className="dh-row-sub">
        {(court ? [a.court_name, t.auTypes.court, a.locality] : [a.bank_name, a.full_address]).filter(Boolean).join(' · ')}
      </p>
      <dl className="dh-facts">
        <div>
          <dt>{t.auDate}</dt>
          <dd>{fmtDate(a.auction_date, locale) ?? t.auNoDate}</dd>
        </div>
        {!court && a.emd_amount ? (
          <div>
            <dt>{t.auEmd}</dt>
            <dd>{rupees(a.emd_amount, locale)}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

function List({ locale, initialFilters, initialPage, banks, cities, today }: Props) {
  const t = text(locale);
  const [filters, setFilters] = useState<AuctionFilters>(initialFilters);
  const [draft, setDraft] = useState<AuctionFilters>(initialFilters);
  const [sheet, setSheet] = useState(false);
  const { query, items, total } = useCursorList({ name: 'auctions', spec: AUCTION, filters, initialFilters, initialPage, fetchPage: auctionsPage, idOf: (a) => `${a.kind}-${a.id}` });
  const n = activeFilters(filters);
  const key = writeParams(filters, AUCTION);
  const draftKey = writeParams(draft, AUCTION);
  const count = useQuery({
    queryKey: ['data-hub', 'auctions-count', draftKey],
    queryFn: async () => (await auctionsPage(draft, null)).total ?? null,
    enabled: sheet && draftKey !== key,
    staleTime: 60_000,
  });

  return (
    <div className="dh-results">
      <aside className="dh-results-side" aria-label={t.filters}>
        <Filters value={filters} onChange={setFilters} banks={banks} cities={cities} locale={locale} />
        {n ? (
          <button type="button" className="btn btn-quiet mt-4 -ml-3" onClick={() => setFilters({})}>
            {t.clear}
          </button>
        ) : null}
      </aside>

      <div className="min-w-0">
        <CountBar query={query} locale={locale} label={t.auCount(total ?? items.length)} as="div">
          <span className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn dh-results-filter-btn"
              onClick={() => {
                setDraft(filters);
                setSheet(true);
              }}
            >
              <Icon name="filter" size={18} />
              {t.filters}
              {n ? <span className="dh-badge-count">{n}</span> : null}
            </button>
            <AuctionAlert
              locale={locale}
              banks={banks}
              cities={cities}
              defaults={{ bank_name: filters.bank ?? null, city: filters.city ?? null, property_type: filters.property_type ?? null, min_price: filters.min_price ?? null, max_price: filters.max_price ?? null }}
            />
          </span>
        </CountBar>

        <ListBody
          query={query}
          count={items.length}
          locale={locale}
          skeleton={
            <ul className="dh-cards" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="sheet dh-card">
                  <span className="skeleton h-8 w-2/5" />
                  <span className="skeleton h-5 w-4/5" />
                  <span className="skeleton h-4 w-3/5" />
                </li>
              ))}
            </ul>
          }
          empty={<StateBlock scene="empty" title={t.auEmptyTitle} body={t.auEmptyBody} action={{ label: t.clear, onClick: () => setFilters({}) }} />}
        >
          <ul className="dh-cards">
            {items.map((a) => (
              <li key={`${a.kind}-${a.id}`}>
                <AuctionCard a={a} locale={locale} today={today} />
              </li>
            ))}
          </ul>
        </ListBody>
      </div>

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title={t.filters}
        closeLabel={t.close}
        footer={
          <>
            <button type="button" className="btn btn-quiet" onClick={() => setDraft({})}>
              {t.reset}
            </button>
            <button
              type="button"
              className="btn btn-primary grow"
              onClick={() => {
                setFilters(draft);
                setSheet(false);
              }}
            >
              {t.show(draftKey === key ? total : (count.data ?? null))}
            </button>
          </>
        }
      >
        <Filters value={draft} onChange={setDraft} banks={banks} cities={cities} locale={locale} />
      </Sheet>
      <Toaster />
    </div>
  );
}

export default function Auctions(props: Props) {
  return (
    <Island locale={props.locale}>
      <List {...props} />
    </Island>
  );
}
