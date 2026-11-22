import { describe, expect, it } from 'vitest';
import { boxCollisionForce, type CollideNode } from './collide';

const box = (x: number, y: number): CollideNode => ({ x, y, width: 250, height: 90 });

describe('box collision force (design section 4)', () => {
  it('pushes two overlapping nodes apart along the axis with the smaller overlap', () => {
    const force = boxCollisionForce();
    const a = box(0, 0);
    const b = box(10, 0);
    force.initialize([a, b]);
    force();
    expect(a.y ?? 0).toBeLessThan(0);
    expect(b.y ?? 0).toBeGreaterThan(0);
  });

  it('leaves nodes that do not overlap where they are', () => {
    const force = boxCollisionForce();
    const a = box(0, 0);
    const b = box(1000, 0);
    force.initialize([a, b]);
    force();
    expect(a.x).toBe(0);
    expect(b.x).toBe(1000);
    expect(a.y).toBe(0);
  });

  it('keeps a margin between nodes', () => {
    const force = boxCollisionForce(8);
    const a = box(0, 0);
    const b = box(0, 95);
    force.initialize([a, b]);
    force();
    expect(a.y ?? 0).toBeLessThan(0);
  });

  it('separates the nodes at every call, not only at the first one', () => {
    const force = boxCollisionForce();
    const a = box(0, 0);
    const b = box(10, 0);
    force.initialize([a, b]);
    force();
    force();
    expect((b.y ?? 0) - (a.y ?? 0)).toBeGreaterThan(90);
  });
});
