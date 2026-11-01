import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PersonRef } from '@/domain';
import { PersonCard } from './PersonCard';

describe('unexpected response card (TC-15)', () => {
  it('keeps the name and says "Unexpected response" where the dates go', () => {
    const person: PersonRef = {
      id: 'AAAA-AAA',
      name: 'F Example',
      gender: 'male',
      living: false,
      invalid: true,
    };
    render(<PersonCard person={person} />);
    expect(screen.getByText('Unexpected response')).toBeInTheDocument();
    expect(screen.getByTitle('F Example')).toBeInTheDocument();
  });
});
