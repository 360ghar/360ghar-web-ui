/** Gazette notices with type tabs (island on /regulatory-updates). The tab is in the URL (?type=). */
import { useState } from 'react';
import type { GazettePage } from '@/features/data-hub/api';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { Tabs } from '@/ui/react/Tabs';
import { StateBlock } from '@/ui/states/StateBlock';
import { gazettePage } from './api';
import { fmtDate } from './format';
import { Island } from './Island';
import { CountBar, ListBody, RowsSkeleton, useCursorList } from './list';
import { GAZETTE, type GazetteFilters } from './params';
import { text } from './text';

type Props = { locale: Locale; initialFilters: GazetteFilters; initialPage: GazettePage | null };

function Notices({ locale, initialFilters, initialPage }: Props) {
  const t = text(locale);
  const [filters, setFilters] = useState<GazetteFilters>(initialFilters);
  const { query, items, total } = useCursorList({ name: 'gazette', spec: GAZETTE, filters, initialFilters, initialPage, fetchPage: gazettePage, idOf: (g) => g.id });
  const tab = filters.type ?? 'all';
  const tabs = (['all', ...GAZETTE.type] as const).map((id) => ({
    id,
    label: t.gzTypes[id],
    panel:
      id === tab ? (
        <>
          <CountBar query={query} locale={locale} label={t.gzCount(total ?? items.length)} />
          <ListBody
            query={query}
            count={items.length}
            locale={locale}
            skeleton={<RowsSkeleton />}
            empty={
              tab === 'all' ? (
                <StateBlock scene="empty" title={t.gzNone} body={t.gzEmptyBody} />
              ) : (
                <StateBlock scene="empty" title={t.gzEmptyTitle(t.gzTypes[tab] ?? '')} body={t.gzEmptyBody} action={{ label: t.gzAll, onClick: () => setFilters({}) }} />
              )
            }
          >
            <ul className="sheet dh-rows">
              {items.map((g) => (
                <li key={g.id} className="grid gap-1.5">
                  <p className="flex flex-wrap gap-x-3 gap-y-1 text-[0.9375rem]">
                    {g.notification_type ? <span className="font-bold text-kesar-700">{t.gzTypes[g.notification_type]}</span> : null}
                    {g.notification_date ? <time dateTime={g.notification_date} className="tabular text-ink-800">{fmtDate(g.notification_date, locale, 'long')}</time> : null}
                    {g.department ? <span className="text-ink-600">{g.department}</span> : null}
                  </p>
                  <h3 className="dh-row-title">{g.title}</h3>
                  {g.summary ? <p className="text-ink-800 max-w-[68ch]">{g.summary}</p> : null}
                  <p className="flex flex-wrap items-center gap-x-5 text-[0.9375rem]">
                    {g.notification_number ? (
                      <span className="text-ink-600">
                        {t.gzNumber} <span className="tabular text-ink-950 font-semibold">{g.notification_number}</span>
                      </span>
                    ) : null}
                    {g.pdf_url ? (
                      <a className="link" href={g.pdf_url} target="_blank" rel="noopener noreferrer">
                        {t.gzPdf}
                        <Icon name="arrow-up-right" size={16} className="arrow" />
                      </a>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </ListBody>
        </>
      ) : null,
  }));

  return <Tabs tabs={tabs} value={tab} onChange={(id) => setFilters(id === 'all' ? {} : { type: id as GazetteFilters['type'] })} label={t.gzTabs} />;
}

export default function GazetteNotices(props: Props) {
  return (
    <Island locale={props.locale}>
      <Notices {...props} />
    </Island>
  );
}
