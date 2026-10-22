/**
 * Remembers, for this tab, that the backend rejected `context` (it is older than the site), so only the first
 * question of a visit pays for the failed try.
 */
const KEY = '360ghar:ask-no-context';
let unsupported = false;

export const contextUnsupported = () => {
  if (unsupported) return true;
  try {
    unsupported = sessionStorage.getItem(KEY) === '1';
  } catch {
    // Storage blocked: the flag lives in memory only.
  }
  return unsupported;
};

export const markContextUnsupported = () => {
  unsupported = true;
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    // Storage blocked: the flag lives in memory only.
  }
};
