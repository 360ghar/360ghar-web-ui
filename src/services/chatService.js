import { getApiBaseUrl } from './http';
import { api } from './api';
import { getSupabaseAccessToken } from './supabaseClient';

/**
 * Parse a streaming SSE response and call onEvent for each complete event.
 *
 * @param {Response} response - The fetch Response with a readable body
 * @param {(type: string, data: object) => void} onEvent - Called for each SSE event
 */
async function _parseSSEStream(response, onEvent) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split on double newline to find complete SSE events
      const segments = buffer.split('\n\n');

      // All segments except the last are complete events; keep the last as the new buffer
      for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i].trim();
        if (!segment) continue;

        let eventType = '';
        let dataStr = '';

        for (const line of segment.split('\n')) {
          if (line.startsWith('event:')) {
            eventType = line.slice('event:'.length).trim();
          } else if (line.startsWith('data:')) {
            dataStr = line.slice('data:'.length).trim();
          }
        }

        if (eventType) {
          try {
            const parsedData = dataStr ? JSON.parse(dataStr) : {};
            onEvent(eventType, parsedData);
          } catch {
            // Malformed JSON in SSE data — skip this event
          }
        }
      }

      buffer = segments[segments.length - 1];
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return;
    }
    throw err;
  }
}

/**
 * Stream a chat message via SSE (Server-Sent Events) using fetch + POST.
 * EventSource cannot be used because it only supports GET with no custom headers.
 *
 * @param {string} message - The user's message (1-4000 chars)
 * @param {number|null} conversationId - Existing conversation ID, or null to start new
 * @param {(type: string, data: object) => void} onEvent - Called for each SSE event
 * @param {AbortSignal} signal - AbortController signal for cancellation
 */
async function streamChat(message, conversationId, onEvent, signal) {
  const token = await getSupabaseAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const url = `${getApiBaseUrl()}/agent/chat`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  await _parseSSEStream(response, onEvent);
}

/**
 * Stream a chat message for unauthenticated guests. Hits the public endpoint
 * which only has property search tools available.
 *
 * @param {string} message - The user's message (1-4000 chars)
 * @param {(type: string, data: object) => void} onEvent - Called for each SSE event
 * @param {AbortSignal} signal - AbortController signal for cancellation
 */
async function streamChatPublic(message, onEvent, signal) {
  const url = `${getApiBaseUrl()}/agent/chat-public`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  await _parseSSEStream(response, onEvent);
}

/**
 * Get list of conversations for the current user.
 *
 * @param {number} limit
 * @param {string|null} cursor - opaque base64 cursor from a prior response's next_cursor (null for first page)
 */
async function getConversations(limit = 50, cursor = null) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (cursor) params.set('cursor', cursor);
  const response = await api.get(
    `${getApiBaseUrl()}/agent/conversations?${params.toString()}`
  );
  // Backend now returns {items, next_cursor, has_more, limit}
  return response.data;
}

/**
 * Get messages for a specific conversation.
 *
 * @param {number} conversationId
 * @param {number} limit
 */
async function getConversationMessages(conversationId, limit = 100) {
  const response = await api.get(
    `${getApiBaseUrl()}/agent/conversations/${conversationId}/messages?limit=${limit}`
  );
  return response.data;
}

/**
 * Delete a conversation by ID.
 *
 * @param {number} conversationId
 */
async function deleteConversation(conversationId) {
  const response = await api.delete(
    `${getApiBaseUrl()}/agent/conversations/${conversationId}`
  );
  return response.data;
}

export const chatService = {
  streamChat,
  streamChatPublic,
  getConversations,
  getConversationMessages,
  deleteConversation,
};
