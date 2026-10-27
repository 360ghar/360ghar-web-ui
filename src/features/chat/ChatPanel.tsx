import { lazy, Suspense, useEffect, useRef, useState, type SubmitEvent } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { currentToken } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { tFrom } from '@/i18n/tFrom';
import { Icon } from '@/ui/icons/Icon';
import { sendFailure, streamChat } from './stream';
import { applyEvent, chatRequest, updateMessage, useChat, type Message } from './store';
import { fetchConversationMessages, mapMessages } from './history';
import { Bubble } from './Bubble';
import { chatCopy } from './copy';
import './chat.css';

// History is for signed-in users only: its code (and the query client) load on first use.
const History = lazy(() => import('./HistoryPanel'));

type Props = { locale: Locale; strings: Record<string, unknown>; onClose: () => void };

const NONE: Message[] = [];

const uid = () => Math.random().toString(36).slice(2);

export default function ChatPanel({ locale, strings, onClose }: Props) {
  const t = tFrom(strings as never);
  const c = chatCopy(locale);
  const stored = useChat((s) => s.messages);
  const conversationId = useChat((s) => s.conversationId);
  const sending = useChat((s) => s.sending);
  const hasEarlier = useChat((s) => Boolean(s.earlier?.cursor));
  const reset = useChat((s) => s.reset);
  const authStatus = useAuth((s) => s.status);
  const authed = authStatus === 'authed';
  // Stored messages show only once the session is known, so a signed-out visitor never sees them for a moment.
  const messages = authStatus === 'unknown' ? NONE : stored;
  // A draft set before the panel mounts; the effect below clears it from the store.
  const [text, setText] = useState(() => useChat.getState().draft ?? '');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [earlierState, setEarlierState] = useState<'idle' | 'loading' | 'error'>('idle');
  // The conversation whose rows are loaded, the one whose rows could not be loaded, and a counter that "Try again" bumps.
  const [loadedFor, setLoadedFor] = useState<number | null>(null);
  const [failedFor, setFailedFor] = useState<number | null>(null);
  const [restoreTry, setRestoreTry] = useState(0);
  // Scroll offsets saved before older rows are put in front, so the view stays on the same message.
  const keepScroll = useRef<{ height: number; top: number } | null>(null);
  const abort = useRef<AbortController | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  // A draft from the page (the lab sentence search) fills the input once; the person sends it.
  // The useState initializer above reads a draft set before mount; the subscription covers an open panel.
  useEffect(() => {
    if (useChat.getState().draft) useChat.setState({ draft: null });
    return useChat.subscribe((s) => {
      if (!s.draft) return;
      setText(s.draft);
      useChat.setState({ draft: null });
      input.current?.focus();
    });
  }, []);

  // A signed-in conversation is not kept in the browser (its replies and widget payloads are account data): only the id is.
  // The panel opens with that id and no messages, so the newest rows come from the server, as when a conversation is opened from history.
  const restoring = authed && conversationId !== null && messages.length === 0 && loadedFor !== conversationId;
  const restoreFailed = failedFor !== null && failedFor === conversationId;
  useEffect(() => {
    if (!authed || conversationId === null || useChat.getState().messages.length > 0) return;
    let alive = true;
    fetchConversationMessages(conversationId, null).then(
      (page) => {
        if (!alive) return;
        setLoadedFor(conversationId);
        // A message sent meanwhile stays: the rows do not replace it.
        if (useChat.getState().messages.length > 0) return;
        useChat.getState().openConversation(conversationId, mapMessages(page.items), { rows: page.items, cursor: page.has_more ? page.next_cursor : null });
      },
      (error: unknown) => {
        if (!alive) return;
        // Deleted elsewhere: the next message starts a new conversation.
        if (error instanceof ApiError && error.status === 404) useChat.setState({ conversationId: null });
        else setFailedFor(conversationId);
      },
    );
    return () => {
      alive = false;
    };
  }, [authed, conversationId, restoreTry]);

  // Guests have no history. If the session ends while the list is open, the chat shows again.
  const inHistory = view === 'history' && authed;

  useEffect(() => {
    const kept = keepScroll.current;
    const el = list.current;
    if (kept && el) {
      keepScroll.current = null;
      el.scrollTop = kept.top + (el.scrollHeight - kept.height);
      return;
    }
    el?.lastElementChild?.scrollIntoView({ block: 'end' });
  }, [messages, inHistory]);

  const loadEarlier = async () => {
    const { earlier, conversationId: id } = useChat.getState();
    if (!earlier?.cursor || id === null || earlierState === 'loading') return;
    setEarlierState('loading');
    try {
      const page = await fetchConversationMessages(id, earlier.cursor);
      if (list.current) keepScroll.current = { height: list.current.scrollHeight, top: list.current.scrollTop };
      useChat.getState().prependEarlier(page.items, page.has_more ? page.next_cursor : null);
      setEarlierState('idle');
    } catch {
      setEarlierState('error');
    }
  };

  const showChat = () => {
    setView('chat');
    requestAnimationFrame(() => input.current?.focus());
  };

  const send = async (raw: string) => {
    const message = raw.trim().slice(0, 4000);
    if (!message || busy || useChat.getState().sending) return;
    setText('');
    const botId = uid();
    useChat.setState({ sending: true });
    useChat.setState((s) => ({
      messages: [
        ...s.messages,
        { id: uid(), role: 'user', text: message, tools: [], widgets: [] },
        { id: botId, role: 'bot', text: '', tools: [], widgets: [] },
      ],
    }));
    setBusy(true);
    abort.current = new AbortController();
    try {
      const token = authed ? await currentToken() : null;
      const req = chatRequest(token, message, conversationId);
      for await (const ev of streamChat(req.path, req.body, abort.current.signal)) {
        applyEvent(botId, ev, t('errorMessage'));
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        const why = sendFailure(error);
        // An unknown or foreign conversation id: the next message starts a new thread, on purpose.
        if (why === 'gone') useChat.setState({ conversationId: null });
        const msg = why === 'rate' ? c.tooManyMessages : why === 'gone' ? c.conversationGone : why === 'inactive' ? c.accountInactive : t('errorMessage');
        updateMessage(botId, (m) => ({ ...m, error: msg }));
      }
    } finally {
      updateMessage(botId, (m) => ({ ...m, tools: m.tools.map((x) => ({ ...x, done: true })) }));
      setBusy(false);
      useChat.setState({ sending: false });
      abort.current = null;
    }
  };

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    void send(text);
  };

  const quick = [t('quickSearch'), locale === 'hi' ? 'सेक्टर 57 में 2 BHK किराये पर' : '2 BHK for rent in Sector 57', locale === 'hi' ? '1 करोड़ से कम के फ़्लैट' : 'Flats under ₹1 Cr'];

  return (
    <section className="chat-panel" aria-label={t('panelAriaLabel')}>
      <header className="chat-head">
        {inHistory ? (
          <div className="chat-head-title">
            <button type="button" className="btn btn-quiet btn-icon" onClick={showChat} aria-label={c.historyBack}>
              <Icon name="arrow-left" />
            </button>
            <h2 className="font-display text-lg">{c.history}</h2>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-lg">{t('title')}</h2>
            <p className="text-sm text-ink-600">{busy ? t('thinking') : t('online')}</p>
          </div>
        )}
        <div className="flex">
          {authed && !inHistory ? (
            <button type="button" className="btn btn-quiet btn-icon" onClick={() => setView('history')} aria-label={c.history} disabled={busy || sending}>
              <Icon name="clock" />
            </button>
          ) : null}
          <button type="button" className="btn btn-quiet btn-icon" onClick={() => { reset(); showChat(); }} aria-label={t('newConversation')} disabled={busy || sending || (!messages.length && !restoring)}>
            <Icon name="retry" />
          </button>
          <button type="button" className="btn btn-quiet btn-icon" onClick={onClose} aria-label={t('closeChat')}>
            <Icon name="close" />
          </button>
        </div>
      </header>

      {inHistory ? (
        <div className="chat-list">
          <Suspense
            fallback={
              <p className="chat-muted" role="status">
                {c.historyLoading}
              </p>
            }
          >
            <History locale={locale} onOpened={showChat} />
          </Suspense>
        </div>
      ) : (
        <>
          <ol ref={list} className="chat-list" aria-label={t('messagesAriaLabel')} aria-live="polite">
            {restoring ? (
              <li className="chat-welcome">
                {restoreFailed ? (
                  <>
                    <p role="alert">{c.restoreFailed}</p>
                    <button type="button" className="btn btn-quiet mt-3" onClick={() => { setFailedFor(null); setRestoreTry((n) => n + 1); }}>
                      {c.retry}
                    </button>
                  </>
                ) : (
                  <p role="status">{c.restoring}</p>
                )}
              </li>
            ) : messages.length === 0 ? (
              <li className="chat-welcome">
                <p>{authed ? t('welcomeSubtitle') : t('guestSubtitle')}</p>
                <div className="mt-3 grid gap-2">
                  {quick.map((q) => (
                    <button key={q} type="button" className="btn justify-start" onClick={() => void send(q)}>
                      <Icon name="search" size={16} />
                      {q}
                    </button>
                  ))}
                </div>
              </li>
            ) : (
              <>
                {hasEarlier ? (
                  <li className="chat-earlier">
                    <button type="button" className="btn btn-quiet" onClick={() => void loadEarlier()} disabled={earlierState === 'loading'}>
                      {earlierState === 'loading' ? c.earlierLoading : c.earlier}
                    </button>
                    {earlierState === 'error' ? (
                      <span className="field-error" role="alert">
                        {c.earlierFailed}
                      </span>
                    ) : null}
                  </li>
                ) : null}
                {messages.map((m) => (
                  <li key={m.id} className={m.role === 'user' ? 'is-user' : 'is-bot'}>
                    <Bubble m={m} locale={locale} t={t} />
                  </li>
                ))}
              </>
            )}
          </ol>

          {!authed ? (
            <p className="chat-guest">
              {t('guestBannerText')}{' '}
              <a className="link" href={localizePath('/login', locale)}>
                {t('guestBannerCta')}
              </a>
            </p>
          ) : null}

          <form className="chat-form" onSubmit={onSubmit}>
            <label className="visually-hidden" htmlFor="chat-input">
              {t('typeMessage')}
            </label>
            <textarea
              ref={input}
              id="chat-input"
              className="textarea chat-input"
              rows={1}
              maxLength={4000}
              placeholder={t('placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send(text);
                }
              }}
            />
            {/* Separate keys, so "Stop" never turns into "Send" in the middle of a click. */}
            {busy ? (
              <button key="stop" type="button" className="btn btn-ink btn-icon" onClick={() => abort.current?.abort()} aria-label={t('stopGenerating')}>
                <Icon name="close" />
              </button>
            ) : (
              <button key="send" type="submit" className="btn btn-primary btn-icon" aria-label={t('sendMessage')} disabled={!text.trim()}>
                <Icon name="arrow-up-right" />
              </button>
            )}
          </form>
        </>
      )}
    </section>
  );
}
