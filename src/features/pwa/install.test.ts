import { describe, expect, it, vi } from 'vitest';
import { dismiss, isDismissed, wireInstallButton, type InstallPrompt } from './install';

type Handler = (event: unknown) => void;
type FakeSession = { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void };

/** A window mock that only tracks add/remove of the two install events. */
function win() {
  const added: Record<string, Handler> = {};
  return {
    addEventListener: (type: string, fn: Handler) => void (added[type] = fn),
    removeEventListener: (type: string) => delete added[type],
    listeners: added as Record<string, Handler | undefined>,
  };
}

/** A button mock that records its click handlers. */
function button() {
  const handlers: Handler[] = [];
  return {
    el: { addEventListener: (_: string, fn: Handler) => handlers.push(fn), removeEventListener: (_: string, fn: Handler) => void handlers.splice(handlers.indexOf(fn), 1) } as unknown as HTMLElement,
    handlers,
  };
}

/** A BeforeInstallPromptEvent stub whose userChoice the test resolves later. */
function promptEvent(outcome: Promise<{ outcome: 'accepted' | 'dismissed' }> = Promise.resolve({ outcome: 'accepted' }), promptRejects = false) {
  return {
    preventDefault: vi.fn(),
    prompt: vi.fn(() => (promptRejects ? Promise.reject(new Error('dialog failed')) : Promise.resolve())),
    userChoice: outcome,
  } as unknown as InstallPrompt & { preventDefault: ReturnType<typeof vi.fn>; prompt: ReturnType<typeof vi.fn> };
}

const freshSession = (): FakeSession => {
  const store = new Map<string, string>();
  return { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => void store.set(k, v) };
};
const flush = () => new Promise<void>((r) => setTimeout(r, 0));

describe('dismissal storage', () => {
  it('is not dismissed on a fresh session, and dismiss() marks the session', () => {
    const session = freshSession();
    expect(isDismissed(session)).toBe(false);
    dismiss(session);
    expect(isDismissed(session)).toBe(true);
  });

  it('survives storage that throws (private mode)', () => {
    const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(isDismissed(broken)).toBe(false);
    expect(() => dismiss(broken)).not.toThrow();
  });

  it('tolerates a null session (storage access threw in the browser)', () => {
    expect(isDismissed(null)).toBe(false);
    expect(isDismissed(undefined)).toBe(false);
    expect(() => dismiss(null)).not.toThrow();
  });
});

describe('wireInstallButton', () => {
  it('does nothing until the browser fires beforeinstallprompt', () => {
    const w = win();
    const b = button();
    const reveal = vi.fn();
    wireInstallButton(b.el, reveal, vi.fn(), w as never, freshSession());
    b.handlers[0]?.({});
    expect(reveal).not.toHaveBeenCalled();
    expect(w.listeners.beforeinstallprompt).toBeDefined();
  });

  it('keeps the event, reveals the button and prevents the browser mini-infobar', () => {
    const w = win();
    const b = button();
    const reveal = vi.fn();
    const hide = vi.fn();
    wireInstallButton(b.el, reveal, hide, w as never, freshSession());
    const event = promptEvent();
    w.listeners.beforeinstallprompt!(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(reveal).toHaveBeenCalled();
    expect(hide).not.toHaveBeenCalled();
  });

  it('stays hidden for the session after a dismissal', () => {
    const w = win();
    const reveal = vi.fn();
    const session = freshSession();
    dismiss(session);
    wireInstallButton(button().el, reveal, vi.fn(), w as never, session);
    const event = promptEvent();
    w.listeners.beforeinstallprompt!(event);
    expect(reveal).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled(); // The browser may use its own UI.
  });

  it('on an accepted choice: prompts, hides, and clears the offer', async () => {
    const w = win();
    const b = button();
    const hide = vi.fn();
    wireInstallButton(b.el, vi.fn(), hide, w as never, freshSession());
    const event = promptEvent();
    w.listeners.beforeinstallprompt!(event);
    b.handlers[0]?.({});
    expect(event.prompt).toHaveBeenCalled();
    await flush();
    expect(hide).toHaveBeenCalled();
    b.handlers[0]?.({}); // A second click does nothing: the offer is gone.
    expect(event.prompt).toHaveBeenCalledTimes(1);
  });

  it('on a dismissed choice: remembers the dismissal and hides', async () => {
    const w = win();
    const b = button();
    const hide = vi.fn();
    const session = freshSession();
    wireInstallButton(b.el, vi.fn(), hide, w as never, session);
    w.listeners.beforeinstallprompt!(promptEvent(Promise.resolve({ outcome: 'dismissed' })));
    b.handlers[0]?.({});
    await flush();
    expect(isDismissed(session)).toBe(true);
    expect(hide).toHaveBeenCalled();
  });

  it('hides the button when the dialog fails to open, and reveals it again on a fresh event', async () => {
    const w = win();
    const b = button();
    const reveal = vi.fn();
    const hide = vi.fn();
    wireInstallButton(b.el, reveal, hide, w as never, freshSession());
    w.listeners.beforeinstallprompt!(promptEvent(new Promise(() => {}), true)); // prompt() rejects, choice never comes
    b.handlers[0]?.({});
    await flush();
    expect(hide).toHaveBeenCalled();
    const fresh = promptEvent();
    w.listeners.beforeinstallprompt!(fresh);
    expect(reveal).toHaveBeenCalledTimes(2);
    b.handlers[0]?.({});
    expect(fresh.prompt).toHaveBeenCalled(); // the new offer is usable
  });

  it('hides the button when the choice lookup fails (the spent offer is a dead control)', async () => {
    const w = win();
    const b = button();
    const hide = vi.fn();
    wireInstallButton(b.el, vi.fn(), hide, w as never, freshSession());
    w.listeners.beforeinstallprompt!(promptEvent(Promise.reject(new Error('no choice'))));
    b.handlers[0]?.({});
    await flush();
    expect(hide).toHaveBeenCalled();
    b.handlers[0]?.({}); // later clicks do nothing and do not throw
    await flush();
    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('hides the button when appinstalled fires', () => {
    const w = win();
    const hide = vi.fn();
    wireInstallButton(button().el, vi.fn(), hide, w as never, freshSession());
    w.listeners.appinstalled!(new Event('appinstalled'));
    expect(hide).toHaveBeenCalled();
  });

  it('clicking twice in a row prompts once (a second prompt() call throws)', () => {
    const w = win();
    const b = button();
    wireInstallButton(b.el, vi.fn(), vi.fn(), w as never, freshSession());
    const event = promptEvent(new Promise(() => {})); // never resolves: the offer would still be pending
    w.listeners.beforeinstallprompt!(event);
    b.handlers[0]?.({});
    expect(() => b.handlers[0]?.({})).not.toThrow();
    expect(event.prompt).toHaveBeenCalledTimes(1);
  });

  it('stop removes every listener', () => {
    const w = win();
    const b = button();
    const stop = wireInstallButton(b.el, vi.fn(), vi.fn(), w as never, freshSession());
    expect(Object.keys(w.listeners)).toEqual(['beforeinstallprompt', 'appinstalled']);
    expect(b.handlers).toHaveLength(1);
    stop();
    expect(w.listeners.beforeinstallprompt).toBeUndefined();
    expect(w.listeners.appinstalled).toBeUndefined();
    expect(b.handlers).toHaveLength(0);
  });
});
