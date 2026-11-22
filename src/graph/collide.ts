/** A node the collision force moves: a position, a velocity and the size of its box. */
export interface CollideNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  width: number;
  height: number;
}

/**
 * Keeps the cards of the graph apart (SDD `4-design/7-force-graph-view.md`, section 4). Two boxes
 * overlap when both their horizontal and vertical extents overlap, counting `margin` px between them;
 * the pair is pushed apart along the axis where the overlap is smaller. The check is O(n²): fine up
 * to a few thousand cards (OQ-28 decides whether culling is needed on top).
 *
 * The shape follows the d3 force protocol: a function of `alpha`, with `initialize` to receive nodes.
 */
export function boxCollisionForce(margin = 8) {
  let nodes: CollideNode[] = [];
  const force = (alpha: number): void => {
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
          const push = (dx < 0 ? -1 : 1) * overlapX * alpha * 0.5;
          a.vx = (a.vx ?? 0) - push;
          b.vx = (b.vx ?? 0) + push;
        } else {
          const push = (dy < 0 ? -1 : 1) * overlapY * alpha * 0.5;
          a.vy = (a.vy ?? 0) - push;
          b.vy = (b.vy ?? 0) + push;
        }
      }
    }
  };
  force.initialize = (list: CollideNode[]): void => {
    nodes = list;
  };
  return force;
}
