import { describe, expect, it, vi } from 'vitest';
import { registerServiceWorker, watchOffline } from './register';

const el = () => ({ hidden: true, textContent: '' }) as unknown as HTMLElement;
function win() {
  const l: Record<string, () => void> = {};
  return {
    l,
    addEventListener: (t: string, f: () => void) => void (l[t] = f),
    removeEventListener: (t: string) => void delete l[t],
  };
}

describe('watchOffline', () => {
  it('stays hidden and silent while online', () => {
    const note = el();
    const live = el();
    watchOffline(note, live, 'Offline', { onLine: true }, win() as never);
    expect(note.hidden).toBe(true);
    expect(live.textContent).toBe('');
  });

  it('shows at once when the page loads offline', () => {
    const note = el();
    const live = el();
    watchOffline(note, live, 'Offline', { onLine: false }, win() as never);
    expect(note.hidden).toBe(false);
    expect(live.textContent).toBe('Offline');
  });

  it('follows the offline and online events, and stops on cleanup', () => {
    const w = win();
    const note = el();
    const live = el();
    const stop = watchOffline(note, live, 'Offline', { onLine: true }, w as never);
    w.l.offline!();
    expect([note.hidden, live.textContent]).toEqual([false, 'Offline']);
    w.l.online!();
    expect([note.hidden, live.textContent]).toEqual([true, '']);
    stop();
    expect(Object.keys(w.l)).toEqual([]);
  });
});

describe('registerServiceWorker', () => {
  const nav = () => ({ serviceWorker: { register: vi.fn(async () => ({})) } });

  it('does nothing outside production', () => {
    const n = nav();
    registerServiceWorker({ prod: false }, n as never, { readyState: 'complete' } as never, win() as never);
    expect(n.serviceWorker.register).not.toHaveBeenCalled();
  });

  it('does nothing when the browser has no service workers', () => {
    expect(() => registerServiceWorker({ prod: true }, {} as never, { readyState: 'complete' } as never, win() as never)).not.toThrow();
  });

  it('registers /sw.js at once when the page has loaded', () => {
    const n = nav();
    registerServiceWorker({ prod: true }, n as never, { readyState: 'complete' } as never, win() as never);
    expect(n.serviceWorker.register).toHaveBeenCalledWith('/sw.js', { scope: '/', updateViaCache: 'none' });
  });

  it('waits for the load event otherwise', () => {
    const n = nav();
    const w = win();
    registerServiceWorker({ prod: true }, n as never, { readyState: 'loading' } as never, w as never);
    expect(n.serviceWorker.register).not.toHaveBeenCalled();
    w.l.load!();
    expect(n.serviceWorker.register).toHaveBeenCalledTimes(1);
  });
});
