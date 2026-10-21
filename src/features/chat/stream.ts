/**
 * Streams an agent reply over Server-Sent Events (fetch + ReadableStream,
 * because EventSource cannot POST). The request goes through the shared
 * authed fetch (bearer token, one refresh on 401, timeout), and a failed
 * response is a typed ApiError. Each event is checked with Zod against the
 * frames of the backend `AgentStreamEvent` union; a block that does not match is skipped.
 *
 * Frames: conversation_info, text_chunk, tool_call_start, tool_call_end,
 * widget, done, error. There is no fallback frame. Read the stream to the end:
 * the server saves the reply before `done` or `error`, and a client that
 * closes early loses that turn's reply.
 */
import { z } from 'zod';
import { apiUrl, authedFetch } from '@/lib/api/client';
import { ApiError, toApiError } from '@/lib/api/errors';
import type { components } from '@/lib/api/schema';

const frame = <E extends string, D extends z.ZodType>(event: E, data: D) => z.object({ event: z.literal(event), data });

/** One SSE event. `widget.structured_content` is a payload per widget name; the widget normalizer checks it. */
export const chatEventSchema = z.discriminatedUnion('event', [
  frame('conversation_info', z.object({ conversation_id: z.number().int() })),
  frame('text_chunk', z.object({ text: z.string() })),
  frame('tool_call_start', z.object({ call_id: z.string(), tool: z.string() })),
  frame('tool_call_end', z.object({ call_id: z.string(), tool: z.string(), success: z.boolean() })),
  frame('widget', z.object({ widget_name: z.string(), structured_content: z.unknown().optional() })),
  frame('done', z.object({ response_text: z.string() })),
  frame('error', z.object({ code: z.string(), message: z.string() })),
]);
export type ChatEvent = z.infer<typeof chatEventSchema>;

/**
 * Build-time guard: every frame of the generated `AgentStreamEvent` must be one of the schemas above.
 * A frame or a field that the backend renames or adds fails `pnpm typecheck` after `pnpm api:types`.
 */
export type WireFramesParse = Assert<[components['schemas']['AgentStreamEvent']] extends [ChatEvent] ? true : false>;
type Assert<T extends true> = T;

/** A reply can run several tool calls, so the stream gets longer than the 15 s default. */
const STREAM_TIMEOUT_MS = 180_000;

/** Parses one SSE block (`event:` and `data:` lines). Returns null when it is not a valid frame. */
export function parseBlock(block: string): ChatEvent | null {
  let event = 'message';
  const data: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
  }
  if (!data.length) return null;
  let json: unknown;
  try {
    json = JSON.parse(data.join('\n'));
  } catch {
    return null;
  }
  const parsed = chatEventSchema.safeParse({ event, data: json });
  return parsed.success ? parsed.data : null;
}

export async function* streamChat(path: string, body: unknown, signal: AbortSignal): AsyncGenerator<ChatEvent> {
  const res = await authedFetch(
    new Request(apiUrl(path), {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
      body: JSON.stringify(body),
      signal,
    }),
    STREAM_TIMEOUT_MS,
  );
  if (!res.ok || !res.body) throw await toApiError(res);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  let finished = false;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    // CRLF-delimited streams are valid SSE: normalize before looking for the blank line.
    buffer = (buffer + value).replace(/\r\n/g, '\n');
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const ev = parseBlock(block);
      if (ev) {
        if (ev.event === 'done' || ev.event === 'error') finished = true;
        yield ev;
      }
    }
  }
  // A clean EOF without `done` or `error` is a cut-off reply, not a finished one.
  if (!finished) throw new ApiError({ status: 0, code: 'STREAM_TRUNCATED', message: 'The reply ended before it was finished.' });
}

/** What went wrong with a send, as a key the panel turns into text. Anything else is `generic`. */
export function sendFailure(error: unknown): 'rate' | 'gone' | 'inactive' | 'generic' {
  if (!(error instanceof ApiError)) return 'generic';
  if (error.status === 429) return 'rate';
  if (error.status === 404) return 'gone';
  if (error.status === 403 && error.code === 'USER_INACTIVE') return 'inactive';
  return 'generic';
}
