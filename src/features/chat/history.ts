/**
 * Chat history for signed-in users: the list of past conversations, the
 * messages of one (newest page first, older pages on request), and delete.
 * Guests have no history (`/agent/chat-public` stores nothing). Types come
 * from the generated schema.
 */
import { api, call } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import type { Message } from './store';

type Schemas = components['schemas'];
export type ConversationSummary = Schemas['AIConversationSummary'];
export type ConversationMessageRow = Schemas['ConversationMessageOut'];
export type ConversationPage = Schemas['CursorPage_AIConversationSummary_'];
export type ConversationMessagePage = Schemas['CursorPage_ConversationMessageOut_'];

const PAGE = 20;
/** Rows per messages page (the route allows 1 to 100, default 30). */
export const MESSAGES_PAGE = 50;

export const conversationsKey = ['chat', 'conversations'] as const;

export function fetchConversations(cursor: string | null): Promise<ConversationPage> {
  return call(api.GET('/api/v1/agent/conversations', { params: { query: { limit: PAGE, ...(cursor ? { cursor } : {}) } } }));
}

/**
 * One page of a conversation's rows. The first page (no cursor) holds the newest rows;
 * `next_cursor` walks back in time. Rows of a page are in chronological order.
 */
export function fetchConversationMessages(id: number, cursor: string | null): Promise<ConversationMessagePage> {
  return call(
    api.GET('/api/v1/agent/conversations/{conversation_id}/messages/page', {
      params: { path: { conversation_id: id }, query: { limit: MESSAGES_PAGE, ...(cursor ? { cursor } : {}) } },
    }),
  );
}

export async function deleteConversation(id: number): Promise<void> {
  await call(api.DELETE('/api/v1/agent/conversations/{conversation_id}', { params: { path: { conversation_id: id } } }));
}

/**
 * Maps stored rows to the panel's message model.
 *
 * The backend stores `user`, `widget` and `assistant` rows. It writes the
 * widget rows of a reply before that reply's `assistant` row, so widgets that
 * wait in `pending` belong to the next assistant row (the same bubble the
 * live stream draws). `tool_call` and `tool_result` rows carry no display
 * text and are skipped, as is any role this code does not know.
 */
export function mapMessages(rows: ConversationMessageRow[]): Message[] {
  const out: Message[] = [];
  let pending: Message['widgets'] = [];
  const flush = (id: string, text: string) => {
    out.push({ id, role: 'bot', text, tools: [], widgets: pending });
    pending = [];
  };
  for (const row of [...rows].sort((a, b) => a.id - b.id)) {
    const id = `h${row.id}`;
    if (row.role === 'user') {
      if (pending.length) flush(`${id}w`, '');
      const text = row.content?.trim();
      if (text) out.push({ id, role: 'user', text, tools: [], widgets: [] });
    } else if (row.role === 'widget') {
      if (row.widget_name) pending.push({ name: row.widget_name, data: row.widget_data ?? null });
    } else if (row.role === 'assistant') {
      const text = row.content ?? '';
      if (text || pending.length) flush(id, text);
    }
  }
  if (pending.length) flush('h-end', '');
  return out;
}
