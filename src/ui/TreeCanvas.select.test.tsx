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

const view: FamilyView = {
  view: 'V1',
  rootId: 'R',
  cards: [card('R', 0), card('F', 1), card('M', 1)],
  couples: [{ id: 'p:F+M', kind: 'parents', partnerIds: ['F', 'M'], childIds: ['R'] }],
};
const layout = layoutFamily(view);

describe('TreeCanvas selection (FR-16)', () => {
  it('gives every card a button when selection is enabled', () => {
    render(<TreeCanvas layout={layout} onSelect={vi.fn()} />);
    expect(screen.getAllByRole('button', { name: /^Show / })).toHaveLength(3);
  });

  it('has no card buttons when selection is not enabled', () => {
    render(<TreeCanvas layout={layout} />);
    expect(screen.queryAllByRole('button', { name: /^Show / })).toHaveLength(0);
  });

  it('reports the selected card and marks it as pressed', () => {
    const onSelect = vi.fn();
    render(<TreeCanvas layout={layout} selectedId="F" onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: 'Show F Example' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Show R Example' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show R Example' }));
    expect(onSelect).toHaveBeenCalledWith('R');
  });

  it('does not pan the canvas when a key is pressed on a card button', () => {
    const { container } = render(<TreeCanvas layout={layout} onSelect={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Show R Example' }), {
      key: 'ArrowLeft',
    });
    expect(container.querySelector('.tree-stage')?.getAttribute('data-x')).toBe('0');
  });
});
