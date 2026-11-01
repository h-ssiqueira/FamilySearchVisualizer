import { describe, expect, it } from 'vitest';
import type { Couple, Gender, Person, PersonRef, PersonSource, ViewTree } from '@/domain';
import { buildAncestorTree } from './ancestors';
import { hasMoreAncestors } from './family';

const ref = (id: string, gender: Gender = 'unknown'): PersonRef => ({
  id,
  name: id,
  gender,
  living: false,
});

function person(id: string, parents: PersonRef[] = []): Person {
  const [partner1, partner2] = parents;
  const couple: Couple = { children: [], preferred: true };
  if (partner1) couple.partner1 = partner1;
  if (partner2) couple.partner2 = partner2;
  return {
    id,
    name: id,
    gender: 'unknown',
    living: false,
    parentSets: parents.length > 0 ? [couple] : [],
    unions: [],
  };
}

function sourceOf(list: Person[]): PersonSource {
  const byId = new Map(list.map((entry) => [entry.id, entry] as const));
  return { getPerson: async (id) => byId.get(id) ?? null };
}

async function trees(list: Person[], generations: number | 'all'): Promise<ViewTree[]> {
  const out: ViewTree[] = [];
  for await (const tree of buildAncestorTree('R', sourceOf(list), { generations })) out.push(tree);
  return out;
}

const lastOf = (list: ViewTree[]): ViewTree => {
  const last = list.at(-1);
  if (!last) throw new Error('no tree was built');
  return last;
};

describe('pending ancestors (FR-31)', () => {
  it('lists the known parents of every branch that were not loaded yet', async () => {
    const both = [
      person('R', [ref('F', 'male'), ref('M', 'female')]),
      person('F', [ref('GF1', 'male'), ref('GM1', 'female')]),
      person('M', [ref('GF2', 'male'), ref('GM2', 'female')]),
      person('GF1'),
      person('GM1'),
      person('GF2'),
      person('GM2'),
    ];
    const result = await trees(both, 1);
    expect(lastOf(result).pending.sort()).toEqual(['GF1', 'GF2', 'GM1', 'GM2']);
    expect(hasMoreAncestors(lastOf(result))).toBe(true);
  });

  it('still offers more when only one branch continues and the other has ended', async () => {
    const oneBranch = [
      person('R', [ref('F', 'male'), ref('M', 'female')]),
      person('F', [ref('GF1', 'male'), ref('GM1', 'female')]),
      person('M'),
      person('GF1'),
      person('GM1'),
    ];
    const result = await trees(oneBranch, 1);
    expect(lastOf(result).pending.sort()).toEqual(['GF1', 'GM1']);
    expect(hasMoreAncestors(lastOf(result))).toBe(true);
  });

  it('reports what is about to be loaded while it streams, and nothing at the end', async () => {
    const chain = [
      person('R', [ref('F', 'male'), ref('M', 'female')]),
      person('F'),
      person('M'),
    ];
    const result = await trees(chain, 'all');
    expect(result[0]?.pending.sort()).toEqual(['F', 'M']);
    expect(lastOf(result).pending).toEqual([]);
    expect(hasMoreAncestors(lastOf(result))).toBe(false);
  });

  it('does not list an ancestor that is already on the tree (pedigree collapse)', async () => {
    const collapse = [
      person('R', [ref('F'), ref('M')]),
      person('F', [ref('P'), ref('Q1')]),
      person('M', [ref('P'), ref('Q2')]),
      person('P'),
      person('Q1'),
      person('Q2'),
    ];
    const result = await trees(collapse, 1);
    expect(lastOf(result).pending.sort()).toEqual(['P', 'Q1', 'Q2']);
    const deeper = await trees(collapse, 2);
    expect(lastOf(deeper).pending).toEqual([]);
  });

  it('stops offering more once the unloadable parents have been tried', async () => {
    const gap = [person('R', [ref('F', 'male'), ref('M', 'female')]), person('M')];
    const result = await trees(gap, 'all');
    expect(lastOf(result).pending).toEqual([]);
    expect(hasMoreAncestors(lastOf(result))).toBe(false);
  });
});
