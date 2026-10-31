import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FamilyView } from '@/domain';
import { layoutFamily } from '@/tree';
import { ExportButton } from './ExportButton';

const view: FamilyView = {
  view: 'V1',
  rootId: 'R',
  cards: [
    {
      id: 'R',
      person: { id: 'R', name: 'R Example', gender: 'female', living: false },
      role: 'line',
      row: 0,
    },
  ],
  couples: [],
};

const createObjectURL = vi.fn((_blob: Blob) => 'blob:synthetic');
const revokeObjectURL = vi.fn();

beforeEach(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    value: createObjectURL,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: revokeObjectURL,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  createObjectURL.mockClear();
});

describe('ExportButton (FR-22)', () => {
  it('downloads the current view as family-tree.svg', () => {
    const saved: { name?: string } = {};
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      saved.name = this.download;
    });

    render(<ExportButton layout={layoutFamily(view)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Export as SVG' }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0]?.[0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.type).toBe('image/svg+xml');
    expect(saved.name).toBe('family-tree.svg');
  });

  it('offers PNG and PDF next to SVG', () => {
    render(<ExportButton layout={layoutFamily(view)} />);
    expect(screen.getByRole('button', { name: 'Export as PNG' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Export as PDF' })).toBeEnabled();
  });

  it('disables every export when there is nothing to export', () => {
    render(<ExportButton layout={{ cards: [], marriages: [], descents: [], width: 0, height: 0 }} />);
    expect(screen.getByRole('button', { name: 'Export as SVG' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Export as PNG' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Export as PDF' })).toBeDisabled();
  });
});
