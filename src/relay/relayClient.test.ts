import { describe, expect, it } from 'vitest';
import {
  connectRelay,
  RELAY_ORIGIN,
  RelayClosedError,
  RelayTimeoutError,
  RelayUnavailableError,
  type RelayBus,
  type RelayMessageEvent,
  type RelayTarget,
} from './relayClient';

class FakeTarget implements RelayTarget {
  closed = false;
  readonly sent: unknown[] = [];
  readonly origins: string[] = [];
  postMessage(message: unknown, origin: string): void {
    this.sent.push(message);
    this.origins.push(origin);
  }
  close(): void {
    this.closed = true;
  }
}

function fakeBus() {
  const handlers = new Set<(event: RelayMessageEvent) => void>();
  const bus: RelayBus = {
    add: (handler) => {
      handlers.add(handler);
    },
    remove: (handler) => {
      handlers.delete(handler);
    },
  };
  const emit = (event: RelayMessageEvent) => {
    for (const handler of [...handlers]) handler(event);
  };
  return { bus, emit };
}

const fromRelay = (target: FakeTarget, data: unknown, origin = RELAY_ORIGIN): RelayMessageEvent => ({
  origin,
  source: target,
  data,
});

const READY = { channel: 'fsv-relay', type: 'ready' };

describe('connectRelay (SDD FR-34)', () => {
  it('resolves once the relay in the FamilySearch tab answers the handshake', async () => {
    const target = new FakeTarget();
    const { bus, emit } = fakeBus();
    const pending = connectRelay({ open: () => target, bus, handshakeTimeoutMs: 2000 });
    expect(target.sent[0]).toEqual({ channel: 'fsv-app', type: 'hello' });
    expect(target.origins[0]).toBe(RELAY_ORIGIN);

    emit(fromRelay(target, READY));
    const connection = await pending;
    expect(connection.isOpen).toBe(true);
    connection.close();
  });

  it('rejects when the browser blocks the window', async () => {
    await expect(connectRelay({ open: () => null, bus: fakeBus().bus })).rejects.toMatchObject({
      name: 'RelayUnavailableError',
      reason: 'popup',
    });
  });

  it('rejects when no relay answers in time', async () => {
    const target = new FakeTarget();
    const error = await connectRelay({
      open: () => target,
      bus: fakeBus().bus,
      handshakeTimeoutMs: 30,
    }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(RelayUnavailableError);
    expect((error as RelayUnavailableError).reason).toBe('timeout');
  });

  it('ignores a ready message from another origin', async () => {
    const target = new FakeTarget();
    const { bus, emit } = fakeBus();
    const pending = connectRelay({
      open: () => target,
      bus,
      handshakeTimeoutMs: 30,
    }).catch((caught: unknown) => caught);
    emit(fromRelay(target, READY, 'https://evil.example'));
    expect(await pending).toBeInstanceOf(RelayUnavailableError);
  });

  it('sends a request and turns the relay reply into a Response', async () => {
    const target = new FakeTarget();
    const { bus, emit } = fakeBus();
    const connecting = connectRelay({ open: () => target, bus });
    emit(fromRelay(target, READY));
    const connection = await connecting;

    const response = connection.fetch('https://www.familysearch.org/platform/users/current', {
      headers: { 'Accept-Language': 'pt', Authorization: 'Bearer synthetic-token' },
    });
    const request = target.sent.at(-1) as { id: string; url: string; token?: string };
    expect(request).toMatchObject({
      channel: 'fsv-app',
      type: 'request',
      method: 'GET',
      acceptLanguage: 'pt',
      token: 'synthetic-token',
    });

    emit(
      fromRelay(target, {
        channel: 'fsv-relay',
        type: 'response',
        id: request.id,
        status: 200,
        body: '{"ok":true}',
      }),
    );
    const result = await response;
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ ok: true });
    connection.close();
  });

  it('keeps Retry-After so the client can pause the queue (FR-09)', async () => {
    const target = new FakeTarget();
    const { bus, emit } = fakeBus();
    const connecting = connectRelay({ open: () => target, bus });
    emit(fromRelay(target, READY));
    const connection = await connecting;

    const response = connection.fetch('https://www.familysearch.org/platform/users/current');
    const request = target.sent.at(-1) as { id: string };
    emit(
      fromRelay(target, {
        channel: 'fsv-relay',
        type: 'response',
        id: request.id,
        status: 429,
        retryAfter: '7',
        body: '',
      }),
    );
    const result = await response;
    expect(result.status).toBe(429);
    expect(result.headers.get('Retry-After')).toBe('7');
    connection.close();
  });

  it('ignores replies that come from a different origin', async () => {
    const target = new FakeTarget();
    const { bus, emit } = fakeBus();
    const connecting = connectRelay({ open: () => target, bus, requestTimeoutMs: 30 });
    emit(fromRelay(target, READY));
    const connection = await connecting;

    const response = connection.fetch('https://www.familysearch.org/platform/users/current');
    const request = target.sent.at(-1) as { id: string };
    emit(
      fromRelay(
        target,
        { channel: 'fsv-relay', type: 'response', id: request.id, status: 200, body: '{}' },
        'https://evil.example',
      ),
    );
    await expect(response).rejects.toBeInstanceOf(RelayTimeoutError);
    connection.close();
  });

  it('times out a request that never gets a reply', async () => {
    const target = new FakeTarget();
    const { bus, emit } = fakeBus();
    const connecting = connectRelay({ open: () => target, bus, requestTimeoutMs: 20 });
    emit(fromRelay(target, READY));
    const connection = await connecting;
    await expect(connection.fetch('https://www.familysearch.org/platform/users/current')).rejects.toBeInstanceOf(
      RelayTimeoutError,
    );
    connection.close();
  });

  it('tells the listeners and refuses new requests once it is closed', async () => {
    const target = new FakeTarget();
    const { bus, emit } = fakeBus();
    const connecting = connectRelay({ open: () => target, bus });
    emit(fromRelay(target, READY));
    const connection = await connecting;

    let notified = 0;
    connection.onClose(() => {
      notified += 1;
    });
    connection.close();
    expect(notified).toBe(1);
    expect(connection.isOpen).toBe(false);
    await expect(connection.fetch('https://www.familysearch.org/platform/users/current')).rejects.toBeInstanceOf(
      RelayClosedError,
    );
  });
});
