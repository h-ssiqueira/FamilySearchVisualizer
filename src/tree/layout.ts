import type { TreeNode, ViewTree } from '@/domain';

export const CARD = { width: 250, height: 90 } as const;
export const GAP = { x: 40, y: 60 } as const;

export interface PositionedNode {
  node: TreeNode;
  x: number;
  y: number;
}

/**
 * Vertical pedigree, root at the bottom (SDD UI spec). Each generation has 2^g binary slots; a
 * node is centred in its slot, so a child sits between its two parents.
 */
export function layoutAncestors(tree: ViewTree): PositionedNode[] {
  const deepest = tree.nodes.reduce((max, node) => Math.max(max, node.generation), 0);
  const unit = CARD.width + GAP.x;
  return tree.nodes.map((node) => {
    const slotWidth = unit * 2 ** (deepest - node.generation);
    return {
      node,
      x: node.slot * slotWidth + (slotWidth - CARD.width) / 2,
      y: (deepest - node.generation) * (CARD.height + GAP.y),
    };
  });
}
