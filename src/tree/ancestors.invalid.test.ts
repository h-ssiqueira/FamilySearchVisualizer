import { describe, expect, it } from 'vitest';
import { InvalidDataError, type Couple, type Person, type PersonRef, type PersonSource, type ViewTree } from '@/domain';
import { buildAncestorTree } from './ancestors';
import { buildFamilyView, hasMoreAncestors } from './family';

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

const couple = (partner1: PersonRef, partner2: PersonRef | undefined, children: PersonRef[]): Couple => ({
  partner1,
  ...(partner2 ? { partner2 } : {}),
  children,
  preferred: true,
});

const root: Person = {
  ...bare('R'),
  parentSets: [couple(ref('F', 'male'), ref('M', 'female'), [ref('R', 'male')])],
};
const father: Person = {
  ...bare('F'),
  parentSets: [couple(ref('GF', 'male'), undefined, [ref('F', 'male')])],
};
const byId = new Map<string, Person>([
  ['R', root],
  ['F', father],
  ['M', bare('M')],
  ['GF', bare('GF')],
]);

async function collect(source: PersonSource): Promise<ViewTree[]> {
  const out: ViewTree[] = [];
  for await (const tree of buildAncestorTree('R', source, { generations: 'all' })) out.push(tree);
  return out;
}

function lastOf(list: ViewTree[]): ViewTree {
  const last = list.at(-1);
  if (!last) throw new Error('no tree was built');
  return last;
}

/** The father's data came back in an unexpected shape. */
const malformedFather = (requested: string[] = []): PersonSource => ({
  getPerson: async (id) => {
    requested.push(id);
    if (id === 'F') throw new InvalidDataError('unexpected shape');
    return byId.get(id) ?? null;
  },
});

describe('unexpected response (TC-15)', () => {
  it('keeps the person on the tree, marked, with the name from the parent entry', async () => {
    const last = lastOf(await collect(malformedFather()));
    const node = last.nodes.find((entry) => entry.id === 'F');
    expect(node).toBeDefined();
    expect(node?.person).toMatchObject({ name: 'F Example', invalid: true });
  });

  it('does not stop the other branches and does not count the person as a failure', async () => {
    const last = lastOf(await collect(malformedFather()));
    expect(last.nodes.map((entry) => entry.id)).toEqual(expect.arrayContaining(['R', 'F', 'M']));
    expect(last.failed).toEqual([]);
    expect(last.pending).toEqual([]);
    expect(hasMoreAncestors(last)).toBe(false);
  });

  it('does not request the parents of a person whose data is unexpected', async () => {
    const requested: string[] = [];
    await collect(malformedFather(requested));
    expect(requested).not.toContain('GF');
  });

  it('shows the card as unexpected in the family view', async () => {
    const view = buildFamilyView(lastOf(await collect(malformedFather())), 'V1');
    const card = view.cards.find((entry) => entry.id === 'F');
    expect(card?.person).toMatchObject({ invalid: true });
  });

  it('counts an unexpected root as a failure, because there is no parent entry to name it', async () => {
    const source: PersonSource = {
      getPerson: async () => {
        throw new InvalidDataError('unexpected shape');
      },
    };
    const last = lastOf(await collect(source));
    expect(last.nodes).toEqual([]);
    expect(last.failed).toEqual(['R']);
  });
});
