import { createFamilySearchClient, RequestQueue, type FamilySearchClient } from '@/api';
import { tokenStore } from '@/auth';
import type { AppConfig } from '@/config';
import type { PersonSource } from '@/domain';
import { acceptLanguageFor, getLocale } from '@/i18n';
import { createPersonSource, personCache } from '@/state';

export interface Services {
  client: FamilySearchClient;
  source: PersonSource;
}

/** Wires the FamilySearch client to the token, the UI language, one request queue and the cache. */
export function createServices(config: AppConfig): Services {
  const queue = new RequestQueue({ concurrency: 4 });
  const client = createFamilySearchClient({
    apiBase: config.apiBase,
    getToken: () => tokenStore.get(),
    getAcceptLanguage: () => acceptLanguageFor(getLocale()),
    queue,
  });
  return { client, source: createPersonSource(client, personCache) };
}
