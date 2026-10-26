import { describe, expect, it } from 'vitest';
import {
  SessionExpiredError,
  type Couple,
  type Person,
  type PersonRef,
  type PersonSource,
  type ViewTree,
} from '@/domain';
import { buildAncestorTree } from './ancestors';
import { buildFamilyView, extendToV3, hasMoreAncestors } from './family';

const ref = (id: string, gender: PersonRef['gender'] = 'unknown'): PersonRef => ({
  id,
  name: id,
  gender,
  living: false,
});

function person(id: string, parents: PersonRef[] = [], unions: Couple[] = []): Person {
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
    unions,
  };
}

async function collect(source: PersonSource, generations: number | 'all' = 'all'): Promise<ViewTree[]> {
  const out: ViewTree[] = [];
  for await (const tree of buildAncestorTree('R', source, { generations })) out.push(tree);
  return out;
}

function lastOf(list: ViewTree[]): ViewTree {
  const last = list.at(-1);
  if (!last) throw new Error('no tree was built');
  return last;
}

const family: Person[] = [
  person('R', [ref('F', 'male'), ref('M', 'female')]),
  person('F', [ref('GF', 'male'), ref('GM', 'female')]),
  person('M', [ref('MF', 'male'), ref('MM', 'female')]),
  person('GF'),
  person('GM'),
  person('MF'),
  person('MM'),
];
const byId = new Map(family.map((entry) => [entry.id, entry] as const));

describe('transient failures (FR-33)', () => {
  it('keeps loading the other branches when one person fails', async () => {
    const source: PersonSource = {
      getPerson: async (id) => {
        if (id === 'GF') throw new Error('transient');
        return byId.get(id) ?? null;
      },
    };
    const last = lastOf(await collect(source));
    expect(last.nodes.map((node) => node.id).sort()).toEqual(['F', 'GM', 'M', 'MF', 'MM', 'R']);
    expect(last.failed).toEqual(['GF']);
    expect(last.pending).toContain('GF');
    expect(hasMoreAncestors(last)).toBe(true);
  });

  it('treats no data (null) as the end of a branch, not as a failure', async () => {
    const source: PersonSource = {
      getPerson: async (id) => (id === 'GF' ? null : (byId.get(id) ?? null)),
    };
    const last = lastOf(await collect(source));
    expect(last.failed).toEqual([]);
    expect(last.pending).toEqual([]);
    expect(hasMoreAncestors(last)).toBe(false);
  });

  it('retries a failed person when the tree is built again', async () => {
    let calls = 0;
    const source: PersonSource = {
      getPerson: async (id) => {
        if (id === 'GF') {
          calls += 1;
          if (calls === 1) throw new Error('transient');
        }
        return byId.get(id) ?? null;
      },
    };
    const first = lastOf(await collect(source));
    expect(first.failed).toEqual(['GF']);
    const second = lastOf(await collect(source));
    expect(second.failed).toEqual([]);
    expect(second.nodes.map((node) => node.id)).toContain('GF');
  });

  it('stops the whole load when the session has expired', async () => {
    const source: PersonSource = {
      getPerson: async () => {
        throw new SessionExpiredError();
      },
    };
    await expect(collect(source)).rejects.toBeInstanceOf(SessionExpiredError);
  });

  it('keeps the V3 relatives going when one of them cannot be loaded', async () => {
    const root = person('R', [], [
      {
        partner1: ref('S', 'female'),
        partner2: ref('R', 'male'),
        children: [ref('K', 'male')],
        preferred: true,
      },
    ]);
    const rootOnly: PersonSource = { getPerson: async (id) => (id === 'R' ? root : null) };
    const v2 = buildFamilyView(lastOf(await collect(rootOnly)), 'V2');
    const failing: PersonSource = {
      getPerson: async () => {
        throw new Error('transient');
      },
    };
    const v3 = await extendToV3(v2, failing);
    expect(v3.view).toBe('V3');
    expect(v3.cards.find((card) => card.id === 'K')).toBeDefined();
  });
});
