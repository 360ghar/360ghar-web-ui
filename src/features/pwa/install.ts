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

export function isDismissed(session: Pick<Storage, 'getItem'> = sessionStorage): boolean {
  try {
    return session.getItem(DISMISS_KEY) === '1';
  } catch {
    return false; // Storage off (private mode): offer the button anyway.
  }
}

export function dismiss(session: Pick<Storage, 'setItem'> = sessionStorage): void {
  try {
    session.setItem(DISMISS_KEY, '1');
  } catch {
    // Storage off: the dismiss lasts until the next navigation.
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
  session: Session = sessionStorage,
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
    pending.prompt().catch(() => {
      // The dialog failed to open (rare): userChoice decides below, or stays pending.
    });
    pending.userChoice.then(
      (choice) => {
        if (choice.outcome === 'dismissed') dismiss(session);
        hide();
      },
      () => {
        // The prompt failed (rare): the button stays for another try.
      },
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
