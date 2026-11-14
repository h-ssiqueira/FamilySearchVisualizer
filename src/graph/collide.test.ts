import { describe, expect, it } from 'vitest';
import { boxCollisionForce, type CollideNode } from './collide';

const box = (x: number, y: number): CollideNode => ({ x, y, width: 250, height: 90 });

describe('box collision force (design section 4)', () => {
  it('pushes two overlapping cards apart along the axis with the smaller overlap', () => {
    const force = boxCollisionForce();
    const a = box(0, 0);
    const b = box(10, 0);
    force.initialize([a, b]);
    force(1);
    expect(a.vy ?? 0).toBeLessThan(0);
    expect(b.vy ?? 0).toBeGreaterThan(0);
  });

  it('leaves cards that do not overlap alone', () => {
    const force = boxCollisionForce();
    const a = box(0, 0);
    const b = box(1000, 0);
    force.initialize([a, b]);
    force(1);
    expect(a.vx).toBeUndefined();
    expect(b.vx).toBeUndefined();
    expect(a.vy).toBeUndefined();
  });

  it('keeps a margin between cards', () => {
    const force = boxCollisionForce(8);
    const a = box(0, 0);
    const b = box(0, 95);
    force.initialize([a, b]);
    force(1);
    expect(a.vy ?? 0).toBeLessThan(0);
  });
});
