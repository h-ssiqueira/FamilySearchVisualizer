import { describe, expect, it } from 'vitest';
import type { Couple, Person, PersonRef, PersonSource, ViewTree } from '@/domain';
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

function withParents(id: string, father: PersonRef, mother: PersonRef): Person {
  const couple: Couple = { partner1: father, partner2: mother, children: [], preferred: true };
  return { ...bare(id), parentSets: [couple] };
}

async function lastTree(source: PersonSource, generations: number | 'all' = 'all'): Promise<ViewTree> {
  let last: ViewTree | undefined;
  for await (const tree of buildAncestorTree('R', source, { generations })) last = tree;
  if (!last) throw new Error('no tree was built');
  return last;
}

describe('unavailable people (TC-43, FR-38)', () => {
  it('draws a parent with no data as an unavailable card and does not go further up', async () => {
    const people = new Map<string, Person | null>([
      ['R', withParents('R', ref('F', 'male'), ref('M', 'female'))],
      ['F', null],
      ['M', bare('M')],
    ]);
    const requested: string[] = [];
    const source: PersonSource = {
      getPerson: async (id) => {
        requested.push(id);
        return people.get(id) ?? null;
      },
    };

    const last = await lastTree(source);

    const father = last.nodes.find((node) => node.id === 'F');
    expect(father?.person).toMatchObject({ name: 'F Example', unavailable: true });
    expect(last.failed).toEqual([]);
    expect(last.pending).toEqual([]);
    expect(requested).not.toContain('FF');
  });
});
