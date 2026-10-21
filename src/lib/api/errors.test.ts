import { describe, expect, it } from 'vitest';
import { ApiError, describeError, networkError, toApiError } from './errors';

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

describe('toApiError', () => {
  it('reads the backend error envelope', async () => {
    const e = await toApiError(json(404, { error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found' } }));
    expect(e).toBeInstanceOf(ApiError);
    expect(e.kind).toBe('not_found');
    expect(e.code).toBe('PROPERTY_NOT_FOUND');
    expect(e.message).toBe('Property not found');
  });

  it('maps 422 details.fields to request field names', async () => {
    const e = await toApiError(
      json(422, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: {
            fields: [
              { field: 'body.monthly_rent', msg: 'Value error, monthly_rent must be a positive number', type: 'value_error' },
              { field: 'query.limit', msg: 'Input should be less than or equal to 100', type: 'less_than_equal' },
              { field: 'body.monthly_rent', msg: 'second message is ignored', type: 'value_error' },
            ],
          },
        },
      }),
    );
    expect(e.kind).toBe('validation');
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.fields).toEqual({
      monthly_rent: 'monthly_rent must be a positive number',
      limit: 'Input should be less than or equal to 100',
    });
  });

  it('keeps a 422 with an empty details.fields as a plain validation error', async () => {
    const e = await toApiError(json(422, { error: { code: 'INVALID_CURSOR', message: 'Cursor does not match', details: { fields: [] } } }));
    expect(e.kind).toBe('validation');
    expect(e.fields).toEqual({});
    expect(e.message).toBe('Cursor does not match');
  });

  it('does not turn other details into form fields', async () => {
    const e = await toApiError(json(503, { error: { code: 'SERVICE_UNAVAILABLE', message: 'Busy', details: { error_code: 'DB_POOL_TIMEOUT', endpoint: '/api/v1/properties' } } }));
    expect(e.fields).toEqual({});
    expect(e.kind).toBe('unavailable');
  });

  it('ignores details.fields on a status other than 422', async () => {
    const e = await toApiError(json(400, { error: { code: 'BAD_REQUEST', message: 'No', details: { fields: [{ field: 'body.x', msg: 'bad', type: 't' }] } } }));
    expect(e.fields).toEqual({});
  });

  it('reads the 409 phone error by code', async () => {
    const e = await toApiError(json(409, { error: { code: 'PHONE_TAKEN', message: 'Phone number is already in use' } }));
    expect(e.kind).toBe('conflict');
    expect(e.code).toBe('PHONE_TAKEN');
  });

  it('does not read the old FastAPI detail shapes', async () => {
    const list = await toApiError(json(422, { detail: [{ loc: ['body', 'x'], msg: 'bad', type: 't' }] }));
    expect(list.fields).toEqual({});
    expect(list.code).toBe('HTTP_422');
    const text = await toApiError(json(400, { detail: 'plain text' }));
    expect(text.code).toBe('HTTP_400');
  });

  it('keeps Retry-After on 429', async () => {
    const e = await toApiError(json(429, { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Slow down' } }, { 'retry-after': '30' }));
    expect(e.kind).toBe('rate_limited');
    expect(e.retryAfter).toBe(30);
    expect(e.retryable).toBe(true);
  });

  it('handles a body that is not JSON', async () => {
    const e = await toApiError(new Response('<html>Bad gateway</html>', { status: 502, statusText: 'Bad Gateway' }));
    expect(e.kind).toBe('unavailable');
  });
});

describe('describeError', () => {
  it('uses clear copy for network errors', () => {
    const d = describeError(networkError(new TypeError('Failed to fetch')));
    expect(d.kind).toBe('network');
    expect(d.title).toMatch(/offline/i);
  });

  it('shows backend validation text and supports Hindi', () => {
    const e = new ApiError({ status: 422, code: 'VALIDATION_ERROR', message: 'PG listings must use purpose rent' });
    expect(describeError(e).body).toBe('PG listings must use purpose rent');
    expect(describeError(networkError(new TypeError('x')), 'hi').title).toContain('ऑफ़लाइन');
  });

  it('tells an inactive account from a missing permission', () => {
    const inactive = new ApiError({ status: 403, code: 'USER_INACTIVE', message: 'Account is inactive' });
    expect(describeError(inactive)).toMatchObject({ kind: 'forbidden', title: 'Your account is not active' });
    expect(describeError(inactive, 'hi').title).toContain('अकाउंट');
    expect(describeError(new ApiError({ status: 403, code: 'FORBIDDEN', message: 'No' })).title).toBe('You cannot do this');
  });

  it('treats unknown values as server errors', () => {
    expect(describeError(new Error('boom')).kind).toBe('server');
  });
});
