/**
 * The watchlist, read after the session settles. The list belongs to the signed-in
 * account, so it cannot be rendered on the server: this island loads it in the
 * browser, and removing a row is optimistic (the row leaves at once and comes
 * back with a toast if the server refuses).
 */
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { initAuth, useAuthStore } from '@/features/auth/store';
import { loginHref } from '@/features/auth/flows';
import { describeError } from '@/lib/api/errors';
import { rupees } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { Island } from '@/features/data-hub/Island';
import { fmtDate } from '@/features/data-hub/format';
import { Delayed, Skeleton } from '@/ui/react/Delayed';
import { StateBlock } from '@/ui/states/StateBlock';
import { toast } from '@/ui/react/Toaster';
import { removeFromWatchlist, watchlist } from './api';
import { label, text, toneOf } from './text';
import { setSaved } from './watchlistState';
import type { WatchlistItem } from './types';

export type WatchlistListProps = { locale: Locale };

const KEY = ['projects', 'watchlist'] as const;

function List({ locale }: WatchlistListProps) {
  const t = text(locale);
  const client = useQueryClient();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    void initAuth();
  }, []);

  const query = useQuery({
    queryKey: KEY,
    queryFn: watchlist,
    enabled: status === 'authed',
    staleTime: 30_000,
    retry: false,
  });

  // Keep the watchlist buttons on other screens in step with this list.
  useEffect(() => {
    for (const item of query.data ?? []) setSaved(item.project_id, true, false);
  }, [query.data]);

  const remove = useMutation({
    mutationFn: (projectId: number) => removeFromWatchlist(projectId),
    onMutate: async (projectId: number) => {
      await client.cancelQueries({ queryKey: KEY });
      const previous = client.getQueryData<WatchlistItem[]>(KEY);
      client.setQueryData<WatchlistItem[]>(KEY, (old) => (old ?? []).filter((item) => item.project_id !== projectId));
      setSaved(projectId, false);
      return { previous };
    },
    onError: (error, projectId, context) => {
      if (context?.previous) client.setQueryData(KEY, context.previous);
      setSaved(projectId, true);
      toast(describeError(error, locale).title, 'error');
    },
    onSuccess: () => toast(t.wlRemoved, 'success'),
    onSettled: () => void client.invalidateQueries({ queryKey: KEY }),
  });

  if (status !== 'authed') {
    return status === 'unknown' ? (
      <Delayed>
        <div className="grid gap-3" aria-busy="true">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </Delayed>
    ) : (
      <StateBlock scene="empty" title={t.wlTitle} body={t.wlSignIn} action={{ label: t.wlSave, href: loginHref(locale, localizePath('/account/watchlist', locale)) }} />
    );
  }

  const error = query.isError ? describeError(query.error, locale) : null;
  const items = query.data ?? [];

  if (error && items.length === 0) {
    return <StateBlock scene={error.kind === 'network' ? 'offline' : 'error'} title={error.title} body={error.body} action={{ label: t.retry, onClick: () => void query.refetch() }} />;
  }

  if (query.isPending) {
    return (
      <Delayed>
        <div className="grid gap-3" aria-busy="true">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </Delayed>
    );
  }

  if (items.length === 0) {
    return <StateBlock scene="empty" title={t.wlTitle} body={t.wlEmpty} action={{ label: t.wlEmptyAction, href: localizePath('/properties', locale) }} />;
  }

  return (
    <div className="pj-watchlist" aria-busy={query.isFetching || undefined}>
      <ul className="sheet dh-rows">
        {items.map((item) => {
          const project = item.project;
          const added = fmtDate(item.created_at, locale, 'long');
          const alerts = item.alert_prefs && Object.keys(item.alert_prefs).length > 0 ? Object.keys(item.alert_prefs).join(', ') : null;
          return (
            <li key={item.id}>
              <div className="dh-row-head">
                <h3 className="dh-row-title">
                  {project?.slug ? <a href={localizePath(`/project/${project.slug}`, locale)}>{project.project_name}</a> : project?.project_name || `#${item.project_id}`}
                </h3>
                {project?.stage ? <span className={`dh-status ${toneOf(project.stage)}`}>{label(t.stageNames, project.stage)}</span> : null}
              </div>
              {project ? <p className="dh-row-sub">{[project.developer_name, project.location, project.district].filter(Boolean).join(' · ')}</p> : null}
              <dl className="dh-facts">
                {project?.current_price_per_sqft !== null && project?.current_price_per_sqft !== undefined ? (
                  <div>
                    <dt>{t.pricePerSqft}</dt>
                    <dd className="tabular">
                      {rupees(project.current_price_per_sqft, locale)} {t.perSqft}
                    </dd>
                  </div>
                ) : null}
                {added ? (
                  <div>
                    <dt>{t.wlAddedLabel}</dt>
                    <dd>{added}</dd>
                  </div>
                ) : null}
                {alerts ? (
                  <div>
                    <dt>{t.wlAlerts}</dt>
                    <dd>{alerts}</dd>
                  </div>
                ) : null}
                {item.notes ? (
                  <div>
                    <dt>{t.wlNotes}</dt>
                    <dd>{item.notes}</dd>
                  </div>
                ) : null}
              </dl>
              <button type="button" className="btn mt-3" disabled={remove.isPending} onClick={() => remove.mutate(item.project_id)}>
                <Icon name="trash" size={18} />
                {t.wlRemove}
              </button>
            </li>
          );
        })}
      </ul>
      {error ? (
        <p className="field-error mt-3" role="alert">
          <Icon name="alert" size={16} />
          {error.title}
        </p>
      ) : null}
    </div>
  );
}

export function WatchlistList(props: WatchlistListProps) {
  return (
    <Island locale={props.locale}>
      <List {...props} />
    </Island>
  );
}

export default WatchlistList;
