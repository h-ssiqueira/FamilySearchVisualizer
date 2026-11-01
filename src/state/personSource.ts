import { UnavailableError, type FamilySearchClient } from '@/api';
import type { Person, PersonId, PersonSource } from '@/domain';
import type { PersonCache } from './cache';

/**
 * Person source for the tree builder: cache first, one request per person even when asked twice
 * at the same time, and restricted/missing people reported as `null` instead of an error.
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
