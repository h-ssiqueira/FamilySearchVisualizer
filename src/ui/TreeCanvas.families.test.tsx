import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FamilyCard, FamilyView } from '@/domain';
import { layoutFamily } from '@/tree';
import { TreeCanvas } from './TreeCanvas';

const root: FamilyCard = {
  id: 'R',
  person: { id: 'R', name: 'R Example', gender: 'male', living: false },
  role: 'line',
  row: 0,
  families: { total: 2, shown: 1 },
};

const view: FamilyView = { view: 'V2', rootId: 'R', cards: [root], couples: [] };

describe('families button on the card (OQ-25)', () => {
  it('gives the card a button that says how many families there are', () => {
    render(<TreeCanvas layout={layoutFamily(view)} onCycleFamilies={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: 'Show another family (1 of 2)' }),
    ).toBeInTheDocument();
  });

  it('asks for the next family of that person when pressed', () => {
    const onCycle = vi.fn();
    render(<TreeCanvas layout={layoutFamily(view)} onCycleFamilies={onCycle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show another family (1 of 2)' }));
    expect(onCycle).toHaveBeenCalledWith('R', 2);
  });

  it('has no button without the handler', () => {
    render(<TreeCanvas layout={layoutFamily(view)} />);
    expect(screen.queryByRole('button', { name: /Show another family/ })).toBeNull();
  });
});
