import type { PersonId, PersonSource } from '@/domain';
import { SessionExpiredError, type Person } from '@/domain';
import { HttpError, UnavailableError, type FamilySearchClient } from '@/api';
import type { PersonCache } from './cache';

/**
 * Person source for the tree builders: cache first, one request per person even when asked twice
 * at the same time. No data (restricted, missing) becomes `null`; a session that has expired is
 * rethrown; any other failure is rethrown so that the builder can report that one person.
 */
export function createPersonSource(client: FamilySearchClient, cache: PersonCache): PersonSource {
  const inFlight = new Map<PersonId, Promise<Person | null>>();

  return {
    async getPerson(id, signal) {
      const cached = cache.get(id);
      if (cached) return cached;
      const pending = inFlight.get(id);
      if (pending) return pending;

      const request = client
        .getPersonDetails(id, signal)
        .then((person): Person | null => {
          cache.set(person);
          return person;
        })
        .catch((error: unknown): Person | null => {
          if (error instanceof UnavailableError) return null;
          if (error instanceof SessionExpiredError) throw error;
          // Logged by class and status only: never the payload (SDD NFR-05).
          console.warn(
            'FamilySearch request failed:',
            error instanceof Error ? error.name : 'unknown',
            error instanceof HttpError ? error.status : '',
          );
          throw error;
        })
        .finally(() => {
          inFlight.delete(id);
        });
      inFlight.set(id, request);
      return request;
    },
  };
}
