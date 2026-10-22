import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store';
import { mapMessages, type ConversationMessageRow } from './history';
import type { ChatEvent } from './stream';

type ToolState = { id: string; tool: string; done: boolean; ok?: boolean };
export type Widget = { name: string; data: unknown };
export type Message = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  tools: ToolState[];
  widgets: Widget[];
  error?: string;
};

/** The stored rows behind the first `count` messages of an opened conversation, and the cursor to older rows. */
type Earlier = { rows: ConversationMessageRow[]; cursor: string | null; count: number };

type ChatState = {
  open: boolean;
  messages: Message[];
  /** The server conversation the next message continues. Null starts a new one. */
  conversationId: number | null;
  /**
   * Who the stored messages belong to: the signed-in user's id, or null for a
   * guest. It is saved with the messages so a later visitor cannot read them.
   */
  owner: string | null;
  /** Text another part of the page puts in the input (not sent). Not stored. */
  draft: string | null;
  /** True while any panel (the chat or an ask panel) waits for a reply, so two sends never overlap. Not stored. */
  sending: boolean;
  /** Older rows of an opened conversation that are not loaded yet (`cursor` null: all loaded). Not stored. */
  earlier: Earlier | null;
  setOpen: (v: boolean) => void;
  /** "New conversation": forget the messages and the conversation id. */
  reset: () => void;
  /** Continue an old conversation from history: its messages, and its id for the next send. */
  openConversation: (id: number, messages: Message[], earlier?: { rows: ConversationMessageRow[]; cursor: string | null }) => void;
  /** Puts an older page of rows in front of the opened conversation. */
  prependEarlier: (rows: ConversationMessageRow[], cursor: string | null) => void;
  /** Called with the signed-in user's id (or null) whenever it is known or changes. */
  syncOwner: (uid: string | null) => void;
};

/** Bump when `Message` or the stored shape changes. Older saved chats go through `restore`. */
const STORE_VERSION = 2;

const storedMessage = z.object({
  id: z.string(),
  role: z.enum(['user', 'bot']),
  text: z.string().catch(''),
  tools: z.array(z.object({ id: z.string(), tool: z.string(), done: z.boolean(), ok: z.boolean().optional() })).catch([]),
  widgets: z.array(z.object({ name: z.string(), data: z.unknown() })).catch([]),
  error: z.string().optional(),
});
const storedChat = z.object({
  messages: z.array(z.unknown()).catch([]),
  conversationId: z.number().int().nullable().catch(null),
  owner: z.string().nullable().catch(null),
});

/** Saved chat state of any older or damaged shape -> a valid one. Messages that do not fit `Message` are dropped. */
export function restore(saved: unknown): Pick<ChatState, 'messages' | 'conversationId' | 'owner'> {
  const chat = storedChat.parse(saved && typeof saved === 'object' ? saved : {});
  const messages = chat.messages.flatMap((m) => {
    const r = storedMessage.safeParse(m);
    return r.success ? [r.data as Message] : [];
  });
  return { messages, conversationId: chat.conversationId, owner: chat.owner };
}

/**
 * A guest's chat survives page loads (localStorage), like the old site. A signed-in
 * user's chat does not: only the conversation id is kept (see `partialize`), and only
 * for the person it belongs to (see `syncOwner`).
 */
export const useChat = create<ChatState>()(
  persist(
    (set, get) => ({
      open: false,
      messages: [],
      conversationId: null,
      owner: null,
      draft: null,
      sending: false,
      earlier: null,
      setOpen: (open) => set({ open }),
      reset: () => set({ messages: [], conversationId: null, earlier: null }),
      openConversation: (id, messages, earlier) => set({ messages, conversationId: id, earlier: earlier ? { ...earlier, count: messages.length } : null }),
      prependEarlier: (older, cursor) =>
        set((s) => {
          if (!s.earlier) return {};
          const rows = [...older, ...s.earlier.rows];
          const history = mapMessages(rows);
          // Messages sent after the conversation was opened stay behind the loaded history.
          return { messages: [...history, ...s.messages.slice(s.earlier.count)], earlier: { rows, cursor, count: history.length } };
        }),
      syncOwner: (uid) => {
        const { owner } = get();
        if (owner === uid) return;
        // Sign-out, or another account: nothing of the old owner stays.
        if (owner !== null) set({ messages: [], conversationId: null, owner: uid, earlier: null });
        // A guest signs in: the messages stay on screen, but the next one starts a conversation of the account.
        else set({ conversationId: null, owner: uid, earlier: null });
      },
    }),
    {
      name: '360ghar:chat-v2',
      version: STORE_VERSION,
      // A signed-in conversation is account data (replies, and widget payloads with leases, rent and tenants), so the
      // browser keeps only its id and the panel loads the rows from the server (ChatPanel). A guest's messages stay: they
      // have no server copy and hold what the guest typed and public listings.
      partialize: (s) => ({ messages: s.owner === null ? s.messages.slice(-40) : [], conversationId: s.conversationId, owner: s.owner }),
      migrate: (saved) => restore(saved),
      // The current version is checked too: a hand-edited or half-written entry must not reach the panel.
      merge: (saved, current) => (saved === undefined ? current : { ...current, ...restore(saved) }),
    },
  ),
);

export const updateMessage = (id: string, fn: (m: Message) => Message) =>
  useChat.setState((s) => ({ messages: s.messages.map((m) => (m.id === id ? fn(m) : m)) }));

/** The page a question is about. The server loads the facts itself (closed set: a property or a locality). */
export type AskContext = { type: 'property'; id: number } | { type: 'locality'; slug: string };

/**
 * The endpoint and body of one chat message. A signed-in user (a token) sends to
 * `/agent/chat` with the conversation to continue; a guest sends to
 * `/agent/chat-public`, which stores nothing, so it never carries an id.
 * `context` is sent only when given (the ask panels): a backend without it answers 422, see AskPanel.
 */
export function chatRequest(token: string | null, message: string, conversationId: number | null, context?: AskContext | null) {
  const extra = context ? { context } : {};
  return token
    ? { path: '/api/v1/agent/chat', body: { message, conversation_id: conversationId, ...extra } }
    : { path: '/api/v1/agent/chat-public', body: { message, ...extra } };
}

/** Puts one stream event into the bot message `botId`. `errorText` is shown for an `error` frame. */
export function applyEvent(botId: string, ev: ChatEvent, errorText: string) {
  if (ev.event === 'conversation_info') useChat.setState({ conversationId: ev.data.conversation_id });
  else if (ev.event === 'text_chunk') updateMessage(botId, (m) => ({ ...m, text: m.text + ev.data.text }));
  else if (ev.event === 'tool_call_start') updateMessage(botId, (m) => ({ ...m, tools: [...m.tools, { id: ev.data.call_id, tool: ev.data.tool, done: false }] }));
  else if (ev.event === 'tool_call_end')
    updateMessage(botId, (m) => ({ ...m, tools: m.tools.map((x) => (x.id === ev.data.call_id ? { ...x, done: true, ok: ev.data.success } : x)) }));
  else if (ev.event === 'widget') updateMessage(botId, (m) => ({ ...m, widgets: [...m.widgets, { name: ev.data.widget_name, data: ev.data.structured_content }] }));
  else if (ev.event === 'done' && ev.data.response_text) updateMessage(botId, (m) => (m.text ? m : { ...m, text: ev.data.response_text }));
  else if (ev.event === 'error') updateMessage(botId, (m) => ({ ...m, error: errorText }));
}

/** Ties the stored messages to the current user. Runs when the auth state is known and on every change. */
export function followAuth(s: ReturnType<typeof useAuthStore.getState>) {
  if (s.status === 'unknown') return;
  useChat.getState().syncOwner(s.status === 'authed' ? (s.session?.user.id ?? null) : null);
}
if (typeof window !== 'undefined') {
  // Messages a signed-in user saved under an older build are rewritten at once, without them.
  const rewrite = () => useChat.setState({});
  if (useChat.persist.hasHydrated()) rewrite();
  else useChat.persist.onFinishHydration(rewrite);
  followAuth(useAuthStore.getState());
  useAuthStore.subscribe(followAuth);
}
