import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FamilyCard, FamilyView } from '@/domain';
import { layoutFamily } from '@/tree';
import { TreeCanvas } from './TreeCanvas';

const card = (id: string, row: number): FamilyCard => ({
  id,
  person: { id, name: `${id} Example`, gender: 'unknown', living: false },
  role: 'line',
  row,
});

/** R at the bottom, the parents F (left) and M (right) above it (NFR-06, TC-50). */
const view: FamilyView = {
  view: 'V1',
  rootId: 'R',
  cards: [card('R', 0), card('F', 1), card('M', 1)],
  couples: [{ id: 'p:F+M', kind: 'parents', partnerIds: ['F', 'M'], childIds: ['R'] }],
};

describe('keyboard navigation between cards (NFR-06, TC-50)', () => {
  it('moves the focus to a parent card when the up arrow is pressed on the child', () => {
    render(<TreeCanvas layout={layoutFamily(view)} selectedId={undefined} onSelect={vi.fn()} />);
    const root = screen.getByRole('button', { name: 'Show R Example' });
    root.focus();
    fireEvent.keyDown(root, { key: 'ArrowUp' });
    expect(['Show F Example', 'Show M Example']).toContain(
      document.activeElement?.getAttribute('aria-label'),
    );
  });

  it('moves the focus to the card on the right when the right arrow is pressed', () => {
    render(<TreeCanvas layout={layoutFamily(view)} selectedId={undefined} onSelect={vi.fn()} />);
    const father = screen.getByRole('button', { name: 'Show F Example' });
    father.focus();
    fireEvent.keyDown(father, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Show M Example' }));
  });

  it('keeps the focus where it is when there is no card in that direction', () => {
    render(<TreeCanvas layout={layoutFamily(view)} selectedId={undefined} onSelect={vi.fn()} />);
    const mother = screen.getByRole('button', { name: 'Show M Example' });
    mother.focus();
    fireEvent.keyDown(mother, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(mother);
  });
});
