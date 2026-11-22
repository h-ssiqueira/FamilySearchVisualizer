/** A node the collision force moves: a position and the size of its box. */
export interface CollideNode {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

/**
 * Keeps the nodes of the graph apart. Two boxes overlap when both their horizontal and vertical
 * extents overlap, counting `margin` px between them; the pair is pushed apart along the axis where
 * the overlap is smaller, by half the overlap each.
 *
 * The positions are corrected directly, as d3's own collision force does, and the correction does not
 * fade with the simulation's cooling: a pair that overlaps is separated at every tick, so the labels
 * do not end up on top of each other when the layout settles. The check is O(n²): fine up to a few
 * thousand nodes (OQ-28 decides whether culling is needed on top).
 *
 * The shape follows the d3 force protocol: a function, with `initialize` to receive the nodes.
 */
export function boxCollisionForce(margin = 8) {
  let nodes: CollideNode[] = [];
  const force = (): void => {
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      if (!a) continue;
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        if (!b) continue;
        const dx = (b.x ?? 0) - (a.x ?? 0);
        const dy = (b.y ?? 0) - (a.y ?? 0);
        const overlapX = (a.width + b.width) / 2 + margin - Math.abs(dx);
        const overlapY = (a.height + b.height) / 2 + margin - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        if (overlapX < overlapY) {
          const push = (dx < 0 ? -1 : 1) * overlapX * 0.5;
          a.x = (a.x ?? 0) - push;
          b.x = (b.x ?? 0) + push;
        } else {
          const push = (dy < 0 ? -1 : 1) * overlapY * 0.5;
          a.y = (a.y ?? 0) - push;
          b.y = (b.y ?? 0) + push;
        }
      }
    }
  };
  force.initialize = (list: CollideNode[]): void => {
    nodes = list;
  };
  return force;
}
