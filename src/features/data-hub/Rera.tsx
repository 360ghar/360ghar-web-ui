/** RERA project list (search + status) and the RERA number check (islands on /rera-projects). */
import { useMutation } from '@tanstack/react-query';
import { useState, type SyntheticEvent } from 'react';
import { describeError } from '@/lib/api/errors';
import { formatNum } from '@/lib/format';
import { localizePath } from '@/lib/i18n/locale';
import type { ReraProjectPage } from '@/features/data-hub/api';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { Segmented } from '@/ui/react/Segmented';
import { TextField } from '@/ui/react/Field';
import { StateBlock } from '@/ui/states/StateBlock';
import { reraPage, verifyRera } from './api';
import { fmtDate } from './format';
import { Island } from './Island';
import { CountBar, ListBody, RowsSkeleton, useCursorList, useSearchFilter } from './list';
import { activeFilters, RERA, type ReraFilters } from './params';
import { projectBySlug } from '@/features/projects/catalog';
import { validSlug } from './route';
import { Status } from './Status';
import { label, text } from './text';

type ListProps = { locale: Locale; initialFilters: ReraFilters; initialPage: ReraProjectPage | null };

function Projects({ locale, initialFilters, initialPage }: ListProps) {
  const t = text(locale);
  const { filters, setFilters, q, setQ } = useSearchFilter(initialFilters, 'q');
  const { query, items, total } = useCursorList({ name: 'rera', spec: RERA, filters, initialFilters, initialPage, fetchPage: reraPage, idOf: (p) => p.id });
  const clear = () => {
    setQ('');
    setFilters({});
  };

  return (
    <div>
      <div className="dh-toolbar">
        <TextField label={t.reraSearch} type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        <fieldset className="dh-fieldset">
          <legend className="field-label">{t.reraStatus}</legend>
          <Segmented
            radio
            className="dh-seg"
            label={t.reraStatus}
            value={filters.status}
            options={([undefined, ...RERA.status] as const).map((s) => [s, s ? t.statuses[s] : t.all] as const)}
            onChange={(s) => setFilters((f) => ({ ...f, status: s }))}
          />
        </fieldset>
      </div>

      <CountBar query={query} locale={locale} label={t.reraCount(total ?? items.length)} onClear={activeFilters(filters) ? clear : undefined} />

      <ListBody
        query={query}
        count={items.length}
        locale={locale}
        skeleton={<RowsSkeleton />}
        empty={<StateBlock scene="empty" title={t.reraEmptyTitle} body={t.reraEmptyBody} action={{ label: t.clear, onClick: clear }} />}
      >
        <ul className="sheet dh-rows">
          {items.map((p) => (
            <li key={p.id}>
              <div className="dh-row-head">
                {/* The slug is the public URL key of the project-intelligence page.
                    A row whose filing named no project name has none, and that page
                    would 404, so the title stays plain text for those rows, and for a slug
                    the route itself would reject, or for a slug of an old catalog page (the
                    route shows that page held, as the sitemap does). */}
                <h3 className="dh-row-title">
                  {validSlug(p.slug ?? undefined) && !projectBySlug(p.slug!) ? <a href={localizePath(`/project/${p.slug}`, locale)}>{p.project_name}</a> : p.project_name}
                </h3>
                <Status value={p.status} locale={locale} />
              </div>
              <p className="dh-row-sub">{[p.developer_name, p.location, p.project_type ? label(t.types, p.project_type) : null].filter(Boolean).join(' · ')}</p>
              <dl className="dh-facts">
                <div>
                  <dt>{t.reraNumber}</dt>
                  <dd>{p.rera_number}</dd>
                </div>
                {p.total_units != null ? (
                  <div>
                    <dt>{t.reraUnits}</dt>
                    <dd>{formatNum(p.total_units, locale)}</dd>
                  </div>
                ) : null}
                {p.possession_date ? (
                  <div>
                    <dt>{t.reraPossession}</dt>
                    <dd>{fmtDate(p.possession_date, locale)}</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          ))}
        </ul>
      </ListBody>
    </div>
  );
}

function Verify({ locale }: { locale: Locale }) {
  const t = text(locale);
  const [n, setN] = useState('');
  const [error, setError] = useState<string | null>(null);
  const check = useMutation({ mutationFn: (num: string) => verifyRera(num) });
  const submit = (e: SyntheticEvent) => {
    e.preventDefault();
    const num = n.trim();
    if (!num) {
      setError(t.verifyEmpty);
      return;
    }
    setError(null);
    check.mutate(num);
  };
  const res = check.data;
  const err = check.isError ? describeError(check.error, locale) : null;
  return (
    <form className="sheet dh-panel" onSubmit={submit} noValidate aria-labelledby="rera-verify">
      <h2 id="rera-verify" className="dh-panel-title">
        {t.verifyTitle}
      </h2>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 grow basis-64">
          <TextField
            label={t.verifyLabel}
            placeholder="HRERA-GGM-189-847"
            autoComplete="off"
            spellCheck={false}
            value={n}
            error={error ?? undefined}
            onChange={(e) => {
              setN(e.target.value);
              check.reset();
            }}
          />
        </div>
        <button type="submit" className="btn btn-ink mt-7" disabled={check.isPending}>
          {check.isPending ? t.verifyBusy : t.verifyButton}
        </button>
      </div>
      <div aria-live="polite">
        {res ? (
          res.valid ? (
            <p className="mt-4 grid gap-1">
              <span className="dh-status is-good">
                <Icon name="check" size={16} />
                {t.verifyYes(res.project_name ?? n.trim())}
              </span>
              {res.status ? <span className="text-ink-800">{t.verifyStatus(label(t.statuses, res.status))}</span> : null}
            </p>
          ) : (
            <p className="mt-4 field-error">
              <Icon name="alert" size={16} />
              {t.verifyNo}
            </p>
          )
        ) : null}
        {err ? (
          <p className="mt-4 field-error" role="alert">
            <Icon name="alert" size={16} />
            {err.title}. {err.body}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export function ReraVerify(props: { locale: Locale }) {
  return (
    <Island locale={props.locale} compact>
      <Verify {...props} />
    </Island>
  );
}

export default function ReraProjects(props: ListProps) {
  return (
    <Island locale={props.locale}>
      <Projects {...props} />
    </Island>
  );
}
