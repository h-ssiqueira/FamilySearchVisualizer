/**
 * Client side of the relay (SDD FR-34). The app asks the FamilySearch tab, through
 * `postMessage`, for the two read-only endpoints; the tab answers with its own session.
 * The app keeps the same rules as before: GET only, the allow-list is checked by the API client
 * before this module is reached, and only messages from the relay origin are accepted.
 */

export const RELAY_ORIGIN = 'https://www.familysearch.org';
const RELAY_START_URL = `${RELAY_ORIGIN}/`;
const WINDOW_NAME = 'fsv-familysearch';
const APP_CHANNEL = 'fsv-app';
const RELAY_CHANNEL = 'fsv-relay';
const HELLO_INTERVAL_MS = 500;
const WATCH_INTERVAL_MS = 1000;
const DEFAULT_HANDSHAKE_MS = 45_000;
const DEFAULT_REQUEST_MS = 30_000;

/** The part of a `Window` the relay uses; a `Window` satisfies it. */
export interface RelayTarget {
  readonly closed: boolean;
  postMessage(message: unknown, targetOrigin: string): void;
  close(): void;
}

export interface RelayMessageEvent {
  readonly origin: string;
  readonly source: unknown;
  readonly data: unknown;
}

/** Where incoming messages come from; the window in the app, a fake one in tests. */
export interface RelayBus {
  add(handler: (event: RelayMessageEvent) => void): void;
  remove(handler: (event: RelayMessageEvent) => void): void;
}

const windowBus: RelayBus = {
  add: (handler) => window.addEventListener('message', handler as unknown as EventListener),
  remove: (handler) => window.removeEventListener('message', handler as unknown as EventListener),
};

export class RelayUnavailableError extends Error {
  readonly reason: 'popup' | 'timeout';
  constructor(reason: 'popup' | 'timeout') {
    super(`Relay unavailable: ${reason}`);
    this.name = 'RelayUnavailableError';
    this.reason = reason;
  }
}

export class RelayClosedError extends Error {
  constructor() {
    super('The FamilySearch tab was closed');
    this.name = 'RelayClosedError';
  }
}

export class RelayTimeoutError extends Error {
  constructor() {
    super('The FamilySearch tab did not answer');
    this.name = 'RelayTimeoutError';
  }
}

export interface RelayOptions {
  /** Opens the FamilySearch window. Returns null when the browser blocked it. */
  open?: (url: string, name: string) => RelayTarget | null;
  bus?: RelayBus;
  /** Origin of the relay; defaults to familysearch.org. */
  origin?: string;
  handshakeTimeoutMs?: number;
  requestTimeoutMs?: number;
}

export interface RelayConnection {
  /** A `fetch` that answers through the FamilySearch tab. */
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  close(): void;
  onClose(listener: () => void): () => void;
  readonly isOpen: boolean;
}

type Dict = Record<string, unknown>;

interface Pending {
  resolve: (response: Response) => void;
  reject: (error: Error) => void;
  timer: number;
}

function isRecord(value: unknown): value is Dict {
  return typeof value === 'object' && value !== null;
}

/** A response built from the relay's reply; statuses outside HTTP's range count as bad gateway. */
function toResponse(data: Dict): Response {
  const raw = typeof data.status === 'number' ? data.status : 502;
  const status = raw >= 200 && raw <= 599 ? raw : 502;
  const headers = new Headers();
  if (typeof data.retryAfter === 'string') headers.set('Retry-After', data.retryAfter);
  const body = typeof data.body === 'string' ? data.body : '';
  return new Response(body, { status, headers });
}

/**
 * Opens the FamilySearch tab and waits until the relay in it answers the handshake. Resolves to
 * a connection; rejects when the window is blocked, when no relay answers in time, or when the
 * tab is closed before that.
 */
export function connectRelay(options: RelayOptions = {}): Promise<RelayConnection> {
  const origin = options.origin ?? RELAY_ORIGIN;
  const openTarget = options.open ?? ((url: string, name: string) => window.open(url, name));
  const bus = options.bus ?? windowBus;
  const handshakeMs = options.handshakeTimeoutMs ?? DEFAULT_HANDSHAKE_MS;
  const requestMs = options.requestTimeoutMs ?? DEFAULT_REQUEST_MS;

  // Opened synchronously, before any await, so the browser counts it as the user's click.
  const target = openTarget(RELAY_START_URL, WINDOW_NAME);
  if (!target) return Promise.reject(new RelayUnavailableError('popup'));

  let opened = true;
  let ready = false;
  let seq = 0;
  const pending = new Map<string, Pending>();
  const closeListeners = new Set<() => void>();
  let resolveReady: (connection: RelayConnection) => void = () => undefined;
  let rejectReady: (reason: Error) => void = () => undefined;
  const readyPromise = new Promise<RelayConnection>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  let hello: number | undefined;
  let watch: number | undefined;
  let deadline: number | undefined;

  const teardown = (reason: Error): void => {
    if (!opened) return;
    opened = false;
    window.clearInterval(hello);
    window.clearInterval(watch);
    window.clearTimeout(deadline);
    bus.remove(onMessage);
    for (const entry of pending.values()) {
      window.clearTimeout(entry.timer);
      entry.reject(reason);
    }
    pending.clear();
    rejectReady(reason);
    for (const listener of [...closeListeners]) listener();
    closeListeners.clear();
  };

  const onMessage = (event: RelayMessageEvent): void => {
    if (!opened || event.origin !== origin || event.source !== target) return;
    const data = event.data;
    if (!isRecord(data) || data.channel !== RELAY_CHANNEL) return;
    if (data.type === 'ready') {
      if (!ready) {
        ready = true;
        window.clearInterval(hello);
        window.clearTimeout(deadline);
        resolveReady(connection);
      }
      return;
    }
    if (data.type === 'response' && typeof data.id === 'string') {
      const entry = pending.get(data.id);
      if (!entry) return;
      pending.delete(data.id);
      window.clearTimeout(entry.timer);
      entry.resolve(toResponse(data));
    }
  };

  const send = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (!opened) return Promise.reject(new RelayClosedError());
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const headers = new Headers(init?.headers);
    const authorization = headers.get('Authorization');
    const token = authorization ? authorization.replace(/^Bearer\s+/i, '') : undefined;
    const id = String(++seq);
    return new Promise<Response>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        pending.delete(id);
        reject(new RelayTimeoutError());
      }, requestMs);
      pending.set(id, { resolve, reject, timer });
      target.postMessage(
        {
          channel: APP_CHANNEL,
          type: 'request',
          id,
          method: 'GET',
          url,
          acceptLanguage: headers.get('Accept-Language') ?? 'en',
          ...(token ? { token } : {}),
        },
        origin,
      );
    });
  };

  const connection: RelayConnection = {
    fetch: send,
    close: () => teardown(new RelayClosedError()),
    onClose: (listener) => {
      closeListeners.add(listener);
      return () => {
        closeListeners.delete(listener);
      };
    },
    get isOpen() {
      return opened;
    },
  };

  hello = window.setInterval(() => {
    if (!ready && opened) target.postMessage({ channel: APP_CHANNEL, type: 'hello' }, origin);
  }, HELLO_INTERVAL_MS);
  watch = window.setInterval(() => {
    if (target.closed) teardown(new RelayClosedError());
  }, WATCH_INTERVAL_MS);
  deadline = window.setTimeout(() => {
    if (!ready) teardown(new RelayUnavailableError('timeout'));
  }, handshakeMs);

  bus.add(onMessage);
  target.postMessage({ channel: APP_CHANNEL, type: 'hello' }, origin);
  return readyPromise;
}
