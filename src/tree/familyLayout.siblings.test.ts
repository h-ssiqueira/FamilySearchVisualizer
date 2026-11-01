import { describe, expect, it } from 'vitest';
import type { FamilyCard, FamilyCouple, FamilyView } from '@/domain';
import { CARD } from './layout';
import { layoutFamily, type FamilyLayout, type MarriageLink, type PositionedCard } from './familyLayout';

const card = (id: string, row: number, role: FamilyCard['role'] = 'line'): FamilyCard => ({
  id,
  person: { id, name: id, gender: 'unknown', living: false },
  role,
  row,
});

const parents = (partnerIds: string[], childIds: string[]): FamilyCouple => ({
  id: `p:${partnerIds.join('+')}`,
  kind: 'parents',
  partnerIds,
  childIds,
});

const union = (partnerIds: string[], childIds: string[]): FamilyCouple => ({
  id: `u:${partnerIds.join('+')}`,
  kind: 'union',
  partnerIds,
  childIds,
});

function at(layout: FamilyLayout, id: string): PositionedCard {
  const found = layout.cards.find((entry) => entry.card.id === id);
  if (!found) throw new Error(`card ${id} was not placed`);
  return found;
}

/** The marriage line of a couple, as drawn. */
function marriageOf(layout: FamilyLayout, coupleId: string): MarriageLink {
  const link = layout.marriages.find((entry) => entry.coupleId === coupleId);
  if (!link) throw new Error(`marriage ${coupleId} was not drawn`);
  return link;
}

/** True when a card covers any point of the marriage line (the line is horizontal). */
function coversLine(entry: PositionedCard, link: MarriageLink): boolean {
  const top = entry.y;
  const bottom = entry.y + CARD.height;
  const left = entry.x;
  const right = entry.x + CARD.width;
  return link.y >= top && link.y <= bottom && right > link.x1 && left < link.x2;
}

/**
 * Two V2 siblings groups on either side of a couple on the line: the siblings of the left
 * partner are outside on its left, the siblings of the right partner outside on its right, so
 * the marriage line between the partners crosses nothing (SDD FR-26, bug: marriage line over
 * the siblings).
 */
const siblingsView: FamilyView = {
  view: 'V2',
  rootId: 'R',
  cards: [
    card('R', 0),
    card('F', 1),
    card('M', 1),
    card('FS1', 1, 'sibling'),
    card('FS2', 1, 'sibling'),
    card('MS1', 1, 'sibling'),
    card('MS2', 1, 'sibling'),
    card('GF', 2),
    card('GM', 2),
    card('GF2', 2),
    card('GM2', 2),
  ],
  couples: [
    parents(['F', 'M'], ['R']),
    parents(['GF', 'GM'], ['FS1', 'F', 'FS2']),
    parents(['GF2', 'GM2'], ['MS1', 'M', 'MS2']),
  ],
};

describe('marriage line between parents with siblings (FR-26)', () => {
  it('puts the siblings of the left partner on its left', () => {
    const layout = layoutFamily(siblingsView);
    const f = at(layout, 'F');
    expect(at(layout, 'FS1').x + CARD.width).toBeLessThanOrEqual(f.x);
    expect(at(layout, 'FS2').x + CARD.width).toBeLessThanOrEqual(f.x);
  });

  it('puts the siblings of the right partner on its right', () => {
    const layout = layoutFamily(siblingsView);
    const m = at(layout, 'M');
    expect(at(layout, 'MS1').x).toBeGreaterThanOrEqual(m.x + CARD.width);
    expect(at(layout, 'MS2').x).toBeGreaterThanOrEqual(m.x + CARD.width);
  });

  it('draws the marriage line between the partners with no card on it', () => {
    const layout = layoutFamily(siblingsView);
    const link = marriageOf(layout, 'p:F+M');
    const crossing = layout.cards.filter(
      (entry) => entry.card.id !== 'F' && entry.card.id !== 'M' && coversLine(entry, link),
    );
    expect(crossing.map((entry) => entry.card.id)).toEqual([]);
  });

  it('keeps every marriage line free of cards, whatever the siblings are doing', () => {
    const layout = layoutFamily(siblingsView);
    for (const link of layout.marriages) {
      const partnersOf = (coupleId: string) =>
        siblingsView.couples.find((couple) => couple.id === coupleId)?.partnerIds ?? [];
      const own = partnersOf(link.coupleId);
      const crossing = layout.cards.filter(
        (entry) => !own.includes(entry.card.id) && coversLine(entry, link),
      );
      expect(crossing.map((entry) => entry.card.id), link.coupleId).toEqual([]);
    }
  });

  it('still keeps a sibling who has a spouse clear of the marriage line', () => {
    const view: FamilyView = {
      ...siblingsView,
      cards: [...siblingsView.cards, card('SP1', 1, 'spouse')],
      couples: [...siblingsView.couples, union(['FS1', 'SP1'], [])],
    };
    const layout = layoutFamily(view);
    const link = marriageOf(layout, 'p:F+M');
    const crossing = layout.cards.filter(
      (entry) => entry.card.id !== 'F' && entry.card.id !== 'M' && coversLine(entry, link),
    );
    expect(crossing.map((entry) => entry.card.id)).toEqual([]);
    expect(at(layout, 'SP1').x + CARD.width).toBeLessThanOrEqual(at(layout, 'F').x);
  });

  it('does not overlap any two cards in the same row', () => {
    const layout = layoutFamily(siblingsView);
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
  });
});
