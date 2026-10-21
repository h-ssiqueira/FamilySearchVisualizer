import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FamilyCard, FamilyView, LifeEvent } from '@/domain';
import { layoutFamily } from '@/tree';
import { TreeCanvas } from './TreeCanvas';

const card = (id: string, row: number): FamilyCard => ({
  id,
  person: { id, name: `${id} Example`, gender: 'unknown', living: false },
  role: 'line',
  row,
});

const marriage: LifeEvent = {
  date: { text: '+1825-05-20', source: 'formal' },
  place: { text: 'Campinas, Brazil' },
};

const view: FamilyView = {
  view: 'V1',
  rootId: 'R',
  cards: [card('R', 0), card('F', 1), card('M', 1)],
  couples: [
    { id: 'p:F+M', kind: 'parents', partnerIds: ['F', 'M'], childIds: ['R'], event: marriage },
  ],
};
const layout = layoutFamily(view);

function stageAttribute(container: HTMLElement, name: string): string | null {
  return container.querySelector('.tree-stage')?.getAttribute(name) ?? null;
}

describe('TreeCanvas', () => {
  it('draws a card per person, the descent links and the marriage with its label (TC-65)', () => {
    const { container } = render(<TreeCanvas layout={layout} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(container.querySelectorAll('.tree-link')).toHaveLength(2);
    expect(container.querySelectorAll('.tree-marriage')).toHaveLength(1);
    expect(container.querySelector('.tree-label')).not.toBeNull();
    expect(container).toHaveTextContent('1825-05-20');
    expect(container).toHaveTextContent('Campinas, Brazil');
  });

  it('is a focusable region that can be zoomed with the keyboard (FR-21)', () => {
    const { container } = render(<TreeCanvas layout={layout} />);
    const region = screen.getByRole('region', { name: /^Family tree/ });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(stageAttribute(container, 'data-scale')).toBe('1');
    fireEvent.keyDown(region, { key: '+' });
    expect(stageAttribute(container, 'data-scale')).toBe('1.2');
    fireEvent.keyDown(region, { key: '-' });
    expect(Number(stageAttribute(container, 'data-scale'))).toBeCloseTo(1, 5);
  });

  it('zooms with the buttons', () => {
    const { container } = render(<TreeCanvas layout={layout} />);
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(stageAttribute(container, 'data-scale')).toBe('1.2');
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(Number(stageAttribute(container, 'data-scale'))).toBeCloseTo(1, 5);
  });

  it('pans with the arrow keys', () => {
    const { container } = render(<TreeCanvas layout={layout} />);
    const region = screen.getByRole('region', { name: /^Family tree/ });
    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    expect(stageAttribute(container, 'data-x')).toBe('60');
    fireEvent.keyDown(region, { key: 'ArrowDown' });
    expect(stageAttribute(container, 'data-y')).toBe('-60');
  });

  it('renders nothing but the controls for an empty layout', () => {
    render(
      <TreeCanvas layout={{ cards: [], marriages: [], descents: [], width: 0, height: 0 }} />,
    );
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Fit to screen' })).toBeInTheDocument();
  });
});
