/**
 * "Ask about this page": three ready questions and a box, answered in place by the same assistant as the chat
 * (same store, same stream). Used on property and locality pages (the server loads that page's facts from
 * `context`) and on /compare (no context: the homes are named in the message).
 *
 * A backend that does not know `context` answers 422. The first time that happens the question is sent again
 * with the subject in the text instead, and the panel remembers it for the rest of the visit.
 */
import { useId, useState, type SubmitEvent } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { currentToken } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { tFrom } from '@/i18n';
import type { Locale } from '@/lib/i18n/locale';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { Bubble } from './Bubble';
import { chatCopy } from './copy';
import { contextUnsupported, markContextUnsupported } from './ask';
import { applyEvent, chatRequest, updateMessage, useChat, type AskContext } from './store';
import { sendFailure, streamChat } from './stream';
import './chat.css';

type Props = {
  locale: Locale;
  /** `common:chatbot` strings (for the typing and error texts). */
  strings: Record<string, unknown>;
  heading: string;
  note: string;
  questions: string[];
  /** The page the questions are about. Null: nothing is sent as context. */
  context: AskContext | null;
  /** Names the page in the message when `context` is null or the backend lacks it, e.g. "This home: 3 BHK in Palam Vihar". */
  subject: string;
};

const T = {
  en: { ask: 'Ask', label: 'Your question', placeholder: 'Ask your own question', busy: 'Answering', limit: 'AI can make mistakes. Check details with the agent.' },
  hi: { ask: 'पूछें', label: 'आपका सवाल', placeholder: 'अपना सवाल लिखें', busy: 'जवाब आ रहा है', limit: 'AI से गलती हो सकती है। जानकारी एजेंट से पक्की करें।' },
};

const MAX = 500;
const uid = () => Math.random().toString(36).slice(2);

function Ask({ locale, strings, heading, note, questions, context, subject }: Props) {
  const t = tFrom(strings as never);
  const c = chatCopy(locale);
  const x = T[locale];
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  // Index of the first message this panel added, so earlier chat messages stay out of it.
  const [start, setStart] = useState<number | null>(null);
  const authed = useAuth((s) => s.status === 'authed');
  const all = useChat((s) => s.messages);
  const shown = start === null ? [] : all.slice(start);
  const id = useId();

  const send = async (raw: string) => {
    const question = raw.trim().slice(0, MAX);
    if (!question || busy) return;
    setText('');
    setBusy(true);
    const botId = uid();
    if (start === null) setStart(useChat.getState().messages.length);
    useChat.setState((s) => ({
      messages: [...s.messages, { id: uid(), role: 'user', text: question, tools: [], widgets: [] }, { id: botId, role: 'bot', text: '', tools: [], widgets: [] }],
    }));
    const run = async (withContext: boolean) => {
      const token = authed ? await currentToken() : null;
      const message = withContext ? question : `${subject}. ${question}`.slice(0, 4000);
      const req = chatRequest(token, message, useChat.getState().conversationId, withContext ? context : null);
      for await (const ev of streamChat(req.path, req.body, new AbortController().signal)) applyEvent(botId, ev, t('errorMessage'));
    };
    try {
      const withContext = context !== null && !contextUnsupported();
      try {
        await run(withContext);
      } catch (error) {
        if (!(withContext && error instanceof ApiError && error.status === 422)) throw error;
        markContextUnsupported();
        await run(false);
      }
    } catch (error) {
      const why = sendFailure(error);
      if (why === 'gone') useChat.setState({ conversationId: null });
      const msg = why === 'rate' ? c.tooManyMessages : why === 'gone' ? c.conversationGone : why === 'inactive' ? c.accountInactive : t('errorMessage');
      updateMessage(botId, (m) => ({ ...m, error: msg }));
    } finally {
      updateMessage(botId, (m) => ({ ...m, tools: m.tools.map((y) => ({ ...y, done: true })) }));
      setBusy(false);
    }
  };

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    void send(text);
  };

  return (
    <section className="ask" aria-labelledby={id}>
      <h2 id={id} className="ask-h">{heading}</h2>
      <p className="ask-note">{note}</p>
      <ul className="ask-q">
        {questions.map((q) => (
          <li key={q}>
            <button type="button" className="link" onClick={() => void send(q)} disabled={busy}>
              {q}
            </button>
          </li>
        ))}
      </ul>
      {shown.length > 0 ? (
        <ol className="ask-list" aria-live="polite" aria-busy={busy || undefined}>
          {shown.map((m) => (
            <li key={m.id} className={m.role === 'user' ? 'is-user' : 'is-bot'}>
              <Bubble m={m} locale={locale} t={t} />
            </li>
          ))}
        </ol>
      ) : null}
      <form className="ask-form" onSubmit={onSubmit}>
        <label className="visually-hidden" htmlFor={`${id}-q`}>{x.label}</label>
        <textarea
          id={`${id}-q`}
          className="textarea"
          rows={1}
          maxLength={MAX}
          placeholder={x.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(text);
            }
          }}
        />
        <button type="submit" className="btn btn-primary" disabled={busy || !text.trim()}>
          {busy ? x.busy : x.ask}
        </button>
      </form>
      <p className="ask-note">{x.limit}</p>
    </section>
  );
}

/** A crash leaves nothing: the page reads the same without the panel. */
export default function AskPanel(props: Props) {
  return (
    <IslandBoundary locale={props.locale} fallback={null}>
      <Ask {...props} />
    </IslandBoundary>
  );
}
