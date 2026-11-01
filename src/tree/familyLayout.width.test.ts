import { describe, expect, it } from 'vitest';
import type { FamilyCard, FamilyView } from '@/domain';
import { cardWidth, CARD_MAX_WIDTH } from './cardWidth';
import { layoutFamily } from './familyLayout';

const card = (id: string, row: number, name = id, place?: string): FamilyCard => ({
  id,
  person: {
    id,
    name,
    gender: 'unknown',
    living: false,
    parentSets: [],
    unions: [],
    ...(place ? { birth: { place: { text: place } } } : {}),
  },
  role: 'line',
  row,
});

const LONG_PLACE = 'A very long place name in a very long region of a very long country, far away';

describe('flexible card width in the layout (OQ-22)', () => {
  it('places each card with its own width', () => {
    const view: FamilyView = {
      view: 'V1',
      rootId: 'R',
      cards: [card('R', 0), card('F', 1, 'F', LONG_PLACE), card('M', 1)],
      couples: [{ id: 'p:F+M', kind: 'parents', partnerIds: ['F', 'M'], childIds: ['R'] }],
    };
    const layout = layoutFamily(view);
    const father = layout.cards.find((entry) => entry.card.id === 'F');
    expect(father?.width).toBe(CARD_MAX_WIDTH);
    expect(father?.width).toBe(cardWidth(father?.card.person ?? card('x', 0).person));
  });

  it('starts the marriage line at the right edge of a wide partner', () => {
    const view: FamilyView = {
      view: 'V1',
      rootId: 'R',
      cards: [card('R', 0), card('F', 1, 'F', LONG_PLACE), card('M', 1)],
      couples: [{ id: 'p:F+M', kind: 'parents', partnerIds: ['F', 'M'], childIds: ['R'] }],
    };
    const layout = layoutFamily(view);
    const father = layout.cards.find((entry) => entry.card.id === 'F');
    const link = layout.marriages[0];
    expect(link?.x1).toBe((father?.x ?? 0) + (father?.width ?? 0));
  });
});
