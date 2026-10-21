/** Builder reputation table with search and score order (island on /builder-reputation). */
import { formatNum } from '@/lib/format';
import type { BuilderPage } from '@/features/data-hub/api';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Segmented } from '@/ui/react/Segmented';
import { TextField } from '@/ui/react/Field';
import { StateBlock } from '@/ui/states/StateBlock';
import { buildersPage } from './api';
import { scoreBand } from './format';
import { Island } from './Island';
import { CountBar, ListBody, TableSkeleton, useCursorList, useSearchFilter } from './list';
import { BUILDER, type BuilderFilters } from './params';
import { text } from './text';

type Props = { locale: Locale; initialFilters: BuilderFilters; initialPage: BuilderPage | null };
const TONE = { good: 'is-good', average: 'is-wait', poor: 'is-bad' } as const;

function List({ locale, initialFilters, initialPage }: Props) {
  const t = text(locale);
  const { filters, setFilters, q, setQ } = useSearchFilter(initialFilters, 'q');
  const { query, items, total } = useCursorList({ name: 'builders', spec: BUILDER, filters, initialFilters, initialPage, fetchPage: buildersPage, idOf: (b) => b.slug });
  const clear = () => {
    setQ('');
    setFilters((f) => ({ order_by: f.order_by }));
  };

  return (
    <div>
      <div className="dh-toolbar">
        <TextField label={t.bdSearch} type="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
        <fieldset className="dh-fieldset">
          <legend className="field-label">{t.bdSort}</legend>
          <Segmented
            radio
            className="dh-seg"
            label={t.bdSort}
            value={filters.order_by}
            options={([undefined, 'score'] as const).map((o) => [o, t.bdSorts[o ?? 'default']] as const)}
            onChange={(o) => setFilters((f) => ({ ...f, order_by: o }))}
          />
        </fieldset>
      </div>
      <CountBar query={query} locale={locale} label={t.bdCount(total ?? items.length)} />
      <ListBody
        query={query}
        count={items.length}
        locale={locale}
        skeleton={<TableSkeleton cols={4} />}
        empty={
          filters.q ? (
            <StateBlock scene="empty" title={t.bdEmptyTitle(filters.q)} body={t.bdEmptyBody} action={{ label: t.clear, onClick: clear }} />
          ) : (
            <StateBlock
              scene="empty"
              title={t.bdNoneTitle}
              body={t.bdNoneBody}
              action={{ label: t.bdGuide, href: localizePath('/builder-reputation-score', locale) }}
              secondary={{ label: t.bdRera, href: localizePath('/rera-projects', locale) }}
            />
          )
        }
      >
        <div className="sheet dh-sheet">
          <table className="dh-table">
            <thead>
              <tr>
                <th scope="col">{t.bdName}</th>
                <th scope="col" className="num">
                  {t.bdProjects}
                </th>
                <th scope="col" className="num">
                  {t.bdComplaints}
                </th>
                <th scope="col" className="num">
                  {t.bdScore}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const band = scoreBand(b.builder_score);
                return (
                  <tr key={b.slug}>
                    <th scope="row" className="font-normal">
                      <a href={localizePath(`/builder-reputation/${b.slug}`, locale)}>{b.builder_name}</a>
                    </th>
                    <td className="num">{formatNum(b.total_projects, locale)}</td>
                    <td className="num">{formatNum(b.total_complaints, locale)}</td>
                    <td className="num">
                      <span className={`dh-status ${TONE[band]}`}>
                        {Math.round(b.builder_score)} <span className="font-semibold">{t.bandShort[band]}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ListBody>
    </div>
  );
}

export default function Builders(props: Props) {
  return (
    <Island locale={props.locale}>
      <List {...props} />
    </Island>
  );
}
