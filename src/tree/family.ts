import {
  partnerOf,
  preferredCouple,
  SessionExpiredError,
  type Couple,
  type FamilyCard,
  type FamilyChoice,
  type FamilyCouple,
  type FamilyView,
  type Person,
  type PersonId,
  type PersonRef,
  type PersonSource,
  type ViewTree,
} from '@/domain';

/** The family chosen with the crossed-arrows button, by person: an index into its unions (OQ-25). */
export type FamilyChoices = ReadonlyMap<PersonId, number>;

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

/**
 * The spouse families of a person to draw. Without a choice: the preferred ones when any is flagged
 * (OQ-04), otherwise all of them (FR-30). With a choice (OQ-25): only the chosen one.
 */
function spouseFamilies(
  person: Person,
  choices?: FamilyChoices,
): { shown: Couple[]; families?: FamilyChoice } {
  const total = person.unions.length;
  if (total < 2) return { shown: person.unions };
  const chosen = choices?.get(person.id);
  if (chosen !== undefined) {
    const index = chosen % total;
    const union = person.unions[index];
    return { shown: union ? [union] : [], families: { total, shown: index + 1 } };
  }
  const flagged = person.unions.filter((union) => union.preferred);
  const first = flagged[0] ?? person.unions[0];
  const shownIndex = first ? person.unions.indexOf(first) + 1 : 1;
  return {
    shown: flagged.length > 0 ? flagged : person.unions,
    families: { total, shown: shownIndex },
  };
}

/** Adds the spouses and children of a person's unions (SDD V2 for the root, V3 for others). */
function addUnions(
  person: Person,
  row: number,
  cards: Map<PersonId, FamilyCard>,
  couples: Map<string, FamilyCouple>,
  choices?: FamilyChoices,
): void {
  const { shown, families } = spouseFamilies(person, choices);
  const owner = cards.get(person.id);
  if (owner && families) cards.set(person.id, { ...owner, families });
  for (const union of shown) {
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
 * line) and the spouses and children of the root. The relatives come as light cards here; their
 * details are loaded by `withDetails` (OQ-05).
 */
export function buildFamilyView(
  tree: ViewTree,
  level: 'V1' | 'V2',
  choices?: FamilyChoices,
): FamilyView {
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
    if (root && 'unions' in root.person) {
      addUnions(root.person, root.generation, cards, couples, choices);
    }
  }

  return {
    view: level,
    rootId: tree.root,
    cards: [...cards.values()],
    couples: [...couples.values()],
  };
}

/**
 * Full details for the relatives drawn as light cards (SDD OQ-05): every card shows dates and
 * places. One request per relative, served from the cache when already known. A relative that
 * cannot be loaded stays a light card (FR-33). Relatives are not expanded here: their own spouses
 * and children are not added.
 */
export async function withDetails(
  view: FamilyView,
  source: PersonSource,
  signal?: AbortSignal,
): Promise<FamilyView> {
  const targets = view.cards.filter(
    (card) => card.role !== 'line' && !('parentSets' in card.person),
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
  for (const [card, person] of loaded) {
    if (person) cards.set(card.id, { ...card, person });
  }
  return { ...view, cards: [...cards.values()] };
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
  choices?: FamilyChoices,
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
    addUnions(person, card.row, cards, couples, choices);
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
