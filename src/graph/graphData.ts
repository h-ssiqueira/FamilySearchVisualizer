import { cardLines, type FamilyCard, type FamilyCouple, type FamilyView, type LifeEvent, type PersonId } from '@/domain';
import { CARD, cardWidth } from '@/tree';

/**
 * A card as a node of the graph. Its size comes from the same rules as the tree card, so the two
 * pages agree on how big a person is (FR-43, TC-87).
 */
export interface GraphNode {
  id: PersonId;
  card: FamilyCard;
  width: number;
  height: number;
}

/**
 * The connection rules of the tree (FR-42): a parent and a child are joined by a solid link, the
 * two partners of a couple by a dashed marriage link.
 */
export type GraphLink =
  | { kind: 'parent'; source: PersonId; target: PersonId; coupleId: string }
  | { kind: 'marriage'; source: PersonId; target: PersonId; coupleId: string; event?: LifeEvent };

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/** The text of a node, as on the tree card (TC-87). `note` names the state; the screen translates it. */
export interface NodeLines {
  name: string;
  dates: string;
  places: string;
  id: string;
  repeated: boolean;
  note?: 'unexpected' | 'unavailable';
}

/** One node per card, in the order of the view. */
export function toGraphNodes(view: FamilyView): GraphNode[] {
  return view.cards.map((card) => ({
    id: card.id,
    card,
    width: cardWidth(card.person),
    height: CARD.height,
  }));
}

function addCouple(
  couple: FamilyCouple,
  known: ReadonlySet<PersonId>,
  links: GraphLink[],
  seen: Set<string>,
): void {
  const [first, second] = couple.partnerIds;
  if (first !== undefined && second !== undefined && known.has(first) && known.has(second)) {
    links.push({
      kind: 'marriage',
      source: first,
      target: second,
      coupleId: couple.id,
      ...(couple.event ? { event: couple.event } : {}),
    });
  }
  for (const partner of couple.partnerIds) {
    if (!known.has(partner)) continue;
    for (const childId of couple.childIds) {
      if (!known.has(childId)) continue;
      const key = `${partner}>${childId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ kind: 'parent', source: partner, target: childId, coupleId: couple.id });
    }
  }
}

/**
 * The graph of a view: the same cards and the same couples as the tree page, with the same
 * connection rules. A link whose end is not on the view is left out, so the graph never points at
 * a missing node.
 */
export function toGraphData(view: FamilyView): GraphData {
  const nodes = toGraphNodes(view);
  const known = new Set(nodes.map((node) => node.id));
  const links: GraphLink[] = [];
  const seen = new Set<string>();
  for (const couple of view.couples) addCouple(couple, known, links, seen);
  return { nodes, links };
}

/** The four lines and the notes of a card, the same text the tree shows (FR-17, FR-36, FR-38, FR-11). */
export function nodeLines(card: FamilyCard): NodeLines {
  const person = card.person;
  const lines = cardLines(person);
  const invalid = 'invalid' in person && person.invalid === true;
  const unavailable = 'unavailable' in person && person.unavailable === true;
  const repeated = 'repeated' in person && person.repeated === true;
  const note = invalid ? 'unexpected' : unavailable ? 'unavailable' : undefined;
  return {
    name: lines.name,
    dates: note ? '' : lines.dates,
    places: note ? '' : lines.places,
    id: lines.id,
    repeated,
    ...(note ? { note } : {}),
  };
}
