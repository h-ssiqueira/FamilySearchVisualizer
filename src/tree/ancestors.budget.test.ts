import { describe, expect, it } from 'vitest';
import type { Couple, Person, PersonRef, PersonSource } from '@/domain';
import { buildAncestorTree } from './ancestors';

const ref = (id: string, gender: PersonRef['gender']): PersonRef => ({
  id,
  name: id,
  gender,
  living: false,
});

function bare(id: string): Person {
  return { id, name: id, gender: 'unknown', living: false, parentSets: [], unions: [] };
}

/** A complete pedigree: every person has two parents, `depth` generations below the root. */
function completePedigree(depth: number): Map<string, Person> {
  const people = new Map<string, Person>();
  const build = (id: string, generation: number): void => {
    if (generation >= depth) {
      people.set(id, bare(id));
      return;
    }
    const couple: Couple = {
      partner1: ref(`${id}f`, 'male'),
      partner2: ref(`${id}m`, 'female'),
      children: [],
      preferred: true,
    };
    people.set(id, { ...bare(id), parentSets: [couple] });
    build(`${id}f`, generation + 1);
    build(`${id}m`, generation + 1);
  };
  build('R', 0);
  return people;
}

describe('request budget of the first batch (TC-53, NFR-02)', () => {
  it('asks for at most 31 people for 4 generations of a complete pedigree', async () => {
    const people = completePedigree(6);
    const requested: string[] = [];
    const source: PersonSource = {
      getPerson: async (id) => {
        requested.push(id);
        return people.get(id) ?? null;
      },
    };

    for await (const _tree of buildAncestorTree('R', source, { generations: 4 })) {
      // The loop is the whole point of the test: the builder yields once per generation.
    }

    expect(requested).toHaveLength(31);
    expect(new Set(requested).size).toBe(31);
  });
});
