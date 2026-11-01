import { describe, expect, it } from 'vitest';
import type { PersonRef, TreeNode, ViewTree } from '@/domain';
import { CARD, GAP, layoutAncestors } from './layout';

const ref = (id: string): PersonRef => ({ id, name: id, gender: 'unknown', living: false });
const node = (id: string, generation: number, slot: number): TreeNode => ({
  id,
  person: ref(id),
  generation,
  slot,
  role: generation === 0 ? 'root' : 'ancestor',
});
const treeOf = (nodes: TreeNode[]): ViewTree => ({
  view: 'V1',
  root: 'R',
  nodes,
  edges: [],
  pending: [],
});

describe('layoutAncestors', () => {
  const unit = CARD.width + GAP.x;

  it('centres a lone root in its slot', () => {
    const [only] = layoutAncestors(treeOf([node('R', 0, 0)]));
    expect(only?.x).toBe((unit - CARD.width) / 2);
    expect(only?.y).toBe(0);
  });

  it('puts the root at the bottom, between its two parents', () => {
    const positioned = layoutAncestors(treeOf([node('R', 0, 0), node('F', 1, 0), node('M', 1, 1)]));
    const at = (id: string) => positioned.find((entry) => entry.node.id === id);
    const father = at('F');
    const mother = at('M');
    const root = at('R');
    expect(father?.y).toBe(0);
    expect(mother?.y).toBe(0);
    expect(root?.y).toBe(CARD.height + GAP.y);
    const middle = ((father?.x ?? 0) + (mother?.x ?? 0)) / 2;
    expect(root?.x).toBe(middle);
    expect((mother?.x ?? 0) - (father?.x ?? 0)).toBe(unit);
  });

  it('does not overlap cards of the same generation', () => {
    const positioned = layoutAncestors(
      treeOf([node('R', 0, 0), node('F', 1, 0), node('M', 1, 1), node('GF', 2, 0), node('GM', 2, 3)]),
    );
    const top = positioned.filter((entry) => entry.node.generation === 2);
    const [left, right] = top;
    expect((right?.x ?? 0) - (left?.x ?? 0)).toBeGreaterThanOrEqual(CARD.width);
  });

  it('returns nothing for an empty tree', () => {
    expect(layoutAncestors(treeOf([]))).toEqual([]);
  });
});
