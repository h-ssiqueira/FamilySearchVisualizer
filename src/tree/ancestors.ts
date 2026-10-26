import {
  preferredCouple,
  SessionExpiredError,
  type Couple,
  type Person,
  type PersonId,
  type PersonRef,
  type PersonSource,
  type TreeEdge,
  type TreeNode,
  type ViewTree,
} from '@/domain';

export interface BuildOptions {
  /** Ancestor generations beyond the root, or `all` (unlimited, SDD ADR-09). */
  generations: number | 'all';
}

interface Frontier {
  id: PersonId;
  slot: number;
  childId?: PersonId;
}

/** Man left (even slot), woman right (odd slot); otherwise `partner1` left (SDD UI spec). */
export function assignParentSlots(
  couple: Couple,
  slot: number,
): Array<{ ref: PersonRef; slot: number }> {
  const partners = [couple.partner1, couple.partner2].filter(
    (partner): partner is PersonRef => partner !== undefined,
  );
  const [first, second] = partners;
  if (first && second) {
    const swap = first.gender === 'female' && second.gender === 'male';
    const left = swap ? second : first;
    const right = swap ? first : second;
    return [
      { ref: left, slot: slot * 2 },
      { ref: right, slot: slot * 2 + 1 },
    ];
  }
  if (first) return [{ ref: first, slot: first.gender === 'female' ? slot * 2 + 1 : slot * 2 }];
  return [];
}

/**
 * V1: the root and its direct ancestors, one generation per step. Yields the tree after each
 * generation so the UI can render progressively; stops when no parents are known, when the
 * requested generation is reached, or when the signal is aborted.
 *
 * A person whose details fail with a transient error (throttling, server error, unexpected
 * data) does not stop the rest of the tree: the person is listed in `failed` and in `pending`,
 * so that loading again retries it (SDD FR-33). A person with no data (`null`) simply ends
 * that branch (FR-31). Only an expired session stops the whole load.
 */
export async function* buildAncestorTree(
  rootId: PersonId,
  source: PersonSource,
  options: BuildOptions,
  signal?: AbortSignal,
): AsyncGenerator<ViewTree> {
  const lastGeneration =
    options.generations === 'all' ? Number.POSITIVE_INFINITY : Math.max(0, options.generations);
  const nodes: TreeNode[] = [];
  const edges: TreeEdge[] = [];
  const placed = new Set<PersonId>();
  const failed = new Set<PersonId>();
  let frontier: Frontier[] = [{ id: rootId, slot: 0 }];

  for (let generation = 0; frontier.length > 0 && generation <= lastGeneration; generation += 1) {
    if (signal?.aborted) return;

    const ids = [...new Set(frontier.map((item) => item.id))].filter((id) => !placed.has(id));
    const loaded = new Map<PersonId, Person | null>();
    await Promise.all(
      ids.map(async (id) => {
        try {
          loaded.set(id, await source.getPerson(id, signal));
        } catch (error) {
          if (error instanceof SessionExpiredError) throw error;
          if (signal?.aborted) return;
          failed.add(id);
        }
      }),
    );
    if (signal?.aborted) return;

    const next: Frontier[] = [];
    for (const item of frontier) {
      if (placed.has(item.id)) {
        // Pedigree collapse: the same ancestor reached twice is one node with two edges.
        if (item.childId) edges.push({ from: item.childId, to: item.id, kind: 'parent' });
        continue;
      }
      const person = loaded.get(item.id);
      if (!person) continue;

      placed.add(item.id);
      failed.delete(item.id);
      nodes.push({
        id: person.id,
        person,
        generation,
        slot: item.slot,
        role: generation === 0 ? 'root' : 'ancestor',
      });
      if (item.childId) edges.push({ from: item.childId, to: person.id, kind: 'parent' });

      const couple = preferredCouple(person.parentSets);
      if (couple) {
        for (const parent of assignParentSlots(couple, item.slot)) {
          next.push({ id: parent.ref.id, slot: parent.slot, childId: person.id });
        }
      }
    }

    frontier = next;
    const pending = new Set<PersonId>([
      ...next.map((item) => item.id).filter((id) => !placed.has(id)),
      ...failed,
    ]);
    yield {
      view: 'V1',
      root: rootId,
      nodes: [...nodes],
      edges: [...edges],
      pending: [...pending],
      failed: [...failed],
    };
  }
}
