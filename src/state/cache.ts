import type { Person, PersonId } from '@/domain';

/** Session cache of full persons: the same person is never requested twice (SDD FR-10). */
export class PersonCache {
  private readonly people = new Map<PersonId, Person>();

  get(id: PersonId): Person | undefined {
    return this.people.get(id);
  }

  set(person: Person): void {
    this.people.set(person.id, person);
  }

  has(id: PersonId): boolean {
    return this.people.has(id);
  }

  clear(): void {
    this.people.clear();
  }

  get size(): number {
    return this.people.size;
  }
}

export const personCache = new PersonCache();
