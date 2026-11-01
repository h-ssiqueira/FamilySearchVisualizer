import type { Person, PersonId } from './types';

/**
 * Thrown when the session is over (for example a 401): the whole load must stop and the user
 * must sign in again (SDD FR-04). Any other error is a transient failure of one person (FR-33).
 */
export class SessionExpiredError extends Error {
  constructor(message = 'Session expired') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

/**
 * The data of one person came back in an unexpected shape (SDD TC-15). The person keeps its
 * place on the tree, marked as unexpected; the rest of the tree goes on.
 */
export class InvalidDataError extends Error {
  constructor(message = 'Unexpected response shape') {
    super(message);
    this.name = 'InvalidDataError';
  }
}

/**
 * Where the tree builders get people from. `null` means there is no data for this person
 * (missing or restricted): a branch ends there. Transient errors are thrown.
 */
export interface PersonSource {
  getPerson(id: PersonId, signal?: AbortSignal): Promise<Person | null>;
}
