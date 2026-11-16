import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOCALE, setLocale } from '@/i18n';
import { TreeToolbar } from './TreeToolbar';

const base = {
  level: 'V1' as const,
  onLevel: vi.fn(),
  generations: 2,
  busy: true,
  detailsBusy: false,
  canLoadMore: false,
  onNext: vi.fn(),
  onAll: vi.fn(),
  onStop: vi.fn(),
  onSignOut: vi.fn(),
};

describe('loading progress (FR-12)', () => {
  it('shows the generations and the people loaded so far while loading', () => {
    setLocale(DEFAULT_LOCALE, false);
    render(<TreeToolbar {...base} people={5} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading: 2 generations, 5 people',
    );
  });

  it('offers pause while loading', () => {
    render(<TreeToolbar {...base} people={5} />);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeEnabled();
  });
});
