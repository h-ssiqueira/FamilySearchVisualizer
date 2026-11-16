import { describe, expect, it } from 'vitest';
import type { Couple, Person, PersonRef, PersonSource } from '@/domain';
import { buildAncestorTree } from './ancestors';

const ref = (id: string, gender: PersonRef['gender'] = 'unknown'): PersonRef => ({
  id,
  name: `${id} Example`,
  gender,
  living: false,
});

const bare = (id: string): Person => ({
  id,
  name: `${id} Example`,
  gender: 'unknown',
  living: false,
  parentSets: [],
  unions: [],
});

const root: Person = {
  ...bare('R'),
  parentSets: [
    { partner1: ref('F', 'male'), partner2: ref('M', 'female'), children: [], preferred: true } as Couple,
  ],
};

/** The failed person's name comes from the parent entry, so the retry action can show it (FR-20). */
describe('names of the people that failed (FR-20)', () => {
  it('keeps the name of a failed person from its parent entry', async () => {
    const source: PersonSource = {
      getPerson: async (id) => {
        if (id === 'F') throw new Error('transient');
        return id === 'R' ? root : bare(id);
      },
    };
    let last: { failedNames?: Readonly<Record<string, string>> } | undefined;
    for await (const tree of buildAncestorTree('R', source, { generations: 'all' })) last = tree;
    expect(last?.failedNames).toEqual({ F: 'F Example' });
  });
});
