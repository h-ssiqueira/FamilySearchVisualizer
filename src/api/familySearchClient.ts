import type { CurrentUser, Person, PersonId } from '@/domain';
import { isAllowedRequest } from './allowList';
import {
  HttpError,
  MissingTokenError,
  NotAllowedError,
  RetryAfterError,
  SchemaError,
  UnauthorizedError,
  UnavailableError,
} from './errors';
import { parseCurrentUser, parsePerson } from './mappers';
import type { RequestQueue } from './requestQueue';

export interface FamilySearchClient {
  getCurrentUser(signal?: AbortSignal): Promise<CurrentUser>;
  getPersonDetails(id: PersonId, signal?: AbortSignal): Promise<Person>;
}

export interface ClientOptions {
  apiBase: string;
  getToken: () => string | null;
  /** Value for the `Accept-Language` header (the response text is localized to it). */
  getAcceptLanguage: () => string;
  queue: RequestQueue;
  /** How requests leave the browser. The relay supplies its own (see src/relay). */
  fetchImpl?: typeof fetch;
  /**
   * With a token (fallback mode) the client must have one. Through the relay the user's own
   * session authorises the calls, so no token is needed.
   */
  requireToken?: boolean;
  /** Retries of a request that failed at network level (NFR-03, TC-42). Default 3. */
  networkRetries?: number;
  /** First wait between network retries; doubles each time. Default 1000 ms. */
  backoffBaseMs?: number;
}

const DEFAULT_RETRY_MS = 5_000;
const MAX_RETRY_MS = 5 * 60_000;
const DEFAULT_NETWORK_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1_000;

/** `Retry-After` is either a number of seconds or an HTTP date. */
export function parseRetryAfter(value: string | null, now: number = Date.now()): number {
  const clamp = (ms: number): number => Math.min(MAX_RETRY_MS, Math.max(0, ms));
  const trimmed = value?.trim() ?? '';
  if (trimmed === '') return DEFAULT_RETRY_MS;
  const seconds = Number(trimmed);
  if (Number.isFinite(seconds)) return clamp(seconds * 1000);
  const date = Date.parse(trimmed);
  return Number.isNaN(date) ? DEFAULT_RETRY_MS : clamp(date - now);
}

function abortError(): DOMException {
  return new DOMException('The request was aborted', 'AbortError');
}

/** Waits `ms`, or stops at once when the signal is aborted. */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort(): void {
      clearTimeout(timer);
      reject(abortError());
    }
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export function createFamilySearchClient(options: ClientOptions): FamilySearchClient {
  const doFetch: typeof fetch = options.fetchImpl ?? ((input, init) => fetch(input, init));
  const requireToken = options.requireToken ?? true;
  const networkRetries = options.networkRetries ?? DEFAULT_NETWORK_RETRIES;
  const backoffBase = options.backoffBaseMs ?? DEFAULT_BACKOFF_MS;

  /**
   * A network failure (the request never got an answer) is retried with exponential back-off.
   * An HTTP answer, even an error one, is not retried here: throttling is handled by the queue.
   */
  async function fetchWithBackoff(url: string, init: RequestInit, signal: AbortSignal): Promise<Response> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await doFetch(url, { ...init, signal });
      } catch (error) {
        if (signal.aborted || !(error instanceof TypeError) || attempt >= networkRetries) {
          throw error;
        }
        await sleep(backoffBase * 2 ** attempt, signal);
      }
    }
  }

  function requestJson(path: string, signal?: AbortSignal): Promise<unknown> {
    return options.queue.enqueue(async (taskSignal) => {
      const url = new URL(path, options.apiBase).toString();
      if (!isAllowedRequest(url, 'GET', options.apiBase)) throw new NotAllowedError();
      const token = options.getToken();
      if (!token && requireToken) throw new MissingTokenError();

      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Accept-Language': options.getAcceptLanguage(),
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36',
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetchWithBackoff(
        url,
        { method: 'GET', headers, credentials: 'omit', referrerPolicy: 'no-referrer' },
        taskSignal,
      );

      if (response.status === 401) throw new UnauthorizedError();
      if (response.status === 403 || response.status === 404) {
        throw new UnavailableError(response.status);
      }
      if (response.status === 429 || response.status === 503) {
        throw new RetryAfterError(parseRetryAfter(response.headers.get('Retry-After')));
      }
      if (!response.ok) throw new HttpError(response.status);

      try {
        return (await response.json()) as unknown;
      } catch {
        throw new SchemaError(['(json)']);
      }
    }, signal);
  }

  return {
    async getCurrentUser(signal) {
      return parseCurrentUser(await requestJson('/platform/users/current', signal));
    },
    async getPersonDetails(id, signal) {
      const path = `/service/tree/tree-data/v8/person/${encodeURIComponent(id)}/details`;
      return parsePerson(await requestJson(path, signal));
    },
  };
}
