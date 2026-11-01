import { createFamilySearchClient, RequestQueue, type FamilySearchClient } from '@/api';
import { tokenStore } from '@/auth';
import type { AppConfig } from '@/config';
import type { PersonSource } from '@/domain';
import { acceptLanguageFor, getLocale } from '@/i18n';
import { createPersonSource, personCache } from '@/state';

export interface Services {
  client: FamilySearchClient;
  source: PersonSource;
  /** Exposed so that the screen can show FamilySearch's `Retry-After` wait (FR-09). */
  queue?: RequestQueue;
}

export interface ServiceOptions {
  /** How requests leave the browser. Defaults to a direct fetch; the relay supplies its own. */
  transport?: typeof fetch;
  /** Fallback mode needs the token; through the relay the session authorises the calls. */
  requireToken?: boolean;
}

/** Wires the client to the transport, the token, the UI language, one queue and the cache. */
export function createServices(config: AppConfig, options: ServiceOptions = {}): Services {
  // Throttling is normal on large trees: give a request more patience before it counts as a
  // failure of that one person (SDD FR-09, FR-33).
  const queue = new RequestQueue({ concurrency: 4, maxRetries: 8 });
  const client = createFamilySearchClient({
    apiBase: config.apiBase,
    getToken: () => tokenStore.get(),
    getAcceptLanguage: () => acceptLanguageFor(getLocale()),
    queue,
    fetchImpl: options.transport,
    requireToken: options.requireToken ?? true,
  });
  return { client, source: createPersonSource(client, personCache), queue };
}
