// localStorage helper for the cached user profile. Shared by authStore (which
// reads on init, writes on profile sync) and http.js (which clears on a hard
// 401). Centralising the key + envelope shape here prevents the two sites
// from drifting if the key or the timestamped-cache envelope changes.

const USER_CACHE_KEY = 'user';
const USER_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Support both legacy (bare user object) and timestamped ({ user, ts })
    // cache entries. Expired entries are treated as a miss.
    if (parsed && typeof parsed === 'object' && 'user' in parsed && 'ts' in parsed) {
      if (Date.now() - parsed.ts > USER_CACHE_TTL_MS) return null;
      return parsed.user || null;
    }
    return parsed || null;
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify({ user, ts: Date.now() }));
  } catch {
    // Ignore storage quota/private mode failures.
  }
}

function clearStoredUser() {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    // Ignore storage failures during cleanup.
  }
}

export { USER_CACHE_KEY, USER_CACHE_TTL_MS, readStoredUser, writeStoredUser, clearStoredUser };
