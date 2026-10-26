import type { FamilyCard, FamilyCouple, FamilyView, LifeEvent, PersonId } from '@/domain';
import { CARD } from './layout';

export const SPACING = {
  /** Between children (cards) of the same couple. */
  siblingGap: 40,
  /** Room for the marriage label between a person and their attached spouse. */
  spouseGap: 160,
  /** Minimum room between the two partners of a couple on the line. */
  partnerGap: 190,
  /** Minimum room between unrelated blocks in the same row. */
  blockGap: 60,
  rowGap: 60,
  padding: 40,
} as const;

export interface PositionedCard {
  card: FamilyCard;
  x: number;
  y: number;
}

export interface MarriageLink {
  coupleId: string;
  x1: number;
  x2: number;
  y: number;
  event?: LifeEvent;
}

export interface DescentLink {
  coupleId: string;
  parentId: PersonId;
  childId: PersonId;
  points: Array<[number, number]>;
}

export interface FamilyLayout {
  cards: PositionedCard[];
  marriages: MarriageLink[];
  descents: DescentLink[];
  width: number;
  height: number;
}

const HALF = CARD.width / 2;

/** Which partner of a couple on the line a block belongs to: left or right of the marriage. */
type Side = 'left' | 'right';

interface Placement {
  id: PersonId;
  row: number;
  /** Centre of the card. */
  cx: number;
}

interface Extent {
  min: number;
  max: number;
}

interface Union {
  couple: FamilyCouple;
  spouseId?: PersonId;
}

function rowExtents(placements: readonly Placement[]): Map<number, Extent> {
  const rows = new Map<number, Extent>();
  for (const placement of placements) {
    const left = placement.cx - HALF;
    const right = placement.cx + HALF;
    const entry = rows.get(placement.row);
    if (!entry) rows.set(placement.row, { min: left, max: right });
    else {
      entry.min = Math.min(entry.min, left);
      entry.max = Math.max(entry.max, right);
    }
  }
  return rows;
}

function overallExtent(placements: readonly Placement[]): Extent {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const placement of placements) {
    min = Math.min(min, placement.cx - HALF);
    max = Math.max(max, placement.cx + HALF);
  }
  return { min, max };
}

function shifted(placements: readonly Placement[], dx: number): Placement[] {
  return placements.map((placement) => ({ ...placement, cx: placement.cx + dx }));
}

const EMPTY: FamilyLayout = { cards: [], marriages: [], descents: [], width: 0, height: 0 };

/**
 * Vertical layout of the SDD UI spec: ancestors above, the root at the bottom, children of a
 * couple side by side under it, spouses to the right of their partner at the same level.
 *
 * The line is laid out as a binary tree from the root upwards. Each block is the group of
 * children of a couple plus, above it, the blocks of the two parents; blocks are joined with a
 * contour check per row, so cards never overlap (including cousins and nephews of V3).
 *
 * The siblings of each partner of a couple go on the outer side of that partner, so the space
 * between the two partners (where the marriage line is drawn) stays free of cards (FR-26).
 */
export function layoutFamily(view: FamilyView): FamilyLayout {
  const cards = new Map(view.cards.map((card) => [card.id, card] as const));
  if (!cards.has(view.rootId)) return EMPTY;
  const isLine = (id: PersonId): boolean => cards.get(id)?.role === 'line';

  const parentCoupleOf = new Map<PersonId, FamilyCouple>();
  for (const couple of view.couples) {
    for (const childId of couple.childIds) {
      if (!parentCoupleOf.has(childId)) parentCoupleOf.set(childId, couple);
    }
  }

  // Who "owns" a union: the person it hangs from. The spouse card is attached to the owner.
  // A union between two people of the line (the parents of someone) has no owner: it is only
  // a link between two cards placed by the pedigree.
  const unionsOf = new Map<PersonId, Union[]>();
  const addUnion = (ownerId: PersonId, union: Union): void => {
    const list = unionsOf.get(ownerId);
    if (list) list.push(union);
    else unionsOf.set(ownerId, [union]);
  };
  for (const couple of view.couples) {
    if (couple.kind !== 'union') continue;
    const [a, b] = couple.partnerIds;
    if (a === undefined) continue;
    if (b === undefined) {
      addUnion(a, { couple });
      continue;
    }
    const swap =
      (isLine(b) && !isLine(a)) ||
      (!isLine(a) && !isLine(b) && !parentCoupleOf.has(a) && parentCoupleOf.has(b));
    addUnion(swap ? b : a, { couple, spouseId: swap ? a : b });
  }

  const used = new Set<PersonId>();

  /** Children (with their own descendants) side by side; x measured from the group's left edge. */
  function layoutChildren(
    childIds: readonly PersonId[],
    selfId?: PersonId,
  ): { placements: Placement[]; width: number } {
    const out: Placement[] = [];
    let cursor = 0;
    for (const childId of childIds) {
      if (isLine(childId) && childId !== selfId) continue; // placed by its own block
      const subtree = layoutMember(childId);
      if (subtree.length === 0) continue;
      const extent = overallExtent(subtree);
      out.push(...shifted(subtree, cursor - extent.min));
      cursor += extent.max - extent.min + SPACING.siblingGap;
    }
    return { placements: out, width: out.length === 0 ? 0 : cursor - SPACING.siblingGap };
  }

  /** A card, its spouses to the right and the children of each union below; card centre at 0. */
  function layoutMember(id: PersonId): Placement[] {
    const card = cards.get(id);
    if (!card || used.has(id)) return [];
    used.add(id);
    const placements: Placement[] = [{ id, row: card.row, cx: 0 }];
    let previousRight = Number.NEGATIVE_INFINITY;
    let spouseCount = 0;

    for (const union of unionsOf.get(id) ?? []) {
      let center = 0;
      if (union.spouseId !== undefined && cards.has(union.spouseId) && !used.has(union.spouseId)) {
        spouseCount += 1;
        const spouseCx = spouseCount * (CARD.width + SPACING.spouseGap);
        used.add(union.spouseId);
        placements.push({ id: union.spouseId, row: card.row, cx: spouseCx });
        center = spouseCx / 2;
      }
      const group = layoutChildren(union.couple.childIds);
      if (group.placements.length === 0) continue;
      const left = Math.max(center - group.width / 2, previousRight + SPACING.siblingGap);
      placements.push(...shifted(group.placements, left));
      previousRight = left + group.width;
    }
    return placements;
  }

  /** Distance between the two parents' anchors so that nothing overlaps (see layoutFamily). */
  function separation(
    left: readonly Placement[],
    right: readonly Placement[],
    group: readonly Placement[],
  ): number {
    const leftRows = rowExtents(left);
    const rightRows = rowExtents(right);
    const groupRows = rowExtents(group);
    let distance = CARD.width + SPACING.partnerGap;
    for (const [row, l] of leftRows) {
      const r = rightRows.get(row);
      if (r) distance = Math.max(distance, l.max + SPACING.blockGap - r.min);
      const g = groupRows.get(row);
      if (g) distance = Math.max(distance, 2 * (l.max + SPACING.blockGap - g.min));
    }
    for (const [row, r] of rightRows) {
      const g = groupRows.get(row);
      if (g) distance = Math.max(distance, 2 * (g.max + SPACING.blockGap - r.min));
    }
    return distance;
  }

  /** Offset of the group when only one parent is known: right of whatever it would touch. */
  function singleOffset(parent: readonly Placement[], group: readonly Placement[]): number {
    const parentRows = rowExtents(parent);
    let offset = 0;
    for (const [row, g] of rowExtents(group)) {
      const p = parentRows.get(row);
      if (p) offset = Math.max(offset, p.max + SPACING.blockGap - g.min);
    }
    return offset;
  }

  /**
   * The children of a couple in the order they are drawn. A partner on the left has its
   * siblings to its left (its own card last); a partner on the right has them to its right.
   */
  function orderedChildren(childIds: readonly PersonId[], selfId: PersonId, side?: Side): PersonId[] {
    const others = childIds.filter((childId) => childId !== selfId);
    if (side === 'left') return [...others, selfId];
    if (side === 'right') return [selfId, ...others];
    return [...childIds];
  }

  const placedLine = new Set<PersonId>();

  /** Block of a person on the line, with the person's card centre at 0. */
  function buildBlock(id: PersonId, side?: Side): Placement[] {
    placedLine.add(id);
    const couple = parentCoupleOf.get(id);
    const group = layoutChildren(
      couple ? orderedChildren(couple.childIds, id, side) : [id],
      id,
    );
    if (group.placements.length === 0) return [];

    const row = cards.get(id)?.row ?? 0;
    const self = group.placements.find((placement) => placement.id === id);
    const rowExtent = rowExtents(group.placements).get(row);
    const groupCenter = rowExtent ? (rowExtent.min + rowExtent.max) / 2 : group.width / 2;
    const groupRel = shifted(group.placements, -groupCenter);
    const selfRel = (self ? self.cx : groupCenter) - groupCenter;

    const blocks: Placement[][] = [];
    const partnerIds = couple && couple.kind === 'parents' ? couple.partnerIds : [];
    partnerIds.forEach((partnerId, index) => {
      if (!isLine(partnerId) || placedLine.has(partnerId)) return;
      blocks.push(buildBlock(partnerId, index === 0 ? 'left' : 'right'));
    });
    const [first, second] = blocks;

    if (first && second) {
      const distance = separation(first, second, groupRel);
      const center = distance / 2;
      const combined = [...first, ...shifted(second, distance), ...shifted(groupRel, center)];
      return shifted(combined, -(center + selfRel));
    }
    if (first) {
      const center = singleOffset(first, groupRel);
      const combined = [...first, ...shifted(groupRel, center)];
      return shifted(combined, -(center + selfRel));
    }
    return shifted(groupRel, -selfRel);
  }

  const placements = buildBlock(view.rootId);

  // Never lose a card: anything the walk could not reach goes at the end of its row.
  const placed = new Set(placements.map((placement) => placement.id));
  for (const card of view.cards) {
    if (placed.has(card.id)) continue;
    const extent = rowExtents(placements).get(card.row);
    placements.push({
      id: card.id,
      row: card.row,
      cx: (extent ? extent.max + SPACING.siblingGap : 0) + HALF,
    });
    placed.add(card.id);
  }
  if (placements.length === 0) return EMPTY;

  const extent = overallExtent(placements);
  const maxRow = placements.reduce(
    (max, placement) => Math.max(max, placement.row),
    Number.NEGATIVE_INFINITY,
  );
  const minRow = placements.reduce(
    (min, placement) => Math.min(min, placement.row),
    Number.POSITIVE_INFINITY,
  );
  const pitch = CARD.height + SPACING.rowGap;

  const positioned = new Map<PersonId, PositionedCard>();
  for (const placement of placements) {
    const card = cards.get(placement.id);
    if (!card) continue;
    positioned.set(placement.id, {
      card,
      x: placement.cx - HALF - extent.min + SPACING.padding,
      y: (maxRow - placement.row) * pitch + SPACING.padding,
    });
  }

  const marriages: MarriageLink[] = [];
  const descents: DescentLink[] = [];
  for (const couple of view.couples) {
    const partners = couple.partnerIds
      .map((partnerId) => positioned.get(partnerId))
      .filter((entry): entry is PositionedCard => entry !== undefined);

    const [one, two] = partners;
    if (one && two) {
      const left = one.x <= two.x ? one : two;
      const right = left === one ? two : one;
      marriages.push({
        coupleId: couple.id,
        x1: left.x + CARD.width,
        x2: right.x,
        y: left.y + CARD.height / 2,
        ...(couple.event ? { event: couple.event } : {}),
      });
    }

    for (const parent of partners) {
      for (const childId of couple.childIds) {
        const child = positioned.get(childId);
        if (!child) continue;
        const startX = parent.x + HALF;
        const startY = parent.y + CARD.height;
        const endX = child.x + HALF;
        const middleY = child.y - SPACING.rowGap / 2;
        descents.push({
          coupleId: couple.id,
          parentId: parent.card.id,
          childId,
          points: [
            [startX, startY],
            [startX, middleY],
            [endX, middleY],
            [endX, child.y],
          ],
        });
      }
    }
  }

  return {
    cards: [...positioned.values()],
    marriages,
    descents,
    width: extent.max - extent.min + 2 * SPACING.padding,
    height: (maxRow - minRow) * pitch + CARD.height + 2 * SPACING.padding,
  };
}
