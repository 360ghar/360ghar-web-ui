import { beforeEach, describe, expect, it, vi } from 'vitest';

// The auth store is replaced by a small real zustand store; localStorage by a Map.
type Auth = { status: 'unknown' | 'anon' | 'authed'; session: { user: { id: string } } | null };
const authed = (id: string): Auth => ({ status: 'authed', session: { user: { id } } });
const anon: Auth = { status: 'anon', session: null };

const KEY = '360ghar:chat-v2';
let disk: Map<string, string>;

async function load(persisted?: unknown, auth: Auth = { status: 'unknown', session: null }) {
  vi.resetModules();
  disk = new Map(persisted === undefined ? [] : [[KEY, JSON.stringify({ state: persisted, version: 0 })]]);
  // zustand persist reads `window.localStorage`; the store module also checks for `window` before it follows the auth store.
  const localStorage = { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) };
  vi.stubGlobal('window', { localStorage });
  vi.stubGlobal('localStorage', localStorage);
  vi.doMock('@/features/auth/store', async () => {
    const { create } = await import('zustand');
    return { useAuthStore: create<Auth>(() => auth) };
  });
  const store = await import('./store');
  const authStore = (await import('@/features/auth/store')).useAuthStore as unknown as { getState: () => Auth; setState: (s: Auth) => void };
  return { ...store, authStore };
}

const msg = (id: string, text: string) => ({ id, role: 'user' as const, text, tools: [], widgets: [] });
const saved = () => JSON.parse(disk.get(KEY) ?? '{}').state as { messages: { text: string }[]; conversationId: number | null; owner: string | null };

beforeEach(() => vi.unstubAllGlobals());

describe('chatRequest', () => {
  it('signed in: /agent/chat with the conversation id', async () => {
    const { chatRequest } = await load();
    expect(chatRequest('tok', 'hi', 7)).toEqual({ path: '/api/v1/agent/chat', body: { message: 'hi', conversation_id: 7 } });
    expect(chatRequest('tok', 'hi', null)).toEqual({ path: '/api/v1/agent/chat', body: { message: 'hi', conversation_id: null } });
  });

  it('guest: /agent/chat-public, never a conversation_id, even when one is stored', async () => {
    const { chatRequest } = await load();
    const r = chatRequest(null, 'hi', 7);
    expect(r).toEqual({ path: '/api/v1/agent/chat-public', body: { message: 'hi' } });
    expect('conversation_id' in r.body).toBe(false);
  });
});

describe('continuity', () => {
  it('open(id) then send continues THAT conversation', async () => {
    const { useChat, chatRequest } = await load();
    useChat.getState().openConversation(42, [msg('h1', 'old question')]);
    const s = useChat.getState();
    expect(s.conversationId).toBe(42);
    expect(s.messages.map((m) => m.text)).toEqual(['old question']);
    expect(chatRequest('tok', 'next', s.conversationId).body).toEqual({ message: 'next', conversation_id: 42 });
  });

  it('opening another conversation replaces the first', async () => {
    const { useChat } = await load();
    useChat.getState().openConversation(1, [msg('a', 'one')]);
    useChat.getState().openConversation(2, [msg('b', 'two')]);
    expect(useChat.getState()).toMatchObject({ conversationId: 2, messages: [{ text: 'two' }] });
  });

  it('new conversation clears the id, so the next send has none', async () => {
    const { useChat, chatRequest } = await load();
    useChat.getState().openConversation(42, [msg('h1', 'old')]);
    useChat.getState().reset();
    const s = useChat.getState();
    expect(s).toMatchObject({ conversationId: null, messages: [] });
    expect(chatRequest('tok', 'fresh', s.conversationId).body).toEqual({ message: 'fresh', conversation_id: null });
  });

  it('a guest chat survives a reload: its messages are saved', async () => {
    const { useChat } = await load();
    useChat.setState({ messages: [msg('g1', 'guest question')] });
    expect(saved()).toMatchObject({ owner: null, messages: [{ text: 'guest question' }] });
  });

  it('a signed-in conversation survives a reload as its id only: no message or widget payload is saved', async () => {
    const { useChat, followAuth } = await load();
    followAuth(authed('user-a') as never);
    useChat.getState().openConversation(42, [{ id: 'h1', role: 'bot', text: 'lease reply', tools: [], widgets: [{ name: 'LeaseManagementWidget', data: { leases: [{ tenant: { display_name: 'Asha' } }] } }] }]);
    expect(saved()).toEqual({ messages: [], conversationId: 42, owner: 'user-a' });
    expect(disk.get(KEY)).not.toContain('Asha');
    // The messages stay on screen for this page.
    expect(useChat.getState().messages).toHaveLength(1);
  });

  it('messages a signed-in user saved under an older build are rewritten without them at load', async () => {
    const { useChat } = await load({ messages: [{ ...msg('old', 'saved reply'), widgets: [{ name: 'RentCollectionWidget', data: { items: [] } }] }], conversationId: 9, owner: 'user-a' });
    expect(saved()).toEqual({ messages: [], conversationId: 9, owner: 'user-a' });
    // Nothing is lost for the page that is open.
    expect(useChat.getState().messages).toHaveLength(1);
  });
});

describe('privacy: stored messages belong to one user', () => {
  const stored = { messages: [msg('m', 'my private question')], conversationId: 9, owner: 'user-a' };

  it('sign-out clears messages, id and the disk copy', async () => {
    const { useChat, authStore } = await load(stored, authed('user-a'));
    expect(useChat.getState().messages).toHaveLength(1); // same user: kept
    authStore.setState(anon);
    expect(useChat.getState()).toMatchObject({ messages: [], conversationId: null, owner: null });
    expect(saved()).toMatchObject({ messages: [], conversationId: null, owner: null });
  });

  it('a page load with stored messages of a user, and no session, clears them', async () => {
    // followAuth is what the module runs once the session is known.
    const { useChat, followAuth } = await load(stored);
    expect(useChat.getState().messages).toHaveLength(1); // still unknown: the panel hides them (see ChatPanel)
    followAuth(anon as never);
    expect(useChat.getState().messages).toEqual([]);
    expect(saved().messages).toEqual([]);
  });

  it('another account signing in gets none of the first account\'s messages or conversation', async () => {
    const { useChat, followAuth } = await load(stored);
    followAuth(authed('user-b') as never);
    expect(useChat.getState()).toMatchObject({ messages: [], conversationId: null, owner: 'user-b' });
  });

  it('the same user signing in again keeps their messages and conversation', async () => {
    const { useChat, followAuth } = await load(stored);
    followAuth(authed('user-a') as never);
    expect(useChat.getState()).toMatchObject({ conversationId: 9, owner: 'user-a', messages: [{ text: 'my private question' }] });
  });

  it('a guest who signs in keeps the guest messages on screen but starts a new conversation', async () => {
    const { useChat, followAuth } = await load({ messages: [msg('g', 'guest question')], conversationId: 3, owner: null });
    followAuth(authed('user-a') as never);
    expect(useChat.getState()).toMatchObject({ owner: 'user-a', conversationId: null, messages: [{ text: 'guest question' }] });
    // ...and those messages do not outlive that account's session.
    followAuth(anon as never);
    expect(useChat.getState().messages).toEqual([]);
  });

  it('an unknown session changes nothing', async () => {
    const { useChat, followAuth } = await load(stored);
    followAuth({ status: 'unknown', session: null } as never);
    expect(useChat.getState()).toMatchObject({ owner: 'user-a', conversationId: 9 });
  });

  it('old saved data with no owner field is treated as a guest\'s', async () => {
    const { useChat, followAuth } = await load({ messages: [msg('o', 'from an older version')], conversationId: 5 });
    followAuth(authed('user-a') as never);
    expect(useChat.getState()).toMatchObject({ conversationId: null, owner: 'user-a' });
  });
});

describe('stored shape: schema version and a guarded read', () => {
  it('saves under version 2', async () => {
    const { useChat } = await load();
    useChat.getState().openConversation(1, [msg('h1', 'q')]);
    expect(JSON.parse(disk.get(KEY) ?? '{}').version).toBe(2);
  });

  it('a version 0 entry from an older build gets the arrays it lacks, and drops what is not a message', async () => {
    const { useChat } = await load({
      messages: [{ id: 'a', role: 'user', text: 'old' }, { id: 'b', role: 'bot', text: 'reply', widgets: 'broken' }, { nope: true }, 'text', null],
      conversationId: 4,
      owner: 'user-a',
    });
    const s = useChat.getState();
    expect(s.messages).toEqual([
      { id: 'a', role: 'user', text: 'old', tools: [], widgets: [] },
      { id: 'b', role: 'bot', text: 'reply', tools: [], widgets: [] },
    ]);
    expect(s).toMatchObject({ conversationId: 4, owner: 'user-a' });
  });

  it('a damaged entry of the current version does not reach the panel either', async () => {
    vi.resetModules();
    const bad = { state: { messages: 'not a list', conversationId: 'x', owner: 7 }, version: 2 };
    disk = new Map([[KEY, JSON.stringify(bad)]]);
    const localStorage = { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) };
    vi.stubGlobal('window', { localStorage });
    vi.stubGlobal('localStorage', localStorage);
    vi.doMock('@/features/auth/store', async () => ({ useAuthStore: (await import('zustand')).create(() => ({ status: 'unknown', session: null })) }));
    const { useChat } = await import('./store');
    expect(useChat.getState()).toMatchObject({ messages: [], conversationId: null, owner: null });
  });
});

describe('earlier messages of an opened conversation', () => {
  const row = (id: number, role: string, extra: Record<string, unknown> = {}) => ({ id, role, created_at: '2026-09-29T10:00:00Z', ...extra });

  it('older rows go in front, messages sent since stay behind, and a split reply keeps its widgets', async () => {
    const { useChat } = await load();
    const newest = [row(3, 'assistant', { content: 'Found one' }), row(4, 'user', { content: 'thanks' }), row(5, 'assistant', { content: 'Welcome' })];
    const { mapMessages } = await import('./history');
    useChat.getState().openConversation(9, mapMessages(newest as never), { rows: newest as never, cursor: 'older' });
    useChat.setState((s) => ({ messages: [...s.messages, msg('live', 'a new question')] }));
    // The widget row of reply 3 is on the older page.
    useChat.getState().prependEarlier([row(1, 'user', { content: 'search' }), row(2, 'widget', { widget_name: 'PropertySearchWidget', widget_data: { items: [] } })] as never, null);
    const s = useChat.getState();
    expect(s.messages.map((m) => m.text)).toEqual(['search', 'Found one', 'thanks', 'Welcome', 'a new question']);
    expect(s.messages[1]?.widgets.map((w) => w.name)).toEqual(['PropertySearchWidget']);
    expect(s.earlier).toMatchObject({ cursor: null, count: 4 });
  });

  it('reset and sign-out forget the rows behind the cursor', async () => {
    const { useChat, followAuth } = await load({ messages: [], conversationId: null, owner: 'user-a' });
    useChat.getState().openConversation(9, [msg('h1', 'q')], { rows: [], cursor: 'older' });
    expect(useChat.getState().earlier?.cursor).toBe('older');
    useChat.getState().reset();
    expect(useChat.getState().earlier).toBeNull();
    useChat.getState().openConversation(9, [msg('h1', 'q')], { rows: [], cursor: 'older' });
    followAuth(anon as never);
    expect(useChat.getState().earlier).toBeNull();
  });

  it('prependEarlier does nothing when no conversation was opened from history', async () => {
    const { useChat } = await load();
    useChat.setState({ messages: [msg('m', 'q')] });
    useChat.getState().prependEarlier([row(1, 'user', { content: 'x' })] as never, null);
    expect(useChat.getState().messages.map((m) => m.text)).toEqual(['q']);
  });
});
