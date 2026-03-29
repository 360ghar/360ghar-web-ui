import { create } from 'zustand';
import { chatService } from '../services/chatService';
import { useAuthStore } from './authStore';
import { extractError } from '../utils/apiError';

const useChatStore = create((set, get) => ({
  isOpen: false,
  conversationId: null,
  messages: [],
  isStreaming: false,
  streamingMessageId: null,
  error: null,
  _abortController: null,

  toggleChat: () => {
    const { isOpen, messages } = get();
    const nextOpen = !isOpen;

    if (nextOpen && messages.length === 0) {
      const welcomeMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        content: 'welcome',
        toolCalls: [],
        widget: null,
        timestamp: new Date(),
        isStreaming: false,
        isError: false,
      };
      set({ isOpen: nextOpen, messages: [welcomeMessage] });
    } else {
      set({ isOpen: nextOpen });
    }
  },

  sendMessage: async (text) => {
    const { isStreaming } = get();

    // Guard: ignore if already streaming
    if (isStreaming) return;

    // Guard: ignore empty text
    if (!text.trim()) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      toolCalls: [],
      widget: null,
      timestamp: new Date(),
      isStreaming: false,
      isError: false,
    };

    const botMsgId = crypto.randomUUID();
    const botMessage = {
      id: botMsgId,
      role: 'bot',
      content: '',
      toolCalls: [],
      widget: null,
      timestamp: new Date(),
      isStreaming: true,
      isError: false,
    };

    set((state) => ({
      messages: [...state.messages, userMessage, botMessage],
      isStreaming: true,
      streamingMessageId: botMsgId,
      error: null,
    }));

    const abortController = new AbortController();
    set({ _abortController: abortController });

    // Capture botMsgId in closure before async ops
    const streamingId = botMsgId;

    const onEvent = (type, data) => {
      switch (type) {
        case 'conversation_info':
          set({ conversationId: data.conversation_id });
          break;

        case 'text_chunk':
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === streamingId
                ? { ...msg, content: msg.content + data.text }
                : msg
            ),
          }));
          break;

        case 'tool_call_start':
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === streamingId
                ? {
                    ...msg,
                    toolCalls: [
                      ...msg.toolCalls,
                      {
                        callId: data.call_id,
                        tool: data.tool,
                        status: 'running',
                        summary: '',
                      },
                    ],
                  }
                : msg
            ),
          }));
          break;

        case 'tool_call_end':
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === streamingId
                ? {
                    ...msg,
                    toolCalls: msg.toolCalls.map((tc) =>
                      tc.callId === data.call_id
                        ? {
                            ...tc,
                            status: data.success ? 'done' : 'error',
                            summary: data.summary || '',
                          }
                        : tc
                    ),
                  }
                : msg
            ),
          }));
          break;

        case 'widget': {
          const widgetMessage = {
            id: crypto.randomUUID(),
            role: 'widget',
            content: '',
            toolCalls: [],
            widget: {
              widgetName: data.widget_name,
              structuredContent: data.structured_content,
            },
            timestamp: new Date(),
            isStreaming: false,
            isError: false,
          };
          set((state) => ({
            messages: [...state.messages, widgetMessage],
          }));
          break;
        }

        case 'done':
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === streamingId ? { ...msg, isStreaming: false } : msg
            ),
            isStreaming: false,
            streamingMessageId: null,
            _abortController: null,
          }));
          break;

        case 'error':
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === streamingId
                ? { ...msg, isError: true, isStreaming: false }
                : msg
            ),
            isStreaming: false,
            streamingMessageId: null,
            _abortController: null,
            error: data.message,
          }));
          break;

        default:
          break;
      }
    };

    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    try {
      if (isAuthenticated) {
        await chatService.streamChat(
          text.trim(),
          get().conversationId,
          onEvent,
          abortController.signal
        );
      } else {
        await chatService.streamChatPublic(
          text.trim(),
          onEvent,
          abortController.signal
        );
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Cancelled — clean up streaming state without showing an error
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === streamingId ? { ...msg, isStreaming: false } : msg
          ),
          isStreaming: false,
          streamingMessageId: null,
          _abortController: null,
        }));
      } else {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === streamingId
              ? { ...msg, isError: true, isStreaming: false }
              : msg
          ),
          isStreaming: false,
          streamingMessageId: null,
          _abortController: null,
          error: extractError(err, 'Chat failed. Please try again.'),
        }));
      }
    }
  },

  cancelStream: () => {
    get()._abortController?.abort();
    const streamingId = get().streamingMessageId;
    set((state) => ({
      isStreaming: false,
      streamingMessageId: null,
      _abortController: null,
      messages: streamingId
        ? state.messages.map((msg) =>
            msg.id === streamingId ? { ...msg, isStreaming: false } : msg
          )
        : state.messages,
    }));
  },

  resetChat: () => {
    get()._abortController?.abort();
    set({
      messages: [],
      conversationId: null,
      isStreaming: false,
      streamingMessageId: null,
      error: null,
      _abortController: null,
    });
  },

  clearError: () => set({ error: null }),
}));

// When the user logs in, keep messages visible but reset conversationId so the next
// message creates a new authenticated conversation.
// When the user logs out, reset the entire chat.
let _prevIsAuthenticated = useAuthStore.getState().isAuthenticated;
useAuthStore.subscribe((authState) => {
  const isAuthenticated = authState.isAuthenticated;
  if (isAuthenticated && !_prevIsAuthenticated) {
    // Just logged in
    useChatStore.setState({ conversationId: null });
  } else if (!isAuthenticated && _prevIsAuthenticated) {
    // Just logged out
    useChatStore.getState().resetChat();
  }
  _prevIsAuthenticated = isAuthenticated;
});

export { useChatStore };
