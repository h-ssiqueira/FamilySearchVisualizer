import { describe, expect, it } from 'vitest';
import type { FamilyCard, FamilyCouple, FamilyView, LifeEvent } from '@/domain';
import { CARD } from './layout';
import { layoutFamily, SPACING, type FamilyLayout, type PositionedCard } from './familyLayout';

const card = (
  id: string,
  row: number,
  role: FamilyCard['role'] = 'line',
  slot?: number,
): FamilyCard => ({
  id,
  person: { id, name: id, gender: 'unknown', living: false },
  role,
  row,
  ...(slot === undefined ? {} : { slot }),
});

const parents = (partnerIds: string[], childIds: string[], event?: LifeEvent): FamilyCouple => ({
  id: `p:${partnerIds.join('+')}`,
  kind: 'parents',
  partnerIds,
  childIds,
  ...(event ? { event } : {}),
});

const union = (partnerIds: string[], childIds: string[]): FamilyCouple => ({
  id: `u:${partnerIds.join('+')}`,
  kind: 'union',
  partnerIds,
  childIds,
});

const viewOf = (cards: FamilyCard[], couples: FamilyCouple[]): FamilyView => ({
  view: 'V2',
  rootId: 'R',
  cards,
  couples,
});

function at(layout: FamilyLayout, id: string): PositionedCard {
  const found = layout.cards.find((entry) => entry.card.id === id);
  if (!found) throw new Error(`card ${id} was not placed`);
  return found;
}
const center = (entry: PositionedCard): number => entry.x + CARD.width / 2;

function expectNoOverlap(layout: FamilyLayout): void {
  const rows = new Map<number, PositionedCard[]>();
  for (const entry of layout.cards) {
    rows.set(entry.card.row, [...(rows.get(entry.card.row) ?? []), entry]);
  }
  for (const entries of rows.values()) {
    const sorted = [...entries].sort((a, b) => a.x - b.x);
    sorted.forEach((entry, index) => {
      const previous = sorted[index - 1];
      if (previous) expect(entry.x).toBeGreaterThanOrEqual(previous.x + CARD.width);
    });
  }
}

describe('layoutFamily', () => {
  it('puts the root below its parents, centred between them', () => {
    const layout = layoutFamily(
      viewOf([card('R', 0), card('F', 1), card('M', 1)], [parents(['F', 'M'], ['R'])]),
    );
    expect(at(layout, 'F').y).toBe(at(layout, 'M').y);
    expect(at(layout, 'R').y).toBeGreaterThan(at(layout, 'F').y);
    expect(center(at(layout, 'R'))).toBe((center(at(layout, 'F')) + center(at(layout, 'M'))) / 2);
    expect(center(at(layout, 'M')) - center(at(layout, 'F'))).toBe(
      CARD.width + SPACING.partnerGap,
    );
  });

  it('draws siblings side by side, centred under the couple (TC-68)', () => {
    const layout = layoutFamily(
      viewOf(
        [card('R', 0), card('F', 1), card('M', 1), card('SIB', 0, 'sibling')],
        [parents(['F', 'M'], ['R', 'SIB'])],
      ),
    );
    const root = at(layout, 'R');
    const sibling = at(layout, 'SIB');
    expect(sibling.y).toBe(root.y);
    expect(sibling.x - (root.x + CARD.width)).toBe(SPACING.siblingGap);
    const childrenCenter = (root.x + sibling.x + CARD.width) / 2;
    expect(childrenCenter).toBe((center(at(layout, 'F')) + center(at(layout, 'M'))) / 2);
  });

  it('puts the spouse of the root to the right and centres the children under the couple (TC-69)', () => {
    const layout = layoutFamily(
      viewOf(
        [card('R', 0), card('S', 0, 'spouse'), card('K', -1, 'child')],
        [union(['R', 'S'], ['K'])],
      ),
    );
    const root = at(layout, 'R');
    const spouse = at(layout, 'S');
    expect(spouse.y).toBe(root.y);
    expect(spouse.x - root.x).toBe(CARD.width + SPACING.spouseGap);
    expect(center(at(layout, 'K'))).toBe((center(root) + center(spouse)) / 2);
    expect(at(layout, 'K').y).toBeGreaterThan(root.y);
  });

  it('needs no room and no card for a missing spouse (TC-69)', () => {
    const layout = layoutFamily(
      viewOf(
        [card('R', 0), card('K1', -1, 'child'), card('K2', -1, 'child')],
        [union(['R'], ['K1', 'K2'])],
      ),
    );
    expect(layout.cards).toHaveLength(3);
    expect((center(at(layout, 'K1')) + center(at(layout, 'K2'))) / 2).toBe(center(at(layout, 'R')));
    expect(at(layout, 'K2').x - at(layout, 'K1').x).toBe(CARD.width + SPACING.siblingGap);
  });

  it('draws several spouses to the right on the same level (TC-70)', () => {
    const layout = layoutFamily(
      viewOf(
        [card('R', 0), card('S1', 0, 'spouse'), card('S2', 0, 'spouse')],
        [union(['R', 'S1'], []), union(['R', 'S2'], [])],
      ),
    );
    const step = CARD.width + SPACING.spouseGap;
    expect(at(layout, 'S1').x - at(layout, 'R').x).toBe(step);
    expect(at(layout, 'S2').x - at(layout, 'S1').x).toBe(step);
    expect(at(layout, 'S2').y).toBe(at(layout, 'R').y);
  });

  it('never overlaps cards of the same row, even with siblings on every generation', () => {
    const cards: FamilyCard[] = [];
    const couples: FamilyCouple[] = [];
    const rows = 4;
    for (let generation = 0; generation < rows; generation += 1) {
      for (let slot = 0; slot < 2 ** generation; slot += 1) {
        const id = `g${generation}s${slot}`;
        cards.push({ ...card(id === 'g0s0' ? 'R' : id, generation, 'line', slot) });
        cards.push(card(`${id}x`, generation, 'sibling'));
        cards.push(card(`${id}y`, generation, 'sibling'));
        if (generation < rows - 1) {
          const self = id === 'g0s0' ? 'R' : id;
          couples.push(
            parents(
              [`g${generation + 1}s${slot * 2}`, `g${generation + 1}s${slot * 2 + 1}`],
              [self, `${id}x`, `${id}y`],
            ),
          );
        }
      }
    }
    const layout = layoutFamily(viewOf(cards, couples));
    expect(layout.cards).toHaveLength(cards.length);
    expectNoOverlap(layout);
  });

  it('does not overlap the cousins of V3 with the children of the next couple', () => {
    // F has a sibling X with a union and four children: they share the row of R.
    const kids = ['C1', 'C2', 'C3', 'C4'];
    const cards = [
      card('R', 0),
      card('F', 1),
      card('M', 1),
      card('X', 1, 'sibling'),
      card('XS', 1, 'spouse'),
      ...kids.map((id) => card(id, 0, 'child')),
      card('SIB', 0, 'sibling'),
    ];
    const layout = layoutFamily(
      viewOf(cards, [
        parents(['F', 'M'], ['R', 'SIB']),
        parents(['GF', 'GM'], ['X', 'F']),
        union(['X', 'XS'], kids),
      ]),
    );
    expect(layout.cards.length).toBeGreaterThan(0);
    expectNoOverlap(layout);
  });

  it('links the couple with a marriage line and each parent with each child (TC-65, TC-67)', () => {
    const event: LifeEvent = { date: { text: '+1825-05-20', source: 'formal' } };
    const layout = layoutFamily(
      viewOf(
        [card('R', 0), card('F', 1), card('M', 1)],
        [parents(['F', 'M'], ['R'], event)],
      ),
    );
    const father = at(layout, 'F');
    const mother = at(layout, 'M');
    const root = at(layout, 'R');

    expect(layout.marriages).toHaveLength(1);
    expect(layout.marriages[0]).toMatchObject({
      coupleId: 'p:F+M',
      x1: father.x + CARD.width,
      x2: mother.x,
      y: father.y + CARD.height / 2,
      event,
    });

    expect(layout.descents).toHaveLength(2);
    const fromFather = layout.descents.find((link) => link.parentId === 'F');
    expect(fromFather?.points[0]).toEqual([center(father), father.y + CARD.height]);
    expect(fromFather?.points[3]).toEqual([center(root), root.y]);
    // Orthogonal: every segment is horizontal or vertical.
    const points = fromFather?.points ?? [];
    points.slice(1).forEach((point, index) => {
      const previous = points[index];
      expect(point[0] === previous?.[0] || point[1] === previous?.[1]).toBe(true);
    });
  });

  it('returns an empty layout when the root is unknown', () => {
    expect(layoutFamily({ view: 'V1', rootId: 'R', cards: [], couples: [] })).toEqual({
      cards: [],
      marriages: [],
      descents: [],
      width: 0,
      height: 0,
    });
  });

  it('never drops a card it cannot reach', () => {
    const layout = layoutFamily(viewOf([card('R', 0), card('STRAY', 0, 'sibling')], []));
    expect(layout.cards.map((entry) => entry.card.id).sort()).toEqual(['R', 'STRAY']);
    expectNoOverlap(layout);
  });

  it('reports the size of the drawing including the padding', () => {
    const layout = layoutFamily(viewOf([card('R', 0)], []));
    expect(layout.width).toBe(CARD.width + 2 * SPACING.padding);
    expect(layout.height).toBe(CARD.height + 2 * SPACING.padding);
  });
});
