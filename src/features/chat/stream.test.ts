import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { parseBlock, sendFailure, streamChat, type ChatEvent } from './stream';

afterEach(() => vi.unstubAllGlobals());

const block = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}`;
const sse = (...blocks: string[]) => new Response(blocks.map((b) => `${b}\n\n`).join(''), { status: 200, headers: { 'content-type': 'text/event-stream' } });
const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

async function collect(gen: AsyncGenerator<ChatEvent>) {
  const out: ChatEvent[] = [];
  for await (const ev of gen) out.push(ev);
  return out;
}

describe('parseBlock', () => {
  it('accepts every frame of the AgentStreamEvent union', () => {
    expect(parseBlock(block('conversation_info', { conversation_id: 7 }))).toEqual({ event: 'conversation_info', data: { conversation_id: 7 } });
    expect(parseBlock(block('text_chunk', { text: 'Hi' }))?.event).toBe('text_chunk');
    expect(parseBlock(block('tool_call_start', { call_id: 'a', tool: 'discovery_search' }))?.event).toBe('tool_call_start');
    expect(parseBlock(block('tool_call_end', { call_id: 'a', tool: 'discovery_search', success: false }))).toMatchObject({ data: { success: false } });
    expect(parseBlock(block('widget', { widget_name: 'PropertySearchWidget', structured_content: { items: [] } }))?.event).toBe('widget');
    expect(parseBlock(block('done', { response_text: 'Done' }))).toEqual({ event: 'done', data: { response_text: 'Done' } });
    expect(parseBlock(block('error', { code: 'AGENT_ERROR', message: 'The assistant could not finish this reply. Try again.' }))?.event).toBe('error');
  });

  it('skips a frame that does not match: wrong field type, missing field, unknown event, bad JSON, no data', () => {
    expect(parseBlock(block('text_chunk', { text: 5 }))).toBeNull();
    expect(parseBlock(block('tool_call_end', { call_id: 'a', tool: 'x' }))).toBeNull();
    expect(parseBlock(block('conversation_info', { conversation_id: 'seven' }))).toBeNull();
    expect(parseBlock(block('fallback', { provider: 'x', reason: 'y' }))).toBeNull();
    expect(parseBlock('event: text_chunk\ndata: {not json')).toBeNull();
    expect(parseBlock('event: done')).toBeNull();
    expect(parseBlock(': keep-alive')).toBeNull();
  });
});

describe('streamChat', () => {
  it('posts JSON through the shared fetch and yields the valid frames in order', async () => {
    const fetchMock = vi.fn(async (_req: Request) =>
      sse(block('conversation_info', { conversation_id: 3 }), block('bogus', { x: 1 }), block('text_chunk', { text: 'Hello' }), block('done', { response_text: 'Hello' })),
    );
    vi.stubGlobal('fetch', fetchMock);
    const events = await collect(streamChat('/api/v1/agent/chat', { message: 'hi', conversation_id: null }, new AbortController().signal));
    expect(events.map((e) => e.event)).toEqual(['conversation_info', 'text_chunk', 'done']);
    const req = fetchMock.mock.calls[0]![0];
    expect(req.method).toBe('POST');
    expect(new URL(req.url).pathname).toBe('/api/v1/agent/chat');
    expect(req.headers.get('accept')).toBe('text/event-stream');
    expect(await req.json()).toEqual({ message: 'hi', conversation_id: null });
  });

  it('reads a frame that is split across chunks', async () => {
    const enc = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(enc.encode('event: text_chunk\ndata: {"te'));
        c.enqueue(enc.encode('xt":"Hi"}\n\nevent: done\ndata: {"response_text":"Hi"}\n\n'));
        c.close();
      },
    });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(stream, { status: 200 })));
    const events = await collect(streamChat('/api/v1/agent/chat-public', { message: 'hi' }, new AbortController().signal));
    expect(events.map((e) => e.event)).toEqual(['text_chunk', 'done']);
  });

  it('throws the typed ApiError of a failed response, with its code', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(403, { error: { code: 'USER_INACTIVE', message: 'Account is inactive' } })));
    const e = await collect(streamChat('/api/v1/agent/chat', { message: 'hi' }, new AbortController().signal)).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect(e).toMatchObject({ status: 403, code: 'USER_INACTIVE' });
    expect(sendFailure(e)).toBe('inactive');
  });

  it('adds the token and retries once after a 401 (shared refresh)', async () => {
    vi.resetModules();
    vi.stubGlobal('window', {});
    vi.stubEnv('PUBLIC_API_BASE', 'https://api.test');
    const client = await import('@/lib/api/client');
    client.setAuthProvider({ token: async () => 'old', refresh: async () => 'fresh' });
    const seen: (string | null)[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (req: Request) => {
        seen.push(req.headers.get('authorization'));
        return seen.length === 1 ? json(401, { error: { code: 'TOKEN_EXPIRED', message: 'expired' } }) : sse(block('done', { response_text: 'ok' }));
      }),
    );
    const stream = await import('./stream');
    const events = await collect(stream.streamChat('/api/v1/agent/chat', { message: 'hi' }, new AbortController().signal));
    vi.unstubAllEnvs();
    expect(seen).toEqual(['Bearer old', 'Bearer fresh']);
    expect(events).toEqual([{ event: 'done', data: { response_text: 'ok' } }]);
  });
});

describe('sendFailure', () => {
  const err = (status: number, code = 'X') => new ApiError({ status, code, message: 'm' });
  it('maps the statuses the panel words differently', () => {
    expect(sendFailure(err(429, 'RATE_LIMIT_EXCEEDED'))).toBe('rate');
    expect(sendFailure(err(404, 'NOT_FOUND'))).toBe('gone');
    expect(sendFailure(err(403, 'USER_INACTIVE'))).toBe('inactive');
    expect(sendFailure(err(403, 'FORBIDDEN'))).toBe('generic');
    expect(sendFailure(err(503))).toBe('generic');
    expect(sendFailure(new Error('x'))).toBe('generic');
  });
});

describe('streamChat edge cases', () => {
  it('reads CRLF-delimited frames', async () => {
    const body = 'event: text_chunk\r\ndata: {"text":"Hi"}\r\n\r\nevent: done\r\ndata: {"response_text":"Hi"}\r\n\r\n';
    vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status: 200 })));
    const events = await collect(streamChat('/api/v1/agent/chat', { message: 'hi' }, new AbortController().signal));
    expect(events.map((e) => e.event)).toEqual(['text_chunk', 'done']);
  });

  it('fails when the stream ends without done or error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('event: text_chunk\ndata: {"text":"Hi"}\n\n', { status: 200 })));
    await expect(collect(streamChat('/api/v1/agent/chat', { message: 'hi' }, new AbortController().signal))).rejects.toMatchObject({ code: 'STREAM_TRUNCATED' });
  });
});
