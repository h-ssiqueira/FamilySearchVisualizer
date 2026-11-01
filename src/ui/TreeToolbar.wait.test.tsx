import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TreeToolbar } from './TreeToolbar';

const base = {
  level: 'V1' as const,
  onLevel: vi.fn(),
  generations: 2,
  busy: true,
  detailsBusy: false,
  canLoadMore: true,
  onNext: vi.fn(),
  onAll: vi.fn(),
  onStop: vi.fn(),
  onSignOut: vi.fn(),
};

describe('TreeToolbar waiting (FR-09)', () => {
  it('says how long FamilySearch asked us to wait, before the loading message', () => {
    render(<TreeToolbar {...base} waitSeconds={7} />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('FamilySearch asked us to wait 7 s');
    expect(status).not.toHaveTextContent('Loading');
  });

  it('shows the normal status when there is no wait', () => {
    render(<TreeToolbar {...base} busy={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('Generations loaded: 2');
  });
});
