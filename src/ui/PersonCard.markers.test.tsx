import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PersonRef } from '@/domain';
import { PersonCard } from './PersonCard';

const base: PersonRef = { id: 'AAAA-AAA', name: 'F Example', gender: 'male', living: false };

describe('card markers (TC-43, TC-22)', () => {
  it('says "Not available" where the dates go for a person with no data', () => {
    render(<PersonCard person={{ ...base, unavailable: true }} />);
    expect(screen.getByText('Not available')).toBeInTheDocument();
    expect(screen.getByTitle('F Example')).toBeInTheDocument();
  });

  it('marks an ancestor that appears again in the tree with the repeat symbol', () => {
    render(<PersonCard person={{ ...base, repeated: true }} />);
    expect(screen.getByRole('img', { name: 'Appears again in this tree' })).toBeInTheDocument();
  });

  it('shows no repeat symbol for an ordinary card', () => {
    render(<PersonCard person={base} />);
    expect(screen.queryByRole('img', { name: 'Appears again in this tree' })).toBeNull();
  });
});
