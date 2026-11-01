import type { Person, PersonId } from './types';

/** Where the tree builder gets people from. `null` means unavailable (restricted, 403/404). */
export interface PersonSource {
  getPerson(id: PersonId, signal?: AbortSignal): Promise<Person | null>;
}
