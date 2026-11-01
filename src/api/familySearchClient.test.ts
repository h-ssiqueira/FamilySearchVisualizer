// @vitest-environment node
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { syntheticCurrentUserResponse, syntheticPersonResponse } from '@/test/fixtures/synthetic';
import {
  HttpError,
  MissingTokenError,
  NotAllowedError,
  RetryAfterError,
  SchemaError,
  UnauthorizedError,
  UnavailableError,
} from './errors';
import { createFamilySearchClient, parseRetryAfter } from './familySearchClient';
import { RequestQueue } from './requestQueue';

const BASE = 'https://www.familysearch.org';
const PERSON_URL = `${BASE}/service/tree/tree-data/v8/person/XXXX-XXX/details`;
const USER_URL = `${BASE}/platform/users/current`;

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeClient(token: string | null = 'synthetic-token') {
  return createFamilySearchClient({
    apiBase: BASE,
    getToken: () => token,
    getAcceptLanguage: () => 'pt',
    queue: new RequestQueue({ concurrency: 2, maxRetries: 1 }),
  });
}

describe('createFamilySearchClient', () => {
  it('sends the Bearer token and the language, and maps the person', async () => {
    const captured: { headers?: Headers } = {};
    server.use(
      http.get(PERSON_URL, ({ request }) => {
        captured.headers = request.headers;
        return HttpResponse.json(syntheticPersonResponse);
      }),
    );

    const person = await makeClient().getPersonDetails('XXXX-XXX');

    expect(person.name).toBe('John Example');
    expect(captured.headers?.get('authorization')).toBe('Bearer synthetic-token');
    expect(captured.headers?.get('accept-language')).toBe('pt');
    expect(captured.headers?.get('accept')).toBe('application/json');
  });

  it('maps the current user', async () => {
    server.use(http.get(USER_URL, () => HttpResponse.json(syntheticCurrentUserResponse)));
    const user = await makeClient().getCurrentUser();
    expect(user.personId).toBe('XXXX-XXX');
    expect(user.preferredLanguage).toBe('pt');
  });

  it('fails without a token and without making a request', async () => {
    await expect(makeClient(null).getCurrentUser()).rejects.toBeInstanceOf(MissingTokenError);
  });

  it('refuses an id that would leave the allowed endpoint', async () => {
    await expect(makeClient().getPersonDetails('../../x')).rejects.toBeInstanceOf(NotAllowedError);
  });

  it('maps HTTP 401 to UnauthorizedError', async () => {
    server.use(http.get(USER_URL, () => new HttpResponse(null, { status: 401 })));
    await expect(makeClient().getCurrentUser()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('maps HTTP 403 and 404 to UnavailableError (TC-43)', async () => {
    server.use(http.get(PERSON_URL, () => new HttpResponse(null, { status: 404 })));
    await expect(makeClient().getPersonDetails('XXXX-XXX')).rejects.toMatchObject({
      name: 'UnavailableError',
      status: 404,
    });
    server.use(http.get(PERSON_URL, () => new HttpResponse(null, { status: 403 })));
    await expect(makeClient().getPersonDetails('XXXX-XXX')).rejects.toBeInstanceOf(UnavailableError);
  });

  it('maps other failures to HttpError', async () => {
    server.use(http.get(USER_URL, () => new HttpResponse(null, { status: 500 })));
    await expect(makeClient().getCurrentUser()).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
    });
    expect(new HttpError(500)).toBeInstanceOf(Error);
  });

  it('reports a body that is not JSON as a schema problem', async () => {
    server.use(
      http.get(
        USER_URL,
        () =>
          new HttpResponse('not json', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    );
    await expect(makeClient().getCurrentUser()).rejects.toBeInstanceOf(SchemaError);
  });

  it('retries once after HTTP 429 with Retry-After (TC-40)', async () => {
    let calls = 0;
    server.use(
      http.get(PERSON_URL, () => {
        calls += 1;
        if (calls === 1) return new HttpResponse(null, { status: 429, headers: { 'Retry-After': '0' } });
        return HttpResponse.json(syntheticPersonResponse);
      }),
    );
    const person = await makeClient().getPersonDetails('XXXX-XXX');
    expect(person.id).toBe('XXXX-XXX');
    expect(calls).toBe(2);
  });

  it('stops retrying when the throttling does not end', async () => {
    let calls = 0;
    server.use(
      http.get(PERSON_URL, () => {
        calls += 1;
        return new HttpResponse(null, { status: 503, headers: { 'Retry-After': '0' } });
      }),
    );
    await expect(makeClient().getPersonDetails('XXXX-XXX')).rejects.toBeInstanceOf(RetryAfterError);
    expect(calls).toBe(2);
  });
});

describe('parseRetryAfter', () => {
  it('reads seconds, clamps them and falls back to a default', () => {
    expect(parseRetryAfter('3')).toBe(3_000);
    expect(parseRetryAfter('0')).toBe(0);
    expect(parseRetryAfter('-5')).toBe(0);
    expect(parseRetryAfter('99999')).toBe(300_000);
    expect(parseRetryAfter(null)).toBe(5_000);
    expect(parseRetryAfter('')).toBe(5_000);
    expect(parseRetryAfter('soon')).toBe(5_000);
  });

  it('reads an HTTP date relative to now', () => {
    const now = Date.parse('Wed, 21 Oct 2015 07:28:00 GMT');
    expect(parseRetryAfter('Wed, 21 Oct 2015 07:28:10 GMT', now)).toBe(10_000);
    expect(parseRetryAfter('Wed, 21 Oct 2015 07:27:00 GMT', now)).toBe(0);
  });
});
