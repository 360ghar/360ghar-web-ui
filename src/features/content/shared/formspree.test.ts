import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseFormspreeError, sendFormspree } from './formspree';

describe('parseFormspreeError', () => {
  it('splits field errors from form errors', () => {
    const r = parseFormspreeError({ errors: [{ field: 'email', message: 'should be an email' }, { message: 'Form not found' }] });
    expect(r.fields).toEqual({ email: 'should be an email' });
    expect(r.message).toBe('Form not found');
  });

  it('reads the single error shape and ignores junk', () => {
    expect(parseFormspreeError({ error: 'Too many requests' }).message).toBe('Too many requests');
    expect(parseFormspreeError(null)).toEqual({ message: '', fields: {} });
    expect(parseFormspreeError({ errors: [{ field: 'x' }, 'bad'] })).toEqual({ message: '', fields: {} });
  });
});

describe('sendFormspree', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts JSON and reports success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await sendFormspree('abc', { email: 'a@b.co' })).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://formspree.io/f/abc');
    expect(JSON.parse(init.body)).toEqual({ email: 'a@b.co' });
  });

  it('never reports success on a failed or broken request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"errors":[{"field":"email","message":"bad"}]}', { status: 422 })));
    expect(await sendFormspree('abc', {})).toEqual({ ok: false, network: false, message: '', fields: { email: 'bad' } });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    expect(await sendFormspree('abc', {})).toMatchObject({ ok: false, network: true });
  });
});
