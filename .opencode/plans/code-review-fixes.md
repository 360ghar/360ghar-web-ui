# Code Review Fixes — 2 Issues + 1 Dropped

## Fix 1: Chat timestamp rehydration

**File:** `src/store/chatStore.js` (line ~283)

**Problem:** `Date` objects become ISO strings after `JSON.stringify` → localStorage → `JSON.parse`. Components calling `.getTime()` or `instanceof Date` on `msg.timestamp` will break after page refresh.

**Change:** In the `onRehydrateStorage` callback, replace the existing `isStreaming`-only cleanup with a map that also converts timestamps back to `Date`:

```js
// BEFORE (line 283-285):
state.messages = state.messages.map((msg) =>
  msg.isStreaming ? { ...msg, isStreaming: false } : msg
);

// AFTER:
state.messages = state.messages.map((msg) => {
  if (typeof msg.timestamp === 'string' || msg.isStreaming) {
    return {
      ...msg,
      timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp,
      isStreaming: false,
    };
  }
  return msg;
});
```

This only creates new objects when actually needed (timestamp is a string from JSON or message was streaming), preserving referential equality for unchanged messages.

---

## Fix 2: Auth retry path for transient profile-fetch failures

**File:** `src/store/authStore.js` (after line 311, before the closing `}))`)

**Problem:** When `syncUserProfile` fails transiently, `isAuthenticated: true` but `user: null`, with no retry mechanism. The user is stuck.

**Change:** Add a `retryProfileFetch` action to the store:

```js
// Add after clearError (line 311):
retryProfileFetch: async () => {
  const { token } = get();
  if (!token) return;
  set({ error: null, isLoading: true });
  try {
    await syncUserProfile(token, set);
  } finally {
    set({ isLoading: false });
  }
},
```

This reuses the existing `syncUserProfile` helper and the current token. Sets `isLoading` for UI feedback and clears it in `finally` regardless of success/failure.

---

## ~~Fix 3: Use publicApi for anonymous deletion requests~~ — DROPPED

**Why dropped:** The `api` instance (`withAuth: true`) conditionally attaches the Bearer token only when a session exists (http.js:68-73). For anonymous users, `getSupabaseAccessToken()` returns `null` and no `Authorization` header is sent — there's no unnecessary overhead. For logged-in users, the token lets the backend associate the deletion request with the account, which is intentional per the JSDoc. Switching to `publicApi` would break this association.

The original review concern (Supabase SDK lazy-load overhead) is negligible — `getSupabaseAccessToken()` is cheap when no session exists.

---

## Verification

1. Run `npm run lint` to check for lint errors
2. Manual test: refresh chat page, verify no console errors from timestamp handling
3. Manual test: simulate profile fetch failure, verify `retryProfileFetch` action works
