import {
  partnerOf,
  preferredCouple,
  SessionExpiredError,
  type Couple,
  type FamilyCard,
  type FamilyCouple,
  type FamilyView,
  type Person,
  type PersonId,
  type PersonRef,
  type PersonSource,
  type ViewTree,
} from '@/domain';

function coupleKey(kind: 'p' | 'u', partnerIds: readonly PersonId[]): string {
  return `${kind}:${[...partnerIds].sort().join('+')}`;
}

/** Man left, woman right; otherwise `partner1` left. Partners without a card are dropped. */
function orderedPartnerIds(couple: Couple, has: (id: PersonId) => boolean): PersonId[] {
  const refs = [couple.partner1, couple.partner2].filter(
    (ref): ref is PersonRef => ref !== undefined && has(ref.id),
  );
  const [first, second] = refs;
  if (first && second && first.gender === 'female' && second.gender === 'male') {
    return [second.id, first.id];
  }
  return refs.map((ref) => ref.id);
}

/** Adds the spouses and children of a person's unions (SDD V2 for the root, V3 for others). */
function addUnions(
  person: Person,
  row: number,
  cards: Map<PersonId, FamilyCard>,
  couples: Map<string, FamilyCouple>,
): void {
  for (const union of person.unions) {
    const spouse = partnerOf(person.id, union);
    // No spouse and no children: nothing to draw ("no spouse, no card").
    if (!spouse && union.children.length === 0) continue;
    const partnerIds = spouse ? [person.id, spouse.id] : [person.id];
    const key = coupleKey('u', partnerIds);
    if (couples.has(key)) continue;

    if (spouse && !cards.has(spouse.id)) {
      cards.set(spouse.id, { id: spouse.id, person: spouse, role: 'spouse', row });
    }
    const childIds: PersonId[] = [];
    for (const child of union.children) {
      if (child.id === person.id) continue;
      childIds.push(child.id);
      if (!cards.has(child.id)) {
        cards.set(child.id, { id: child.id, person: child, role: 'child', row: row - 1 });
      }
    }
    couples.set(key, { id: key, kind: 'union', partnerIds, event: union.event, childIds });
  }
}

/**
 * V1: the line only. V2: plus every child of each couple shown (siblings of the people on the
 * line) and the spouses and children of the root. No request is needed: relatives come with
 * the details of the people already loaded (SDD objective, section 2.3).
 */
export function buildFamilyView(tree: ViewTree, level: 'V1' | 'V2'): FamilyView {
  const cards = new Map<PersonId, FamilyCard>();
  const couples = new Map<string, FamilyCouple>();

  for (const node of tree.nodes) {
    cards.set(node.id, {
      id: node.id,
      person: node.person,
      role: 'line',
      row: node.generation,
      slot: node.slot,
    });
  }
  const has = (id: PersonId): boolean => cards.has(id);

  for (const node of tree.nodes) {
    if (!('parentSets' in node.person)) continue;
    const source = preferredCouple(node.person.parentSets);
    if (!source) continue;
    const partnerIds = orderedPartnerIds(source, has);
    if (partnerIds.length === 0) continue;

    const key = coupleKey('p', partnerIds);
    const couple: FamilyCouple = couples.get(key) ?? {
      id: key,
      kind: 'parents',
      partnerIds,
      event: source.event,
      childIds: [],
    };
    const siblingIds = level === 'V2' ? source.children.map((child) => child.id) : [];
    for (const childId of [...siblingIds, node.id]) {
      if (!couple.childIds.includes(childId)) couple.childIds.push(childId);
    }
    if (level === 'V2') {
      for (const child of source.children) {
        if (!cards.has(child.id)) {
          cards.set(child.id, { id: child.id, person: child, role: 'sibling', row: node.generation });
        }
      }
    }
    couples.set(key, couple);
  }

  if (level === 'V2') {
    const root = tree.nodes.find((node) => node.role === 'root');
    if (root && 'unions' in root.person) addUnions(root.person, root.generation, cards, couples);
  }

  return {
    view: level,
    rootId: tree.root,
    cards: [...cards.values()],
    couples: [...couples.values()],
  };
}

/**
 * V3: plus the spouse(s) of the children shown in V2 and their children, one level only.
 * It needs the details of each such child (one request each, through the cached source).
 * A relative that cannot be loaded keeps its card without the extra relatives (FR-33).
 */
export async function extendToV3(
  view: FamilyView,
  source: PersonSource,
  signal?: AbortSignal,
): Promise<FamilyView> {
  const targets = view.cards.filter(
    (card) => card.role === 'sibling' || (card.role === 'child' && card.row === -1),
  );
  const loaded = await Promise.all(
    targets.map(async (card): Promise<readonly [FamilyCard, Person | null]> => {
      try {
        return [card, await source.getPerson(card.id, signal)];
      } catch (error) {
        if (error instanceof SessionExpiredError) throw error;
        return [card, null];
      }
    }),
  );
  if (signal?.aborted) return view;

  const cards = new Map(view.cards.map((card) => [card.id, card] as const));
  const couples = new Map(view.couples.map((couple) => [couple.id, couple] as const));
  for (const [card, person] of loaded) {
    if (!person) continue;
    cards.set(card.id, { ...card, person });
    addUnions(person, card.row, cards, couples);
  }

  return {
    ...view,
    view: 'V3',
    cards: [...cards.values()],
    couples: [...couples.values()],
  };
}

/**
 * True while any branch still has known parents that were not loaded, or failed to load
 * (SDD FR-31, FR-33). It reads the tree's `pending` list, so a branch that ended early never
 * hides one that goes on.
 */
export function hasMoreAncestors(tree: ViewTree): boolean {
  return tree.pending.length > 0;
}
