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
  fetchImpl?: typeof fetch;
}

const DEFAULT_RETRY_MS = 5_000;
const MAX_RETRY_MS = 5 * 60_000;

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

export function createFamilySearchClient(options: ClientOptions): FamilySearchClient {
  const doFetch: typeof fetch = options.fetchImpl ?? ((input, init) => fetch(input, init));

  function requestJson(path: string, signal?: AbortSignal): Promise<unknown> {
    return options.queue.enqueue(async (taskSignal) => {
      const url = new URL(path, options.apiBase).toString();
      if (!isAllowedRequest(url, 'GET', options.apiBase)) throw new NotAllowedError();
      const token = options.getToken();
      if (!token) throw new MissingTokenError();

      const response = await doFetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Accept-Language': options.getAcceptLanguage(),
          Authorization: `Bearer ${token}`,
        },
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: taskSignal,
      });

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
