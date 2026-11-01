import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PersonRef } from '@/domain';
import { PersonCard } from './PersonCard';

describe('untrusted names are shown as text (TC-55)', () => {
  it('renders markup inside a name as plain text, never as elements', () => {
    const hostile: PersonRef = {
      id: 'XXXX-XXX',
      name: '<img src=x onerror="alert(1)"><b>Bold</b>',
      gender: 'unknown',
      living: false,
    };

    const { container } = render(<PersonCard person={hostile} />);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(screen.getByText(/<img src=x/)).toBeInTheDocument();
  });
});
