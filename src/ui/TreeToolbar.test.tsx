import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TreeToolbar, type TreeToolbarProps } from './TreeToolbar';

function propsWith(overrides: Partial<TreeToolbarProps> = {}): TreeToolbarProps {
  return {
    level: 'V1',
    onLevel: vi.fn(),
    generations: 3,
    busy: false,
    detailsBusy: false,
    canLoadMore: true,
    onNext: vi.fn(),
    onAll: vi.fn(),
    onStop: vi.fn(),
    onSignOut: vi.fn(),
    ...overrides,
  };
}

describe('TreeToolbar', () => {
  it('marks the current view as pressed and switches view (FR-15)', () => {
    const props = propsWith({ level: 'V2' });
    render(<TreeToolbar {...props} />);
    expect(screen.getByRole('button', { name: 'Couples and children' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Direct line' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Extended family' }));
    expect(props.onLevel).toHaveBeenCalledWith('V3');
  });

  it('shows the generations loaded when idle', () => {
    render(<TreeToolbar {...propsWith()} />);
    expect(screen.getByRole('status')).toHaveTextContent('Generations loaded: 3');
    expect(screen.getByRole('button', { name: 'Stop' })).toBeDisabled();
  });

  it('shows that it is loading and lets the user stop (FR-12, TC-58)', () => {
    const props = propsWith({ busy: true, canLoadMore: false });
    render(<TreeToolbar {...props} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(props.onStop).toHaveBeenCalledTimes(1);
  });

  it('shows that relatives are being loaded for the extended view', () => {
    render(<TreeToolbar {...propsWith({ level: 'V3', detailsBusy: true })} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading relatives…');
  });

  it('offers the next generation or all of them only while there is more to load', () => {
    const props = propsWith();
    const { rerender } = render(<TreeToolbar {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Load next generation' }));
    fireEvent.click(screen.getByRole('button', { name: 'Load all generations' }));
    expect(props.onNext).toHaveBeenCalledTimes(1);
    expect(props.onAll).toHaveBeenCalledTimes(1);

    rerender(<TreeToolbar {...propsWith({ canLoadMore: false })} />);
    expect(screen.getByRole('button', { name: 'Load next generation' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Load all generations' })).toBeDisabled();
  });

  it('signs out', () => {
    const props = propsWith();
    render(<TreeToolbar {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(props.onSignOut).toHaveBeenCalledTimes(1);
  });
});
