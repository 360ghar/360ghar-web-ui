import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY, useLocationStore } from './store';
import { TTL_MS } from './logic';

const memory = new Map<string, string>();
const localStorageStub = {
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => void memory.set(k, v),
  removeItem: (k: string) => void memory.delete(k),
};

type Ok = (p: { coords: { latitude: number; longitude: number; accuracy: number } }) => void;
type Fail = (e: { code: number }) => void;
let prompts = 0;
function geolocation(result: 'ok' | number) {
  return {
    getCurrentPosition: (ok: Ok, fail: Fail) => {
      prompts++;
      if (result === 'ok') ok({ coords: { latitude: 28.5, longitude: 77.1, accuracy: 20 } });
      else fail({ code: result });
    },
  };
}

beforeEach(() => {
  memory.clear();
  prompts = 0;
  vi.stubGlobal('localStorage', localStorageStub);
  vi.stubGlobal('navigator', { geolocation: geolocation('ok') });
  useLocationStore.setState({ fix: null, status: 'idle', reason: null, dismissed: false });
});
afterEach(() => vi.unstubAllGlobals());

describe('location store', () => {
  it('asks once, saves only the four fields, and reuses the fix', async () => {
    const first = await useLocationStore.getState().locate();
    expect(first).toMatchObject({ lat: 28.5, lng: 77.1, accuracy: 20 });
    expect(prompts).toBe(1);
    const saved = JSON.parse(memory.get(STORAGE_KEY)!) as { state: { fix: Record<string, unknown> } };
    expect(Object.keys(saved.state.fix).sort()).toEqual(['accuracy', 'lat', 'lng', 'time']);
    const second = await useLocationStore.getState().locate();
    expect(second).toEqual(first);
    expect(prompts).toBe(1);
  });

  it('reads a fresh saved fix after a reload without asking', async () => {
    memory.set(STORAGE_KEY, JSON.stringify({ state: { fix: { lat: 28.4, lng: 77, accuracy: null, time: Date.now() - 1000 } }, version: 1 }));
    await useLocationStore.persist.rehydrate(); // what useLocationMemory does after mount
    const fix = await useLocationStore.getState().locate();
    expect(fix?.lat).toBe(28.4);
    expect(prompts).toBe(0);
  });

  it('ignores an expired saved fix and asks again', async () => {
    memory.set(STORAGE_KEY, JSON.stringify({ state: { fix: { lat: 28.4, lng: 77, accuracy: null, time: Date.now() - TTL_MS - 1 } }, version: 1 }));
    await useLocationStore.persist.rehydrate();
    expect(useLocationStore.getState().fix).toBeNull(); // dropped when read
    const fix = await useLocationStore.getState().locate();
    expect(fix?.lat).toBe(28.5);
    expect(prompts).toBe(1);
  });

  it('falls back with a reason on denial, timeout and no support', async () => {
    vi.stubGlobal('navigator', { geolocation: geolocation(1) });
    expect(await useLocationStore.getState().locate()).toBeNull();
    expect(useLocationStore.getState()).toMatchObject({ status: 'fallback', reason: 'denied', fix: null });

    vi.stubGlobal('navigator', { geolocation: geolocation(3) });
    await useLocationStore.getState().locate();
    expect(useLocationStore.getState().reason).toBe('timeout');

    vi.stubGlobal('navigator', {});
    await useLocationStore.getState().locate();
    expect(useLocationStore.getState().reason).toBe('unsupported');
  });

  it('can be dismissed, and cleared', async () => {
    vi.stubGlobal('navigator', { geolocation: geolocation(1) });
    await useLocationStore.getState().locate();
    useLocationStore.getState().dismiss();
    expect(useLocationStore.getState().dismissed).toBe(true);

    vi.stubGlobal('navigator', { geolocation: geolocation('ok') });
    await useLocationStore.getState().locate();
    expect(useLocationStore.getState().fix).not.toBeNull();
    useLocationStore.getState().clear();
    expect(useLocationStore.getState()).toMatchObject({ fix: null, status: 'idle', reason: null });
    expect(JSON.parse(memory.get(STORAGE_KEY)!).state.fix).toBeNull();
  });
});
