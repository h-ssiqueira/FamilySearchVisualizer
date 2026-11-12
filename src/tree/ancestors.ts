import {
  InvalidDataError,
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
  /** What the parent entry says about this person: the name we show when its data is missing or unexpected. */
  ref?: PersonRef;
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

/** The reason of a failed load, from the error class and message only (never the payload). */
function reasonOf(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : 'unknown error';
}

/**
 * Writes one console line for a person who could not be loaded, with the id, the name (when the
 * parent entry gave it) and the reason (SDD FR-39). Written once per person and reason within one
 * build. Never a token or a response payload.
 */
function report(
  written: Set<string>,
  id: PersonId,
  name: string | undefined,
  reason: string,
): void {
  const key = `${id}|${reason}`;
  if (written.has(key)) return;
  written.add(key);
  console.warn(`[FamilySearch Visualizer] person ${id} (${name ?? 'name unknown'}): ${reason}`);
}

/**
 * V1: the root and its direct ancestors, one generation per step. Yields the tree after each
 * generation so the UI can render progressively; stops when no parents are known, when the
 * requested generation is reached, or when the signal is aborted.
 *
 * A person whose details fail with a transient error does not stop the rest of the tree: it is
 * listed in `failed` and `pending`, so loading again retries it (FR-33). A person with no data
 * (restricted, missing) gets an "unavailable" card in its place, and its branch ends there (TC-43,
 * FR-38). A person whose data came back unexpected keeps its place, marked, and its parents are not
 * requested (TC-15). The same ancestor reached twice is one card, marked as repeated (TC-22); its
 * second parent entry is an extra edge. Every person that cannot be loaded is reported to the
 * console with id, name and reason (FR-39). Only an expired session stops the whole load.
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
  const repeated = new Set<PersonId>();
  const written = new Set<string>();
  const names = new Map<PersonId, string>();
  let frontier: Frontier[] = [{ id: rootId, slot: 0 }];

  for (let generation = 0; frontier.length > 0 && generation <= lastGeneration; generation += 1) {
    if (signal?.aborted) return;

    for (const item of frontier) {
      if (item.ref) names.set(item.id, item.ref.name);
    }
    const ids = [...new Set(frontier.map((item) => item.id))].filter((id) => !placed.has(id));
    const loaded = new Map<PersonId, Person | null>();
    const malformed = new Set<PersonId>();
    await Promise.all(
      ids.map(async (id) => {
        try {
          loaded.set(id, await source.getPerson(id, signal));
        } catch (error) {
          if (error instanceof SessionExpiredError) throw error;
          if (signal?.aborted) return;
          if (error instanceof InvalidDataError) {
            malformed.add(id);
          } else {
            failed.add(id);
            report(written, id, names.get(id), reasonOf(error));
          }
        }
      }),
    );
    if (signal?.aborted) return;

    const next: Frontier[] = [];
    for (const item of frontier) {
      if (placed.has(item.id)) {
        // Pedigree collapse: the same ancestor reached twice is one card, marked, with an extra edge.
        if (item.childId) {
          edges.push({ from: item.childId, to: item.id, kind: 'parent' });
          repeated.add(item.id);
        }
        continue;
      }
      const person = loaded.get(item.id);
      if (!person) {
        if (!item.ref) {
          // The root has no parent entry to name it: a failure, not a card.
          if (malformed.has(item.id)) {
            failed.add(item.id);
            report(written, item.id, undefined, 'InvalidDataError: unexpected response shape');
          }
          continue;
        }
        if (malformed.has(item.id) || loaded.has(item.id)) {
          placed.add(item.id);
          const isMalformed = malformed.has(item.id);
          const marked: PersonRef = isMalformed
            ? { ...item.ref, invalid: true }
            : { ...item.ref, unavailable: true };
          report(
            written,
            item.id,
            item.ref.name,
            isMalformed
              ? 'InvalidDataError: unexpected response shape'
              : 'no data (restricted or not found)',
          );
          nodes.push({ id: item.id, person: marked, generation, slot: item.slot, role: 'ancestor' });
          if (item.childId) edges.push({ from: item.childId, to: item.id, kind: 'parent' });
        }
        continue;
      }

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
          next.push({ id: parent.ref.id, slot: parent.slot, childId: person.id, ref: parent.ref });
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
      nodes: nodes.map((node) =>
        repeated.has(node.id) ? { ...node, person: { ...node.person, repeated: true } } : node,
      ),
      edges: [...edges],
      pending: [...pending],
      failed: [...failed],
    };
  }
}
