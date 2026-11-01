import type { PersonId } from './types';

/** The person's own page on familysearch.org (SDD FR-16). */
export function personPageUrl(id: PersonId): string {
  return `https://www.familysearch.org/tree/person/details/${encodeURIComponent(id)}`;
}
