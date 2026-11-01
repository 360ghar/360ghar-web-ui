/**
 * Chrome install prompt. Chromium fires `beforeinstallprompt` once the site
 * meets the install criteria (manifest, service worker, HTTPS). We hold the
 * event, reveal an Install button in the header, and call prompt() on click.
 * Browsers without the event (iOS Safari, Firefox) never reveal the button,
 * so nothing changes for them. The button is `hidden` until then, so the
 * header never carries a dead control.
 */

/** One dismissed offer stays dismissed for the rest of the tab session. */
const DISMISS_KEY = '360ghar-install-dismissed';

/** Chromium's BeforeInstallPromptEvent: prompt() plus the visitor's choice. */
export type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function isDismissed(session?: Session | null): boolean {
  if (!session) return false;
  try {
    return session.getItem(DISMISS_KEY) === '1';
  } catch {
    return false; // Storage off (private mode): offer the button anyway.
  }
}

export function dismiss(session?: Session | null): void {
  if (!session) return;
  try {
    session.setItem(DISMISS_KEY, '1');
  } catch {
    // Storage off: the dismiss lasts until the next navigation.
  }
}

/**
 * sessionStorage access itself throws where storage is blocked (cookies off,
 * some private modes). Resolving it lazily keeps `wireInstallButton` from
 * throwing before it registers its listeners.
 */
function defaultSession(): Session | null {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
}

type ListenerWindow = Pick<Window, 'addEventListener' | 'removeEventListener'>;
type Session = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Wire an Install button to the browser prompt. `reveal` shows the button
 * when the browser reports installability, `hide` removes it again (installed
 * or dismissed). Only the newest deferred prompt is kept. `session` is
 * injectable for tests. Returns a stop function that removes every listener
 * (used by tests).
 */
export function wireInstallButton(
  button: HTMLElement,
  reveal: () => void,
  hide: () => void,
  win: ListenerWindow = window,
  session: Session | null | undefined = defaultSession(),
): () => void {
  let offer: InstallPrompt | null = null;

  const available = (event: Event) => {
    if (isDismissed(session)) return; // Stay hidden: the visitor said no this session.
    event.preventDefault();
    offer = event as InstallPrompt;
    reveal();
  };
  const installed = () => {
    offer = null;
    hide();
  };
  const clicked = () => {
    const pending = offer;
    if (!pending) return;
    offer = null; // One prompt per event: a second prompt() call throws InvalidStateError.
    // The offer is spent either way, so every failure hides the button; a
    // fresh beforeinstallprompt event reveals it again.
    pending.prompt().catch(hide);
    pending.userChoice.then(
      (choice) => {
        if (choice.outcome === 'dismissed') dismiss(session);
        hide();
      },
      hide,
    );
  };

  button.addEventListener('click', clicked);
  win.addEventListener('beforeinstallprompt', available);
  win.addEventListener('appinstalled', installed);
  return () => {
    button.removeEventListener('click', clicked);
    win.removeEventListener('beforeinstallprompt', available);
    win.removeEventListener('appinstalled', installed);
  };
}
