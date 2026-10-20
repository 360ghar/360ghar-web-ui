import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { describeError } from '@/lib/api/errors';
import { formatDate } from '@/lib/format';
import { useCursorQuery } from '@/lib/infinite';
import type { ConversationPage } from '@/features/chat/history';
import type { Locale } from '@/lib/i18n/locale';
import { QueryProvider } from '@/lib/query';
import { Icon } from '@/ui/icons/Icon';
import { Delayed, Skeleton } from '@/ui/react/Delayed';
import { chatCopy } from './copy';
import {
  conversationsKey,
  deleteConversation,
  fetchConversationMessages,
  fetchConversations,
  mapMessages,
} from './history';
import { useChat } from './store';
import { serverDate } from './widgets';

type Props = {
  locale: Locale;
  /** Called after a conversation is loaded into the panel. */
  onOpened: () => void;
};

type Pages = InfiniteData<ConversationPage, string | null>;

function ListSkeleton() {
  return (
    <Delayed>
      <ul className="chat-hist-list" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="chat-hist-row">
            <span className="chat-hist-open">
              <Skeleton style={{ height: '1rem', width: '70%' }} />
              <Skeleton style={{ height: '0.75rem', width: '40%' }} />
            </span>
          </li>
        ))}
      </ul>
    </Delayed>
  );
}

function HistoryView({ locale, onOpened }: Props) {
  const c = chatCopy(locale);
  const client = useQueryClient();
  const query = useCursorQuery({ key: conversationsKey, fetch: fetchConversations, staleTime: 0 });
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const keepButton = useRef<HTMLButtonElement>(null);
  // The id whose delete button gets focus back after a cancel (the button is rebuilt, so keep the id, not the element).
  const restore = useRef<number | null>(null);

  // Keep focus in the panel: heading on entry, "Keep" when the confirm opens.
  useEffect(() => {
    heading.current?.focus();
  }, []);
  useEffect(() => {
    if (confirmId !== null) keepButton.current?.focus();
    else if (restore.current !== null) {
      root.current?.querySelector<HTMLElement>(`[data-delete="${restore.current}"]`)?.focus();
      restore.current = null;
    }
  }, [confirmId]);

  const cancel = () => {
    restore.current = confirmId;
    setConfirmId(null);
  };

  // Escape cancels an open confirm instead of closing the whole panel.
  useEffect(() => {
    const el = root.current;
    if (!el || confirmId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      cancel();
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
    // `cancel` only reads `confirmId`, which is in the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmId]);

  const open = useMutation({
    // The newest page opens first; the panel offers the older ones.
    mutationFn: async (id: number) => {
      const page = await fetchConversationMessages(id, null);
      return { id, rows: page.items, cursor: page.has_more ? page.next_cursor : null };
    },
    onSuccess: ({ id, rows, cursor }) => {
      useChat.getState().openConversation(id, mapMessages(rows), { rows, cursor });
      onOpened();
    },
  });

  const remove = useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_data, id) => {
      client.setQueryData<Pages>(conversationsKey, (old) =>
        old ? { ...old, pages: old.pages.map((p) => ({ ...p, items: p.items.filter((x) => x.id !== id) })) } : old,
      );
      if (useChat.getState().conversationId === id) useChat.getState().reset();
      setConfirmId(null);
      setNotice(c.deleted);
      heading.current?.focus();
    },
  });

  const rows = query.data?.pages.flatMap((p) => p.items) ?? [];
  const when = (iso: string) => formatDate(serverDate(iso) ?? iso, locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const failure = query.isError ? describeError(query.error, locale) : null;

  return (
    <section ref={root} className="chat-hist" aria-labelledby="chat-hist-title">
      <h3 id="chat-hist-title" ref={heading} tabIndex={-1} className="chat-hist-head">
        {c.history}
      </h3>
      <p className="chat-muted">{c.historyIntro}</p>
      <p className="visually-hidden" role="status">
        {open.isPending ? c.opening : query.isPending ? c.historyLoading : notice}
      </p>

      {query.isPending ? <ListSkeleton /> : null}

      {failure ? (
        <div className="chat-hist-state" role="alert">
          <strong>{failure.title}</strong>
          <span>{failure.body}</span>
          <button type="button" className="btn btn-quiet" onClick={() => void query.refetch()}>
            <Icon name="retry" size={16} />
            {c.retry}
          </button>
        </div>
      ) : null}

      {query.isSuccess && rows.length === 0 ? <p className="chat-hist-state">{c.historyEmpty}</p> : null}

      {rows.length ? (
        <ul className="chat-hist-list">
          {rows.map((r) => {
            const title = r.title?.trim() || c.untitled;
            const meta = [when(r.updated_at), c.messageCount(r.message_count ?? 0)].join(' · ');
            if (confirmId === r.id) {
              return (
                <li key={r.id} className="chat-hist-row is-confirm" role="group" aria-label={c.deleteConversation(title)}>
                  <p id="chat-del-ask">{c.deleteAsk}</p>
                  <div className="chat-hist-actions">
                    <button ref={keepButton} type="button" className="btn btn-quiet" aria-describedby="chat-del-ask" onClick={cancel}>
                      {c.deleteNo}
                    </button>
                    <button type="button" className="btn btn-ink" aria-disabled={remove.isPending || undefined} onClick={() => !remove.isPending && remove.mutate(r.id)}>
                      {c.deleteYes}
                    </button>
                  </div>
                  {remove.isError ? (
                    <p className="chat-error" role="alert">
                      {c.deleteFailed}
                    </p>
                  ) : null}
                </li>
              );
            }
            return (
              <li key={r.id} className="chat-hist-row">
                <button
                  type="button"
                  className="chat-hist-open"
                  aria-disabled={open.isPending || undefined}
                  aria-busy={(open.isPending && open.variables === r.id) || undefined}
                  onClick={() => !open.isPending && open.mutate(r.id)}
                >
                  <span className="chat-hist-title">{title}</span>
                  <span className="chat-muted tabular">{meta}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-quiet btn-icon"
                  aria-label={c.deleteConversation(title)}
                  aria-disabled={open.isPending || undefined}
                  data-delete={r.id}
                  onClick={() => {
                    if (open.isPending) return;
                    remove.reset();
                    setNotice('');
                    setConfirmId(r.id);
                  }}
                >
                  <Icon name="trash" size={18} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {open.isError ? (
        <p className="chat-error chat-hist-state" role="alert">
          {c.openFailed} {describeError(open.error, locale).body}
        </p>
      ) : null}

      {query.hasNextPage ? (
        <button type="button" className="btn btn-quiet chat-hist-more" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage}>
          {c.historyMore}
        </button>
      ) : null}
    </section>
  );
}

/** Lazy-loaded by the panel for signed-in users only. It brings its own query client provider. */
export default function History(props: Props) {
  return (
    <QueryProvider>
      <HistoryView {...props} />
    </QueryProvider>
  );
}
