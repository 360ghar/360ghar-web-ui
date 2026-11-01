import { afterEach, describe, expect, it, vi } from 'vitest';
import { ANALYTICS_MAX_WAIT_MS, ANALYTICS_QUIET_MS, scheduleAnalyticsStart } from './scheduler';

type Handler = () => void;

/**
 * A scripted window/document/PerformanceObserver. The scheduler only uses
 * load/interaction listeners, window timers, idle callbacks and LCP entries,
 * so the fake drives exactly those and lets the test decide when the LCP
 * candidates arrive.
 */
function makeEnv(readyState: Document['readyState']) {
  const listeners = new Map<string, Handler[]>();
  const idle: Handler[] = [];
  const timers = new Map<number, { ms: number; fn: Handler }>();
  const observers: FakeObserver[] = [];
  let nextId = 1;

  class FakeObserver {
    static supportedEntryTypes: string[] = ['largest-contentful-paint'];
    callback: PerformanceObserverCallback;
    disconnected = false;
    constructor(callback: PerformanceObserverCallback) {
      this.callback = callback;
      observers.push(this);
    }
    observe(_options: PerformanceObserverInit) {}
    disconnect() {
      this.disconnected = true;
    }
    takeRecords(): PerformanceEntryList {
      return [];
    }
  }

  const win = {
    addEventListener(type: string, fn: Handler) {
      const list = listeners.get(type) ?? [];
      list.push(fn);
      listeners.set(type, list);
    },
    removeEventListener(type: string, fn: Handler) {
      const list = listeners.get(type);
      if (list) listeners.set(type, list.filter((f) => f !== fn));
    },
    requestIdleCallback(cb: Handler): number {
      idle.push(cb);
      return idle.length;
    },
    setTimeout(fn: Handler, ms: number): number {
      const id = nextId++;
      timers.set(id, { ms, fn });
      return id;
    },
    clearTimeout(id: number) {
      timers.delete(id);
    },
  };

  return {
    observers,
    install() {
      vi.stubGlobal('window', win);
      vi.stubGlobal('document', { readyState });
      vi.stubGlobal('PerformanceObserver', FakeObserver);
      return FakeObserver;
    },
    fire(type: string) {
      for (const fn of [...(listeners.get(type) ?? [])]) fn();
    },
    flushIdle() {
      for (const cb of idle.splice(0)) cb();
    },
    runTimers(ms: number) {
      for (const [, t] of [...timers]) if (t.ms === ms) t.fn();
    },
    pendingTimers: () => [...timers.values()].map((t) => t.ms),
    deliverLcp(startTimes: number[]) {
      const entries = startTimes.map((t) => ({ startTime: t }) as PerformanceEntry);
      const list = { getEntries: () => entries } as unknown as PerformanceObserverEntryList;
      for (const o of observers) if (!o.disconnected) o.callback(list, o as unknown as PerformanceObserver);
    },
  };
}

describe('analytics scheduler', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('watches nothing until the load event fires', () => {
    const env = makeEnv('loading');
    env.install();
    scheduleAnalyticsStart(vi.fn());
    expect(env.pendingTimers()).toEqual([]);
    expect(env.observers).toHaveLength(0);
    env.fire('load');
    expect(env.pendingTimers()).toEqual([ANALYTICS_MAX_WAIT_MS]);
    expect(env.observers).toHaveLength(1);
  });

  it('idle alone never starts analytics: it waits for the LCP candidates', () => {
    const env = makeEnv('complete');
    env.install();
    const begin = vi.fn();
    scheduleAnalyticsStart(begin);
    env.flushIdle();
    expect(begin).not.toHaveBeenCalled();
    env.deliverLcp([1300]);
    env.flushIdle();
    expect(begin).not.toHaveBeenCalled();
    env.runTimers(ANALYTICS_QUIET_MS);
    env.flushIdle();
    expect(begin).toHaveBeenCalledTimes(1);
    expect(env.observers[0]?.disconnected).toBe(true);
    expect(env.pendingTimers()).toEqual([]);
  });

  it('a later candidate restarts the quiet window and analytics starts once', () => {
    const env = makeEnv('complete');
    env.install();
    const begin = vi.fn();
    scheduleAnalyticsStart(begin);
    env.deliverLcp([1300]);
    env.deliverLcp([2600]);
    env.runTimers(ANALYTICS_QUIET_MS);
    env.flushIdle();
    expect(begin).toHaveBeenCalledTimes(1);
    expect(env.observers[0]?.disconnected).toBe(true);
    expect(env.pendingTimers()).toEqual([]);
  });

  it('the first interaction starts analytics even before LCP', () => {
    const env = makeEnv('loading');
    env.install();
    const begin = vi.fn();
    scheduleAnalyticsStart(begin);
    env.fire('pointerdown');
    expect(env.pendingTimers()).toEqual([]);
    expect(env.observers).toHaveLength(0);
    env.flushIdle();
    expect(begin).toHaveBeenCalledTimes(1);
    env.fire('load');
    expect(env.observers).toHaveLength(0);
    expect(begin).toHaveBeenCalledTimes(1);
  });

  it('the hard cap starts analytics when no LCP is ever reported (hidden tab)', () => {
    const env = makeEnv('complete');
    env.install();
    const begin = vi.fn();
    scheduleAnalyticsStart(begin);
    env.runTimers(ANALYTICS_MAX_WAIT_MS);
    env.flushIdle();
    expect(begin).toHaveBeenCalledTimes(1);
  });

  it('engines without LCP support fall back to load + idle', () => {
    const env = makeEnv('complete');
    const FakeObserver = env.install();
    FakeObserver.supportedEntryTypes = ['mark'];
    const begin = vi.fn();
    scheduleAnalyticsStart(begin);
    expect(env.observers).toHaveLength(0);
    expect(begin).not.toHaveBeenCalled();
    env.flushIdle();
    expect(begin).toHaveBeenCalledTimes(1);
  });

  it('interaction and the automatic path racing still start analytics once', () => {
    const env = makeEnv('complete');
    env.install();
    const begin = vi.fn();
    scheduleAnalyticsStart(begin);
    env.deliverLcp([2600]);
    env.runTimers(ANALYTICS_QUIET_MS);
    env.fire('keydown');
    env.runTimers(ANALYTICS_MAX_WAIT_MS);
    env.flushIdle();
    expect(begin).toHaveBeenCalledTimes(1);
    expect(env.pendingTimers()).toEqual([]);
  });
});
