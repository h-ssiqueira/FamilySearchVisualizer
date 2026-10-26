import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CARD } from '@/tree';
import type { FamilyLayout, PositionedCard } from '@/tree';
import { TreeCanvas } from './TreeCanvas';

/** One column of `count` cards, one below the other: the worst case for drawing everything. */
function tallLayout(count: number): FamilyLayout {
  const cards: PositionedCard[] = Array.from({ length: count }, (_, index) => ({
    card: {
      id: `P${index}`,
      person: { id: `P${index}`, name: `P${index}`, gender: 'unknown', living: false },
      role: 'line',
      row: index,
    },
    x: 40,
    y: 40 + index * (CARD.height + 60),
  }));
  return {
    cards,
    marriages: [],
    descents: [],
    width: CARD.width + 80,
    height: count * (CARD.height + 60) + 80,
  };
}

beforeEach(() => {
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(800);
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(600);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('TreeCanvas culling (NFR-02, TC-59)', () => {
  it('draws only the cards near the viewport in a tree of 1,000 people', () => {
    const { container } = render(<TreeCanvas layout={tallLayout(1000)} />);
    const drawn = container.querySelectorAll('.tree-card').length;
    expect(drawn).toBeGreaterThan(0);
    expect(drawn).toBeLessThan(200);
  });

  it('draws every card of a small tree', () => {
    const { container } = render(<TreeCanvas layout={tallLayout(5)} />);
    expect(container.querySelectorAll('.tree-card')).toHaveLength(5);
  });
});
