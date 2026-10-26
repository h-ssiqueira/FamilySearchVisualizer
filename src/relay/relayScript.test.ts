import { describe, expect, it, vi } from 'vitest';
import { ALLOWED_PATHS } from '@/api/allowList';
import relaySource from '../../relay/fsv-relay.js?raw';

const APP = 'https://h-ssiqueira.github.io';

interface RelayEvent {
  origin: string;
  source: unknown;
  data: unknown;
}

/** Runs the relay script as the browser would on familysearch.org, opened by the app. */
function runRelay(fetchImpl: typeof fetch) {
  const app = { postMessage: vi.fn() };
  const listeners: Array<(event: RelayEvent) => void> = [];
  const fakeWindow = {
    opener: app,
    addEventListener: (type: string, listener: (event: RelayEvent) => void) => {
      if (type === 'message') listeners.push(listener);
    },
  };
  const alertSpy = vi.fn();
  new Function('window', 'fetch', 'alert', relaySource)(fakeWindow, fetchImpl, alertSpy);
  const send = (data: unknown, origin = APP, source: unknown = app) => {
    for (const listener of listeners) listener({ origin, source, data });
  };
  return { app, send, alertSpy };
}

const USER_URL = 'https://www.familysearch.org/platform/users/current';
const PERSON_URL = 'https://www.familysearch.org/service/tree/tree-data/v8/person/XXXX-XXX/details';

describe('relay script (SDD FR-34)', () => {
  it('answers the handshake with ready, to the app origin only', () => {
    const { app, send } = runRelay(vi.fn() as unknown as typeof fetch);
    send({ channel: 'fsv-app', type: 'hello' });
    expect(app.postMessage).toHaveBeenCalledWith({ channel: 'fsv-relay', type: 'ready' }, APP);
  });

  it('answers an allowed GET with the user session and forwards the language and token', async () => {
    const fetchMock = vi.fn(async () => new Response('{"users":[]}', { status: 200 }));
    const { app, send } = runRelay(fetchMock as unknown as typeof fetch);
    send({
      channel: 'fsv-app',
      type: 'request',
      id: '1',
      method: 'GET',
      url: USER_URL,
      acceptLanguage: 'pt',
      token: 'synthetic-token',
    });
    await vi.waitFor(() => expect(app.postMessage).toHaveBeenCalled());

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(USER_URL);
    expect(init.credentials).toBe('include');
    expect((init.headers as Record<string, string>)['Accept-Language']).toBe('pt');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer synthetic-token');
    expect(app.postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ channel: 'fsv-relay', type: 'response', id: '1', status: 200 }),
      APP,
    );
  });

  it('answers a person request and passes the status and Retry-After through', async () => {
    const fetchMock = vi.fn(
      async () => new Response('', { status: 429, headers: { 'Retry-After': '7' } }),
    );
    const { app, send } = runRelay(fetchMock as unknown as typeof fetch);
    send({ channel: 'fsv-app', type: 'request', id: '2', method: 'GET', url: PERSON_URL });
    await vi.waitFor(() => expect(app.postMessage).toHaveBeenCalled());
    expect(app.postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: '2', status: 429, retryAfter: '7' }),
      APP,
    );
  });

  it('refuses an endpoint outside the allow-list without calling FamilySearch', () => {
    const fetchMock = vi.fn();
    const { app, send } = runRelay(fetchMock as unknown as typeof fetch);
    send({
      channel: 'fsv-app',
      type: 'request',
      id: '3',
      method: 'GET',
      url: 'https://www.familysearch.org/platform/tree/ancestry?person=XXXX-XXX',
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(app.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ id: '3', status: 403 }),
      APP,
    );
  });

  it('refuses any method other than GET and any other host', () => {
    const fetchMock = vi.fn();
    const { app, send } = runRelay(fetchMock as unknown as typeof fetch);
    send({ channel: 'fsv-app', type: 'request', id: '4', method: 'POST', url: USER_URL });
    send({
      channel: 'fsv-app',
      type: 'request',
      id: '5',
      method: 'GET',
      url: 'https://evil.example/platform/users/current',
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(app.postMessage).toHaveBeenCalledWith(expect.objectContaining({ id: '4', status: 403 }), APP);
    expect(app.postMessage).toHaveBeenCalledWith(expect.objectContaining({ id: '5', status: 403 }), APP);
  });

  it('ignores messages from another origin or from a window that is not the opener', () => {
    const fetchMock = vi.fn();
    const { app, send } = runRelay(fetchMock as unknown as typeof fetch);
    send({ channel: 'fsv-app', type: 'hello' }, 'https://evil.example');
    send({ channel: 'fsv-app', type: 'hello' }, APP, {});
    expect(app.postMessage).not.toHaveBeenCalled();
  });

  it('ignores messages that are not from the app channel', () => {
    const { app, send } = runRelay(vi.fn() as unknown as typeof fetch);
    send({ type: 'hello' });
    expect(app.postMessage).not.toHaveBeenCalled();
  });

  it('keeps its list of endpoints identical to the app (NFR-11)', () => {
    for (const pattern of ALLOWED_PATHS) {
      expect(relaySource).toContain(pattern.toString());
    }
  });
});
