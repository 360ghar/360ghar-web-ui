# 360Ghar AI ChatBot — Design Spec

## Context

360Ghar's backend already has a fully-built AI agent chat system (`POST /api/v1/agent/chat`) powered by ZhipuAI's GLM-4.7-flash model via Pydantic AI. It supports SSE streaming, 31 MCP-bridged tools (property management, bookings, maintenance, leases), conversation persistence, and HTML widget events. However, there is no frontend consumer — the existing `AIAgent.jsx` page is only a marketing landing page.

This spec defines the frontend chat UI: a floating bubble + slide-up panel that connects to the existing backend, renders streamed responses with inline tool status chips and rich widget cards, and provides a limited guest experience for unauthenticated users.

---

## Component Architecture

```
App.jsx
└── <ChatBot />                    — Lazy-loaded orchestrator, inside BrowserRouter
    ├── <ChatBubble />             — Fixed FAB button, bottom-right
    └── <ChatPanel />              — Slide-up overlay panel (conditional on isOpen)
        ├── <ChatHeader />         — Orange header bar with title + controls
        ├── <ChatMessages />       — Scrollable message list + welcome state
        │   ├── <UserMessage />    — Right-aligned user bubble
        │   ├── <BotMessage />     — Left-aligned markdown bubble + tool chips
        │   ├── <ToolChip />       — Inline tool status pill (running/done/error)
        │   ├── <ChatWidget />     — Widget router → specific widget components
        │   └── <TypingIndicator />— Three-dot bounce animation
        ├── <GuestPrompt />        — Login CTA (replaces input when !isAuthenticated)
        └── <ChatInput />          — Textarea + send/stop button
```

### File Layout

```
src/components/chatbot/
├── ChatBot.jsx
├── ChatBubble.jsx
├── ChatPanel.jsx
├── ChatHeader.jsx
├── ChatMessages.jsx
├── ChatInput.jsx
├── messages/
│   ├── UserMessage.jsx
│   ├── BotMessage.jsx
│   ├── ToolChip.jsx
│   ├── TypingIndicator.jsx
│   ├── GuestPrompt.jsx
│   └── ChatWidget.jsx
└── widgets/
    ├── PropertyResultsWidget.jsx
    ├── PropertyDetailWidget.jsx
    ├── VisitListWidget.jsx
    ├── DashboardWidget.jsx
    ├── LeaseWidget.jsx
    ├── MaintenanceWidget.jsx
    └── GenericWidget.jsx

src/services/chatService.js
src/store/chatStore.js
public/assets/sass/components/_chatbot.scss
```

---

## Backend API Contract (Existing)

### POST `/api/v1/agent/chat` — SSE Streaming Chat

**Request:** `{ message: string (1-4000), conversation_id: int|null }`
**Auth:** `Authorization: Bearer <supabase_jwt>`

**SSE Events (in order):**

| Event | Payload | When |
|---|---|---|
| `conversation_info` | `{ conversation_id }` | Always first |
| `text_chunk` | `{ text }` | Streamed tokens (concatenate) |
| `tool_call_start` | `{ call_id, tool }` | Tool invocation begins |
| `tool_call_end` | `{ call_id, tool, success, summary }` | Tool completed |
| `widget` | `{ widget_name, structured_content }` | After tool with widget |
| `done` | `{ conversation_id, tool_calls_count, response_text }` | Success terminal |
| `error` | `{ code, message, recoverable }` | Error terminal |

### Other Endpoints (wired but not used in V1 UI)

- `GET /api/v1/agent/conversations` — list conversations
- `GET /api/v1/agent/conversations/{id}/messages` — get messages
- `DELETE /api/v1/agent/conversations/{id}` — delete conversation

---

## State Management — `chatStore.js`

Zustand store following existing project patterns (`create((set, get) => ({...}))`).

### State Shape

```js
{
  isOpen: false,
  conversationId: null,
  messages: [],              // Message[]
  isStreaming: false,
  streamingMessageId: null,  // ID of bot message being built
  error: null,
  _abortController: null,
}
```

### Message Object

```js
{
  id: string,                // crypto.randomUUID()
  role: 'user' | 'bot' | 'tool' | 'widget' | 'system',
  content: string,
  toolCalls: [{ callId, tool, status, summary }],
  widget: { widgetName, structuredContent } | null,
  timestamp: Date,
  isStreaming: boolean,
}
```

### Actions

- `toggleChat()` — open/close panel; push welcome system message on first open
- `sendMessage(text)` — guard on `isStreaming`; push user msg, create streaming bot msg, call `chatService.streamChat` with event dispatcher
- `cancelStream()` — abort in-flight request, keep partial content
- `resetChat()` — clear messages, conversationId, start fresh
- `clearError()`

### SSE Event Dispatch (inside `sendMessage`)

- `conversation_info` → set `conversationId`
- `text_chunk` → append to current bot message's `content`
- `tool_call_start` → add to bot message's `toolCalls[]` with status `'running'`
- `tool_call_end` → update matching `toolCalls[]` entry to `'done'` or `'error'`
- `widget` → push separate widget message to `messages[]`
- `done` → set `isStreaming: false`, finalize bot message
- `error` → show error, mark bot message as errored

---

## Service Layer — `chatService.js`

Uses `fetch()` (not `EventSource`) because the endpoint requires POST + auth headers.

### `streamChat(message, conversationId, onEvent, signal)`

1. Get token via `getSupabaseAccessToken()` from `src/services/supabaseClient.js`
2. Build URL: `${getApiBaseUrl()}/agent/chat` (proxy adds `/v1`)
3. `fetch()` with POST, JSON body, Bearer token, AbortController signal
4. Read stream via `response.body.getReader()` + `TextDecoder`
5. Buffer lines, split on `\n\n`, parse `event:` and `data:` fields
6. Call `onEvent(type, parsedData)` for each complete SSE event

### REST Methods (wired for future use)

- `getConversations(limit, offset)` — `GET /agent/conversations`
- `getMessages(conversationId, limit)` — `GET /agent/conversations/{id}/messages`
- `deleteConversation(conversationId)` — `DELETE /agent/conversations/{id}`

These use `createAxiosInstance({ withAuth: true })` from `src/services/http.js`.

---

## Guest Mode

When `!isAuthenticated` (from `useAuthStore`):

- Chat bubble is visible and clickable
- Panel opens with a welcome system message: "Hi! I'm the 360Ghar AI Assistant. I can help you with property search, bookings, and more."
- Quick action buttons displayed: "Search Properties", "Schedule a Visit", "EMI Calculator", "Contact Us" — these navigate to the relevant page (not chat actions)
- Input area replaced by `<GuestPrompt />`: "Sign in to chat with our AI assistant" with Login and Register links
- No API calls made in guest mode

---

## Widget Rendering

`ChatWidget` maps `widget_name` from SSE events to React components:

| Widget Name | Component | Renders |
|---|---|---|
| `PropertySearchWidget` | `PropertyResultsWidget` | Property card grid (up to 4 items) |
| `PropertyDetailsWidget` | `PropertyDetailWidget` | Single property summary card |
| `VisitListWidget` / `VisitSchedulerWidget` | `VisitListWidget` | Visit list with status badges |
| `OwnerDashboardWidget` | `DashboardWidget` | Stats grid (properties, leases, etc.) |
| `LeaseDetailsWidget` / `LeaseManagementWidget` | `LeaseWidget` | Lease summary card |
| `MaintenanceWidget` | `MaintenanceWidget` | Maintenance request list |
| All others | `GenericWidget` | Formatted key-value card fallback |

Each widget is wrapped in an error boundary. Widgets receive `structuredContent` as `data` prop.

---

## Visual Design

### Chat Bubble
- Position: `fixed; bottom: 24px; right: 24px` (mobile: `bottom: 16px; right: 16px`)
- Size: `56px` circle (mobile: `48px`)
- Background: orange gradient `#ff6b00` → `#ff8c3a`
- Icon: chat SVG (closed) / X SVG (open)
- Shadow: `var(--shadow-lg)`
- Pulse animation on first load (3s, once)
- z-index: `9999`

### Chat Panel
- Desktop: `380px` wide, `520px` tall, `bottom: 100px; right: 24px`, `border-radius: 16px`
- Mobile (<768px): `100vw` × `100vh`, `bottom: 0; right: 0`, `border-radius: 0`
- Background: white
- Shadow: `var(--shadow-xl)`
- Animation: `translateY(100%)` → `translateY(0)`, `300ms cubic-bezier(0.4, 0, 0.2, 1)`
- z-index: `9998`

### Chat Header
- Background: `#ff6b00`
- Text: white, "360Ghar AI", Josefin Sans font
- Status dot (green) + "Online" text
- New Chat button (icon) + Close button (X)
- Height: `56px`
- Border-radius: `16px 16px 0 0` (desktop)

### Messages
- **User:** right-aligned, orange bg `#ff6b00`, white text, `border-radius: 16px 16px 4px 16px`
- **Bot:** left-aligned, gray bg `#F8F8F8`, dark text, `border-radius: 16px 16px 16px 4px`, markdown via `react-markdown` + `remark-gfm`
- **Tool chips:** small pills, orange border, animated spinner → checkmark/X, `12-13px` text
- **Widgets:** full-width cards, `border-left: 3px solid #ff6b00`, slight shadow

### Input Area
- Sticky bottom, `border-top: 1px solid #E0E0E0`
- Auto-growing textarea (1-4 lines), `border-radius: 24px`
- Placeholder: "Ask me anything..."
- Send: orange circle with arrow icon, `44px` touch target
- Stop button (during streaming): replaces send, red accent
- Max: 4000 characters

---

## Integration Points

### Modified Files

1. **`src/App.jsx`** — Add lazy-loaded `<ChatBot />` inside `<BrowserRouter>`, after `</Suspense>` and before `</BrowserRouter>`:
   ```jsx
   const ChatBot = lazy(() => import('./components/chatbot/ChatBot'));
   // Inside BrowserRouter, after the main Suspense block:
   <Suspense fallback={null}><ChatBot /></Suspense>
   ```

2. **`src/store/index.js`** — Export `useChatStore`

3. **`public/assets/sass/components/_index.scss`** — Add `@import "chatbot"`

### Dependencies
No new npm packages. Reuses existing:
- `react-markdown` (v10.1.0)
- `remark-gfm`
- `react-router-dom` (for Link in GuestPrompt/widgets)
- Supabase client (`getSupabaseAccessToken`)

---

## Edge Cases & Error Handling

- **Network failure during streaming:** Catch fetch errors, show error message with "Retry" button
- **Token expiration mid-stream:** Backend sends `error` SSE event; show "Session expired" with login link
- **Concurrent sends:** `isStreaming` flag prevents double-sends; Send button disabled
- **Empty responses:** If `done` with no text and no widgets, show generic fallback message
- **User cancels stream:** `AbortController.abort()`, keep partial content, no error shown
- **Rapid panel toggle:** CSS-driven animation handles gracefully; don't abort stream on close

## Accessibility

- Focus moves to input on panel open, returns to bubble on close
- `role="dialog"`, `aria-label="Chat with 360Ghar AI assistant"` on panel
- `aria-live="polite"` on messages container
- Escape key closes panel
- All interactive elements keyboard-accessible with `44px` min touch targets
- `prefers-reduced-motion` disables animations

---

## Verification Plan

1. **Build check:** `npm run build` succeeds with no errors
2. **Bubble visibility:** Chat bubble appears bottom-right on all pages
3. **Guest mode:** Open chat while logged out — see welcome + quick actions + login prompt, no API calls
4. **Auth flow:** Log in, open chat, send "Hello" — verify SSE stream connects and response renders with markdown
5. **Tool chips:** Send "Show me my properties" — verify tool_call_start shows spinner chip, tool_call_end shows checkmark
6. **Widget rendering:** Send "Search for 2BHK in Gurgaon" — verify PropertyResultsWidget renders inline
7. **Mobile:** Resize to <768px — panel goes full-screen, bubble adjusts size
8. **Cancel:** Click Stop while streaming — partial content preserved, no error
9. **Error recovery:** Disconnect network mid-stream — error message appears with retry option
10. **Keyboard:** Tab through bubble → panel → input → send; Escape closes panel
