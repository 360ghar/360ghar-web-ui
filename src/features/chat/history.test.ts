import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchConversationMessages, mapMessages, type ConversationMessageRow } from './history';

afterEach(() => vi.unstubAllGlobals());

const at = '2026-09-29T10:00:00Z';
const row = (id: number, role: string, extra: Partial<ConversationMessageRow> = {}): ConversationMessageRow => ({ id, role, created_at: at, ...extra });

describe('mapMessages', () => {
  it('maps user and assistant rows to the panel model', () => {
    const out = mapMessages([row(1, 'user', { content: '2 BHK in Sector 57' }), row(2, 'assistant', { content: '**Here** you go' })]);
    expect(out).toEqual([
      { id: 'h1', role: 'user', text: '2 BHK in Sector 57', tools: [], widgets: [] },
      { id: 'h2', role: 'bot', text: '**Here** you go', tools: [], widgets: [] },
    ]);
  });

  it('puts the widget rows that come before an assistant row into that bubble', () => {
    const out = mapMessages([
      row(1, 'user', { content: 'search' }),
      row(2, 'widget', { widget_name: 'PropertySearchWidget', widget_data: { properties: [{ id: 5 }] } }),
      row(3, 'widget', { widget_name: 'VisitListWidget', widget_data: { visits: [] } }),
      row(4, 'assistant', { content: 'Found one' }),
    ]);
    expect(out).toHaveLength(2);
    expect(out[1]?.text).toBe('Found one');
    expect(out[1]?.widgets.map((w) => w.name)).toEqual(['PropertySearchWidget', 'VisitListWidget']);
    expect(out[1]?.widgets[0]?.data).toEqual({ properties: [{ id: 5 }] });
  });

  it('keeps an assistant row with empty text when it carries widgets, and drops one with nothing', () => {
    const withWidget = mapMessages([row(1, 'widget', { widget_name: 'MaintenanceWidget', widget_data: { items: [] } }), row(2, 'assistant', { content: '' })]);
    expect(withWidget).toHaveLength(1);
    expect(withWidget[0]?.role).toBe('bot');
    expect(mapMessages([row(1, 'assistant', { content: '' })])).toEqual([]);
  });

  it('flushes widgets that have no assistant row after them', () => {
    const out = mapMessages([row(1, 'user', { content: 'a' }), row(2, 'widget', { widget_name: 'W', widget_data: null }), row(3, 'user', { content: 'b' }), row(4, 'widget', { widget_name: 'X' })]);
    expect(out.map((m) => m.role)).toEqual(['user', 'bot', 'user', 'bot']);
    expect(out[1]?.widgets).toEqual([{ name: 'W', data: null }]);
    expect(out[3]?.widgets).toEqual([{ name: 'X', data: null }]);
  });

  it('skips tool rows, unknown roles, blank user rows and widget rows without a name', () => {
    const out = mapMessages([
      row(1, 'tool_call', { tool_name: 'discovery_search', tool_args: { q: 'x' } }),
      row(2, 'tool_result', { tool_name: 'discovery_search', tool_result: {} }),
      row(3, 'system', { content: 'hidden' }),
      row(4, 'user', { content: '   ' }),
      row(5, 'widget', { widget_name: null, widget_data: { a: 1 } }),
    ]);
    expect(out).toEqual([]);
  });

  it('orders by id and does not change its input', () => {
    const rows = [row(2, 'assistant', { content: 'b' }), row(1, 'user', { content: 'a' })];
    const out = mapMessages(rows);
    expect(out.map((m) => m.text)).toEqual(['a', 'b']);
    expect(rows[0]?.id).toBe(2);
  });
});

describe('fetchConversationMessages', () => {
  it('reads the paged route: newest page first, then the cursor of older rows', async () => {
    const page = { items: [], next_cursor: null, has_more: false, limit: 50, total: null };
    const fetchMock = vi.fn(async (_req: Request) => new Response(JSON.stringify(page), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    await fetchConversationMessages(7, null);
    await fetchConversationMessages(7, 'abc');
    const urls = fetchMock.mock.calls.map((c) => new URL(c[0].url));
    expect(urls.map((u) => u.pathname)).toEqual(['/api/v1/agent/conversations/7/messages/page', '/api/v1/agent/conversations/7/messages/page']);
    expect(urls[0]!.searchParams.get('limit')).toBe('50');
    expect(urls[0]!.searchParams.has('cursor')).toBe(false);
    expect(urls[1]!.searchParams.get('cursor')).toBe('abc');
  });
});
