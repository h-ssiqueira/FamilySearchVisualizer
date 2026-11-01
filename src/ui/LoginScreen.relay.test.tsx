import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { relayStore } from '@/relay/relayStore';
import { LoginScreen } from './LoginScreen';

afterEach(() => {
  relayStore.disconnect();
  vi.restoreAllMocks();
});

describe('relay sign-in failures (FR-34, TC-05)', () => {
  it('tells the user when the browser blocked the FamilySearch window', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    render(<LoginScreen onSignIn={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open FamilySearch and connect' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The browser blocked the FamilySearch window',
    );
  });
});
