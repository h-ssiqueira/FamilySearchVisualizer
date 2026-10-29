import { describe, expect, it } from 'vitest';
import type { Person } from '@/domain';
import { CARD_MAX_WIDTH, CARD_MIN_WIDTH, cardWidth } from './cardWidth';

const person = (name: string, placeText = ''): Person => ({
  id: 'AAAA-AAA',
  name,
  gender: 'unknown',
  living: false,
  parentSets: [],
  unions: [],
  birth: placeText ? { place: { text: placeText } } : undefined,
});

describe('card width (OQ-22, FR-24)', () => {
  it('is never below the minimum', () => {
    expect(cardWidth(person('R'))).toBe(CARD_MIN_WIDTH);
  });

  it('grows with a long place, up to the maximum', () => {
    const medium = cardWidth(person('John Example', 'Campinas, São Paulo, Brazil'));
    expect(medium).toBeGreaterThan(CARD_MIN_WIDTH);
    expect(medium).toBeLessThanOrEqual(CARD_MAX_WIDTH);
  });

  it('stops at the maximum, the card truncates the rest', () => {
    const huge = 'A very long place name in a very long region of a very long country, far away';
    expect(cardWidth(person('John Example', huge))).toBe(CARD_MAX_WIDTH);
  });
});
