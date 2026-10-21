/**
 * Zoning list with a sector search, and the FAR calculator (islands on /zone-checker).
 * Wire fields: far_limit, max_coverage_pct, max_height_m (backend-gaps X7, X8).
 */
import { useState } from 'react';
import { areaSqft } from '@/lib/format';
import type { ZonePage } from '@/features/data-hub/api';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { SelectField, TextField } from '@/ui/react/Field';
import { StateBlock } from '@/ui/states/StateBlock';
import type { Zone } from './api';
import { zonesPage } from './api';
import { farArea, parseAmount } from './format';
import { Island } from './Island';
import { CountBar, ListBody, TableSkeleton, useCursorList, useSearchFilter } from './list';
import { ZONE, type ZoneFilters } from './params';
import { label, text } from './text';

const num = (v: number | null | undefined, unit = '') => (v == null ? '–' : `${v}${unit}`);

const NEXT = {
  en: { lead: 'Other checks before you buy land:', rera: 'RERA projects', owner: 'Verify ownership' },
  hi: { lead: 'ज़मीन खरीदने से पहले ये भी जाँचें:', rera: 'RERA प्रोजेक्ट', owner: 'मालिकाना हक जाँचें' },
};

/** Real pages to go to when the zoning table has no answer (shown in both empty states). */
function NextSteps({ locale }: { locale: Locale }) {
  const n = NEXT[locale === 'hi' ? 'hi' : 'en'];
  return (
    <p className="mt-3 text-ink-800">
      {n.lead}{' '}
      <a className="link" href={localizePath('/rera-projects', locale)}>
        {n.rera}
      </a>
      ,{' '}
      <a className="link" href={localizePath('/verify-ownership', locale)}>
        {n.owner}
      </a>
      .
    </p>
  );
}

type ListProps = { locale: Locale; initialFilters: ZoneFilters; initialPage: ZonePage | null };

function List({ locale, initialFilters, initialPage }: ListProps) {
  const t = text(locale);
  const { filters, setFilters, q, setQ } = useSearchFilter(initialFilters, 'sector');
  const { query, items, total } = useCursorList({ name: 'zones', spec: ZONE, filters, initialFilters, initialPage, fetchPage: zonesPage, idOf: (z) => z.id });
  const clear = () => {
    setQ('');
    setFilters({});
  };
  const circleLink = localizePath(`/circle-rates${filters.sector ? `?sector=${encodeURIComponent(filters.sector)}` : ''}`, locale);

  return (
    <div>
      <div className="dh-toolbar">
        <TextField label={t.znSearch} hint={t.znSearchHint} type="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <CountBar query={query} locale={locale} label={t.znCount(total ?? items.length)} />
      <ListBody
        query={query}
        count={items.length}
        locale={locale}
        skeleton={<TableSkeleton cols={4} rows={6} />}
        empty={
          filters.sector ? (
            <StateBlock scene="empty" title={t.znEmptyTitle(filters.sector)} body={t.znEmptyBody} action={{ label: t.clear, onClick: clear }} secondary={{ label: t.znCircle, href: circleLink }}>
              <NextSteps locale={locale} />
            </StateBlock>
          ) : (
            <StateBlock scene="empty" title={t.znNoneTitle} body={t.znNoneBody} action={{ label: t.znCircle, href: circleLink }}>
              <NextSteps locale={locale} />
            </StateBlock>
          )
        }
      >
        <div className="sheet dh-sheet">
          <table className="dh-table">
            <thead>
              <tr>
                <th scope="col">{t.znSearch}</th>
                <th scope="col">{t.znLandUse}</th>
                <th scope="col" className="num">
                  {t.znFar}
                </th>
                <th scope="col" className="num wide">
                  {t.znCoverage}
                </th>
                <th scope="col" className="num wide">
                  {t.znHeight}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((z) => (
                <tr key={z.id}>
                  <th scope="row" className="font-normal">
                    <a href={localizePath(`/zone-checker/${z.slug}`, locale)}>{z.sector}</a>
                  </th>
                  <td>{label(t.types, z.land_use) || '–'}</td>
                  <td className="num">{num(z.far_limit)}</td>
                  <td className="num wide">{num(z.max_coverage_pct, '%')}</td>
                  <td className="num wide">{num(z.max_height_m, ' m')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ListBody>
    </div>
  );
}

function Far({ locale, zones }: { locale: Locale; zones: Pick<Zone, 'slug' | 'sector' | 'far_limit'>[] }) {
  const t = text(locale);
  const [plot, setPlot] = useState('');
  const [far, setFar] = useState('');
  const withFar = zones.filter((z) => z.far_limit != null);
  const area = farArea(parseAmount(plot) ?? 0, Number(far));
  return (
    <section className="sheet dh-panel dh-form" aria-labelledby="far-title">
      <div>
        <h2 id="far-title" className="dh-panel-title mb-1">
          {t.farTitle}
        </h2>
        <p className="text-ink-800">{t.farLead}</p>
      </div>
      <TextField label={t.farPlot} inputMode="decimal" autoComplete="off" value={plot} onChange={(e) => setPlot(e.target.value)} />
      <div className="dh-form-row">
        {withFar.length ? (
          <SelectField label={t.farPick} value={withFar.find((z) => String(z.far_limit) === far)?.slug ?? ''} onChange={(e) => setFar(String(withFar.find((z) => z.slug === e.target.value)?.far_limit ?? ''))}>
            <option value="">{t.farNone}</option>
            {withFar.map((z) => (
              <option key={z.slug} value={z.slug}>
                {z.sector} ({z.far_limit})
              </option>
            ))}
          </SelectField>
        ) : null}
        <TextField label={t.farValue} inputMode="decimal" autoComplete="off" value={far} onChange={(e) => setFar(e.target.value)} />
      </div>
      <p className="grid gap-1" aria-live="polite">
        <span className="dh-fig-label">{t.farResult}</span>
        <span className="dh-price">{areaSqft(area, locale) ?? '–'}</span>
        {area ? null : <span className="dh-meta">{t.farEmpty}</span>}
      </p>
    </section>
  );
}

export function FarCalculator(props: { locale: Locale; zones: Pick<Zone, 'slug' | 'sector' | 'far_limit'>[] }) {
  return (
    <IslandBoundary locale={props.locale} compact>
      <Far {...props} />
    </IslandBoundary>
  );
}

export default function Zones(props: ListProps) {
  return (
    <Island locale={props.locale}>
      <List {...props} />
    </Island>
  );
}
