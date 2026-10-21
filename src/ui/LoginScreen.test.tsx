import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOCALE, setLocale } from '@/i18n';
import { LoginScreen } from './LoginScreen';

afterEach(() => {
  window.localStorage.clear();
  setLocale(DEFAULT_LOCALE, false);
});

describe('LoginScreen', () => {
  it('shows one sign-in button that starts the login (TC-01)', () => {
    const onSignIn = vi.fn();
    render(<LoginScreen onSignIn={onSignIn} />);
    const button = screen.getByRole('button', { name: 'Sign in with Google (FamilySearch)' });
    fireEvent.click(button);
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  it('explains that the token stays in the browser tab', () => {
    render(<LoginScreen onSignIn={() => undefined} />);
    expect(screen.getByText(/stay in this browser tab/)).toBeInTheDocument();
  });

  it('switches the language and the document language (ADR-11)', () => {
    render(<LoginScreen onSignIn={() => undefined} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pt-BR' } });
    expect(
      screen.getByRole('button', { name: 'Entrar com Google (FamilySearch)' }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('pt-BR');
  });
});
